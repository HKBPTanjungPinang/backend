# APP GEREJA Backend API

Backend API untuk Gereja HKBP Tanjung Pinang yang mengelola data ibadah, acara, dan pengumuman dengan sistem authentication dan authorization berbasis role.

## Fitur Utama

- **Authentication & Authorization**: Login dengan JWT token dan role-based access control
- **Admin Management**: Superadmin dapat mengelola akun Admin Gereja
- **Data Management**: Admin Gereja dapat mengelola semua data acara dan ibadah
- **Public Access**: Pengguna publik dapat mengakses semua file tanpa login
- **PDF File Management**: Upload, download, dan view file PDF untuk setiap menu

## Teknologi yang Digunakan

- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **SQLite** - Database
- **JWT** - Authentication token
- **Bcryptjs** - Password hashing
- **Multer** - File upload handling

## Setup & Installation

### Prerequisites

- Node.js (v14 atau lebih tinggi)
- npm

### Instalasi

```bash
# Clone repository
git clone https://github.com/HKBPTanjungPinang/backend.git
cd backend

# Install dependencies
npm install

# Jalankan server
npm start

# Atau gunakan development mode dengan nodemon
npm run dev
```

Server akan berjalan di `http://localhost:3000`

## Environment Variables

Buat file `.env` di root directory:

```env
PORT=3000
DB_PATH=./database.db
JWT_SECRET=your-secret-key-change-in-production
```

## Database Schema

### Users Table
- `id` - ID pengguna
- `username` - Username unik
- `password` - Password yang di-hash
- `role` - Role pengguna (Superadmin atau AdminGereja)
- `is_active` - Status aktif (1 atau 0)
- `created_at` - Tanggal pembuatan
- `updated_at` - Tanggal update

### Menu Data Tables (minggu_batak, minggu_indonesia, kontemporer, tingting)
- `id` - ID data
- `tanggal` - Tanggal acara
- `file` - Path file PDF
- `created_at` - Tanggal pembuatan
- `updated_at` - Tanggal update

### Partangiangan Table
- `id` - ID data
- `tanggal` - Tanggal acara
- `lokasi` - Lokasi partangiangan
- `waktu` - Waktu acara
- `file` - Path file PDF
- `created_at` - Tanggal pembuatan
- `updated_at` - Tanggal update

### Sejarah Table
- `id` - ID data
- `deskripsi` - Deskripsi sejarah
- `gambar` - Path gambar
- `created_at` - Tanggal pembuatan
- `updated_at` - Tanggal update

## Keamanan

Aplikasi ini menggunakan JWT untuk authentication dan bcryptjs untuk password hashing. Pastikan untuk:

1. **Mengubah JWT_SECRET** di file `.env` dengan nilai yang kuat
2. **Mengubah password default** akun Superadmin dan AdminGereja setelah first login
3. **Jangan membagikan credentials** ke publik

## API Endpoints

### Authentication

| Method | Endpoint | Auth | Deskripsi |
|--------|----------|------|-----------|
| POST | `/api/auth/login` | No | Login dengan username & password, returns JWT token |

### Admin Management (Superadmin Only)

| Method | Endpoint | Auth | Deskripsi |
|--------|----------|------|-----------|
| POST | `/api/admin/create` | Yes | Buat akun Admin Gereja baru |
| GET | `/api/admin` | Yes | Lihat daftar semua Admin Gereja |
| PUT | `/api/admin/:id/activate` | Yes | Aktifkan Admin Gereja yang sudah dinonaktifkan |
| PUT | `/api/admin/:id/deactivate` | Yes | Nonaktifkan Admin Gereja |
| DELETE | `/api/admin/:id` | Yes | Hapus Admin Gereja |
| PUT | `/api/admin/change-password` | Yes | Ubah password Admin Gereja |

### Minggu Batak (Public Read, Admin Write)

