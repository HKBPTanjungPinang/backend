const { run, get, all } = require("../config/database");
const { hashPassword, verifyPassword, generateToken } = require("../utils/auth");

function createError(message, statusCode = 500) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

async function login(req, res, next) {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      throw createError("Username dan password harus diisi", 400);
    }

    const user = await get(
      "SELECT id, username, password, role, is_active FROM users WHERE username = ?",
      [username]
    );

    if (!user) {
      throw createError("Username atau password salah", 401);
    }

    if (!user.is_active) {
      throw createError("Akun Anda telah dinonaktifkan", 403);
    }

    const isPasswordValid = await verifyPassword(password, user.password);
    if (!isPasswordValid) {
      throw createError("Username atau password salah", 401);
    }

    const token = generateToken(user.id, user.username, user.role);

    res.json({
      message: "Login berhasil",
      token,
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
      },
    });
  } catch (error) {
    next(error);
  }
}

async function createAdminGereja(req, res, next) {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      throw createError("Username dan password harus diisi", 400);
    }

    if (password.length < 6) {
      throw createError("Password minimal 6 karakter", 400);
    }

    const existingUser = await get("SELECT id FROM users WHERE username = ?", [username]);
    if (existingUser) {
      throw createError("Username sudah terdaftar", 400);
    }

    const hashedPassword = await hashPassword(password);

    const result = await run(
      `
        INSERT INTO users (username, password, role, is_active)
        VALUES (?, ?, ?, 1)
      `,
      [username, hashedPassword, "AdminGereja"]
    );

    res.status(201).json({
      message: "Admin Gereja berhasil dibuat",
      admin: {
        id: result.id,
        username,
        role: "AdminGereja",
      },
    });
  } catch (error) {
    next(error);
  }
}

async function listAdminGereja(req, res, next) {
  try {
    const admins = await all(
      `
        SELECT id, username, role, is_active, created_at, updated_at
        FROM users
        WHERE role = 'AdminGereja'
        ORDER BY created_at DESC
      `
    );

    res.json({
      message: "Daftar Admin Gereja",
      data: admins,
    });
  } catch (error) {
    next(error);
  }
}

async function deactivateAdminGereja(req, res, next) {
  try {
    const { id } = req.params;

    const admin = await get("SELECT id, role FROM users WHERE id = ?", [id]);
    if (!admin) {
      throw createError("Admin tidak ditemukan", 404);
    }

    if (admin.role !== "AdminGereja") {
      throw createError("User bukan Admin Gereja", 400);
    }

    await run(
      "UPDATE users SET is_active = 0, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
      [id]
    );

    res.json({
      message: "Admin Gereja berhasil dinonaktifkan",
    });
  } catch (error) {
    next(error);
  }
}

async function activateAdminGereja(req, res, next) {
  try {
    const { id } = req.params;

    const admin = await get("SELECT id, role FROM users WHERE id = ?", [id]);
    if (!admin) {
      throw createError("Admin tidak ditemukan", 404);
    }

    if (admin.role !== "AdminGereja") {
      throw createError("User bukan Admin Gereja", 400);
    }

    await run(
      "UPDATE users SET is_active = 1, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
      [id]
    );

    res.json({
      message: "Admin Gereja berhasil diaktifkan",
    });
  } catch (error) {
    next(error);
  }
}

async function deleteAdminGereja(req, res, next) {
  try {
    const { id } = req.params;

    const admin = await get("SELECT id, role FROM users WHERE id = ?", [id]);
    if (!admin) {
      throw createError("Admin tidak ditemukan", 404);
    }

    if (admin.role !== "AdminGereja") {
      throw createError("User bukan Admin Gereja", 400);
    }

    await run("DELETE FROM users WHERE id = ?", [id]);

    res.json({
      message: "Admin Gereja berhasil dihapus",
    });
  } catch (error) {
    next(error);
  }
}

async function changePassword(req, res, next) {
  try {
    const { adminId, newPassword } = req.body;

    if (!adminId || !newPassword) {
      throw createError("Admin ID dan password baru harus diisi", 400);
    }

    if (newPassword.length < 6) {
      throw createError("Password minimal 6 karakter", 400);
    }

    const admin = await get("SELECT id FROM users WHERE id = ?", [adminId]);
    if (!admin) {
      throw createError("Admin tidak ditemukan", 404);
    }

    const hashedPassword = await hashPassword(newPassword);
    await run(
      "UPDATE users SET password = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
      [hashedPassword, adminId]
    );

    res.json({
      message: "Password berhasil diubah",
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  login,
  createAdminGereja,
  listAdminGereja,
  deactivateAdminGereja,
  activateAdminGereja,
  deleteAdminGereja,
  changePassword,
};
