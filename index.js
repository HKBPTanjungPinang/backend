require("dotenv").config();

const path = require("path");
const express = require("express");
const { initializeDatabase } = require("./src/config/database");
const apiRouter = require("./src/routes");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

app.get("/", (_req, res) => {
  res.json({
    message: "APP_GEREJA backend is running",
  });
});

app.use("/api", apiRouter);

app.use((req, res) => {
  res.status(404).json({
    message: `Route ${req.method} ${req.originalUrl} tidak ditemukan`,
  });
});

app.use((error, _req, res, _next) => {
  console.error(error);

  const statusCode = error.statusCode || 500;
  res.status(statusCode).json({
    message: error.message || "Terjadi kesalahan pada server",
  });
});

initializeDatabase()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server berjalan di http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Gagal inisialisasi database:", error);
    process.exit(1);
  });
