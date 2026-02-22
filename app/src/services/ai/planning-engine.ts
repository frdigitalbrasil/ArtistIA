import { openai, isOpenAIConfigured } from "@/lib/openai";
import { prisma } from "@/lib/prisma";
import { getActivePlanningPrompt } from "./prompts";

export interface ArtistaParaPlanejamento {
  id: string;
  nome: string;
  nomeArtistico: string;
  genero: string;
  cidadeBase: string | null;
  tempoCarreira: string | null;
  objetivo: string | null;
  instagram: string | null;
  facebook: string | null;
  spotify: string | null;
  youtube: string | null;
  tiktok: string | null;
  kwai: string | null;
  dadosColetados: unknown;
}

/**
 * Monta o conteúdo do usuário (dados do artista) para enviar ao modelo.
 */
function buildUserMessage(artista: ArtistaParaPlanejamento): string {
  const links = [
    artista.instagram && `Instagram: ${artista.instagram}`,
    artista.facebook && `Facebook: ${artista.facebook}`,
    artista.spotify && `Spotify: ${artista.spotify}`,
    artista.youtube && `YouTube: ${artista.youtube}`,
    artista.tiktok && `TikTok: ${artista.tiktok}`,
    artista.kwai && `Kwai: ${artista.kwai}`,
  ].filter(Boolean);

  const bloco = [
    "## DADOS DO ARTISTA",
    `Nome: ${artista.nome}`,
    `Nome artístico: ${artista.nomeArtistico}`,
    `Gênero musical: ${artista.genero}`,
    artista.cidadeBase && `Cidade-base: ${artista.cidadeBase}`,
    artista.tempoCarreira && `Tempo de carreira: ${artista.tempoCarreira}`,
    artista.objetivo && `Objetivo: ${artista.objetivo}`,
    "",
    "## LINKS DAS PLATAFORMAS",
    ...links,
    "",
  ].filter(Boolean);

  if (artista.dadosColetados && typeof artista.dadosColetados === "object") {
    bloco.push(
      "## DADOS COLETADOS (métricas)",
      JSON.stringify(artista.dadosColetados, null, 2)
    );
  } else {
    bloco.push(
      "## DADOS COLETADOS",
      "Dados ainda não coletados. Use 'Dado não disponível — recomenda-se verificar manualmente' onde fizer sentido."
    );
  }

  bloco.push(
    "",
    "Responda SOMENTE com um único objeto JSON válido, seguindo a estrutura do planejamento (capas, diagnostico, analiseMercado, publicoAlvo, estrategiaConteudo, etc.). Sem texto antes ou depois do JSON."
  );

  return bloco.join("\n");
}

/**
 * Tenta extrair JSON do texto de resposta (pode vir com markdown code block).
 */
function parsePlanningJson(text: string): Record<string, unknown> {
  const trimmed = text.trim();
  const jsonMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/) ?? trimmed.match(/(\{[\s\S]*\})/);
  const str = jsonMatch ? (jsonMatch[1] ?? jsonMatch[0]).trim() : trimmed;
  return JSON.parse(str) as Record<string, unknown>;
}

/**
 * Gera o planejamento com GPT-4o e atualiza o registro no banco.
 * O planejamento já deve existir com status GERANDO.
 */
export async function generatePlanning(
  artista: ArtistaParaPlanejamento,
  userId: string,
  planejamentoId: string
): Promise<{ conteudo: Record<string, unknown>; tokensUsados?: number }> {
  if (!isOpenAIConfigured() || !openai) {
    throw new Error("OpenAI não configurada (OPENAI_API_KEY).");
  }

  const systemPrompt = await getActivePlanningPrompt();
  if (!systemPrompt) {
    throw new Error(
      "Nenhum System Prompt ativo de planejamento encontrado. Cadastre em Admin > Prompts."
    );
  }

  const userMessage = buildUserMessage(artista);

  const completion = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userMessage },
    ],
    response_format: { type: "json_object" },
    temperature: 0.5,
  });

  const choice = completion.choices[0];
  if (!choice?.message?.content) {
    throw new Error("Resposta vazia da OpenAI.");
  }

  let conteudo: Record<string, unknown>;
  try {
    conteudo = parsePlanningJson(choice.message.content);
  } catch (e) {
    console.error("[planning-engine] JSON parse error", e);
    throw new Error("Resposta da IA não é um JSON válido.");
  }

  const tokensUsados =
    completion.usage?.total_tokens ?? undefined;

  await prisma.planejamento.update({
    where: { id: planejamentoId },
    data: {
      conteudo: conteudo as object,
      status: "CONCLUIDO",
      modeloUsado: "gpt-4o",
      tokensUsados: tokensUsados ?? null,
    },
  });

  return { conteudo, tokensUsados };
}
