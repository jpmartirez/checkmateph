"use client";

import React from "react";
import { Badge } from "@/components/ui/badge";
import { BadgeCheck } from "@/lib/icons/icons";
import {
	CATEGORY_LABELS,
	SOURCES,
	SourceCategory,
} from "@/components/main/sources/verified-sources-data";

interface VerifiedSourcesGridProps {
	activeFilter: "all" | SourceCategory;
	query: string;
}

const VerifiedSourcesGrid = ({
	activeFilter,
	query,
}: VerifiedSourcesGridProps) => {
	const normalizedQuery = query.trim().toLowerCase();
	const visibleSources = SOURCES.filter((source) => {
		const matchesFilter =
			activeFilter === "all" || source.category === activeFilter;
		const matchesQuery =
			!normalizedQuery ||
			source.name.toLowerCase().includes(normalizedQuery) ||
			source.url.toLowerCase().includes(normalizedQuery) ||
			source.description.toLowerCase().includes(normalizedQuery);

		return matchesFilter && matchesQuery;
	});

	return (
		<div className="space-y-4">
			{visibleSources.map((source) => (
				<div
					key={source.id}
					className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-5 shadow-[var(--shadow-soft-sm)]"
				>
					<div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
						<div className="flex items-start gap-3">
							<div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--bg-tertiary)] text-[10px] font-semibold text-[var(--text-secondary)]">
								{source.logo}
							</div>
							<div>
								<div className="flex items-center gap-2">
									<p className="text-sm font-semibold text-[var(--text-primary)]">
										{source.name}
									</p>
									<BadgeCheck className="h-4 w-4 text-[var(--color-brand)]" />
								</div>
								<p className="text-xs text-[var(--text-muted)]">{source.url}</p>
							</div>
						</div>
						<Badge
							variant="secondary"
							className="rounded-full bg-[var(--color-brand-subtle)] text-[10px] font-semibold text-[var(--color-brand)]"
						>
							{CATEGORY_LABELS[source.category]}
						</Badge>
					</div>

					<p className="mt-3 text-sm text-[var(--text-secondary)]">
						{source.description}
					</p>
				</div>
			))}
		</div>
	);
};

export default VerifiedSourcesGrid;
