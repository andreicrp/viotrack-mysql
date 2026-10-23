import { createCipheriv, createDecipheriv, createHmac, randomBytes } from "node:crypto";

const base32Alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
const keyMaterial = process.env.TWO_FACTOR_ENCRYPTION_KEY || process.env.SESSION_SECRET || "viotrack-development-two-factor-key";

const encryptionKey = createHashKey(keyMaterial);

function createHashKey(value: string) {
  return createHmac("sha256", "viotrack-2fa-key").update(value).digest();
}

export const generateTotpSecret = () => {
  const bytes = randomBytes(20);
  let bits = "";
  for (const byte of bytes) bits += byte.toString(2).padStart(8, "0");
  let secret = "";
  for (let index = 0; index < bits.length; index += 5) {
    secret += base32Alphabet[Number.parseInt(bits.slice(index, index + 5).padEnd(5, "0"), 2)];
  }
  return secret;
};

const decodeBase32 = (secret: string) => {
  const normalized = secret.replace(/\s+/g, "").toUpperCase().replace(/=+$/, "");
  let bits = "";
  for (const character of normalized) {
    const value = base32Alphabet.indexOf(character);
    if (value < 0) throw new Error("Invalid TOTP secret.");
    bits += value.toString(2).padStart(5, "0");
  }
  const bytes: number[] = [];
  for (let index = 0; index + 8 <= bits.length; index += 8) {
    bytes.push(Number.parseInt(bits.slice(index, index + 8), 2));
  }
  return Buffer.from(bytes);
};

export const createTotpCode = (secret: string, timestamp = Date.now()) => {
  const counter = Math.floor(timestamp / 1000 / 30);
  const counterBuffer = Buffer.alloc(8);
  counterBuffer.writeBigUInt64BE(BigInt(counter));
  const digest = createHmac("sha1", decodeBase32(secret)).update(counterBuffer).digest();
  const offset = digest[digest.length - 1] & 0x0f;
  const value = (digest.readUInt32BE(offset) & 0x7fffffff) % 1_000_000;
  return String(value).padStart(6, "0");
};

export const verifyTotpCode = (secret: string, code: string) => {
  const normalizedCode = code.replace(/\s/g, "");
  if (!/^\d{6}$/.test(normalizedCode)) return false;
  const now = Date.now();
  return [-1, 0, 1].some((window) => createTotpCode(secret, now + window * 30_000) === normalizedCode);
};

export const encryptTotpSecret = (secret: string) => {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", encryptionKey, iv);
  const encrypted = Buffer.concat([cipher.update(secret, "utf8"), cipher.final()]);
  return `${iv.toString("base64url")}.${cipher.getAuthTag().toString("base64url")}.${encrypted.toString("base64url")}`;
};

export const decryptTotpSecret = (value: string) => {
  const [ivText, tagText, encryptedText] = value.split(".");
  if (!ivText || !tagText || !encryptedText) throw new Error("Invalid encrypted TOTP secret.");
  const decipher = createDecipheriv("aes-256-gcm", encryptionKey, Buffer.from(ivText, "base64url"));
  decipher.setAuthTag(Buffer.from(tagText, "base64url"));
  return Buffer.concat([decipher.update(Buffer.from(encryptedText, "base64url")), decipher.final()]).toString("utf8");
};

export const createOtpAuthUri = (secret: string, email: string) =>
  `otpauth://totp/VioTrack:${encodeURIComponent(email)}?secret=${secret}&issuer=VioTrack&algorithm=SHA1&digits=6&period=30`;

export const generateRecoveryCodes = (count = 8) =>
  Array.from({ length: count }, () => randomBytes(5).toString("hex").toUpperCase());
