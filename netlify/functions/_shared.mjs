import { getStore } from "@netlify/blobs";
import { createHash } from "node:crypto";
import defaultContent from "../../content.json";

const DEFAULT_PASSWORD = "Pusteblume2026";

export const ALLOWED_IMAGE_EXT = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
};

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

export async function getPasswordHash() {
  const store = adminStore();
  const existing = await store.get("password_hash");
  if (existing) return existing;
  const hash = hashPassword(DEFAULT_PASSWORD);
  await store.set("password_hash", hash);
  return hash;
}

export async function checkPassword(password) {
  if (typeof password !== "string" || !password) return false;
  const hash = await getPasswordHash();
  return hashPassword(password) === hash;
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
