import Link from "next/link";
import React from "react";

const Footer = () => {
	return (
		<footer className="relative z-10 border-t border-[#1e1c30] py-6 px-6">
			<div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
				<div>
					<p className="text-white font-semibold text-sm">CheckMatePh</p>
					<p className="text-[#5a5875] text-xs mt-0.5">
						Dedicated to Civic Integrity and Transparency.
					</p>
				</div>
				<nav className="flex flex-wrap gap-x-5 gap-y-2">
					{[
						"About",
						"Privacy Policy",
						"Terms of Service",
						"Community Guidelines",
						"Support",
					].map((item) => (
						<Link
							key={item}
							href="#"
							className="text-xs text-[#5a5875] hover:text-[#a0a0b8] transition-colors"
						>
							{item}
						</Link>
					))}
				</nav>
			</div>
		</footer>
	);
};

export default Footer;
