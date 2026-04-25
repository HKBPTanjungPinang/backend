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

## Default Users

Saat aplikasi pertama kali dijalankan, akan dibuat 2 user default:

| Username | Password | Role |
|----------|----------|------|
| superadmin | superadmin123 | Superadmin |
| admingereja | admingereja123 | AdminGereja |

**PENTING**: Ubah password ini setelah login pertama kali!

## API Endpoints

### Authentication

#### Login
```
POST /api/auth/login
Content-Type: application/json

{
  "username": "superadmin",
  "password": "superadmin123"
}

Response:
{
  "message": "Login berhasil",
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": 1,
    "username": "superadmin",
    "role": "Superadmin"
  }
}
```

### Admin Management (Superadmin Only)

#### Buat Admin Gereja
```
POST /api/admin/create
Authorization: Bearer <token>
Content-Type: application/json

{
  "username": "admingereja2",
  "password": "password123"
}
```

#### List Semua Admin Gereja
```
GET /api/admin
Authorization: Bearer <token>
```

#### Deaktifkan Admin Gereja
```
PUT /api/admin/:id/deactivate
Authorization: Bearer <token>
```

#### Aktifkan Admin Gereja
```
PUT /api/admin/:id/activate
Authorization: Bearer <token>
```

#### Hapus Admin Gereja
```
DELETE /api/admin/:id
Authorization: Bearer <token>
```

#### Ubah Password Admin
```
PUT /api/admin/change-password
Authorization: Bearer <token>
Content-Type: application/json

{
  "adminId": 2,
  "newPassword": "newpassword123"
}
```

### Data Access (Public - No Auth Required)

Semua endpoint GET untuk melihat data dapat diakses tanpa login:

#### Ambil Semua Data
```
GET /api/minggu-batak
GET /api/minggu-indonesia
GET /api/partangiangan
GET /api/kontemporer
GET /api/tingting
GET /api/sejarah

Response:
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

#### Ambil Data by ID
```
GET /api/minggu-batak/:id
```

#### View File (Inline)
```
GET /api/minggu-batak/:id/view
```

#### Download File
```
GET /api/minggu-batak/:id/download
```

### Data Management (Admin/Superadmin Only)

#### Buat Data Baru
```
POST /api/minggu-batak
Authorization: Bearer <token>
Content-Type: multipart/form-data

FormData:
- tanggal: "2026-05-03"
- file: <PDF file>
```

#### Update Data
```
PUT /api/minggu-batak/:id
Authorization: Bearer <token>
Content-Type: multipart/form-data

FormData:
- tanggal: "2026-05-03" (optional)
- file: <PDF file> (optional)
```

#### Hapus Data
```
DELETE /api/minggu-batak/:id
Authorization: Bearer <token>
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

### Testing API dengan cURL

Login:
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"superadmin","password":"superadmin123"}'
```

Get Data:
```bash
curl http://localhost:3000/api/minggu-batak
```

Create Data (dengan token):
```bash
curl -X POST http://localhost:3000/api/minggu-batak \
  -H "Authorization: Bearer <token>" \
  -F "tanggal=2026-05-03" \
  -F "file=@document.pdf"
```

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
