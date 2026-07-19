import { getStore } from "@netlify/blobs";
import { createHash, timingSafeEqual } from "node:crypto";
import defaultContent from "../../content.json";

export const ALLOWED_IMAGE_EXT = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
};

const MAX_LOGIN_ATTEMPTS = 5;
const LOGIN_WINDOW_MS = 15 * 60 * 1000;

export function hashPassword(password) {
  return createHash("sha256").update(password, "utf8").digest("hex");
}

export function adminStore() {
  return getStore("admin");
}

export function contentStore() {
  return getStore("site-content");
}

export function imagesStore() {
  return getStore("site-images");
}

function rateLimitStore() {
  return getStore("rate-limit");
}

export function clientIp(req, context) {
  return (
    (context && context.ip) ||
    req.headers.get("x-nf-client-connection-ip") ||
    req.headers.get("x-forwarded-for") ||
    "unbekannt"
  );
}

export async function isRateLimited(ip) {
  const raw = await rateLimitStore().get(ip);
  if (!raw) return false;
  const data = JSON.parse(raw);
  if (Date.now() - data.first > LOGIN_WINDOW_MS) return false;
  return data.count >= MAX_LOGIN_ATTEMPTS;
}

export async function recordFailedAttempt(ip) {
  const store = rateLimitStore();
  const raw = await store.get(ip);
  const now = Date.now();
  let data = raw ? JSON.parse(raw) : null;
  if (!data || now - data.first > LOGIN_WINDOW_MS) {
    data = { first: now, count: 0 };
  }
  data.count += 1;
  await store.set(ip, JSON.stringify(data));
}

export async function clearFailedAttempts(ip) {
  await rateLimitStore().delete(ip);
}

// Bootstrap-Passwort kommt aus der Umgebungsvariable ADMIN_PASSWORD (in Netlify
// unter Site settings > Environment variables zu setzen) statt aus dem Code, damit
// im öffentlichen Repo kein Passwort im Klartext steht. Ohne gesetzte Variable und
// ohne bereits gespeicherten Hash schlägt jeder Login fehl (fail closed).
export async function getPasswordHash() {
  const store = adminStore();
  const existing = await store.get("password_hash");
  if (existing) return existing;
  const initial = process.env.ADMIN_PASSWORD;
  if (!initial) return null;
  const hash = hashPassword(initial);
  await store.set("password_hash", hash);
  return hash;
}

function safeEqual(a, b) {
  const bufA = Buffer.from(a, "utf8");
  const bufB = Buffer.from(b, "utf8");
  if (bufA.length !== bufB.length) return false;
  return timingSafeEqual(bufA, bufB);
}

export async function checkPassword(password) {
  if (typeof password !== "string" || !password) return false;
  const hash = await getPasswordHash();
  if (!hash) return false;
  return safeEqual(hashPassword(password), hash);
}

export function sanitizeIfSvg(buffer, contentType) {
  if (contentType !== "image/svg+xml") return buffer;
  const text = buffer
    .toString("utf8")
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/\son\w+\s*=\s*"[^"]*"/gi, "")
    .replace(/\son\w+\s*=\s*'[^']*'/gi, "")
    .replace(/javascript:/gi, "");
  return Buffer.from(text, "utf8");
}

export async function loadOverrides() {
  const raw = await contentStore().get("overrides");
  if (!raw) return { text: {}, images: {} };
  try {
    const parsed = JSON.parse(raw);
    return { text: parsed.text || {}, images: parsed.images || {} };
  } catch {
    return { text: {}, images: {} };
  }
}

export async function saveOverrides(overrides) {
  await contentStore().set("overrides", JSON.stringify(overrides));
}

export function mergedContent(overrides) {
  return {
    text: { ...defaultContent.text, ...overrides.text },
    images: { ...defaultContent.images, ...overrides.images },
  };
}

export function json(status, body) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json; charset=utf-8" },
  });
}

export async function readJsonBody(req) {
  try {
    return await req.json();
  } catch {
    return null;
  }
}
