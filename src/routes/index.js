const express = require("express");
const { get } = require("../config/database");
const { createResourceController, createError } = require("../controllers/resourceController");
const { createPdfResourceController } = require("../controllers/pdfResourceController");
const createPdfUploadMiddleware = require("../middlewares/createPdfUploadMiddleware");
const authController = require("../controllers/authController");
const {
  authMiddleware,
  superadminMiddleware,
  adminOrSuperadminMiddleware,
} = require("../middlewares/authMiddleware");

const router = express.Router();

const sejarahController = createResourceController({
  tableName: "sejarah",
  fields: ["deskripsi", "gambar"],
  requiredFields: ["deskripsi", "gambar"],
});

const pdfMingguBatakController = createPdfResourceController({
  tableName: "minggu_batak",
  routeName: "minggu-batak",
  fields: ["tanggal", "file"],
});

const pdfMingguIndonesiaController = createPdfResourceController({
  tableName: "minggu_indonesia",
  routeName: "minggu-indonesia",
  fields: ["tanggal", "file"],
});

const pdfPartangianganController = createPdfResourceController({
  tableName: "partangiangan",
  routeName: "partangiangan",
  fields: ["tanggal", "lokasi", "waktu", "file"],
});

const pdfKontemporerController = createPdfResourceController({
  tableName: "kontemporer",
  routeName: "kontemporer",
  fields: ["tanggal", "file"],
});

const pdfTingtingController = createPdfResourceController({
  tableName: "tingting",
  routeName: "tingting",
  fields: ["tanggal", "file"],
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
      auth: {
        login: "POST /api/auth/login",
        admin: {
          create: "POST /api/admin/create",
          list: "GET /api/admin",
          activate: "PUT /api/admin/:id/activate",
          deactivate: "PUT /api/admin/:id/deactivate",
          delete: "DELETE /api/admin/:id",
          changePassword: "PUT /api/admin/change-password",
        },
      },
      public: {
        sejarah: "GET /api/sejarah",
        minggu_batak: "GET /api/minggu-batak",
        minggu_indonesia: "GET /api/minggu-indonesia",
        partangiangan: "GET /api/partangiangan",
        kontemporer: "GET /api/kontemporer",
        tingting: "GET /api/tingting",
      },
      adminOnly: {
        sejarah: "POST/PUT/DELETE /api/sejarah",
        minggu_batak: "POST/PUT/DELETE /api/minggu-batak",
        minggu_indonesia: "POST/PUT/DELETE /api/minggu-indonesia",
        partangiangan: "POST/PUT/DELETE /api/partangiangan",
        kontemporer: "POST/PUT/DELETE /api/kontemporer",
        tingting: "POST/PUT/DELETE /api/tingting",
      },
    },
  });
});

// Auth routes
router.post("/auth/login", authController.login);

// Admin management routes (Superadmin only)
router.post("/admin/create", authMiddleware, superadminMiddleware, authController.createAdminGereja);
router.get("/admin", authMiddleware, superadminMiddleware, authController.listAdminGereja);
router.put("/admin/:id/activate", authMiddleware, superadminMiddleware, authController.activateAdminGereja);
router.put("/admin/:id/deactivate", authMiddleware, superadminMiddleware, authController.deactivateAdminGereja);
router.delete("/admin/:id", authMiddleware, superadminMiddleware, authController.deleteAdminGereja);
router.put("/admin/change-password", authMiddleware, superadminMiddleware, authController.changePassword);

// Public routes - READ ONLY (no auth required)
registerPublicCrudRoutes(router, "/sejarah", sejarahController);
registerPublicPdfCrudRoutes(router, "/minggu-batak", pdfMingguBatakController);
registerPublicPdfCrudRoutes(router, "/minggu-indonesia", pdfMingguIndonesiaController);
registerPublicPdfCrudRoutes(router, "/partangiangan", pdfPartangianganController);
registerPublicPdfCrudRoutes(router, "/kontemporer", pdfKontemporerController);
registerPublicPdfCrudRoutes(router, "/tingting", pdfTingtingController);

// Protected routes - WRITE OPERATIONS (auth required for POST/PUT/DELETE)
registerProtectedWriteRoutes(router, "/sejarah", sejarahController);
registerProtectedPdfWriteRoutes(router, "/minggu-batak", pdfMingguBatakController, uploadMingguBatak);
registerProtectedPdfWriteRoutes(router, "/minggu-indonesia", pdfMingguIndonesiaController, uploadMingguIndonesia);
registerProtectedPdfWriteRoutes(router, "/partangiangan", pdfPartangianganController, uploadPartangiangan);
registerProtectedPdfWriteRoutes(router, "/kontemporer", pdfKontemporerController, uploadKontemporer);
registerProtectedPdfWriteRoutes(router, "/tingting", pdfTingtingController, uploadTingting);

function registerPublicCrudRoutes(routerInstance, basePath, controller) {
  routerInstance.get(basePath, controller.getAll);
  routerInstance.get(`${basePath}/:id`, controller.getById);
}

function registerProtectedWriteRoutes(routerInstance, basePath, controller) {
  routerInstance.post(basePath, authMiddleware, adminOrSuperadminMiddleware, controller.create);
  routerInstance.put(`${basePath}/:id`, authMiddleware, adminOrSuperadminMiddleware, controller.update);
  routerInstance.delete(`${basePath}/:id`, authMiddleware, adminOrSuperadminMiddleware, controller.remove);
}

function registerPublicPdfCrudRoutes(routerInstance, basePath, controller) {
  routerInstance.get(basePath, controller.getAll);
  routerInstance.get(`${basePath}/:id/view`, controller.view);
  routerInstance.get(`${basePath}/:id/download`, controller.download);
  routerInstance.get(`${basePath}/:id`, controller.getById);
}

function registerProtectedPdfWriteRoutes(routerInstance, basePath, controller, uploadMiddleware) {
  routerInstance.post(basePath, authMiddleware, adminOrSuperadminMiddleware, uploadMiddleware.single("file"), controller.create);
  routerInstance.put(`${basePath}/:id`, authMiddleware, adminOrSuperadminMiddleware, uploadMiddleware.single("file"), controller.update);
  routerInstance.delete(`${basePath}/:id`, authMiddleware, adminOrSuperadminMiddleware, controller.remove);
}

module.exports = router;

module.exports = router;
