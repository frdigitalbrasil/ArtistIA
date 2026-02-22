"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  FileText,
  Brain,
  Settings,
  Globe,
} from "lucide-react";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/artistas", label: "Artistas", icon: Users },
  { href: "/dashboard/planejamentos", label: "Planejamentos", icon: FileText },
  { href: "/dashboard/memoria", label: "Memória", icon: Brain },
  { href: "/dashboard/admin/prompts", label: "Admin › Prompts", icon: Settings },
  { href: "/dashboard/admin/sites", label: "Admin › Sites de Pesquisa", icon: Globe },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside
      className="w-64 border-r border-border flex flex-col shrink-0"
      style={{ backgroundColor: "#0a0a0f" }}
    >
      <div className="p-4 border-b border-border">
        <Link href="/dashboard" className="flex items-center gap-2 font-bold text-lg">
          <span className="text-primary" style={{ color: "#ff3d00" }}>
            ArtistAI
          </span>
        </Link>
      </div>
      <nav className="flex-1 p-3 space-y-1">
        {navItems.map((item) => {
          const isActive =
            item.href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary/15 text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
              style={
                isActive
                  ? { backgroundColor: "rgba(255, 61, 0, 0.15)", color: "#ff3d00" }
                  : undefined
              }
            >
              <Icon className="h-5 w-5 shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
