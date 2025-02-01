import * as crypto from "crypto-js";
import * as process from "process";


export function encrypt(text: string): string {
  const SECRET_KEY = process.env.CRYPTO_SECRET_KEY
  if (!text) {
    throw new Error('Text to encrypt cannot be empty');
  }
  if (!SECRET_KEY) {
    throw new Error('CRYPTO_SECRET_KEY environment variable is not set');
  }

  const encrypted = crypto.AES.encrypt(text, SECRET_KEY);

  const base64 = encrypted.toString();

  return base64
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');

}

export function decrypt(encryptedText: string): string {
  const SECRET_KEY = process.env.CRYPTO_SECRET_KEY
  if (!encryptedText) {
    throw new Error('Text to decrypt cannot be empty');
  }
  if (!SECRET_KEY) {
    throw new Error('CRYPTO_SECRET_KEY environment variable is not set');
  }

  try {
    const base64 = encryptedText
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    const pad = base64.length % 4;
    const paddedBase64 = pad
      ? base64 + '='.repeat(4 - pad)
      : base64;

    const bytes = crypto.AES.decrypt(paddedBase64, SECRET_KEY);
    const decrypted = bytes.toString(crypto.enc.Utf8);

    if (!decrypted) {
      throw new Error('Decryption failed');
    }

    return decrypted;
  } catch (error) {
    throw new Error('Failed to decrypt text: ' + error.message);
  }
}