"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export interface LinksValues {
  instagram?: string;
  facebook?: string;
  spotify?: string;
  youtube?: string;
  tiktok?: string;
  kwai?: string;
}

const LINKS = [
  { key: "instagram" as const, label: "Instagram", placeholder: "https://instagram.com/..." },
  { key: "facebook" as const, label: "Facebook", placeholder: "https://facebook.com/..." },
  { key: "spotify" as const, label: "Spotify", placeholder: "https://open.spotify.com/..." },
  { key: "youtube" as const, label: "YouTube", placeholder: "https://youtube.com/..." },
  { key: "tiktok" as const, label: "TikTok", placeholder: "https://tiktok.com/..." },
  { key: "kwai" as const, label: "Kwai", placeholder: "https://kwai.com/..." },
] as const;

interface LinkInputsProps {
  values: LinksValues;
  onChange: (values: LinksValues) => void;
}

export function LinkInputs({ values, onChange }: LinkInputsProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {LINKS.map(({ key, label, placeholder }) => (
        <div key={key} className="space-y-2">
          <Label htmlFor={key}>{label}</Label>
          <Input
            id={key}
            type="url"
            placeholder={placeholder}
            value={values[key] ?? ""}
            onChange={(e) =>
              onChange({ ...values, [key]: e.target.value || undefined })
            }
            className="bg-background/50"
          />
        </div>
      ))}
    </div>
  );
}
