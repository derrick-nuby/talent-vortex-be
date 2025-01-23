import * as crypto from "crypto-js";

const SECRET_KEY = process.env.CRYPTO_SECRET_KEY


export function encrypt(text: string): string {
  return crypto.AES.encrypt(text, SECRET_KEY).toString();
}

export function decrypt(encryptedText: string): string {
  const bytes = crypto.AES.decrypt(encryptedText, SECRET_KEY);
  return bytes.toString(crypto.enc.Utf8);
}