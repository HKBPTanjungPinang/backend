const fs = require("fs");
const path = require("path");
const sqlite3 = require("sqlite3").verbose();
const bcrypt = require("bcryptjs");

const dbPath = path.resolve(process.cwd(), process.env.DB_PATH || "./database.db");

const db = new sqlite3.Database(dbPath, (error) => {
  if (error) {
    console.error("Gagal terhubung ke SQLite:", error.message);
  }
});

function run(query, params = []) {
  return new Promise((resolve, reject) => {
    db.run(query, params, function onRun(error) {
      if (error) {
        reject(error);
        return;
      }

      resolve({
        id: this.lastID,
        changes: this.changes,
      });
    });
  });
}

function get(query, params = []) {
  return new Promise((resolve, reject) => {
    db.get(query, params, (error, row) => {
      if (error) {
        reject(error);
        return;
      }

      resolve(row || null);
    });
  });
}

function all(query, params = []) {
  return new Promise((resolve, reject) => {
    db.all(query, params, (error, rows) => {
      if (error) {
        reject(error);
        return;
      }

      resolve(rows);
    });
  });
}

function ensureSamplePdf(relativeFilePath, label) {
  const absolutePath = path.resolve(process.cwd(), relativeFilePath);
  const directory = path.dirname(absolutePath);
  fs.mkdirSync(directory, { recursive: true });

  if (fs.existsSync(absolutePath)) {
    return;
  }

  const safeLabel = String(label).replace(/[()]/g, "");
  const content = `%PDF-1.1
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /MediaBox [0 0 400 180] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>
endobj
4 0 obj
<< /Length 58 >>
stream
BT
/F1 16 Tf
40 110 Td
(${safeLabel}) Tj
ET
endstream
endobj
5 0 obj
<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>
endobj
xref
0 6
0000000000 65535 f 
0000000010 00000 n 
0000000063 00000 n 
0000000122 00000 n 
0000000250 00000 n 
0000000355 00000 n 
trailer
<< /Size 6 /Root 1 0 R >>
startxref
425
%%EOF
`;

  fs.writeFileSync(absolutePath, content, "ascii");
}

async function normalizeStoredPdfPaths(tableName, folderName, labelPrefix) {
  const rows = await all(`SELECT id, file FROM ${tableName}`);
  const cwdPath = process.cwd().replace(/\\/g, "/");

  for (const row of rows) {
    const normalizedFile = String(row.file).replace(/\\/g, "/");
    const relativeFile = normalizedFile.startsWith(cwdPath)
      ? normalizedFile.slice(cwdPath.length + 1)
      : normalizedFile;

    if (relativeFile.startsWith("uploads/")) {
      ensureSamplePdf(relativeFile, `${labelPrefix} ${row.id}`);
      if (relativeFile !== row.file) {
        await run(`UPDATE ${tableName} SET file = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`, [
          relativeFile,
          row.id,
        ]);
      }
      continue;
    }

    const normalizedPath = `uploads/${folderName}/${path.basename(relativeFile)}`;
    ensureSamplePdf(normalizedPath, `${labelPrefix} ${row.id}`);
    await run(`UPDATE ${tableName} SET file = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`, [
      normalizedPath,
      row.id,
    ]);
  }
}

