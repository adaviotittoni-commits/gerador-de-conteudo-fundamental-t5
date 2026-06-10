import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// We test the lib/crypto.ts module (Next.js runtime version)
// The Web Crypto API is available in Node.js 20+ and in Vitest jsdom env

describe('lib/crypto', () => {
  const TEST_SECRET = 'test-encryption-key-at-least-32-chars-long!!'

  beforeEach(() => {
    vi.stubEnv('ENCRYPTION_KEY', TEST_SECRET)
  })

  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('should encrypt and decrypt a key roundtrip', async () => {
    const { encryptApiKey, decryptApiKey } = await import('@/lib/crypto')

    const plaintext = 'sk-test-1234567890abcdef'
    const encrypted = await encryptApiKey(plaintext)

    // Encrypted value should be different from plaintext
    expect(encrypted).not.toBe(plaintext)

    // Encrypted value should be base64
    expect(() => atob(encrypted)).not.toThrow()

    // Decrypted value should match original
    const decrypted = await decryptApiKey(encrypted)
    expect(decrypted).toBe(plaintext)
  })

  it('should produce different ciphertexts for the same plaintext (random IV)', async () => {
    const { encryptApiKey } = await import('@/lib/crypto')

    const plaintext = 'sk-test-same-key-different-output'
    const encrypted1 = await encryptApiKey(plaintext)
    const encrypted2 = await encryptApiKey(plaintext)

    // Due to random IV, two encryptions of the same plaintext should differ
    expect(encrypted1).not.toBe(encrypted2)
  })

  it('should handle long API keys', async () => {
    const { encryptApiKey, decryptApiKey } = await import('@/lib/crypto')

    const longKey = 'sk-' + 'a'.repeat(200)
    const encrypted = await encryptApiKey(longKey)
    const decrypted = await decryptApiKey(encrypted)
    expect(decrypted).toBe(longKey)
  })

  it('should handle special characters in API keys', async () => {
    const { encryptApiKey, decryptApiKey } = await import('@/lib/crypto')

    const specialKey = 'sk-test/+==key$with&special!chars'
    const encrypted = await encryptApiKey(specialKey)
    const decrypted = await decryptApiKey(encrypted)
    expect(decrypted).toBe(specialKey)
  })

  it('should throw when ENCRYPTION_KEY is not set', async () => {
    vi.stubEnv('ENCRYPTION_KEY', '')

    // Re-import to get fresh module (env is checked at call time)
    const { encryptApiKey } = await import('@/lib/crypto')

    await expect(encryptApiKey('test')).rejects.toThrow('ENCRYPTION_KEY')
  })

  it('should fail to decrypt with wrong secret', async () => {
    const { encryptApiKey } = await import('@/lib/crypto')

    const plaintext = 'sk-test-wrong-secret'
    const encrypted = await encryptApiKey(plaintext)

    // Change the env to a different secret
    vi.stubEnv('ENCRYPTION_KEY', 'completely-different-secret-key-here!!')

    // Re-import to get module with new env
    const { decryptApiKey } = await import('@/lib/crypto')

    await expect(decryptApiKey(encrypted)).rejects.toThrow()
  })
})
