import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Users, FileText } from "lucide-react";

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Bem-vindo ao ArtistAI. Gerencie seus artistas e planejamentos.
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 max-w-xl">
        <Button asChild variant="outline" className="h-auto py-4 flex flex-col items-start gap-2">
          <Link href="/dashboard/artistas">
            <Users className="h-8 w-8 text-primary" style={{ color: "#ff3d00" }} />
            <span className="font-semibold">Artistas</span>
            <span className="text-sm font-normal text-muted-foreground">
              Cadastre e gerencie artistas
            </span>
          </Link>
        </Button>
        <Button asChild variant="outline" className="h-auto py-4 flex flex-col items-start gap-2">
          <Link href="/dashboard/planejamentos">
            <FileText className="h-8 w-8 text-primary" style={{ color: "#ff3d00" }} />
            <span className="font-semibold">Planejamentos</span>
            <span className="text-sm font-normal text-muted-foreground">
              Ver e gerar planejamentos em PDF
            </span>
          </Link>
        </Button>
      </div>
    </div>
  );
}