async function initializeDatabase() {
  await run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      role TEXT NOT NULL CHECK(role IN ('Superadmin', 'AdminGereja')),
      is_active INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await run(`
    CREATE TABLE IF NOT EXISTS sejarah (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      deskripsi TEXT NOT NULL,
      gambar TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await run(`
    CREATE TABLE IF NOT EXISTS minggu_batak (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      tanggal TEXT NOT NULL,
      file TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await run(`
    CREATE TABLE IF NOT EXISTS minggu_indonesia (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      tanggal TEXT NOT NULL,
      file TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await run(`
    CREATE TABLE IF NOT EXISTS partangiangan (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      tanggal TEXT NOT NULL,
      lokasi TEXT NOT NULL,
      waktu TEXT NOT NULL,
      file TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await run(`
    CREATE TABLE IF NOT EXISTS kontemporer (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      tanggal TEXT NOT NULL,
      file TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await run(`
    CREATE TABLE IF NOT EXISTS tingting (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      tanggal TEXT NOT NULL,
      file TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);

  const existingUserCount = await get("SELECT COUNT(*) AS total FROM users");

  if (existingUserCount.total === 0) {
    const salt = await bcrypt.genSalt(10);
    const superadminPassword = await bcrypt.hash("superadmin123", salt);
    const adminPassword = await bcrypt.hash("admingereja123", salt);

    await run(
      `
        INSERT INTO users (username, password, role, is_active)
        VALUES
        (?, ?, ?, 1),
        (?, ?, ?, 1)
      `,
      ["superadmin", superadminPassword, "Superadmin", "admingereja", adminPassword, "AdminGereja"]
    );
  }

  const existingSejarahCount = await get("SELECT COUNT(*) AS total FROM sejarah");
  if (existingSejarahCount.total === 0) {
    await run(
      `
        INSERT INTO sejarah (deskripsi, gambar)
        VALUES
        (?, ?),
        (?, ?)
      `,
      [
        "Gereja APP_GEREJA berdiri sebagai tempat persekutuan jemaat untuk beribadah, bertumbuh dalam iman, dan melayani bersama di tengah masyarakat.",
        "sejarah-gereja-1.jpg",
        "Seiring waktu, gereja berkembang dengan pelayanan sekolah minggu, ibadah keluarga, dan berbagai kegiatan pembinaan rohani jemaat.",
        "sejarah-gereja-2.jpg",
      ]
    );
  }

  const existingMingguBatakCount = await get("SELECT COUNT(*) AS total FROM minggu_batak");
  if (existingMingguBatakCount.total === 0) {
    ensureSamplePdf("uploads/minggu-batak/minggu-batak-2026-04-19.pdf", "Minggu Batak 2026-04-19");
    ensureSamplePdf("uploads/minggu-batak/minggu-batak-2026-04-26.pdf", "Minggu Batak 2026-04-26");
    await run(
      `
        INSERT INTO minggu_batak (tanggal, file)
        VALUES
        (?, ?),
        (?, ?)
      `,
      [
        "2026-04-19",
        "uploads/minggu-batak/minggu-batak-2026-04-19.pdf",
        "2026-04-26",
        "uploads/minggu-batak/minggu-batak-2026-04-26.pdf",
      ]
    );
  }
  await normalizeStoredPdfPaths("minggu_batak", "minggu-batak", "Minggu Batak");

  const existingMingguIndonesiaCount = await get("SELECT COUNT(*) AS total FROM minggu_indonesia");
  if (existingMingguIndonesiaCount.total === 0) {
    ensureSamplePdf("uploads/minggu-indonesia/minggu-indonesia-2026-04-19.pdf", "Minggu Indonesia 2026-04-19");
    ensureSamplePdf("uploads/minggu-indonesia/minggu-indonesia-2026-04-26.pdf", "Minggu Indonesia 2026-04-26");
    await run(
      `
        INSERT INTO minggu_indonesia (tanggal, file)
        VALUES
        (?, ?),
        (?, ?)
      `,
      [
        "2026-04-19",
        "uploads/minggu-indonesia/minggu-indonesia-2026-04-19.pdf",
        "2026-04-26",
        "uploads/minggu-indonesia/minggu-indonesia-2026-04-26.pdf",
      ]
    );
  }
  await normalizeStoredPdfPaths("minggu_indonesia", "minggu-indonesia", "Minggu Indonesia");

  const existingPartangianganCount = await get("SELECT COUNT(*) AS total FROM partangiangan");
  if (existingPartangianganCount.total === 0) {
    ensureSamplePdf("uploads/partangiangan/partangiangan-2026-04-20.pdf", "Partangiangan 2026-04-20");
    ensureSamplePdf("uploads/partangiangan/partangiangan-2026-04-27.pdf", "Partangiangan 2026-04-27");
    await run(
      `
        INSERT INTO partangiangan (tanggal, lokasi, waktu, file)
        VALUES
        (?, ?, ?, ?),
        (?, ?, ?, ?)
      `,
      [
        "2026-04-20",
        "Rumah Keluarga Simanjuntak",
        "19:00",
        "uploads/partangiangan/partangiangan-2026-04-20.pdf",
        "2026-04-27",
        "Rumah Keluarga Sitorus",
        "19:30",
        "uploads/partangiangan/partangiangan-2026-04-27.pdf",
      ]
    );
  }
  await normalizeStoredPdfPaths("partangiangan", "partangiangan", "Partangiangan");

  const existingKontemporerCount = await get("SELECT COUNT(*) AS total FROM kontemporer");
  if (existingKontemporerCount.total === 0) {
    ensureSamplePdf("uploads/kontemporer/kontemporer-2026-04-21.pdf", "Kontemporer 2026-04-21");
    ensureSamplePdf("uploads/kontemporer/kontemporer-2026-04-28.pdf", "Kontemporer 2026-04-28");
    await run(
      `
        INSERT INTO kontemporer (tanggal, file)
        VALUES
        (?, ?),
        (?, ?)
      `,
      [
        "2026-04-21",
        "uploads/kontemporer/kontemporer-2026-04-21.pdf",
        "2026-04-28",
        "uploads/kontemporer/kontemporer-2026-04-28.pdf",
      ]
    );
  }
  await normalizeStoredPdfPaths("kontemporer", "kontemporer", "Kontemporer");

  const existingTingtingCount = await get("SELECT COUNT(*) AS total FROM tingting");
  if (existingTingtingCount.total === 0) {
    const sampleTingtingFile = "uploads/tingting/contoh-tingting.pdf";
    ensureSamplePdf(sampleTingtingFile, "Tingting APP GEREJA");
    await run(
      `
        INSERT INTO tingting (tanggal, file)
        VALUES (?, ?)
      `,
      [
        "2026-04-20",
        sampleTingtingFile,
      ]
    );
  }
  await normalizeStoredPdfPaths("tingting", "tingting", "Tingting");
}

module.exports = {
  db,
  run,
  get,
  all,
  initializeDatabase,
};
