#!/bin/bash
# ============================================
# ArtistAI — Setup da VPS Hostinger (Ubuntu 24)
# KVM 4 — 16GB RAM
# ============================================

echo "🎵 Iniciando setup do ArtistAI..."

# Atualizar sistema
sudo apt update && sudo apt upgrade -y

# Instalar Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Instalar Docker Compose
sudo apt install docker-compose-plugin -y

# Instalar Node.js 20 (para dev local)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Instalar Certbot (SSL)
sudo apt install certbot -y

# Instalar Git
sudo apt install git -y

# Criar diretórios
mkdir -p /opt/artistai
cd /opt/artistai

# Gerar SSL (substituir pelo seu domínio)
# sudo certbot certonly --standalone -d seudominio.com.br

echo "✅ Setup básico concluído!"
echo ""
echo "Próximos passos:"
echo "1. Clone o repositório: git clone https://github.com/frdigitalbrasil/ArtistIA.git /opt/artistai"
echo "2. Configure o .env"
echo "3. Rode: docker compose up -d"
echo "4. Acesse: https://seudominio.com.br"
