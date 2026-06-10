/**
 * API Key encryption/decryption for Next.js server-side routes.
 * Uses Web Crypto API (AES-GCM) — same algorithm as supabase/functions/_shared/crypto.ts.
 *
 * IMPORTANT: The ENCRYPTION_KEY env var must be set. In production this should be
 * a strong, unique secret (minimum 32 characters).
 */

const ALGORITHM = 'AES-GCM'
const IV_LENGTH = 12
const KEY_LENGTH = 256

function getEncryptionSecret(): string {
  const secret = process.env.ENCRYPTION_KEY
  if (!secret) {
    throw new Error(
      'ENCRYPTION_KEY environment variable is not set. Cannot encrypt API keys.',
    )
  }
  return secret
}

async function deriveKey(secret: string): Promise<CryptoKey> {
  const encoder = new TextEncoder()
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    'PBKDF2',
    false,
    ['deriveKey'],
  )

  const salt = encoder.encode('stitch-ai-api-key-encryption-v1')

  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt,
      iterations: 100_000,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: ALGORITHM, length: KEY_LENGTH },
    false,
    ['encrypt', 'decrypt'],
  )
}

/**
 * Encrypt a plaintext API key using AES-GCM.
 * Returns a base64-encoded string containing the IV prepended to ciphertext.
 */
export async function encryptApiKey(plaintext: string): Promise<string> {
  const secret = getEncryptionSecret()
  const encoder = new TextEncoder()
  const key = await deriveKey(secret)
  const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH))

  const ciphertext = await crypto.subtle.encrypt(
    { name: ALGORITHM, iv },
    key,
    encoder.encode(plaintext),
  )

  const combined = new Uint8Array(IV_LENGTH + ciphertext.byteLength)
  combined.set(iv)
  combined.set(new Uint8Array(ciphertext), IV_LENGTH)

  return btoa(String.fromCharCode(...combined))
}

/**
 * Decrypt a base64-encoded ciphertext (with prepended IV) using AES-GCM.
 * Returns the original plaintext API key.
 */
export async function decryptApiKey(encrypted: string): Promise<string> {
  const secret = getEncryptionSecret()
  const key = await deriveKey(secret)

  const combined = Uint8Array.from(atob(encrypted), (c) => c.charCodeAt(0))
  const iv = combined.slice(0, IV_LENGTH)
  const ciphertext = combined.slice(IV_LENGTH)

  const decrypted = await crypto.subtle.decrypt(
    { name: ALGORITHM, iv },
    key,
    ciphertext,
  )

  return new TextDecoder().decode(decrypted)
}
