"use client";

import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search } from "@/lib/icons/icons";
import VerifiedSourcesGrid from "@/components/main/sources/VerifiedSourcesGrid";
import {
	SOURCE_TABS,
	SourceTab,
} from "@/components/main/sources/verified-sources-data";

const SourcesPage = () => {
	const [query, setQuery] = useState("");
	const [activeTab, setActiveTab] = useState<SourceTab>("all");

	return (
		<section className="px-4 pb-10 pt-8 sm:px-6">
			<div className="mx-auto max-w-3xl text-center">
				<h1 className="text-2xl font-semibold text-(--text-primary) sm:text-3xl">
					Verified Sources
				</h1>
				<p className="mt-2 text-sm text-(--text-muted) sm:text-base">
					Official primary sources and authenticated news organizations for
					citation and fact-verification.
				</p>
			</div>

			<div className="mx-auto mt-6 flex w-full max-w-2xl items-center gap-2 rounded-full border border-(--border-subtle) bg-(--bg-tertiary) px-4 py-2 text-(--text-secondary)">
				<Search className="h-4 w-4" />
				<Input
					value={query}
					onChange={(event) => setQuery(event.target.value)}
					placeholder="Search verified domains and institutions..."
					className="h-7 border-none bg-transparent px-0 text-sm text-(--text-primary) placeholder:text-(--text-muted) focus-visible:ring-0"
				/>
			</div>

			<Tabs
				value={activeTab}
				onValueChange={(value) => setActiveTab(value as SourceTab)}
				className="mx-auto mt-5 w-full max-w-3xl flex flex-col items-center"
			>
				<TabsList
					variant="line"
					className="flex w-full flex-wrap items-center justify-center gap-3 rounded-full bg-transparent p-0"
				>
					{SOURCE_TABS.map((tab) => (
						<TabsTrigger
							key={tab.id}
							value={tab.id}
							className="rounded-full border border-transparent px-4 py-2 text-xs font-semibold uppercase tracking-wide text-(--text-muted)data-active:bg-(--color-brand) data-active:text-white sm:text-sm"
						>
							{tab.label}
						</TabsTrigger>
					))}
				</TabsList>
				<TabsContent value={activeTab} className="mt-6 w-full">
					<VerifiedSourcesGrid activeFilter={activeTab} query={query} />
				</TabsContent>
			</Tabs>
		</section>
	);
};

export default SourcesPage;
