const express = require("express");
const { get } = require("../config/database");
const { createResourceController, createError } = require("../controllers/resourceController");
const { createPdfResourceController } = require("../controllers/pdfResourceController");
const createPdfUploadMiddleware = require("../middlewares/createPdfUploadMiddleware");

const router = express.Router();

const userController = createResourceController({
  tableName: "users",
  fields: ["username", "role"],
  requiredFields: ["username", "role"],
  orderBy: "id ASC",
  hooks: {
    async beforeCreate(payload) {
      const totalUsers = await get("SELECT COUNT(*) AS total FROM users");
      if (totalUsers.total >= 2) {
        throw createError("Tabel users hanya boleh memiliki 2 user", 400);
      }

      const duplicateRole = await get("SELECT id FROM users WHERE role = ?", [payload.role]);
      if (duplicateRole) {
        throw createError(`Role ${payload.role} sudah ada`, 400);
      }
    },
    async beforeUpdate(payload, id) {
      const duplicateRole = await get("SELECT id FROM users WHERE role = ? AND id != ?", [payload.role, id]);
      if (duplicateRole) {
        throw createError(`Role ${payload.role} sudah dipakai user lain`, 400);
      }
    },
  },
});

const sejarahController = createResourceController({
  tableName: "sejarah",
  fields: ["deskripsi", "gambar"],
  requiredFields: ["deskripsi", "gambar"],
});

const pdfMingguBatakController = createPdfResourceController({
  tableName: "minggu_batak",
  routeName: "minggu-batak",
  fields: ["tanggal", "deskripsi", "file"],
});

const pdfMingguIndonesiaController = createPdfResourceController({
  tableName: "minggu_indonesia",
  routeName: "minggu-indonesia",
  fields: ["tanggal", "deskripsi", "file"],
});

const pdfPartangianganController = createPdfResourceController({
  tableName: "partangiangan",
  routeName: "partangiangan",
  fields: ["tanggal", "lokasi", "waktu", "file"],
});

const pdfKontemporerController = createPdfResourceController({
  tableName: "kontemporer",
  routeName: "kontemporer",
  fields: ["tanggal", "deskripsi", "file"],
});

const pdfTingtingController = createPdfResourceController({
  tableName: "tingting",
  routeName: "tingting",
  fields: ["tanggal", "deskripsi", "file"],
});

const uploadMingguBatak = createPdfUploadMiddleware("minggu-batak");
const uploadMingguIndonesia = createPdfUploadMiddleware("minggu-indonesia");
const uploadPartangiangan = createPdfUploadMiddleware("partangiangan");
const uploadKontemporer = createPdfUploadMiddleware("kontemporer");
const uploadTingting = createPdfUploadMiddleware("tingting");

router.get("/", (_req, res) => {
  res.json({
    message: "API APP_GEREJA siap digunakan",
    endpoints: {
      users: "/api/users",
      sejarah: "/api/sejarah",
      minggu_batak: "/api/minggu-batak",
      minggu_indonesia: "/api/minggu-indonesia",
      partangiangan: "/api/partangiangan",
      kontemporer: "/api/kontemporer",
      tingting: "/api/tingting",
    },
  });
});

registerCrudRoutes(router, "/users", userController);
registerCrudRoutes(router, "/sejarah", sejarahController);
registerPdfCrudRoutes(router, "/minggu-batak", pdfMingguBatakController, uploadMingguBatak);
registerPdfCrudRoutes(router, "/minggu-indonesia", pdfMingguIndonesiaController, uploadMingguIndonesia);
registerPdfCrudRoutes(router, "/partangiangan", pdfPartangianganController, uploadPartangiangan);
registerPdfCrudRoutes(router, "/kontemporer", pdfKontemporerController, uploadKontemporer);
registerPdfCrudRoutes(router, "/tingting", pdfTingtingController, uploadTingting);

function registerCrudRoutes(routerInstance, basePath, controller) {
  routerInstance.get(basePath, controller.getAll);
  routerInstance.get(`${basePath}/:id`, controller.getById);
  routerInstance.post(basePath, controller.create);
  routerInstance.put(`${basePath}/:id`, controller.update);
  routerInstance.delete(`${basePath}/:id`, controller.remove);
}

function registerPdfCrudRoutes(routerInstance, basePath, controller, uploadMiddleware) {
  routerInstance.get(basePath, controller.getAll);
  routerInstance.get(`${basePath}/:id/view`, controller.view);
  routerInstance.get(`${basePath}/:id/download`, controller.download);
  routerInstance.get(`${basePath}/:id`, controller.getById);
  routerInstance.post(basePath, uploadMiddleware.single("file"), controller.create);
  routerInstance.put(`${basePath}/:id`, uploadMiddleware.single("file"), controller.update);
  routerInstance.delete(`${basePath}/:id`, controller.remove);
}

module.exports = router;
