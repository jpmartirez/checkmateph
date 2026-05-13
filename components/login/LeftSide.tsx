import React from "react";
import Image from "next/image";

const LeftSide = () => {
	return (
		<div className="flex flex-col items-start max-w-lg w-full lg:w-1/2">
			<div className="flex items-center gap-3 mb-8">
				<div className="rounded-xl flex items-center justify-center shadow-lg">
					<Image
						src={"/checkmateph-logo.png"}
						alt="checkmateph-logo"
						width={105}
						height={105}
					/>
				</div>
				<span className="text-5xl font-bold text-brand tracking-tight">
					CheckMatePh
				</span>
			</div>

			<h1 className="auth-title">
				Dedicated to Civic Integrity
			</h1>

			<p className="auth-subtitle">
				Join a community dedicated to elevated discourse. Access verified
				sources, AI-assisted fact-checking, and structured debates designed to
				uncover the truth.
			</p>
		</div>
	);
};

export default LeftSide;
