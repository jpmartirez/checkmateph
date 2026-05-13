import React from "react";
import FeatureList from "./FeatureList";
import Image from "next/image";

const LeftSide = () => {
	return (
		<div className="flex flex-col items-start max-w-lg w-full lg:w-1/2">
			<div className="flex items-center gap-3 mb-8">
				<div className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg">
					<Image
						src={"/checkmateph-logo.png"}
						alt="checkmateph-logo"
						width={45}
						height={45}
					/>
				</div>
				<span className="text-2xl font-bold text-[#7c5cff] tracking-tight">
					CheckMatePh
				</span>
			</div>

			<h1 className="text-4xl sm:text-5xl font-extrabold text-white leading-tight mb-6">
				Discuss politics
				<br />
				with evidence,
				<br />
				context, and
				<br />
				accountability.
			</h1>

			<p className="text-[#a0a0b8] text-base leading-relaxed mb-10">
				Join a community dedicated to elevated discourse. Access verified
				sources, AI-assisted fact-checking, and structured debates designed to
				uncover the truth.
			</p>

			{/* Feature list */}
			<FeatureList />
		</div>
	);
};

export default LeftSide;
