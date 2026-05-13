/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState } from "react";
import { Label } from "../ui/label";
import { Eye, EyeOff, Lock, Mail } from "lucide-react";
import { Input } from "../ui/input";
import Link from "next/link";
import { Button } from "../ui/button";
import { Separator } from "../ui/separator";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import axios from "axios";

const LoginForm = () => {
	const [showPassword, setShowPassword] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const router = useRouter();

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!email || !password) {
			toast.error("Please fill in both email and password.");
			return;
		}

		setIsLoading(true);

		try {
			await axios.post("/api/auth/login", { email, password });

			toast.success("Login successful!");
			router.push("/feed");
			router.refresh();
		} catch (error: any) {
			toast.error(
				error.response?.data?.error || "Failed to login. Please try again.",
			);
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<form onSubmit={handleSubmit} className="flex flex-col gap-3">
			{/* Email */}
			<div className="flex flex-col gap-1.5">
				<Label htmlFor="email" className="text-[#c0c0d8] text-sm font-medium">
					Email or Username
				</Label>
				<div className="relative">
					<Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#5a5875] pointer-events-none" />
					<Input
						id="email"
						type="text"
						placeholder="Enter your email or username"
						value={email}
						onChange={(e) => setEmail(e.target.value)}
						className="pl-10 bg-[#1a1830] border-[#2d2a4a] text-white placeholder:text-[#4a4868] focus-visible:ring-[#6c4eff] focus-visible:border-[#6c4eff] h-11 rounded-lg"
						autoComplete="email"
					/>
				</div>
			</div>

			{/* Password */}
			<div className="flex flex-col gap-1.5">
				<div className="flex items-center justify-between">
					<Label
						htmlFor="password"
						className="text-[#c0c0d8] text-sm font-medium"
					>
						Password
					</Label>
					<Link
						href="/forgot-password"
						className="text-xs text-[#a0a0b8] hover:text-[#7c5cff] transition-colors"
					>
						Forgot password?
					</Link>
				</div>
				<div className="relative">
					<Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#5a5875] pointer-events-none" />
					<Input
						id="password"
						type={showPassword ? "text" : "password"}
						placeholder="••••••••"
						value={password}
						onChange={(e) => setPassword(e.target.value)}
						className="pl-10 pr-10 bg-[#1a1830] border-[#2d2a4a] text-white placeholder:text-[#4a4868] focus-visible:ring-[#6c4eff] focus-visible:border-[#6c4eff] h-11 rounded-lg"
						autoComplete="current-password"
					/>
					<button
						type="button"
						onClick={() => setShowPassword((v) => !v)}
						className="absolute right-3 top-1/2 -translate-y-1/2 text-[#5a5875] hover:text-[#a0a0b8] transition-colors"
						aria-label={showPassword ? "Hide password" : "Show password"}
					>
						{showPassword ? (
							<EyeOff className="w-4 h-4" />
						) : (
							<Eye className="w-4 h-4" />
						)}
					</button>
				</div>
			</div>

			{/* Sign In button */}
			<Button
				type="submit"
				disabled={isLoading}
				className="h-11 rounded-lg bg-[#6c4eff] hover:bg-[#7c5cff] text-white font-semibold text-sm tracking-wide shadow-lg shadow-[#6c4eff]/30 transition-all duration-200 active:scale-[0.98] disabled:opacity-70"
			>
				{isLoading ? (
					<span className="flex items-center gap-2">
						<svg
							className="animate-spin w-4 h-4"
							fill="none"
							viewBox="0 0 24 24"
						>
							<circle
								className="opacity-25"
								cx="12"
								cy="12"
								r="10"
								stroke="currentColor"
								strokeWidth="4"
							/>
							<path
								className="opacity-75"
								fill="currentColor"
								d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z"
							/>
						</svg>
						Signing in…
					</span>
				) : (
					"Sign In"
				)}
			</Button>

			{/* Divider */}
			<div className="flex items-center gap-3 my-1">
				<Separator className="flex-1 bg-[#2a2540]" />
				<span className="text-xs text-[#5a5875] font-medium">OR</span>
				<Separator className="flex-1 bg-[#2a2540]" />
			</div>

			{/* Create Account Button */}
			<Link
				href={"/register"}
				className="h-9 flex items-center px-2 rounded-lg bg-primary text-white font-semibold text-sm shadow-lg shadow-[#6c4eff]/30 transition-all duration-200 active:scale-[0.98] disabled:opacity-70 w-auto self-start mx-auto"
			>
				{isLoading ? (
					<span className="flex items-center gap-2">
						<svg
							className="animate-spin w-4 h-4"
							fill="none"
							viewBox="0 0 24 24"
						>
							<circle
								className="opacity-25"
								cx="12"
								cy="12"
								r="10"
								stroke="currentColor"
								strokeWidth="4"
							/>
							<path
								className="opacity-75"
								fill="currentColor"
								d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z"
							/>
						</svg>
						Signing in…
					</span>
				) : (
					"Create Account"
				)}
			</Link>
		</form>
	);
};

export default LoginForm;
