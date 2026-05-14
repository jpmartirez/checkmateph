"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Camera, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface EditProfileModalProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	userId: string;
	displayName: string;
	currentAvatarUrl: string;
	currentCoverUrl: string;
}

async function uploadToStorage(
	supabase: ReturnType<typeof createClient>,
	file: File,
	path: string,
): Promise<string> {
	const { error } = await supabase.storage
		.from("post-images")
		.upload(path, file, { contentType: file.type, upsert: true });
	if (error) throw error;
	const {
		data: { publicUrl },
	} = supabase.storage.from("post-images").getPublicUrl(path);
	return publicUrl;
}

export function EditProfileModal({
	open,
	onOpenChange,
	userId,
	displayName,
	currentAvatarUrl,
	currentCoverUrl,
}: EditProfileModalProps) {
	const router = useRouter();
	const avatarInputRef = useRef<HTMLInputElement>(null);
	const coverInputRef = useRef<HTMLInputElement>(null);
	const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
	const [coverPreview, setCoverPreview] = useState<string | null>(null);
	const [avatarFile, setAvatarFile] = useState<File | null>(null);
	const [coverFile, setCoverFile] = useState<File | null>(null);
	const [saving, setSaving] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const initials = displayName
		.trim()
		.split(/\s+/)
		.map((p) => p[0])
		.join("")
		.toUpperCase()
		.slice(0, 2);

	const handleFileSelect = (
		e: React.ChangeEvent<HTMLInputElement>,
		setPreview: (url: string) => void,
		setFile: (f: File) => void,
	) => {
		const file = e.target.files?.[0];
		if (!file) return;
		if (file.size > 5 * 1024 * 1024) {
			setError("Image must be under 5 MB.");
			return;
		}
		if (!file.type.startsWith("image/")) {
			setError("Only image files are allowed.");
			return;
		}
		setError(null);
		setPreview(URL.createObjectURL(file));
		setFile(file);
		e.target.value = "";
	};

	const handleSave = async () => {
		if (!avatarFile && !coverFile) return;
		setSaving(true);
		setError(null);
		try {
			const supabase = createClient();
			const updates: Record<string, string> = {};

			if (avatarFile) {
				const ext = avatarFile.name.split(".").pop() ?? "jpg";
				updates.avatar_url = await uploadToStorage(
					supabase,
					avatarFile,
					`${userId}/profile/avatar.${ext}`,
				);
			}
			if (coverFile) {
				const ext = coverFile.name.split(".").pop() ?? "jpg";
				updates.cover_url = await uploadToStorage(
					supabase,
					coverFile,
					`${userId}/profile/cover.${ext}`,
				);
			}

			const { error: updateError } = await supabase
				.from("profiles")
				.update(updates)
				.eq("id", userId);
			if (updateError) throw updateError;

			onOpenChange(false);
			router.refresh();
		} catch (err) {
			setError(err instanceof Error ? err.message : "Failed to save changes.");
		} finally {
			setSaving(false);
		}
	};

	const handleClose = (open: boolean) => {
		if (!open) {
			setAvatarPreview(null);
			setCoverPreview(null);
			setAvatarFile(null);
			setCoverFile(null);
			setError(null);
		}
		onOpenChange(open);
	};

	const hasChanges = Boolean(avatarFile || coverFile);

	return (
		<Dialog open={open} onOpenChange={handleClose}>
			<DialogContent aria-describedby={undefined} className="w-[95vw] max-w-lg bg-card border-border text-foreground">
				<DialogHeader>
					<DialogTitle>Edit Profile</DialogTitle>
				</DialogHeader>

				<div className="space-y-6">
					{/* Cover photo */}
					<div>
						<p className="text-sm font-medium mb-2">Cover Photo</p>
						<div className="relative h-36 w-full rounded-xl overflow-hidden bg-muted border border-border">
							<Image
								src={coverPreview ?? currentCoverUrl}
								alt="Cover"
								fill
								sizes="(max-width: 640px) 95vw, 512px"
								className="object-cover"
							/>
							<button
								type="button"
								onClick={() => coverInputRef.current?.click()}
								className="absolute inset-0 flex flex-col items-center justify-center gap-1 bg-black/40 hover:bg-black/60 transition-colors"
							>
								<Camera className="h-6 w-6 text-white" />
								<span className="text-white text-xs font-medium">Change Cover</span>
							</button>
						</div>
						<input
							ref={coverInputRef}
							type="file"
							accept="image/*"
							className="hidden"
							onChange={(e) => handleFileSelect(e, setCoverPreview, setCoverFile)}
						/>
					</div>

					{/* Profile photo */}
					<div>
						<p className="text-sm font-medium mb-2">Profile Photo</p>
						<div className="flex items-center gap-4">
							<div className="relative w-20 h-20 shrink-0">
								<Avatar className="w-20 h-20">
									<AvatarImage
										src={avatarPreview ?? currentAvatarUrl}
										alt={displayName}
									/>
									<AvatarFallback className="text-lg">{initials}</AvatarFallback>
								</Avatar>
								<button
									type="button"
									onClick={() => avatarInputRef.current?.click()}
									className="absolute inset-0 flex items-center justify-center bg-black/40 hover:bg-black/60 transition-colors rounded-full"
								>
									<Camera className="h-5 w-5 text-white" />
								</button>
							</div>
							<p className="text-xs text-muted-foreground leading-relaxed">
								Click the photo to upload a new one.
								<br />
								Max size: 5 MB. JPG, PNG, or WebP.
							</p>
						</div>
						<input
							ref={avatarInputRef}
							type="file"
							accept="image/*"
							className="hidden"
							onChange={(e) => handleFileSelect(e, setAvatarPreview, setAvatarFile)}
						/>
					</div>

					{error && <p className="text-xs text-red-500">{error}</p>}

					<div className="flex justify-end gap-2">
						<Button variant="ghost" onClick={() => handleClose(false)}>
							Cancel
						</Button>
						<Button
							onClick={handleSave}
							disabled={saving || !hasChanges}
							className="bg-purple-600 hover:bg-purple-700 text-white"
						>
							{saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
							Save Changes
						</Button>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
}
