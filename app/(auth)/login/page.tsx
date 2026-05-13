"use client";

import Image from "next/image";
import Footer from "@/components/login/Footer";
import LoginForm from "@/components/login/LoginForm";
import LeftSide from "@/components/login/LeftSide";

export default function LoginPage() {
	return (
		<div className="relative min-h-screen w-full overflow-hidden bg-background flex flex-col ">
			{/* Background image */}
			<div className="absolute inset-0">
				<Image
					src="/login-bg.png"
					alt="Background"
					fill
					className="object-cover opacity-20"
					priority
				/>
				{/* Gradient overlay */}
				<div className="absolute inset-0 bg-linear-to-br from-[#0d0d14]/90 via-[#0d0d14]/70 to-[#1a1030]/80" />
			</div>

			{/* Main content */}
			<main className="relative z-10 flex flex-1 flex-col lg:flex-row items-center justify-center px-4 py-12 gap-12 lg:gap-20 max-w-6xl mx-auto w-full ">
				{/* Left: Branding & features */}
				<LeftSide />

				{/* Right: Login card */}
				<div className="w-full max-w-md lg:w-1/2">
					<div className="rounded-2xl bg-card border border-(--border-subtle)  backdrop-blur-xl shadow-soft-lg p-8">
						{/* Login form */}
						<LoginForm />
					</div>

					<p className="text-center text-[10px] tracking-widest text-[#4a4868] mt-4 font-medium">
						SECURE CONNECTION ESTABLISHED • 256-BIT ENCRYPTION
					</p>
				</div>
			</main>

			{/* Footer */}
			<Footer />
		</div>
	);
}
