"use client";

import React, { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Search } from "@/lib/icons/icons";
import { cn } from "@/lib/utils";
import PoliticiansGrid from "@/components/main/politicians/PoliticiansGrid";
import {
	POLITICIANS,
	POLITICIAN_BRANCHES,
	POLITICIAN_LOCATIONS,
} from "@/components/main/politicians/politician-data";
import type {
	PoliticianBranchFilter,
	PoliticianLocationFilter,
} from "@/components/main/politicians/politician-types";

const PoliticiansPage = () => {
	const [query, setQuery] = useState("");
	const [activeBranch, setActiveBranch] =
		useState<PoliticianBranchFilter>("all");
	const [activeLocation, setActiveLocation] =
		useState<PoliticianLocationFilter>("all");

	const filteredPoliticians = useMemo(() => {
		const normalizedQuery = query.trim().toLowerCase();

		return POLITICIANS.filter((politician) => {
			if (activeBranch !== "all" && politician.branch !== activeBranch) {
				return false;
			}

			if (activeLocation !== "all" && politician.location !== activeLocation) {
				return false;
			}

			if (!normalizedQuery) {
				return true;
			}

			const searchFields = [
				politician.name,
				politician.role,
				politician.office,
			];

			return searchFields.some((field) =>
				field.toLowerCase().includes(normalizedQuery),
			);
		});
	}, [activeBranch, activeLocation, query]);

	return (
		<section className="px-4 pb-12 pt-8 sm:px-6">
			<div className="mx-auto max-w-4xl text-center">
				<h1 className="text-2xl font-semibold text-(--text-primary) sm:text-3xl">
					Government Officials
				</h1>
				<p className="mt-2 text-sm text-(--text-muted) sm:text-base">
					Browse verified public officials across national, regional, and local
					levels.
				</p>
			</div>

			<div className="mx-auto mt-6 flex w-full max-w-3xl items-center gap-2 rounded-full border border-(--border-subtle) bg-(--bg-tertiary) px-4 py-2 text-(--text-secondary)">
				<Search className="h-4 w-4" />
				<Input
					value={query}
					onChange={(event) => setQuery(event.target.value)}
					placeholder="Search by name, role, or department..."
					className="h-7 border-none bg-transparent px-0 text-sm text-(--text-primary) placeholder:text-(--text-muted) focus-visible:ring-0"
				/>
			</div>

			<div className="mx-auto mt-5 flex w-full max-w-5xl flex-wrap items-center justify-center gap-2">
				{POLITICIAN_BRANCHES.map((branch) => (
					<Button
						key={branch.id}
						variant="ghost"
						size="sm"
						onClick={() => setActiveBranch(branch.id)}
						className={cn(
							"rounded-full border border-(--border-subtle) px-4 text-xs font-semibold uppercase tracking-wide text-(--text-muted) hover:text-(--text-primary)",
							branch.id === activeBranch
								? "border-transparent bg-brand text-white hover:text-white"
								: "bg-(--bg-tertiary)",
						)}
					>
						{branch.label}
					</Button>
				))}
				<Select
					value={activeLocation}
					onValueChange={(value) =>
						setActiveLocation(value as PoliticianLocationFilter)
					}
				>
					<SelectTrigger
						size="sm"
						className="rounded-full border border-(--border-subtle) bg-(--bg-tertiary) text-xs font-semibold uppercase tracking-wide text-(--text-muted)"
					>
						<SelectValue placeholder="Location" />
					</SelectTrigger>
					<SelectContent>
						{POLITICIAN_LOCATIONS.map((location) => (
							<SelectItem key={location.id} value={location.id}>
								{location.label}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			</div>

			<div className="mx-auto mt-4 flex w-full max-w-5xl items-center justify-between text-xs text-(--text-muted)">
				<p>{filteredPoliticians.length} officials found</p>
				<p>Verified as of May 2026</p>
			</div>

			<div className="mx-auto mt-6 w-full max-w-5xl">
				{filteredPoliticians.length ? (
					<PoliticiansGrid politicians={filteredPoliticians} />
				) : (
					<div className="rounded-2xl border border-dashed border-(--border-subtle) bg-(--bg-secondary) px-6 py-10 text-center text-sm text-(--text-muted)">
						No officials match that search yet.
					</div>
				)}
			</div>
		</section>
	);
};

export default PoliticiansPage;
