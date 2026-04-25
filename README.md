# APP_GEREJA Backend

Backend ini menggunakan `Express` dan `SQLite` tanpa frontend.

## Menjalankan project

```bash
npm run dev
```

atau

```bash
npm start
```

Server berjalan di:

```bash
http://localhost:3000
```

## Database

Database SQLite otomatis dibuat dari nilai:

```env
DB_PATH=./database.db
```

Saat server pertama kali jalan, tabel `users` otomatis diisi 2 user:

- `superadmin` dengan role `Superadmin`
- `admingereja` dengan role `AdminGereja`

Tabel `users` dibatasi hanya boleh berisi 2 user.

## Endpoint CRUD

### 1. Users

- `GET /api/users`
- `GET /api/users/:id`
- `POST /api/users`
- `PUT /api/users/:id`
- `DELETE /api/users/:id`

Contoh body:

```json
{
  "username": "superadmin",
  "role": "Superadmin"
}
```

Role hanya boleh:

- `Superadmin`
- `AdminGereja`

### 2. Sejarah

- `GET /api/sejarah`
- `GET /api/sejarah/:id`
- `POST /api/sejarah`
- `PUT /api/sejarah/:id`
- `DELETE /api/sejarah/:id`

Contoh body:

```json
{
  "deskripsi": "Sejarah berdirinya gereja",
  "gambar": "sejarah-gereja.jpg"
}
```

### 3. Minggu Batak

- `GET /api/minggu-batak`
- `GET /api/minggu-batak/:id`
- `POST /api/minggu-batak`
- `PUT /api/minggu-batak/:id`
- `DELETE /api/minggu-batak/:id`

Contoh body:

```json
{
  "tanggal": "2026-04-19",
  "deskripsi": "Ibadah Minggu Batak",
  "file": "minggu-batak.pdf"
}
```

### 4. Minggu Indonesia

- `GET /api/minggu-indonesia`
- `GET /api/minggu-indonesia/:id`
- `POST /api/minggu-indonesia`
- `PUT /api/minggu-indonesia/:id`
- `DELETE /api/minggu-indonesia/:id`

Contoh body:

```json
{
  "tanggal": "2026-04-19",
  "deskripsi": "Ibadah Minggu Indonesia",
  "file": "minggu-indonesia.pdf"
}
```

### 5. Partangiangan

- `GET /api/partangiangan`
- `GET /api/partangiangan/:id`
- `POST /api/partangiangan`
- `PUT /api/partangiangan/:id`
- `DELETE /api/partangiangan/:id`

Contoh body:

```json
{
  "tanggal": "2026-04-20",
  "lokasi": "Medan",
  "waktu": "19:00",
  "file": "partangiangan.pdf"
}
```

### 6. Kontemporer

- `GET /api/kontemporer`
- `GET /api/kontemporer/:id`
- `POST /api/kontemporer`
- `PUT /api/kontemporer/:id`
- `DELETE /api/kontemporer/:id`

Contoh body:

```json
{
  "tanggal": "2026-04-21",
  "deskripsi": "Jadwal ibadah kontemporer",
  "file": "kontemporer.pdf"
}
```
