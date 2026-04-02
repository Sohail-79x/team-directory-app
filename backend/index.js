const express = require("express");
const fs = require("fs");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

const FILE = "data.json";

function readMembers() {
  try {
    if (!fs.existsSync(FILE)) return [];
    const raw = fs.readFileSync(FILE, "utf8");
    if (!raw.trim()) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeMembers(members) {
  fs.writeFileSync(FILE, JSON.stringify(members, null, 2));
}

function isValidEmail(email) {
  if (typeof email !== "string") return false;
  // pragmatic email check (good enough for a directory app)
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

function isValidUrl(url) {
  if (typeof url !== "string") return false;
  try {
    // eslint-disable-next-line no-new
    new URL(url.trim());
    return true;
  } catch {
    return false;
  }
}

function normalizeMemberInput(body, { partial = false } = {}) {
  const out = {};

  if ("name" in body) out.name = String(body.name ?? "").trim();
  if ("role" in body) out.role = String(body.role ?? "").trim();
  if ("email" in body) out.email = String(body.email ?? "").trim();
  if ("profilePic" in body) out.profilePic = String(body.profilePic ?? "").trim();

  const errors = [];

  if (!partial || "name" in out) {
    if (!out.name) errors.push("Name is required.");
  }

  if ("role" in out && out.role.length > 80) errors.push("Role is too long.");
  if ("email" in out && out.email && !isValidEmail(out.email)) errors.push("Email is invalid.");
  if ("profilePic" in out && out.profilePic && !isValidUrl(out.profilePic)) {
    errors.push("Profile picture URL is invalid.");
  }

  return { value: out, errors };
}

// READ
app.get("/api/members", (req, res) => {
  res.json(readMembers());
});

// CREATE
app.post("/api/members", (req, res) => {
  const data = readMembers();
  const { value, errors } = normalizeMemberInput(req.body, { partial: false });
  if (errors.length) return res.status(400).json({ message: "Validation error", errors });

  const newMember = {
    id: Date.now(),
    name: value.name,
    role: value.role || "",
    email: value.email || "",
    profilePic: value.profilePic || "",
  };

  data.push(newMember);
  writeMembers(data);
  res.status(201).json(newMember);
});

// UPDATE
app.put("/api/members/:id", (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isFinite(id)) return res.status(400).json({ message: "Invalid member id" });

  const data = readMembers();
  const idx = data.findIndex((m) => Number(m.id) === id);
  if (idx === -1) return res.status(404).json({ message: "Member not found" });

  const { value, errors } = normalizeMemberInput(req.body, { partial: true });
  if (errors.length) return res.status(400).json({ message: "Validation error", errors });
  if (!Object.keys(value).length) return res.status(400).json({ message: "No fields to update" });

  const updated = { ...data[idx], ...value };
  data[idx] = updated;
  writeMembers(data);
  res.json(updated);
});

// DELETE
app.delete("/api/members/:id", (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isFinite(id)) return res.status(400).json({ message: "Invalid member id" });

  const data = readMembers();
  const next = data.filter((m) => Number(m.id) !== id);
  if (next.length === data.length) return res.status(404).json({ message: "Member not found" });

  writeMembers(next);
  res.json({ message: "Deleted" });
});

app.listen(5000, () => console.log("Server running on port 5000"));