require("dotenv").config();

const express = require("express");
const pool = require("./db");
const session = require("express-session");
const PgSession = require("connect-pg-simple")(session);
const cookieParser = require("cookie-parser");
const bcrypt = require("bcryptjs");
const cors = require("cors");

const app = express();
const isProduction = process.env.NODE_ENV === "production";
const SESSION_MAX_AGE = 1000 * 60 * 60 * 24 * 7;

if (isProduction && !process.env.SESSION_SECRET) {
  throw new Error("SESSION_SECRET wajib diisi pada environment production.");
}

const allowedOrigins = new Set(
  [
    process.env.FRONTEND_URL,
    "http://localhost:5173",
    "http://127.0.0.1:5173",
  ]
    .filter(Boolean)
    .flatMap((origin) => origin.split(","))
    .map((origin) => origin.trim().replace(/\/$/, ""))
    .filter(Boolean),
);

app.set("trust proxy", 1);

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.has(origin)) {
        return callback(null, true);
      }
      return callback(null, false);
    },
    credentials: true,
  }),
);
app.use(express.json());
app.use(cookieParser());

app.use(
  session({
    name: "taskly.sid",
    store: new PgSession({
      pool,
      tableName: "session",
      createTableIfMissing: true,
      ttl: SESSION_MAX_AGE / 1000,
    }),
    secret: process.env.SESSION_SECRET || "taskly-dev-secret-change-in-prod",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "none" : "lax",
      maxAge: SESSION_MAX_AGE,
    },
  }),
);

function requireAuth(req, res, next) {
  if (req.session && req.session.userId) {
    return next();
  }
  return res.status(401).json({
    status: "error",
    message: "Unauthorized",
  });
}

function regenerateSession(req) {
  return new Promise((resolve, reject) => {
    req.session.regenerate((error) => {
      if (error) {
        reject(error);
        return;
      }
      resolve();
    });
  });
}

app.get("/", (req, res) => {
  res.send("Taskly backend is running!");
});

app.get("/api/auth/me", async (req, res) => {
  try {
    if (!req.session || !req.session.userId) {
      return res.json({ status: "success", data: null });
    }
    const result = await pool.query(
      "SELECT id, name, email FROM users WHERE id = $1",
      [req.session.userId],
    );
    if (result.rows.length === 0) {
      req.session.destroy(() => {});
      return res.json({ status: "success", data: null });
    }
    res.json({ status: "success", data: result.rows[0] });
  } catch (error) {
    res.status(500).json({ status: "error", message: "Gagal mengambil user" });
  }
});

app.post("/api/auth/register", async (req, res) => {
  try {
    const { name, email, password, confirmPassword } = req.body;

    if (!name || !email || !password || !confirmPassword) {
      return res.status(400).json({
        status: "error",
        message: "Semua field wajib diisi",
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        status: "error",
        message: "Format email tidak valid",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        status: "error",
        message: "Password minimal 6 karakter",
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        status: "error",
        message: "Konfirmasi password tidak sesuai",
      });
    }

    const existing = await pool.query("SELECT id FROM users WHERE email = $1", [
      email.toLowerCase(),
    ]);
    if (existing.rows.length > 0) {
      return res.status(400).json({
        status: "error",
        message: "Email sudah terdaftar",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await pool.query(
      "INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING id, name, email",
      [name.trim(), email.toLowerCase(), hashedPassword],
    );

    await regenerateSession(req);
    req.session.userId = result.rows[0].id;
    res.status(201).json({ status: "success", data: result.rows[0] });
  } catch (error) {
    if (error.code === "23505") {
      return res.status(400).json({
        status: "error",
        message: "Email sudah terdaftar",
      });
    }
    res.status(500).json({ status: "error", message: "Gagal mendaftar" });
  }
});

app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({
        status: "error",
        message: "Email dan password wajib diisi",
      });
    }

    const result = await pool.query(
      "SELECT id, name, email, password FROM users WHERE email = $1",
      [email.toLowerCase()],
    );
    if (result.rows.length === 0) {
      return res.status(400).json({
        status: "error",
        message: "Email atau password salah",
      });
    }

    const user = result.rows[0];
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(400).json({
        status: "error",
        message: "Email atau password salah",
      });
    }

    await regenerateSession(req);
    req.session.userId = user.id;
    res.json({ status: "success", data: { id: user.id, name: user.name, email: user.email } });
  } catch (error) {
    res.status(500).json({ status: "error", message: "Gagal login" });
  }
});

