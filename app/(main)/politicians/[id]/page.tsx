import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { BadgeCheck, ArrowLeft } from "@/lib/icons/icons";
import { POLITICIANS, BRANCH_LABELS, LOCATION_LABELS } from "@/components/main/politicians/politician-data";

export default async function PoliticianProfilePage({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
	const { id } = await params;
	const politician = POLITICIANS.find((p) => p.id === id);

	if (!politician) notFound();

	return (
		<section className="mx-auto max-w-2xl px-4 pb-12 pt-8 sm:px-6">
			<Link
				href="/politicians"
				className="mb-6 inline-flex items-center gap-1.5 text-sm text-(--text-muted) hover:text-(--text-primary)"
			>
				<ArrowLeft className="h-4 w-4" />
				Back to Officials
			</Link>

			<div className="overflow-hidden rounded-2xl border border-(--border-subtle) bg-(--bg-card) shadow-(--shadow-soft)">
				<div className="relative h-52 w-full bg-(--bg-tertiary)">
					<Image
						src={politician.imageUrl}
						alt={politician.name}
						fill
						className="object-cover object-top"
					/>
				</div>

				<div className="px-6 py-5">
					<div className="flex items-start justify-between gap-3">
						<div>
							<p className="text-xs uppercase tracking-wide text-(--text-muted)">
								{BRANCH_LABELS[politician.branch]} · {LOCATION_LABELS[politician.location]}
							</p>
							<h1 className="mt-1 text-xl font-semibold text-(--text-primary) sm:text-2xl">
								{politician.name}
							</h1>
							<p className="mt-0.5 text-sm text-(--text-secondary)">{politician.role}</p>
							<p className="mt-0.5 text-xs text-(--text-muted)">{politician.office}</p>
						</div>
						{politician.verified ? (
							<BadgeCheck className="mt-1 h-5 w-5 shrink-0 text-brand" />
						) : null}
					</div>

					{(politician.background || politician.education || politician.knownFor) ? (
						<div className="mt-6 space-y-4 border-t border-(--border-subtle) pt-5">
							{politician.background ? (
								<div>
									<h2 className="text-xs font-semibold uppercase tracking-wide text-(--text-muted)">
										Background
									</h2>
									<p className="mt-1.5 text-sm leading-relaxed text-(--text-secondary)">
										{politician.background}
									</p>
								</div>
							) : null}

							{politician.education ? (
								<div>
									<h2 className="text-xs font-semibold uppercase tracking-wide text-(--text-muted)">
										Education
									</h2>
									<p className="mt-1.5 text-sm leading-relaxed text-(--text-secondary)">
										{politician.education}
									</p>
								</div>
							) : null}

							{politician.knownFor ? (
								<div>
									<h2 className="text-xs font-semibold uppercase tracking-wide text-(--text-muted)">
										Known For
									</h2>
									<p className="mt-1.5 text-sm leading-relaxed text-(--text-secondary)">
										{politician.knownFor}
									</p>
								</div>
							) : null}
						</div>
					) : null}
				</div>
			</div>
		</section>
	);
}
