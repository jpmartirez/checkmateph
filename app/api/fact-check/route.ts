import { NextResponse } from 'next/server'
import { saveAICheck, parseAICheckResponse } from '@/lib/ai-source-checks'

export async function POST(request: Request) {
  const { post_id, claim, source_urls } = await request.json()

  if (!post_id || !claim || !source_urls?.length) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  // Fetch content from each source URL
  const sourceFetches = await Promise.allSettled(
    source_urls.map((url: string) =>
      fetch(url)
        .then(r => r.text())
        .then(text => ({ url, content: text.slice(0, 2000) })) // cap per source
        .catch(() => ({ url, content: '[Could not fetch]' }))
    )
  )

  const sources = sourceFetches
    .filter(r => r.status === 'fulfilled')
    .map(r => (r as PromiseFulfilledResult<{ url: string; content: string }>).value)

  const sourcesText = sources
    .map((s, i) => `Source ${i + 1} (${s.url}):\n${s.content}`)
    .join('\n\n---\n\n')

  // Call Claude to evaluate coherence between claim and sources
  const aiResponse = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.ANTHROPIC_API_KEY!,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: `You are a fact-checking assistant. Evaluate whether the following claim is coherent with and supported by the provided sources.

CLAIM:
${claim}

SOURCES:
${sourcesText}

Respond ONLY with a JSON object in this exact format, no preamble:
{
  "verdict": "STRONGLY_AGREE" | "AGREE" | "NEUTRAL" | "DISAGREE" | "STRONGLY_DISAGREE",
  "confidence": <float between 0 and 1>,
  "rationale": "<one paragraph explaining your verdict>"
}

verdict meaning:
- STRONGLY_AGREE: sources strongly support the claim
- AGREE: sources generally support the claim
- NEUTRAL: sources are inconclusive or unrelated
- DISAGREE: sources contradict the claim
- STRONGLY_DISAGREE: sources directly refute the claim`,
        },
      ],
    }),
  })

  if (!aiResponse.ok) {
    return NextResponse.json({ error: 'AI service error' }, { status: 502 })
  }

  const aiData = await aiResponse.json()
  const rawText = aiData.content.map((b: { type: string; text?: string }) => b.text ?? '').join('')

  const parsed = parseAICheckResponse(rawText)

  const saved = await saveAICheck({
    post_id,
    verdict: parsed.verdict,
    confidence: parsed.confidence,
    rationale: parsed.rationale,
  })

  return NextResponse.json(saved, { status: 201 })
}