app.post("/api/auth/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ status: "error", message: "Gagal logout" });
    }
    res.clearCookie("taskly.sid");
    res.json({ status: "success", message: "Berhasil logout" });
  });
});

app.get("/api/tasks", requireAuth, async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM tasks WHERE user_id = $1 ORDER BY id ASC",
      [req.session.userId],
    );

    res.json({
      status: "success",
      data: result.rows,
    });
  } catch (error) {
    console.log("Gagal Mengambil tasks", error.message);

    res.status(500).json({
      status: "error",
      message: "Gagal mengambil data tasks",
    });
  }
});

app.post("/api/tasks", requireAuth, async (req, res) => {
  try {
    const { title, status = "todo" } = req.body;
    if (!title || typeof title !== "string" || !title.trim()) {
      return res.status(400).json({
        status: "error",
        message: "Title Wajib di isi",
      });
    }

    const allowedStatus = ["todo", "in_progress", "done"];
    if (!allowedStatus.includes(status)) {
      return res.status(400).json({
        status: "error",
        message: "Status tidak valid",
      });
    }

    const result = await pool.query(
      `INSERT INTO tasks (title, status, user_id)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [title.trim(), status, req.session.userId],
    );

    res.status(201).json({
      status: "success",
      message: "Task berhasil ditambahkan",
      data: result.rows[0],
    });
  } catch (error) {
    console.log("Gagal Menambahkan Task", error.message);
    res.status(500).json({
      status: "error",
      message: "Gagal menambahkan Task",
    });
  }
});

app.put("/api/tasks/:id", requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, status } = req.body;
    const allowedStatuses = ["todo", "in_progress", "done"];

    if (!/^\d+$/.test(id)) {
      return res.status(400).json({ status: "error", message: "ID tidak valid" });
    }

    if (!title || typeof title !== "string" || !title.trim()) {
      return res.status(400).json({
        status: "error",
        message: "Title wajib diisi",
      });
    }

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        status: "error",
        message: "Status tidak valid",
      });
    }

    const result = await pool.query(
      `UPDATE tasks
       SET title = $1, status = $2
       WHERE id = $3 AND user_id = $4
       RETURNING *`,
      [title.trim(), status, id, req.session.userId],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        status: "error",
        message: "Task tidak ditemukan",
      });
    }

    res.json({
      status: "success",
      message: "Task berhasil diperbarui",
      data: result.rows[0],
    });
  } catch (error) {
    console.log("Gagal Memperbarui Tasks", error.message);
    res.status(500).json({
      status: "error",
      message: "Gagal memperbarui tasks",
    });
  }
});

app.delete("/api/tasks/:id", requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    if (!/^\d+$/.test(id)) {
      return res.status(400).json({ status: "error", message: "ID tidak valid" });
    }
    const result = await pool.query(
      "DELETE FROM tasks WHERE id = $1 AND user_id = $2 RETURNING *",
      [id, req.session.userId],
    );
    if (result.rows.length === 0) {
      return res.status(404).json({
        status: "error",
        message: "Task tidak ditemukan",
      });
    }
    res.json({
      status: "success",
      message: "Task berhasil dihapus",
      data: result.rows[0],
    });
  } catch (error) {
    console.log("Gagal Menghapus Task", error);
    res.status(500).json({
      status: "error",
      message: "Gagal menghapus task",
    });
  }
});

app.use((err, req, res, next) => {
  if (res.headersSent) {
    return next(err);
  }

  if (err.type === "entity.parse.failed") {
    return res.status(400).json({
      status: "error",
      message: "Format JSON tidak valid",
    });
  }

  if (err.code === "23505" && err.constraint === "users_email_key") {
    return res.status(400).json({
      status: "error",
      message: "Email sudah terdaftar",
    });
  }

  console.error("Unhandled error:", err);

  return res.status(500).json({
    status: "error",
    message: "Terjadi kesalahan pada server",
  });
});

module.exports = app;
