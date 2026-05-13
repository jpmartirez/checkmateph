import { ShieldCheck } from "lucide-react";
import React from "react";

const FeatureList = () => {
	return (
		<div className="flex flex-col gap-5">
			{[
				{
					label: "AI-ASSISTED VERIFICATION",
					desc: "Real-time claim analysis against our extensive Source Archive.",
				},
				{
					label: "VERIFIED EXPERT COMMUNITY",
					desc: "Engage with credentialed journalists, academics, and analysts.",
				},
				{
					label: "SECURE CIVIC DISCOURSE",
					desc: "A moderated environment free from toxic rhetoric and targeted harassment.",
				},
			].map(({ label, desc }) => (
				<div key={label} className="flex items-start gap-3">
					<div className="mt-0.5 w-7 h-7 rounded-full bg-[#1e1a3a] border border-[#6c4eff]/40 flex items-center justify-center shrink-0">
						<ShieldCheck className="w-3.5 h-3.5 text-[#7c5cff]" />
					</div>
					<div>
						<p className="text-[10px] font-bold tracking-widest text-[#7c5cff] mb-0.5">
							{label}
						</p>
						<p className="text-sm text-[#a0a0b8]">{desc}</p>
					</div>
				</div>
			))}
		</div>
	);
};

export default FeatureList;
