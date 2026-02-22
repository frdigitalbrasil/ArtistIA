import puppeteer from "puppeteer";
import path from "path";
import fs from "fs";

const SECTION_TITLES: Record<string, string> = {
  capa: "1. Capa",
  diagnostico: "2. Diagnóstico do Artista",
  diagnosticoArtista: "2. Diagnóstico do Artista",
  analiseMercado: "3. Análise de Mercado",
  publicoAlvo: "4. Público-Alvo",
  estrategiaConteudo: "5. Estratégia de Conteúdo",
  estrategiaTrafegoPago: "6. Estratégia de Tráfego Pago",
  marketingInfluencia: "7. Marketing de Influência",
  estrategiaLancamento: "8. Estratégia de Lançamento",
  planoNegocio: "9. Plano de Negócio",
  cronogramaGeral: "10. Cronograma Geral",
  kpisMetricas: "11. KPIs e Métricas de Sucesso",
};

function sectionTitle(key: string): string {
  return (
    SECTION_TITLES[key] ??
    key.replace(/([A-Z])/g, " $1").replace(/^./, (s) => s.toUpperCase())
  );
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function renderValue(value: unknown): string {
  if (value === null || value === undefined) return "";
  if (typeof value === "string") return `<p>${escapeHtml(value)}</p>`;
  if (typeof value === "number" || typeof value === "boolean") {
    return `<p>${String(value)}</p>`;
  }
  if (Array.isArray(value)) {
    if (value.length > 0 && typeof value[0] === "object" && value[0] !== null && !Array.isArray(value[0])) {
      const first = value[0] as Record<string, unknown>;
      const headers = Object.keys(first)
        .map((h) => `<th>${escapeHtml(String(h))}</th>`)
        .join("");
      const rows = value
        .map(
          (row) =>
            `<tr>${Object.values(row as object)
              .map((v) => `<td>${escapeHtml(String(v ?? ""))}</td>`)
              .join("")}</tr>`
        )
        .join("");
      return `<table><thead><tr><th>#</th>${headers}</tr></thead><tbody>${rows}</tbody></table>`;
    }
    const items = value
      .map((item) => `<li>${escapeHtml(String(item))}</li>`)
      .join("");
    return `<ul>${items}</ul>`;
  }
  if (typeof value === "object") {
    const obj = value as Record<string, unknown>;
    const entries = Object.entries(obj);
    if (entries.length === 0) return "";
    let html = "";
    for (const [k, v] of entries) {
      if (v === null || v === undefined) continue;
      const title = sectionTitle(k);
      html += `<h4>${escapeHtml(title)}</h4>${renderValue(v)}`;
    }
    return html;
  }
  return "";
}

function renderSection(id: string, title: string, content: string): string {
  return `
  <div class="page">
    <div class="section">
      <h2 class="section-title" id="sec-${escapeHtml(id)}">${escapeHtml(title)}</h2>
      <div class="section-content">${content}</div>
    </div>
  </div>`;
}

/**
 * Monta o HTML completo a partir do JSON do planejamento.
 */
export function buildHtmlFromPlanejamento(
  conteudo: Record<string, unknown>,
  artistaNome: string,
  data: string
): string {
  const templatePath = path.join(
    process.cwd(),
    "src/services/pdf/templates/planejamento.html"
  );
  let template: string;
  try {
    template = fs.readFileSync(templatePath, "utf-8");
  } catch {
    template = getEmbeddedTemplate();
  }

  const sectionKeys = Object.keys(conteudo).filter(
    (k) =>
      k.toLowerCase() !== "capa" &&
      conteudo[k] !== null &&
      conteudo[k] !== undefined &&
      (typeof conteudo[k] === "object" || typeof conteudo[k] === "string")
  );

  const sumarioItems = sectionKeys
    .map(
      (id, i) =>
        `<li><a href="#sec-${id}">${sectionTitle(id)}</a><span>${i + 1}</span></li>`
    )
    .join("\n");

  let sectionsHtml = "";
  for (const key of sectionKeys) {
    const value = conteudo[key];
    const content = renderValue(value);
    if (content.trim()) {
      sectionsHtml += renderSection(key, sectionTitle(key), content);
    }
  }

  return template
    .replace("{{ARTISTA_NOME}}", escapeHtml(artistaNome))
    .replace("{{DATA}}", escapeHtml(data))
    .replace("{{SUMARIO}}", sumarioItems)
    .replace("{{SECTIONS}}", sectionsHtml);
}

function getEmbeddedTemplate(): string {
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <title>Planejamento — {{ARTISTA_NOME}}</title>
  <style>
    :root { --bg: #0a0a0f; --surface: #12121a; --border: #2a2a35; --text: #e4e4e7; --muted: #a1a1aa; --primary: #ff3d00; --primary-soft: rgba(255, 61, 0, 0.15); }
    * { box-sizing: border-box; }
    body { margin: 0; font-family: Inter, sans-serif; background: var(--bg); color: var(--text); font-size: 11px; line-height: 1.5; }
    .page { page-break-after: always; padding: 40px; min-height: 100vh; }
    .cover { display: flex; flex-direction: column; justify-content: center; align-items: center; text-align: center; border-bottom: 3px solid var(--primary); }
    .cover-logo { font-size: 28px; font-weight: 700; color: var(--primary); margin-bottom: 50px; }
    .cover h1 { font-size: 22px; margin: 0 0 12px; }
    .cover .subtitle { font-size: 14px; color: var(--primary); font-weight: 600; margin-bottom: 8px; }
    .cover .date { font-size: 12px; color: var(--muted); }
    .toc-page h2 { font-size: 18px; color: var(--primary); margin-bottom: 24px; border-bottom: 2px solid var(--primary); padding-bottom: 8px; }
    .toc-list { list-style: none; padding: 0; margin: 0; }
    .toc-list li { padding: 8px 0; border-bottom: 1px solid var(--border); display: flex; justify-content: space-between; }
    .section-title { font-size: 16px; font-weight: 700; color: var(--primary); margin-bottom: 16px; padding-bottom: 8px; border-bottom: 2px solid var(--primary); }
    .section-content p { margin: 0 0 10px; }
    .section-content ul, .section-content ol { margin: 0 0 12px; padding-left: 20px; }
    .section-content h4 { font-size: 12px; color: var(--muted); margin: 14px 0 6px; font-weight: 600; }
    table { width: 100%; border-collapse: collapse; margin: 12px 0; font-size: 10px; background: var(--surface); }
    th, td { padding: 10px 12px; text-align: left; border-bottom: 1px solid var(--border); }
    th { background: var(--primary-soft); color: var(--primary); font-weight: 600; }
  </style>
</head>
<body>
  <div class="page cover"><div class="cover-logo">ArtistAI</div><h1>{{ARTISTA_NOME}}</h1><p class="subtitle">Planejamento Estratégico de Marketing Digital</p><p class="date">{{DATA}}</p></div>
  <div class="page toc-page"><h2>Sumário</h2><ul class="toc-list">{{SUMARIO}}</ul></div>
  {{SECTIONS}}
</body>
</html>`;
}

/**
 * Gera o PDF a partir do HTML usando Puppeteer.
 */
export async function generatePdfBuffer(html: string): Promise<Buffer> {
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"],
  });

  try {
    const page = await browser.newPage();
    await page.setContent(html, {
      waitUntil: "networkidle0",
      timeout: 30000,
    });

    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: { top: "60px", right: "40px", bottom: "60px", left: "40px" },
      displayHeaderFooter: true,
      headerTemplate: `<div style="font-size:9px; color:#a1a1aa; padding:0 40px; width:100%; display:flex; justify-content:space-between;"><span><strong style="color:#ff3d00">ArtistAI</strong></span><span>Planejamento Estratégico</span></div>`,
      footerTemplate: `<div style="font-size:9px; color:#a1a1aa; padding:0 40px; width:100%; display:flex; justify-content:space-between;"><span>Planejamento Estratégico de Marketing Digital</span><span>Página <span class="pageNumber"></span> de <span class="totalPages"></span></span></div>`,
    });

    return Buffer.from(pdfBuffer);
  } finally {
    await browser.close();
  }
}
