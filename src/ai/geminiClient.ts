// ─── Gemini Client ────────────────────────────────────────────────────────────
// Singleton client for the Google Generative AI SDK.
// Reads API key from Vite env — only exposes VITE_* vars to the browser.
// ─────────────────────────────────────────────────────────────────────────────

import { GoogleGenerativeAI } from '@google/generative-ai';

let _client: GoogleGenerativeAI | null = null;

/**
 * Returns the singleton Gemini client.
 * Throws a user-friendly error if the API key is missing.
 */
export function getGeminiClient(): GoogleGenerativeAI {
  if (_client) return _client;

  const apiKey = import.meta.env.VITE_GOOGLE_API_KEY as string | undefined;
  if (!apiKey || apiKey.trim() === '') {
    throw new Error(
      'VITE_GOOGLE_API_KEY is not set. Add it to your .env file as VITE_GOOGLE_API_KEY=your_key_here'
    );
  }

  _client = new GoogleGenerativeAI(apiKey);
  return _client;
}

/** The Gemini model to use for semantic extraction */
export function getGeminiModelName(): string {
  return (import.meta.env.VITE_GEMINI_MODEL as string | undefined) ?? 'gemini-2.0-flash-lite';
}
