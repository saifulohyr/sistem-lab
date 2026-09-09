#!/bin/bash
# ─── LABMUMA Deploy Script ────────────────────────────────────────
# Jalankan di server Debian: bash deploy.sh
set -e

echo ""
echo "🚀 =========================="
echo "   LABMUMA — Deploy Script   "
echo "=============================="
echo ""

# Pastikan .env.production ada
if [ ! -f ".env.production" ]; then
  echo "❌ ERROR: File .env.production tidak ditemukan!"
  echo "   Buat dulu: cp .env.production.example .env.production"
  echo "   Lalu isi dengan nilai yang benar."
  exit 1
fi

echo "📥 Pull kode terbaru dari GitHub..."
git pull origin main

echo ""
echo "🔽 Matikan container lama..."
docker compose down

echo ""
echo "🔨 Build Docker image (proses ini butuh 2-5 menit pertama kali)..."
docker compose up -d --build

echo ""
echo "🧹 Bersihkan image lama yang tidak terpakai..."
docker image prune -f

echo ""
echo "📊 Status container:"
docker compose ps

echo ""
echo "✅ Deploy selesai!"
echo "   App berjalan di: http://localhost:3000"
echo "   Public URL    : https://app.labmuma.xyz"
echo ""
echo "📋 Cek log app: docker compose logs -f app"
echo ""
