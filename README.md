<div align="center">

# CheckMatePH

### A Political Fact-Checking & Civic Engagement Platform for Filipino Voters

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-black?style=flat-square&logo=next.js" />
  <img src="https://img.shields.io/badge/TypeScript-blue?style=flat-square&logo=typescript" />
  <img src="https://img.shields.io/badge/Supabase-3ECF8E?style=flat-square&logo=supabase" />
  <img src="https://img.shields.io/badge/Vercel-black?style=flat-square&logo=vercel" />
</p>

**SIKAPTala 2026 Hackathon**  
Team Debuggerinas · Manuel S. Enverga University Foundation – Lucena City

</div>

---

# Overview

CheckMatePH is a web-based political social platform designed to combat misinformation and encourage responsible civic engagement among Filipino citizens.

Every political post submitted to the platform undergoes AI-powered fact-checking before publication and may later be reviewed by accredited human experts for additional verification.

The platform provides voters — especially first-time voters and youth — with a trustworthy space to:
- discuss political issues
- verify public claims
- analyze politicians
- participate in civic discourse responsibly

---

# Key Features


## Political Discussion Feed
A structured civic discussion feed featuring:
- threaded comments
- upvotes
- categorized political topics
- community engagement tools

---

## Verified Politician Profiles
Dedicated politician pages containing:
- integrity scores
- public claim history
- promise vs. action tracker
- fact-check summaries

---

## Real-Time Debate Rooms
Interactive debate spaces powered by Supabase Realtime with:
- live discussions
- structured arguments
- real-time audience voting

---

## Role-Based Access Control
Different permission systems for:
- Regular Users
- Verified Experts
- Moderators
- Verified Politicians

---

# Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js + React + TypeScript |
| Styling | Tailwind CSS + shadcn/ui |
| Backend & Database | Supabase (PostgreSQL + Realtime) |
| Authentication | Supabase Auth + JWT + RLS |
| Deployment | Vercel |

---

# Getting Started

## Prerequisites

Make sure you have:

- Node.js 18+
- A Supabase project
- An OpenAI API key

---

## Installation

```bash
git clone https://github.com/jpmartirez/checkmateph.git

cd checkmateph

npm install
```

---

## Environment Variables

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
OPENAI_API_KEY=your_openai_api_key
```

---

## Run Development Server

```bash
npm run dev
```

Open:

```txt
http://localhost:3000
```

---

# Project Structure

```bash
checkmateph/
├── app/              # Next.js App Router pages & layouts
├── components/       # Reusable UI components
├── lib/              # Utilities, API helpers, Supabase clients
├── types/            # TypeScript types & interfaces
├── public/           # Static assets
└── styles/           # Global styles
```

---

# Hackathon Scope & Limitations

- AI fact-checking is probabilistic and not a legal determination of truth
- Debate rooms are currently text-only
- OAuth login and advanced Tagalog NLP are post-hackathon features
- The platform is web-based only (mobile responsive)

---

# Vision

CheckMatePH aims to promote:
- media literacy
- informed voting
- civic participation
- responsible political discussion

through accessible and technology-driven fact verification.

---

# Team

## Debuggerinas

**Manuel S. Enverga University Foundation – Lucena City**

Built for:

### SIKAPTala 2026  
National Computer Science & Information Technology Competition

```