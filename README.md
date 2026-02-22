# ArtistAI

Sistema SaaS de marketing digital para artistas e empresários do mundo musical brasileiro. Gera planejamentos estratégicos em PDF com IA e atua como agente conversacional via WhatsApp.

## Stack

- **Frontend:** Next.js 14 (App Router), TypeScript, Tailwind CSS, shadcn/ui
- **Backend:** Next.js API Routes, Prisma, PostgreSQL
- **IA:** OpenAI GPT-4o, Google Gemini 2.0 Flash
- **Filas:** BullMQ + Redis
- **Storage:** MinIO (S3)
- **PDF:** Puppeteer
- **Deploy:** Docker, Nginx, SSL

---

## Rodar localmente

1. **Requisitos:** Node.js 20, PostgreSQL, Redis (opcional para filas).

2. **Clone e instale:**
   ```bash
   cd artistai/app
   npm install
   ```

3. **Configure o ambiente:**
   ```bash
   cp .env.example .env
   # Edite .env com DATABASE_URL, OPENAI_API_KEY, JWT_SECRET, etc.
   ```

4. **Banco de dados:**
   ```bash
   npx prisma migrate dev
   npm run seed:prompts
   ```

5. **Inicie o app:**
   ```bash
   npm run dev
   ```
   Acesse: [http://localhost:3000](http://localhost:3000)

---

## Deploy na VPS (Docker)

1. **Na VPS (Ubuntu):** use o script de setup (ou instale Docker + Docker Compose manualmente):
   ```bash
   chmod +x scripts/setup-vps.sh
   ./scripts/setup-vps.sh
   ```

2. **Configure o ambiente:**
   ```bash
   cp .env.example .env
   # Edite .env com senhas e chaves reais (APP_URL com seu domínio).
   ```

3. **SSL (recomendado):**
   ```bash
   sudo certbot certonly --standalone -d seudominio.com.br
   ```
   Ajuste `nginx/default.conf` com o nome do domínio e caminhos dos certificados.

4. **Suba os serviços:**
   ```bash
   docker compose up -d
   ```

5. **Migrações (primeira vez):**
   ```bash
   docker compose exec app npx prisma migrate deploy
   docker compose exec app npm run seed:prompts
   ```

6. Acesse: `https://seudominio.com.br`

---

## Variáveis de ambiente

| Variável | Descrição |
|----------|-----------|
| `DB_PASSWORD` | Senha do PostgreSQL (compose) |
| `DATABASE_URL` | URL do Postgres (local: `postgresql://user:senha@localhost:5432/artistai`) |
| `OPENAI_API_KEY` | Chave da API OpenAI |
| `GEMINI_API_KEY` | Chave da API Google Gemini |
| `JWT_SECRET` | Chave secreta para JWT (auth) |
| `REDIS_URL` | URL do Redis (ex.: `redis://localhost:6379`) |
| `MINIO_ACCESS_KEY` / `MINIO_SECRET_KEY` | Credenciais MinIO |
| `MINIO_ENDPOINT` / `MINIO_PORT` | Host e porta do MinIO |
| `CHROMA_URL` | URL do ChromaDB (RAG) |
| `EVOLUTION_API_KEY` | Chave da Evolution API (WhatsApp) |
| `APP_URL` | URL pública do app (ex.: `https://seudominio.com.br`) |
| `NEXT_PUBLIC_APP_URL` | Mesma URL para o frontend |
| `NODE_ENV` | `development` ou `production` |

---

## Comandos úteis

| Comando | Descrição |
|---------|-----------|
| `npm run dev` | Desenvolvimento (app) |
| `npm run build` | Build de produção |
| `npm run start` | Inicia o app em produção (após build) |
| `npx prisma migrate dev` | Cria/aplica migrações (dev) |
| `npx prisma migrate deploy` | Aplica migrações (produção) |
| `npm run seed:prompts` | Popula system prompts iniciais |
| `docker compose up -d` | Sobe todos os serviços |
| `docker compose logs -f app` | Logs do app |
| `docker compose exec app npx prisma migrate deploy` | Migrations no container |

---

## Estrutura principal

```
artistai/
├── app/                 # Next.js (API + front)
│   ├── src/app/        # Rotas e API
│   ├── src/components/
│   ├── src/lib/
│   ├── src/services/
│   ├── prisma/
│   ├── Dockerfile
│   └── Dockerfile.worker
├── nginx/
│   └── default.conf
├── scripts/
│   └── setup-vps.sh
├── docker-compose.yml
├── .env.example
└── README.md
```

Documento completo do projeto: [PROJETO-ARTISTAI.md](../PROJETO-ARTISTAI.md) (na pasta do repositório).
