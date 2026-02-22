"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart3, TrendingUp, Music, Youtube, Library, Users } from "lucide-react";

const SITES = [
  { id: "spotify", label: "Spotify Charts", url: "https://charts.spotify.com/", icon: Music },
  { id: "trends", label: "Google Trends", url: "https://trends.google.com.br/trending", icon: TrendingUp },
  { id: "tiktok", label: "TikTok Creative Center", url: "https://ads.tiktok.com/business/creativecenter", icon: BarChart3 },
  { id: "youtube", label: "YouTube Trending", url: "https://www.youtube.com/feed/trending", icon: Youtube },
  { id: "meta", label: "Meta Ad Library", url: "https://www.facebook.com/ads/library/", icon: Library },
  { id: "socialblade", label: "Social Blade", url: "https://socialblade.com/", icon: Users },
] as const;

export default function AdminSitesPage() {
  const [activeId, setActiveId] = useState<string>(SITES[0].id);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Sites de Pesquisa</h1>
        <p className="text-muted-foreground mt-1">
          Ferramentas e dashboards externos para análise de tendências e métricas. Alguns sites podem bloquear exibição em iframe.
        </p>
      </div>

      <Card className="border-border/50">
        <CardHeader>
          <CardTitle>Iframes</CardTitle>
          <CardDescription>Altere a aba para carregar o site correspondente</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeId} onValueChange={setActiveId} className="w-full">
            <TabsList className="flex flex-wrap h-auto gap-1 bg-muted/50 p-2">
              {SITES.map((s) => {
                const Icon = s.icon;
                return (
                  <TabsTrigger
                    key={s.id}
                    value={s.id}
                    className="data-[state=active]:bg-primary/15 data-[state=active]:text-primary data-[state=active]:border-primary/30 border border-transparent"
                    style={
                      activeId === s.id
                        ? { backgroundColor: "rgba(255, 61, 0, 0.15)", color: "#ff3d00", borderColor: "rgba(255, 61, 0, 0.3)" }
                        : undefined
                    }
                  >
                    <Icon className="h-4 w-4 mr-2 shrink-0" />
                    {s.label}
                  </TabsTrigger>
                );
              })}
            </TabsList>
            {SITES.map((s) => (
              <TabsContent key={s.id} value={s.id} className="mt-4 focus-visible:outline-none">
                <div className="rounded-lg border border-border overflow-hidden bg-muted/30" style={{ minHeight: "70vh" }}>
                  <iframe
                    title={s.label}
                    src={s.url}
                    className="w-full h-[70vh] min-h-[600px] border-0"
                    sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
                    allow="fullscreen"
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  {s.url}
                </p>
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
