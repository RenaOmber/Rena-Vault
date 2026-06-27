# Rena Omber — Internal Vault
## Setup Guide

### 1. Supabase — buat storage bucket

1. Buka Supabase project kamu
2. Pergi ke **Storage** → New bucket
3. Nama bucket: `vault-docs`
4. Centang **Public**: ❌ (biarkan private)
5. Klik Create

Lalu buat folder per kategori di dalam bucket:
- `lore/`
- `design/`
- `marketing/`
- `social/`
- `finance/`
- `ops/`

(Cara paling mudah: upload satu file `.keep` kosong ke masing-masing folder lewat UI Supabase)

### 2. Supabase — RLS policy

Di SQL Editor Supabase, jalankan ini:

```sql
-- Allow anyone with anon key to read & upload (access dikontrol di frontend via password)
create policy "vault read"
  on storage.objects for select
  using (bucket_id = 'vault-docs');

create policy "vault upload"
  on storage.objects for insert
  with check (bucket_id = 'vault-docs');
```

### 3. Generate password hash

Buka browser console (F12), ketik:

```javascript
const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode('passwordkamu'));
console.log(Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2,'0')).join(''));
```

Copy hasilnya.

### 4. Edit index.html

Cari bagian `// ─── CONFIG` dan isi:

```javascript
const SUPABASE_URL  = 'https://xxxxx.supabase.co';
const SUPABASE_ANON = 'eyJhbGci...'; // anon public key dari Supabase → Settings → API
const PASSWORD_HASH = 'hash dari langkah 3';
```

### 5. Deploy ke Vercel

```bash
npm i -g vercel
cd rena-omber-vault
vercel --prod
```

Atau drag-drop folder ini ke vercel.com/new.

---

Selesai. Website siap dipakai.
