import express from "express";
import path from "path";
import fs from "fs";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import multer from "multer";
import { createServer as createViteServer } from "vite";

const app = express();
const PORT = 3000;

// Resolve paths
const DB_FILE = path.join(process.cwd(), "db.json");
const UPLOADS_DIR = path.join(process.cwd(), "uploads");

// Ensure database file and uploads directory exist
if (!fs.existsSync(DB_FILE)) {
  fs.writeFileSync(DB_FILE, JSON.stringify({ birthday_pages: [], messages: [] }, null, 2));
}
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Helper to read DB
function readDB() {
  try {
    const data = fs.readFileSync(DB_FILE, "utf-8");
    return JSON.parse(data);
  } catch (error) {
    console.error("Error reading database:", error);
    return { birthday_pages: [], messages: [] };
  }
}

// Helper to write DB
function writeDB(data: any) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error("Error writing database:", error);
  }
}

// Setup Multer for upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOADS_DIR);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const uniqueName = `${Date.now()}-${crypto.randomBytes(4).toString("hex")}${ext}`;
    cb(null, uniqueName);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|webp|gif/;
    const mimeType = allowedTypes.test(file.mimetype);
    const extName = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    if (mimeType && extName) {
      return cb(null, true);
    }
    cb(new Error("Only images (jpg, png, webp, gif) are allowed!"));
  },
});

// Middleware
app.use(express.json());
// Serve uploads folder statically
app.use("/uploads", express.static(UPLOADS_DIR));

// API: Create a new birthday page
app.post("/api/birthday-pages", (req, res) => {
  try {
    const { celebrant_name, password, slug } = req.body;

    if (!celebrant_name || !password || !slug) {
      return res.status(400).json({ success: false, error: "All fields are required" });
    }

    const cleanSlug = slug.trim().toLowerCase();
    const slugRegex = /^[a-zA-Z0-9_\-]+$/;
    if (!slugRegex.test(cleanSlug)) {
      return res.status(400).json({
        success: false,
        error: "Slug can only contain letters, numbers, hyphens, and underscores",
      });
    }

    const db = readDB();
    const existing = db.birthday_pages.find((p: any) => p.slug === cleanSlug);
    if (existing) {
      return res.status(400).json({ success: false, error: "Link/slug is already taken" });
    }

    const password_hash = bcrypt.hashSync(password, 10);
    const newPage = {
      id: crypto.randomUUID(),
      slug: cleanSlug,
      celebrant_name: celebrant_name.trim(),
      password_hash,
      created_at: new Date().toISOString(),
    };

    db.birthday_pages.push(newPage);
    writeDB(db);

    // Return sanitized page (no hash)
    const { password_hash: _, ...sanitizedPage } = newPage;
    return res.json({
      success: true,
      data: {
        birthdayPage: sanitizedPage,
        friendLink: `/${cleanSlug}`,
        celebrantLink: `/${cleanSlug}/reveal`,
      },
    });
  } catch (error: any) {
    console.error("API error creating page:", error);
    return res.status(500).json({ success: false, error: error.message || "Internal server error" });
  }
});

// API: Get celebrant name by slug
app.get("/api/birthday-pages/:slug", (req, res) => {
  try {
    const { slug } = req.params;
    const db = readDB();
    const page = db.birthday_pages.find((p: any) => p.slug === slug.toLowerCase());

    if (!page) {
      return res.status(404).json({ success: false, error: "Birthday page not found" });
    }

    return res.json({
      success: true,
      data: {
        id: page.id,
        slug: page.slug,
        celebrant_name: page.celebrant_name,
        created_at: page.created_at,
      },
    });
  } catch (error: any) {
    console.error("API error getting page:", error);
    return res.status(500).json({ success: false, error: error.message || "Internal server error" });
  }
});

// API: Verify password and reveal messages
app.post("/api/birthday-pages/:slug/reveal", (req, res) => {
  try {
    const { slug } = req.params;
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({ success: false, error: "Password is required" });
    }

    const db = readDB();
    const page = db.birthday_pages.find((p: any) => p.slug === slug.toLowerCase());

    if (!page) {
      return res.status(404).json({ success: false, error: "Birthday page not found" });
    }

    const isValid = bcrypt.compareSync(password, page.password_hash);
    if (!isValid) {
      return res.status(401).json({ success: false, error: "Incorrect password" });
    }

    // Filter messages for this page
    const messages = db.messages
      .filter((m: any) => m.page_id === page.id)
      .sort((a: any, b: any) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

    return res.json({
      success: true,
      data: {
        celebrant_name: page.celebrant_name,
        messages,
      },
    });
  } catch (error: any) {
    console.error("API error revealing messages:", error);
    return res.status(500).json({ success: false, error: error.message || "Internal server error" });
  }
});

// API: Submit a message
app.post("/api/messages", upload.single("photo"), (req, res) => {
  try {
    const { page_id, sender_name, message_text } = req.body;

    if (!page_id || !sender_name || !message_text) {
      return res.status(400).json({ success: false, error: "Page ID, name, and message are required" });
    }

    const db = readDB();
    const pageExists = db.birthday_pages.some((p: any) => p.id === page_id);
    if (!pageExists) {
      return res.status(400).json({ success: false, error: "Birthday page does not exist" });
    }

    // Determine photo URL if uploaded
    let photo_url = null;
    if (req.file) {
      photo_url = `/uploads/${req.file.filename}`;
    }

    // Generate random layout parameters
    const rotation_deg = Math.floor(Math.random() * 17) - 8; // -8 to 8
    const layout_template = Math.floor(Math.random() * 4) + 1; // 1-4

    const newMessage = {
      id: crypto.randomUUID(),
      page_id,
      sender_name: sender_name.trim(),
      message_text: message_text.trim(),
      photo_url,
      rotation_deg,
      layout_template,
      created_at: new Date().toISOString(),
    };

    db.messages.push(newMessage);
    writeDB(db);

    return res.json({
      success: true,
      data: newMessage,
    });
  } catch (error: any) {
    console.error("API error creating message:", error);
    return res.status(500).json({ success: false, error: error.message || "Internal server error" });
  }
});

// Error handling middleware for multer / uploads
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({ success: false, error: "Photo exceeds the 5MB size limit" });
    }
    return res.status(400).json({ success: false, error: err.message });
  } else if (err) {
    return res.status(400).json({ success: false, error: err.message });
  }
  next();
});

// Setup Vite or Production Handlers
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
