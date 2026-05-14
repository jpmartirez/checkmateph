/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState } from "react";
import { Label } from "../ui/label";
import { Eye, EyeOff, Lock, Mail, User } from "lucide-react";
import { Input } from "../ui/input";
import Link from "next/link";
import { Button } from "../ui/button";
import { Separator } from "../ui/separator";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import axios from "axios";

const RegisterForm = () => {
	const [showPassword, setShowPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [firstName, setFirstName] = useState("");
	const [lastName, setLastName] = useState("");
	const [username, setUsername] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const router = useRouter();

	const normalizeUsername = (value: string) => value.trim().toLowerCase();
	const isValidUsername = (value: string) => /^[a-z0-9_]{3,20}$/.test(value);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		const normalizedUsername = normalizeUsername(username);
		if (!firstName || !lastName || !normalizedUsername || !email || !password || !confirmPassword) {
			toast.error("Please fill in all fields.");
			return;
		}
		if (!isValidUsername(normalizedUsername)) {
			toast.error(
				"Username must be 3–20 characters (a-z, 0-9, underscore).",
			);
			return;
		}
		if (password.length < 6) {
			toast.error("Password must be at least 6 characters.");
			return;
		}
		if (password !== confirmPassword) {
			toast.error("Passwords do not match.");
			return;
		}

		setIsLoading(true);
		try {
			const res = await axios.post("/api/auth/signup", {
				email,
				password,
				username: normalizedUsername,
				firstName: firstName.trim(),
				lastName: lastName.trim(),
			});
			toast.success(
				res?.data?.message ?? "Account created. Check your email to verify.",
			);
			router.push("/login");
			router.refresh();
		} catch (error: any) {
			toast.error(
				error.response?.data?.error ||
					error.response?.data?.message ||
					"Failed to create account. Please try again.",
			);
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<form onSubmit={handleSubmit} className="flex flex-col gap-3">
			<div className="mb-2">
				<h1 className="text-2xl font-bold text-white">Create account</h1>
				<p className="text-sm text-[#a0a0b8] mt-1">
					Join CheckMatePH to post claims and opinions.
				</p>
			</div>

			{/* First + Last name */}
			<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
				<div className="flex flex-col gap-1.5">
					<Label
						htmlFor="firstName"
						className="text-[#c0c0d8] text-sm font-medium"
					>
						First name
					</Label>
					<div className="relative">
						<User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#5a5875] pointer-events-none" />
						<Input
							id="firstName"
							type="text"
							placeholder="Juan"
							value={firstName}
							onChange={(e) => setFirstName(e.target.value)}
							className="pl-10 bg-[#1a1830] border-[#2d2a4a] text-white placeholder:text-[#4a4868] focus-visible:ring-[#6c4eff] focus-visible:border-[#6c4eff] h-11 rounded-lg"
							autoComplete="given-name"
						/>
					</div>
				</div>
				<div className="flex flex-col gap-1.5">
					<Label
						htmlFor="lastName"
						className="text-[#c0c0d8] text-sm font-medium"
					>
						Last name
					</Label>
					<div className="relative">
						<User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#5a5875] pointer-events-none" />
						<Input
							id="lastName"
							type="text"
							placeholder="Dela Cruz"
							value={lastName}
							onChange={(e) => setLastName(e.target.value)}
							className="pl-10 bg-[#1a1830] border-[#2d2a4a] text-white placeholder:text-[#4a4868] focus-visible:ring-[#6c4eff] focus-visible:border-[#6c4eff] h-11 rounded-lg"
							autoComplete="family-name"
						/>
					</div>
				</div>
			</div>

			{/* Username */}
			<div className="flex flex-col gap-1.5">
				<Label htmlFor="username" className="text-[#c0c0d8] text-sm font-medium">
					Username
				</Label>
				<div className="relative">
					<User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#5a5875] pointer-events-none" />
					<Input
						id="username"
						type="text"
						placeholder="juan_delacruz"
						value={username}
						onChange={(e) => setUsername(e.target.value)}
						className="pl-10 bg-[#1a1830] border-[#2d2a4a] text-white placeholder:text-[#4a4868] focus-visible:ring-[#6c4eff] focus-visible:border-[#6c4eff] h-11 rounded-lg"
						autoComplete="username"
					/>
				</div>
				<p className="text-[11px] text-[#5a5875]">
					3–20 chars, lowercase letters, numbers, underscore.
				</p>
			</div>

			{/* Email */}
			<div className="flex flex-col gap-1.5">
				<Label htmlFor="email" className="text-[#c0c0d8] text-sm font-medium">
					Email
				</Label>
				<div className="relative">
					<Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#5a5875] pointer-events-none" />
					<Input
						id="email"
						type="email"
						placeholder="Enter your email"
						value={email}
						onChange={(e) => setEmail(e.target.value)}
						className="pl-10 bg-[#1a1830] border-[#2d2a4a] text-white placeholder:text-[#4a4868] focus-visible:ring-[#6c4eff] focus-visible:border-[#6c4eff] h-11 rounded-lg"
						autoComplete="email"
					/>
				</div>
			</div>

			{/* Password */}
			<div className="flex flex-col gap-1.5">
				<Label
					htmlFor="password"
					className="text-[#c0c0d8] text-sm font-medium"
				>
					Password
				</Label>
				<div className="relative">
					<Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#5a5875] pointer-events-none" />
					<Input
						id="password"
						type={showPassword ? "text" : "password"}
						placeholder="••••••••"
						value={password}
						onChange={(e) => setPassword(e.target.value)}
						className="pl-10 pr-10 bg-[#1a1830] border-[#2d2a4a] text-white placeholder:text-[#4a4868] focus-visible:ring-[#6c4eff] focus-visible:border-[#6c4eff] h-11 rounded-lg"
						autoComplete="new-password"
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

			{/* Confirm Password */}
			<div className="flex flex-col gap-1.5">
				<Label
					htmlFor="confirmPassword"
					className="text-[#c0c0d8] text-sm font-medium"
				>
					Confirm Password
				</Label>
				<div className="relative">
					<Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#5a5875] pointer-events-none" />
					<Input
						id="confirmPassword"
						type={showConfirmPassword ? "text" : "password"}
						placeholder="••••••••"
						value={confirmPassword}
						onChange={(e) => setConfirmPassword(e.target.value)}
						className="pl-10 pr-10 bg-[#1a1830] border-[#2d2a4a] text-white placeholder:text-[#4a4868] focus-visible:ring-[#6c4eff] focus-visible:border-[#6c4eff] h-11 rounded-lg"
						autoComplete="new-password"
					/>
					<button
						type="button"
						onClick={() => setShowConfirmPassword((v) => !v)}
						className="absolute right-3 top-1/2 -translate-y-1/2 text-[#5a5875] hover:text-[#a0a0b8] transition-colors"
						aria-label={showConfirmPassword ? "Hide password" : "Show password"}
					>
						{showConfirmPassword ? (
							<EyeOff className="w-4 h-4" />
						) : (
							<Eye className="w-4 h-4" />
						)}
					</button>
				</div>
			</div>

			{/* Create Account button */}
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
						Creating…
					</span>
				) : (
					"Create Account"
				)}
			</Button>

			{/* Divider */}
			<div className="flex items-center gap-3 my-1">
				<Separator className="flex-1 bg-[#2a2540]" />
				<span className="text-xs text-[#5a5875] font-medium">OR</span>
				<Separator className="flex-1 bg-[#2a2540]" />
			</div>

			{/* Already have an account */}
			<Link
				href={"/login"}
				className="h-9 flex items-center justify-center px-3 rounded-lg bg-primary text-white font-semibold text-sm shadow-lg shadow-[#6c4eff]/30 transition-all duration-200 active:scale-[0.98] w-auto self-center"
			>
				Sign In
			</Link>
		</form>
	);
};

export default RegisterForm;
