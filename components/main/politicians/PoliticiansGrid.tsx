import React from "react";
import Link from "next/link";
import { BadgeCheck, X } from "@/lib/icons/icons";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { BRANCH_LABELS, LOCATION_LABELS } from "./politician-data";
import type { Politician } from "./politician-types";
import Image from "next/image";

type PoliticiansGridProps = {
	politicians: Politician[];
};

const PoliticiansGrid = ({ politicians }: PoliticiansGridProps) => {
	return (
		<div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
			{politicians.map((politician) => (
				<Card
					key={politician.id}
					className="relative overflow-hidden border border-(--border-subtle) bg-(--bg-card) shadow-(--shadow-soft)"
				>
					<div className="relative h-44 overflow-hidden">
						<Image
							src={politician.imageUrl}
							alt={politician.name}
							width={300}
							height={300}
							className="object-cover"
						/>
					</div>
					<CardContent className="space-y-2">
						<div className="flex items-start justify-between gap-3">
							<div>
								<p className="text-xs uppercase tracking-wide text-(--text-muted)">
									{BRANCH_LABELS[politician.branch]}
								</p>
								<h3 className="text-base font-semibold text-(--text-primary)">
									{politician.name}
								</h3>
							</div>
							{politician.verified ? (
								<BadgeCheck className="h-4 w-4 text-brand" />
							) : null}
						</div>
						<p className="text-sm text-(--text-secondary)">{politician.role}</p>
						<p className="text-xs text-(--text-muted)">
							{politician.office} · {LOCATION_LABELS[politician.location]}
						</p>
					</CardContent>
					<CardFooter className="bg-(--bg-tertiary)">
						<Button
							asChild
							size="sm"
							className="w-full bg-brand text-white hover:bg-brand-hover"
						>
							<Link href={`/profile/politicians/${politician.id}`}>View Profile</Link>
						</Button>
					</CardFooter>
				</Card>
			))}
		</div>
	);
};

export default PoliticiansGrid;
