const fs = require("fs");
const path = require("path");
const { get, all, run } = require("../config/database");
const { createError } = require("./resourceController");

function removeFileIfExists(filePath) {
  if (!filePath) {
    return;
  }

  const absolutePath = path.resolve(process.cwd(), filePath);
  if (fs.existsSync(absolutePath)) {
    fs.unlinkSync(absolutePath);
  }
}

function normalizeStoredPath(filePath) {
  const normalizedPath = filePath.replace(/\\/g, "/");
  const cwdPath = process.cwd().replace(/\\/g, "/");

  if (normalizedPath.startsWith(cwdPath)) {
    return normalizedPath.slice(cwdPath.length + 1);
  }

  return normalizedPath;
}

function buildPdfUrls(req, routeName, row) {
  if (!row) {
    return row;
  }

  const normalizedFile = normalizeStoredPath(row.file);
  const fileName = path.basename(normalizedFile);
  const baseUrl = `${req.protocol}://${req.get("host")}`;

  return {
    ...row,
    file_url: `${baseUrl}/${normalizedFile}`,
    view_url: `${baseUrl}/api/${routeName}/${row.id}/view`,
    download_url: `${baseUrl}/api/${routeName}/${row.id}/download`,
    file_name: fileName,
  };
}

function validatePayload(body, reqFile, requiredFields, isUpdate = false) {
  for (const field of requiredFields) {
    if (field === "file") {
      continue;
    }

    if (!body[field]) {
      throw createError(`Field '${field}' wajib diisi`, 400);
    }
  }

  if (!isUpdate && !reqFile) {
    throw createError("File PDF wajib diupload", 400);
  }
}

function createPdfResourceController(config) {
  const {
    tableName,
    routeName = tableName,
    fields,
    requiredFields = fields,
    orderBy = "tanggal DESC, id DESC",
  } = config;

  return {
    async getAll(req, res, next) {
      try {
        const rows = await all(`SELECT * FROM ${tableName} ORDER BY ${orderBy}`);
        res.json(rows.map((row) => buildPdfUrls(req, routeName, row)));
      } catch (error) {
        next(error);
      }
    },

    async getById(req, res, next) {
      try {
        const row = await get(`SELECT * FROM ${tableName} WHERE id = ?`, [req.params.id]);
        if (!row) {
          throw createError(`Data ${tableName} dengan id ${req.params.id} tidak ditemukan`, 404);
        }

        res.json(buildPdfUrls(req, routeName, row));
      } catch (error) {
        next(error);
      }
    },

    async create(req, res, next) {
      try {
        validatePayload(req.body, req.file, requiredFields);

        const payload = {
          ...req.body,
          file: normalizeStoredPath(req.file.path),
        };

        const columns = fields.join(", ");
        const placeholders = fields.map(() => "?").join(", ");
        const values = fields.map((field) => payload[field]);

        const result = await run(
          `INSERT INTO ${tableName} (${columns}) VALUES (${placeholders})`,
          values
        );

        const createdRow = await get(`SELECT * FROM ${tableName} WHERE id = ?`, [result.id]);
        res.status(201).json(buildPdfUrls(req, routeName, createdRow));
      } catch (error) {
        if (req.file) {
          removeFileIfExists(req.file.path);
        }
        next(error);
      }
    },

    async update(req, res, next) {
      try {
        validatePayload(req.body, req.file, requiredFields, true);

        const existingRow = await get(`SELECT * FROM ${tableName} WHERE id = ?`, [req.params.id]);
        if (!existingRow) {
          if (req.file) {
            removeFileIfExists(req.file.path);
          }
          throw createError(`Data ${tableName} dengan id ${req.params.id} tidak ditemukan`, 404);
        }

        const nextFilePath = req.file ? normalizeStoredPath(req.file.path) : normalizeStoredPath(existingRow.file);
        const payload = {
          ...req.body,
          file: nextFilePath,
        };

        const setClause = [...fields.map((field) => `${field} = ?`), "updated_at = CURRENT_TIMESTAMP"].join(", ");
        const values = [...fields.map((field) => payload[field]), req.params.id];

        await run(`UPDATE ${tableName} SET ${setClause} WHERE id = ?`, values);

        if (req.file && existingRow.file !== nextFilePath) {
          removeFileIfExists(existingRow.file);
        }

        const updatedRow = await get(`SELECT * FROM ${tableName} WHERE id = ?`, [req.params.id]);
        res.json(buildPdfUrls(req, routeName, updatedRow));
      } catch (error) {
        if (req.file) {
          removeFileIfExists(req.file.path);
        }
        next(error);
      }
    },

    async remove(req, res, next) {
      try {
        const existingRow = await get(`SELECT * FROM ${tableName} WHERE id = ?`, [req.params.id]);
        if (!existingRow) {
          throw createError(`Data ${tableName} dengan id ${req.params.id} tidak ditemukan`, 404);
        }

        await run(`DELETE FROM ${tableName} WHERE id = ?`, [req.params.id]);
        removeFileIfExists(existingRow.file);

        res.json({
          message: `Data ${tableName} berhasil dihapus`,
        });
      } catch (error) {
        next(error);
      }
    },

    async view(req, res, next) {
      try {
        const row = await get(`SELECT * FROM ${tableName} WHERE id = ?`, [req.params.id]);
        if (!row) {
          throw createError(`Data ${tableName} dengan id ${req.params.id} tidak ditemukan`, 404);
        }

        const absolutePath = path.resolve(process.cwd(), row.file);
        if (!fs.existsSync(absolutePath)) {
          throw createError("File PDF tidak ditemukan", 404);
        }

        res.setHeader("Content-Type", "application/pdf");
        res.setHeader("Content-Disposition", `inline; filename="${path.basename(row.file)}"`);
        res.sendFile(absolutePath);
      } catch (error) {
        next(error);
      }
    },

    async download(req, res, next) {
      try {
        const row = await get(`SELECT * FROM ${tableName} WHERE id = ?`, [req.params.id]);
        if (!row) {
          throw createError(`Data ${tableName} dengan id ${req.params.id} tidak ditemukan`, 404);
        }

        const absolutePath = path.resolve(process.cwd(), row.file);
        if (!fs.existsSync(absolutePath)) {
          throw createError("File PDF tidak ditemukan", 404);
        }

        res.download(absolutePath, path.basename(row.file));
      } catch (error) {
        next(error);
      }
    },
  };
}

module.exports = {
  createPdfResourceController,
};
