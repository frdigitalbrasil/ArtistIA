"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          password,
          phone: phone || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Erro ao criar conta.");
        return;
      }
      window.location.href = "/login";
      return;
    } catch {
      setError("Erro de conexão. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ backgroundColor: "#0a0a0f" }}
    >
      <Card className="w-full max-w-md border-border/50 bg-card/95">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold">Criar conta — ArtistAI</CardTitle>
          <CardDescription>
            Preencha os dados para se cadastrar.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {error && (
              <p className="text-sm text-destructive text-center">{error}</p>
            )}
            <div className="space-y-2">
              <Label htmlFor="name">Nome</Label>
              <Input
                id="name"
                type="text"
                placeholder="Seu nome"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                autoComplete="name"
                className="bg-background/50"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                className="bg-background/50"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Senha (mín. 6 caracteres)</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                autoComplete="new-password"
                className="bg-background/50"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Telefone / WhatsApp (opcional)</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="(11) 99999-9999"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                autoComplete="tel"
                className="bg-background/50"
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button
              type="submit"
              className="w-full bg-primary hover:bg-primary/90"
              disabled={loading}
            >
              {loading ? "Cadastrando..." : "Cadastrar"}
            </Button>
            <p className="text-sm text-muted-foreground text-center">
              Já tem conta?{" "}
              <Link
                href="/login"
                className="font-medium text-primary hover:underline"
              >
                Fazer login
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
