const express = require("express");
const session = require("express-session");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

// Change these in Render → Environment. Defaults are for local testing only.
const ENTRY_KEY = process.env.ENTRY_KEY || "rajeevbkl";
const SECRET_KEY = process.env.SECRET_KEY || "rajeevbkl";
const SESSION_SECRET = process.env.SESSION_SECRET || "local-only-change-this-secret";

app.use(express.json());
app.use(session({
  name: "pratiti.sid",
  secret: SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 8 * 60 * 60 * 1000
  }
}));

app.post("/api/unlock", (req, res) => {
  const { stage, passcode } = req.body || {};
  const expected = stage === "entry" ? ENTRY_KEY : stage === "secret" ? SECRET_KEY : null;
  if (!expected) return res.status(400).json({ ok: false, message: "That door doesn't exist." });
  if (stage === "secret" && !req.session.entryUnlocked) {
    return res.status(403).json({ ok: false, message: "Open the first door first." });
  }
  if (String(passcode || "").trim().toLowerCase() !== expected.toLowerCase()) {
    return res.status(401).json({ ok: false, message: "Nopeee 😭 try again, birthday girl!" });
  }
  if (stage === "entry") req.session.entryUnlocked = true;
  if (stage === "secret") req.session.secretUnlocked = true;
  res.json({ ok: true });
});

app.get("/api/status", (req, res) => {
  res.json({ entryUnlocked: !!req.session.entryUnlocked, secretUnlocked: !!req.session.secretUnlocked });
});

// All website files are served directly from this same folder.
// No public/ or other asset folder is required.
app.use(express.static(__dirname));
app.get("*", (req, res) => res.sendFile(path.join(__dirname, "index.html")));

app.listen(PORT, () => console.log(`Only for Pratiti is running on port ${PORT}`));
