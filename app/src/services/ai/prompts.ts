import { prisma } from "@/lib/prisma";

const NOME_PROMPT_PLANEJAMENTO = "planejamento_principal";

/**
 * Busca o System Prompt ativo de planejamento no banco.
 * Usado pelo motor de geração de planejamento.
 */
export async function getActivePlanningPrompt(): Promise<string | null> {
  const prompt = await prisma.systemPrompt.findFirst({
    where: { nome: NOME_PROMPT_PLANEJAMENTO, ativo: true },
    orderBy: { versao: "desc" },
  });
  return prompt?.conteudo ?? null;
}

/**
 * Busca um System Prompt por nome (ativo).
 */
export async function getActivePromptByNome(nome: string): Promise<string | null> {
  const prompt = await prisma.systemPrompt.findFirst({
    where: { nome, ativo: true },
    orderBy: { versao: "desc" },
  });
  return prompt?.conteudo ?? null;
}
