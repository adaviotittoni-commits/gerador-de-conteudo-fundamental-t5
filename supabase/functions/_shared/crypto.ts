/**
 * Encryption/decryption helpers using Web Crypto API (AES-GCM).
 * Works in both Deno (Edge Functions) and modern Node.js runtimes.
 *
 * Format: base64(iv:ciphertext) where iv is 12 bytes prepended to ciphertext.
 */

const ALGORITHM = 'AES-GCM'
const IV_LENGTH = 12
const KEY_LENGTH = 256

/**
 * Derive a CryptoKey from a string secret using PBKDF2.
 * Uses a fixed salt derived from the secret itself for deterministic key derivation.
 */
async function deriveKey(secret: string): Promise<CryptoKey> {
  const encoder = new TextEncoder()
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    'PBKDF2',
    false,
    ['deriveKey'],
  )

  // Use a fixed salt so the same secret always produces the same key.
  // Security note: the secret (ENCRYPTION_KEY) must be strong and unique.
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
 * Encrypt a plaintext string using AES-GCM.
 * Returns a base64-encoded string containing the IV and ciphertext.
 */
export async function encryptKey(
  plaintext: string,
  secret: string,
): Promise<string> {
  const encoder = new TextEncoder()
  const key = await deriveKey(secret)
  const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH))

  const ciphertext = await crypto.subtle.encrypt(
    { name: ALGORITHM, iv },
    key,
    encoder.encode(plaintext),
  )

  // Prepend IV to ciphertext
  const combined = new Uint8Array(IV_LENGTH + ciphertext.byteLength)
  combined.set(iv)
  combined.set(new Uint8Array(ciphertext), IV_LENGTH)

  return btoa(String.fromCharCode(...combined))
}

/**
 * Decrypt a base64-encoded ciphertext (with prepended IV) using AES-GCM.
 * Returns the original plaintext string.
 */
export async function decryptKey(
  encrypted: string,
  secret: string,
): Promise<string> {
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