| Method | Endpoint | Auth | Deskripsi |
|--------|----------|------|-----------|
| GET | `/api/minggu-batak` | No | Ambil semua data Minggu Batak |
| GET | `/api/minggu-batak/:id` | No | Ambil detail data Minggu Batak by ID |
| GET | `/api/minggu-batak/:id/view` | No | View file PDF inline |
| GET | `/api/minggu-batak/:id/download` | No | Download file PDF |
| POST | `/api/minggu-batak` | Yes | Buat data Minggu Batak baru (dengan upload PDF) |
| PUT | `/api/minggu-batak/:id` | Yes | Update data Minggu Batak |
| DELETE | `/api/minggu-batak/:id` | Yes | Hapus data Minggu Batak |

### Minggu Indonesia (Public Read, Admin Write)

| Method | Endpoint | Auth | Deskripsi |
|--------|----------|------|-----------|
| GET | `/api/minggu-indonesia` | No | Ambil semua data Minggu Indonesia |
| GET | `/api/minggu-indonesia/:id` | No | Ambil detail data Minggu Indonesia by ID |
| GET | `/api/minggu-indonesia/:id/view` | No | View file PDF inline |
| GET | `/api/minggu-indonesia/:id/download` | No | Download file PDF |
| POST | `/api/minggu-indonesia` | Yes | Buat data Minggu Indonesia baru |
| PUT | `/api/minggu-indonesia/:id` | Yes | Update data Minggu Indonesia |
| DELETE | `/api/minggu-indonesia/:id` | Yes | Hapus data Minggu Indonesia |

### Partangiangan (Public Read, Admin Write)

| Method | Endpoint | Auth | Deskripsi |
|--------|----------|------|-----------|
| GET | `/api/partangiangan` | No | Ambil semua data Partangiangan |
| GET | `/api/partangiangan/:id` | No | Ambil detail data Partangiangan by ID |
| GET | `/api/partangiangan/:id/view` | No | View file PDF inline |
| GET | `/api/partangiangan/:id/download` | No | Download file PDF |
| POST | `/api/partangiangan` | Yes | Buat data Partangiangan baru |
| PUT | `/api/partangiangan/:id` | Yes | Update data Partangiangan |
| DELETE | `/api/partangiangan/:id` | Yes | Hapus data Partangiangan |

### Kontemporer (Public Read, Admin Write)

| Method | Endpoint | Auth | Deskripsi |
|--------|----------|------|-----------|
| GET | `/api/kontemporer` | No | Ambil semua data Kontemporer |
| GET | `/api/kontemporer/:id` | No | Ambil detail data Kontemporer by ID |
| GET | `/api/kontemporer/:id/view` | No | View file PDF inline |
| GET | `/api/kontemporer/:id/download` | No | Download file PDF |
| POST | `/api/kontemporer` | Yes | Buat data Kontemporer baru |
| PUT | `/api/kontemporer/:id` | Yes | Update data Kontemporer |
| DELETE | `/api/kontemporer/:id` | Yes | Hapus data Kontemporer |

### Tingting (Public Read, Admin Write)

| Method | Endpoint | Auth | Deskripsi |
|--------|----------|------|-----------|
| GET | `/api/tingting` | No | Ambil semua data Tingting |
| GET | `/api/tingting/:id` | No | Ambil detail data Tingting by ID |
| GET | `/api/tingting/:id/view` | No | View file PDF inline |
| GET | `/api/tingting/:id/download` | No | Download file PDF |
| POST | `/api/tingting` | Yes | Buat data Tingting baru |
| PUT | `/api/tingting/:id` | Yes | Update data Tingting |
| DELETE | `/api/tingting/:id` | Yes | Hapus data Tingting |

### Sejarah (Public Read, Admin Write)

| Method | Endpoint | Auth | Deskripsi |
|--------|----------|------|-----------|
| GET | `/api/sejarah` | No | Ambil semua data Sejarah |
| GET | `/api/sejarah/:id` | No | Ambil detail data Sejarah by ID |
| POST | `/api/sejarah` | Yes | Buat data Sejarah baru |
| PUT | `/api/sejarah/:id` | Yes | Update data Sejarah |
| DELETE | `/api/sejarah/:id` | Yes | Hapus data Sejarah |

## Contoh Request & Response

### Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "your_username",
    "password": "your_password"
  }'
