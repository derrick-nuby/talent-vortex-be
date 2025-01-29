import * as crypto from "crypto-js";
import * as process from "process";


export function encrypt(text: string): string {
  const SECRET_KEY = process.env.CRYPTO_SECRET_KEY
  if (!text) {
    throw new Error('Text to encrypt cannot be empty');
  }
  return crypto.AES.encrypt(text, SECRET_KEY).toString();
}

export function decrypt(encryptedText: string): string {
  const SECRET_KEY = process.env.CRYPTO_SECRET_KEY
  if (!encryptedText) {
    throw new Error('Text to decrypt cannot be empty');
  }
  const bytes = crypto.AES.decrypt(encryptedText, SECRET_KEY);
  return bytes.toString(crypto.enc.Utf8);
}