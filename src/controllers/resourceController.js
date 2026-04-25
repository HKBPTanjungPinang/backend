const { all, get, run } = require("../config/database");

function createError(message, statusCode) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

function hasEmptyValue(value) {
  return value === undefined || value === null || value === "";
}

function validatePayload(payload, requiredFields) {
  for (const field of requiredFields) {
    if (hasEmptyValue(payload[field])) {
      throw createError(`Field '${field}' wajib diisi`, 400);
    }
  }
}

function createResourceController(config) {
  const { tableName, fields, requiredFields = fields, orderBy = "id DESC", hooks = {} } = config;

  return {
    async getAll(_req, res, next) {
      try {
        const rows = await all(`SELECT * FROM ${tableName} ORDER BY ${orderBy}`);
        res.json(rows);
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

        res.json(row);
      } catch (error) {
        next(error);
      }
    },

    async create(req, res, next) {
      try {
        validatePayload(req.body, requiredFields);

        if (hooks.beforeCreate) {
          await hooks.beforeCreate(req.body);
        }

        const values = fields.map((field) => req.body[field]);
        const placeholders = fields.map(() => "?").join(", ");
        const columns = fields.join(", ");

        const result = await run(
          `INSERT INTO ${tableName} (${columns}) VALUES (${placeholders})`,
          values
        );

        const createdRow = await get(`SELECT * FROM ${tableName} WHERE id = ?`, [result.id]);
        res.status(201).json(createdRow);
      } catch (error) {
        next(mapSqliteError(error, tableName));
      }
    },

    async update(req, res, next) {
      try {
        validatePayload(req.body, requiredFields);

        const existingRow = await get(`SELECT * FROM ${tableName} WHERE id = ?`, [req.params.id]);
        if (!existingRow) {
          throw createError(`Data ${tableName} dengan id ${req.params.id} tidak ditemukan`, 404);
        }

        if (hooks.beforeUpdate) {
          await hooks.beforeUpdate(req.body, req.params.id);
        }

        const setClause = [...fields.map((field) => `${field} = ?`), "updated_at = CURRENT_TIMESTAMP"].join(", ");
        const values = [...fields.map((field) => req.body[field]), req.params.id];

        await run(`UPDATE ${tableName} SET ${setClause} WHERE id = ?`, values);

        const updatedRow = await get(`SELECT * FROM ${tableName} WHERE id = ?`, [req.params.id]);
        res.json(updatedRow);
      } catch (error) {
        next(mapSqliteError(error, tableName));
      }
    },

    async remove(req, res, next) {
      try {
        const existingRow = await get(`SELECT * FROM ${tableName} WHERE id = ?`, [req.params.id]);
        if (!existingRow) {
          throw createError(`Data ${tableName} dengan id ${req.params.id} tidak ditemukan`, 404);
        }

        if (hooks.beforeDelete) {
          await hooks.beforeDelete(req.params.id);
        }

        await run(`DELETE FROM ${tableName} WHERE id = ?`, [req.params.id]);

        res.json({
          message: `Data ${tableName} berhasil dihapus`,
        });
      } catch (error) {
        next(error);
      }
    },
  };
}

function mapSqliteError(error, tableName) {
  if (!error || !error.message) {
    return error;
  }

  if (error.message.includes("UNIQUE constraint failed")) {
    return createError(`Data ${tableName} memiliki nilai unik yang sudah digunakan`, 400);
  }

  if (error.message.includes("CHECK constraint failed")) {
    return createError("Role user hanya boleh 'Superadmin' atau 'AdminGereja'", 400);
  }

  return error;
}

module.exports = {
  createResourceController,
  createError,
};