```

Response:
```json
{
  "message": "Login berhasil",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "username": "your_username",
    "role": "Superadmin"
  }
}
```

### Ambil Semua Data
```bash
curl http://localhost:3000/api/minggu-batak
```

Response:
```json
{
  "message": "Berhasil mengambil data",
  "data": [
    {
      "id": 1,
      "tanggal": "2026-04-19",
      "file": "uploads/minggu-batak/minggu-batak-2026-04-19.pdf",
      "created_at": "2026-04-26T10:00:00Z",
      "updated_at": "2026-04-26T10:00:00Z"
    }
  ]
}
```

### Buat Data Baru (dengan Authorization)
```bash
curl -X POST http://localhost:3000/api/minggu-batak \
  -H "Authorization: Bearer <token>" \
  -F "tanggal=2026-05-03" \
  -F "file=@document.pdf"
```

Response:
```json
{
  "message": "Berhasil membuat data",
  "data": {
    "id": 3,
    "tanggal": "2026-05-03",
    "file": "uploads/minggu-batak/minggu-batak-2026-05-03.pdf",
    "created_at": "2026-04-26T10:00:00Z",
    "updated_at": "2026-04-26T10:00:00Z"
  }
}
```

### Update Data
```bash
curl -X PUT http://localhost:3000/api/minggu-batak/1 \
  -H "Authorization: Bearer <token>" \
  -F "tanggal=2026-05-10" \
  -F "file=@new-document.pdf"
```

### Hapus Data
```bash
curl -X DELETE http://localhost:3000/api/minggu-batak/1 \
  -H "Authorization: Bearer <token>"
```

Response:
```json
{
  "message": "Berhasil menghapus data"
}
```

### Download File
```bash
curl -O http://localhost:3000/api/minggu-batak/1/download
```

### View File (Inline)
```
GET http://localhost:3000/api/minggu-batak/1/view
```

## Role dan Permission

### Superadmin
- Login
- Membuat akun Admin Gereja
- Melihat daftar Admin Gereja
- Mengaktifkan/Menonaktifkan Admin Gereja
- Menghapus Admin Gereja
- Mengubah password Admin Gereja
- Membuat/Edit/Hapus data di semua menu

### Admin Gereja
- Login
- Membuat/Edit/Hapus data di semua menu
- Melihat semua file publik

### Public User
- Melihat semua data (tanpa login)
- Download file
- View file

## File Upload

File upload menggunakan middleware Multer dengan folder destination sesuai menu:
- `/uploads/minggu-batak/`
- `/uploads/minggu-indonesia/`
- `/uploads/partangiangan/`
- `/uploads/kontemporer/`
- `/uploads/tingting/`

### Upload Rules
- Hanya file PDF yang diizinkan
- File size maksimal 10MB
- Nama file otomatis di-generate berdasarkan tanggal

## Error Handling

API mengembalikan error dengan format:
```json
{
  "message": "Error description"
}
```

HTTP Status Codes:
- `200` - OK
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Server Error

## Development

### Menjalankan dengan Nodemon (Auto-reload)
```bash
npm run dev
```

Lihat bagian **Contoh Request & Response** untuk testing API dengan cURL.

## Project Structure

```
backend/
├── src/
│   ├── config/
│   │   └── database.js          # Database configuration
│   ├── controllers/
│   │   ├── authController.js    # Authentication logic
│   │   ├── resourceController.js # Generic CRUD operations
│   │   └── pdfResourceController.js # PDF-specific operations
│   ├── middlewares/
│   │   ├── authMiddleware.js    # Authentication & authorization
│   │   └── createPdfUploadMiddleware.js # File upload handling
│   ├── utils/
│   │   └── auth.js              # Auth utilities (JWT, password hashing)
│   └── routes/
│       └── index.js             # All route definitions
├── uploads/                     # Uploaded files directory
├── .env                         # Environment variables
├── .gitignore                   # Git ignore rules
├── index.js                     # Application entry point
├── package.json                 # Project dependencies
└── README.md                    # This file
```

## Kontribusi

Untuk kontribusi, silakan buat pull request dengan deskripsi yang jelas.

## License

ISC

## Support

Untuk dukungan, silakan hubungi admin@hkbptanjungpinang.com
