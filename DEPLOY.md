# LABMUMA — Panduan Deploy ke Debian Server

## Arsitektur

```
Browser (internet/LAN)
        │
        ▼
  Cloudflare (HTTPS/SSL otomatis)
  ───────────────────────────────
  Domain: app.labmuma.xyz
        │
        ▼
  cloudflared tunnel (di server Debian)
        │
        ▼
  Docker Container — Next.js :3000
  ───────────────────────────────
  Database: Supabase PostgreSQL (cloud)
  Storage : Supabase Storage (cloud)
```

---

## Langkah 1: Install Docker & Docker Compose di Debian

SSH ke server Debian, lalu jalankan:

```bash
# Update sistem
sudo apt update && sudo apt upgrade -y

# Install dependencies
sudo apt install -y ca-certificates curl gnupg lsb-release git

# Tambah Docker GPG key
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/debian/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
sudo chmod a+r /etc/apt/keyrings/docker.gpg

# Tambah Docker repository
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/debian \
  $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Install Docker Engine
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# Tambahkan user saat ini ke grup docker (tidak perlu sudo tiap kali)
sudo usermod -aG docker $USER
newgrp docker

# Verifikasi
docker --version
docker compose version
```

---

## Langkah 2: Clone Repository

```bash
# Buat folder aplikasi
sudo mkdir -p /opt/labmuma
sudo chown $USER:$USER /opt/labmuma
cd /opt/labmuma

# Clone repo
git clone https://github.com/saifulohyr/sistem-lab.git .
```

---

## Langkah 3: Setup Environment Production

```bash
# Buat file .env.production dari template
cp .env.production.example .env.production

# Edit dengan nilai production
nano .env.production
```

Isi `.env.production` dengan nilai asli:

```env
DATABASE_URL="postgresql://postgres.xxx:PASSWORD@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.xxx:PASSWORD@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres"
AUTH_SECRET="generate-dengan-openssl-rand-base64-32"
NEXTAUTH_URL="https://app.labmuma.xyz"
NEXT_PUBLIC_SUPABASE_URL="https://xxx.supabase.co"
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY="sb_publishable_..."
```

> **Generate AUTH_SECRET baru:**
> ```bash
> openssl rand -base64 32
> ```

---

## Langkah 4: Deploy Aplikasi

```bash
# Beri izin eksekusi
chmod +x deploy.sh

# Jalankan deploy (pertama kali ~5 menit)
bash deploy.sh
```

Setelah selesai, cek status:
```bash
docker compose ps
docker compose logs -f app
```

---

## Langkah 5: Install & Setup Cloudflare Tunnel

### 5a. Install cloudflared

```bash
# Download cloudflared
curl -L https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb -o cloudflared.deb
sudo dpkg -i cloudflared.deb

# Verifikasi
cloudflared --version
```

### 5b. Login ke Cloudflare

```bash
cloudflared tunnel login
# Akan membuka browser — login dan pilih domain labmuma.xyz
```

### 5c. Buat Tunnel

```bash
# Buat tunnel bernama "labmuma"
cloudflared tunnel create labmuma

# Catat Tunnel ID yang muncul, misalnya: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
```

### 5d. Buat Config File

```bash
mkdir -p ~/.cloudflared
nano ~/.cloudflared/config.yml
```

Isi config:
```yaml
tunnel: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx  # ganti dengan Tunnel ID
credentials-file: /root/.cloudflared/xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx.json

ingress:
  - hostname: app.labmuma.xyz
    service: http://localhost:3000
  - service: http_status:404
```

### 5e. Setup DNS di Cloudflare Dashboard

```bash
# Otomatis tambah DNS record
cloudflared tunnel route dns labmuma app.labmuma.xyz
```

### 5f. Jalankan Tunnel sebagai Service (auto-start)

```bash
sudo cloudflared service install
sudo systemctl enable cloudflared
sudo systemctl start cloudflared
sudo systemctl status cloudflared
```

---

## Langkah 6: Verifikasi

1. Buka browser → `https://app.labmuma.xyz`
2. Harus muncul halaman login LABMUMA
3. Login dengan akun yang ada
4. Test semua fitur: dashboard, laporan, cetak dokumen

---

## Update Aplikasi (Selanjutnya)

Setiap ada update, cukup:
```bash
cd /opt/labmuma
bash deploy.sh
```

---

## Perintah Berguna

```bash
# Lihat log real-time
docker compose logs -f app

# Restart app tanpa rebuild
docker compose restart app

# Stop semua
docker compose down

# Cek penggunaan resource
docker stats labmuma

# Cek status tunnel
sudo systemctl status cloudflared

# Restart tunnel
sudo systemctl restart cloudflared
```

---

## Troubleshooting

### App tidak bisa diakses
```bash
docker compose ps                    # pastikan container "Up"
docker compose logs app --tail=50   # cek error di log
```

### Tunnel tidak terhubung
```bash
sudo systemctl status cloudflared
cloudflared tunnel info labmuma
```

### Auth error / NEXTAUTH_URL salah
- Pastikan `NEXTAUTH_URL=https://app.labmuma.xyz` di `.env.production`
- Rebuild container: `bash deploy.sh`
