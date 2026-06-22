"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createPlace, updatePlace } from "@/lib/actions";
import type { Place } from "@/lib/db/schema";

interface Props {
  place?: Place;
}

export function PlaceForm({ place }: Props) {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsPending(true);
    const fd = new FormData(e.currentTarget);
    const data = {
      name: fd.get("name") as string,
      cuisine: fd.get("cuisine") as string,
      priceTier: fd.get("priceTier") as "$" | "$$" | "$$$",
      address: (fd.get("address") as string) || undefined,
      mapUrl: (fd.get("mapUrl") as string) || undefined,
      menuUrl: (fd.get("menuUrl") as string) || undefined,
      avgPrice: fd.get("avgPrice") ? Number(fd.get("avgPrice")) : undefined,
      walkingMinutes: Number(fd.get("walkingMinutes") ?? 0),
      colorHue: Number(fd.get("colorHue") ?? 0),
      openingHours: (fd.get("openingHours") as string) || undefined,
      dietaryFlags: (fd.getAll("dietaryFlags") as string[]) || [],
      tags: (fd.get("tags") as string)
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
    };

    try {
      if (place) {
        await updatePlace(place.id, data);
      } else {
        await createPlace(data);
      }
      router.push("/admin/places");
      router.refresh();
    } finally {
      setIsPending(false);
    }
  }

  const field = (
    label: string,
    name: string,
    type = "text",
    defaultValue?: string | number,
    required = false
  ) => (
    <div>
      <label className="block text-[13px] font-semibold text-ink mb-1">
        {label}
        {required && <span className="text-accent ml-0.5">*</span>}
      </label>
      <input
        type={type}
        name={name}
        defaultValue={defaultValue ?? (place ? (place as Record<string, unknown>)[name] as string : "")}
        required={required}
        className="w-full border border-line rounded-[10px] px-3 py-2 text-[14px] font-body text-ink bg-card outline-none focus:border-accent"
      />
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {field("Name", "name", "text", undefined, true)}
      {field("Cuisine", "cuisine", "text", undefined, true)}

      <div>
        <label className="block text-[13px] font-semibold text-ink mb-1">
          Price tier <span className="text-accent">*</span>
        </label>
        <select
          name="priceTier"
          defaultValue={place?.priceTier ?? "$$"}
          required
          className="w-full border border-line rounded-[10px] px-3 py-2 text-[14px] font-body text-ink bg-card outline-none focus:border-accent"
        >
          <option value="$">$ (budget)</option>
          <option value="$$">$$ (mid-range)</option>
          <option value="$$$">$$$ (premium)</option>
        </select>
      </div>

      {field("Address", "address")}
      {field("Map URL", "mapUrl", "url")}
      {field("Menu URL", "menuUrl", "url")}
      {field("Avg price (€)", "avgPrice", "number")}
      {field("Walking minutes", "walkingMinutes", "number", place?.walkingMinutes ?? 0)}
      {field("Opening hours", "openingHours")}
      {field("Color hue (0–360)", "colorHue", "number", place?.colorHue ?? 0)}
      {field(
        "Tags (comma-separated)",
        "tags",
        "text",
        (place?.tags as string[] ?? []).join(", ")
      )}

      <div>
        <label className="block text-[13px] font-semibold text-ink mb-2">
          Dietary flags
        </label>
        <div className="flex gap-4">
          {[
            { value: "vegetarian", label: "Vegetarian" },
            { value: "vegan", label: "Vegan" },
            { value: "glutenFree", label: "Gluten-free" },
          ].map(({ value, label }) => (
            <label key={value} className="flex items-center gap-2 cursor-pointer text-[14px] text-ink">
              <input
                type="checkbox"
                name="dietaryFlags"
                value={value}
                defaultChecked={(place?.dietaryFlags as string[] ?? []).includes(value)}
                className="accent-accent"
              />
              {label}
            </label>
          ))}
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={isPending}
          className="flex-1 bg-accent text-white font-bold text-[15px] py-[13px] rounded-btn shadow-btn-accent disabled:opacity-60"
        >
          {isPending ? "Saving…" : place ? "Save changes" : "Create place"}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="px-5 py-[13px] border border-line rounded-btn text-ink font-semibold text-[15px] bg-card"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
