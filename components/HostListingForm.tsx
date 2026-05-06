"use client";

import { ChevronDown, ImagePlus } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { BackButton } from "@/components/BackButton";
import { BlueNestLogo } from "@/components/BlueNestLogo";
import { MobileShell } from "@/components/MobileShell";
import { NAVI_AREAS, type ListingArea } from "@/lib/constants";
import type { ListingType } from "@/lib/types";
import { useApp } from "@/context/AppContext";

const AREAS: ListingArea[] = NAVI_AREAS.filter((a): a is ListingArea => a !== "All");

export function HostListingForm() {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const { userListing, createListing } = useApp();

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const previewObjectUrlRef = useRef<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [area, setArea] = useState<ListingArea>(AREAS[0] ?? "Vashi");
  const [type, setType] = useState<ListingType>("rent");
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);

  function revokePreviewUrl() {
    if (previewObjectUrlRef.current) {
      URL.revokeObjectURL(previewObjectUrlRef.current);
      previewObjectUrlRef.current = null;
    }
  }

  useEffect(() => {
    return () => revokePreviewUrl();
  }, []);

  function onPickFile(f: File | null) {
    setError(null);
    revokePreviewUrl();
    if (!f || !f.type.startsWith("image/")) {
      setImageFile(null);
      setImagePreview(null);
      return;
    }
    const url = URL.createObjectURL(f);
    previewObjectUrlRef.current = url;
    setImagePreview(url);
    setImageFile(f);
  }

  async function submit() {
    setError(null);
    if (userListing) {
      setError("You already have an active listing. Delete it from your profile first.");
      return;
    }
    if (!imageFile) {
      setError("Please upload one photo.");
      return;
    }
    const p = Number(price.replace(/,/g, ""));
    if (!title.trim() || !description.trim() || !Number.isFinite(p) || p <= 0) {
      setError("Fill in title, valid price, and description.");
      return;
    }
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", imageFile);
      const uploadRes = await fetch("/api/upload/image", {
        method: "POST",
        body: formData,
      });
      const uploadJson = (await uploadRes.json()) as {
        url?: string;
        error?: string;
      };
      if (!uploadRes.ok) {
        setError(uploadJson.error || "Image upload failed.");
        return;
      }
      if (!uploadJson.url) {
        setError("Image upload did not return a URL.");
        return;
      }
      const result = await createListing({
        title,
        area,
        price: p,
        type,
        description,
        imageUrl: uploadJson.url,
      });
      if (result.ok) router.push("/profile");
      else setError(result.error || "Could not post listing.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <MobileShell>
      <div
        className="relative h-40 w-full overflow-hidden bg-slate-200"
        style={{
          backgroundImage:
            "url(https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800&q=60)",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-slate-900/25 backdrop-blur-[2px]" />
        <div className="absolute left-4 top-[max(0.75rem,env(safe-area-inset-top))] z-10">
          <BackButton href="/" />
        </div>
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 opacity-90">
          <BlueNestLogo compact />
        </div>
      </div>

      <div className="flex flex-1 flex-col rounded-t-[28px] bg-white px-5 pb-28 pt-6 shadow-[0_-12px_40px_rgba(15,23,42,0.08)] -mt-5 relative z-[1]">
        <h1 className="text-2xl font-bold text-[var(--bn-blue-dark)]">
          Post a Listing
        </h1>
        <p className="mt-1 text-sm text-slate-500">Add details about your place</p>

        <div className="mt-6 flex flex-col gap-5">
          <Field label="Photo">
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => onPickFile(e.target.files?.[0] ?? null)}
            />
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="flex min-h-[140px] w-full flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/80 px-4 py-6 text-center transition-colors hover:border-[var(--bn-blue)]/40 hover:bg-white"
            >
              {imagePreview ? (
                <div className="relative h-32 w-full max-w-[200px] overflow-hidden rounded-xl">
                  <Image
                    src={imagePreview}
                    alt=""
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </div>
              ) : (
                <>
                  <span className="text-[var(--bn-blue)]">
                    <ImagePlus size={36} strokeWidth={1.7} />
                  </span>
                  <span className="text-sm font-semibold text-[var(--bn-blue-dark)]">
                    Tap to upload image
                  </span>
                  <span className="text-xs text-slate-500">
                    Only 1 photo — uploaded to Cloudinary
                  </span>
                </>
              )}
            </button>
          </Field>

          <Field label="Title">
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. 1 BHK near Mindspace"
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none placeholder:text-slate-400 focus:border-[var(--bn-blue)]/50 focus:ring-2 focus:ring-[var(--bn-blue)]/15"
            />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Price (₹)">
              <input
                inputMode="numeric"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="0"
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none placeholder:text-slate-400 focus:border-[var(--bn-blue)]/50 focus:ring-2 focus:ring-[var(--bn-blue)]/15"
              />
            </Field>
            <Field label="Area">
              <div className="relative">
                <select
                  value={area}
                  onChange={(e) => setArea(e.target.value as ListingArea)}
                  className="w-full appearance-none rounded-xl border border-slate-200 bg-white px-4 py-3 pr-10 text-sm font-medium text-[var(--bn-blue-dark)] outline-none focus:border-[var(--bn-blue)]/50 focus:ring-2 focus:ring-[var(--bn-blue)]/15"
                >
                  {AREAS.map((a) => (
                    <option key={a} value={a}>
                      {a}
                    </option>
                  ))}
                </select>
                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                  <ChevronDown size={18} strokeWidth={2} />
                </span>
              </div>
            </Field>
          </div>

          <Field label="Listing type">
            <div className="grid grid-cols-2 gap-2 rounded-2xl bg-slate-100 p-1">
              <button
                type="button"
                onClick={() => setType("rent")}
                className={
                  type === "rent"
                    ? "rounded-xl bg-[var(--bn-blue)] py-2.5 text-center text-xs font-bold uppercase tracking-wide text-white shadow-sm"
                    : "rounded-xl py-2.5 text-center text-xs font-bold uppercase tracking-wide text-[var(--bn-blue-dark)]"
                }
              >
                Rent (monthly)
              </button>
              <button
                type="button"
                onClick={() => setType("daily")}
                className={
                  type === "daily"
                    ? "rounded-xl bg-[var(--bn-blue)] py-2.5 text-center text-xs font-bold uppercase tracking-wide text-white shadow-sm"
                    : "rounded-xl py-2.5 text-center text-xs font-bold uppercase tracking-wide text-[var(--bn-blue-dark)]"
                }
              >
                Daily stay
              </button>
            </div>
          </Field>

          <Field label="Description">
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              placeholder="Tell us more about the place..."
              className="w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none placeholder:text-slate-400 focus:border-[var(--bn-blue)]/50 focus:ring-2 focus:ring-[var(--bn-blue)]/15"
            />
          </Field>

          <p className="rounded-xl bg-slate-50 px-3 py-2 text-xs text-slate-600 ring-1 ring-slate-100">
            Only one active listing allowed per user.
          </p>

          {error && (
            <p className="text-sm font-medium text-red-600" role="alert">
              {error}
            </p>
          )}

          <button
            type="button"
            onClick={submit}
            disabled={uploading}
            className="flex w-full items-center justify-center rounded-2xl bg-[var(--bn-blue-dark)] py-4 text-base font-bold text-white shadow-lg transition-transform active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-70"
          >
            {uploading ? "Uploading…" : "Post Listing"}
          </button>
        </div>
      </div>
    </MobileShell>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-[11px] font-bold uppercase tracking-wide text-[var(--bn-blue-dark)]">
        {label}
      </span>
      {children}
    </div>
  );
}
