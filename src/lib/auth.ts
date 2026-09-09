const DIGESTS = new Set([
  "5e0e2dc225e26b873aa721b16d85add15b386e8c2498db53ec07ee1ff48adc14",
  "852d8ffff70d6b71b345cae64a306f3fe8a3e45228ff05256bd7a53bc0ed4fdd",
]);

async function sha256Hex(input: string): Promise<string> {
  const bytes = new TextEncoder().encode(input);
  const hash = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function verifyPasscode(raw: string): Promise<boolean> {
  const digits = raw.replace(/\D/g, "");
  if (!digits || digits.length > 16) return false;
  const digest = await sha256Hex(digits);
  return DIGESTS.has(digest);
}