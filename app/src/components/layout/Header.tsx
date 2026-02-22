"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

export function Header() {
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <header className="h-14 border-b border-border flex items-center justify-between px-6 bg-background/95">
      <div className="text-sm text-muted-foreground">
        Painel ArtistAI
      </div>
      <Button
        variant="ghost"
        size="sm"
        onClick={handleLogout}
        className="text-muted-foreground hover:text-foreground"
      >
        <LogOut className="h-4 w-4 mr-2" />
        Sair
      </Button>
    </header>
  );
}
