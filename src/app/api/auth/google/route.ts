import { NextResponse } from "next/server";

export const runtime = "nodejs";

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
const JWKS_URL = "https://www.googleapis.com/oauth2/v3/certs";
const JWKS_CACHE_MS = 5 * 60 * 1000;

interface JwksEntry {
  kid?: string;
  alg?: string;
  n?: string;
  e?: string;
  kty?: string;
}

let jwksCache: { keys: JwksEntry[]; fetchedAt: number } | null = null;

function b64urlDecode(input: string): Uint8Array<ArrayBuffer> {
  const b64 = input.replace(/-/g, "+").replace(/_/g, "/");
  const padded = b64.padEnd(b64.length + ((4 - (b64.length % 4)) % 4), "=");
  const bin = atob(padded);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes;
}

async function getJwks(): Promise<JwksEntry[] | null> {
  const now = Date.now();
  if (jwksCache && now - jwksCache.fetchedAt < JWKS_CACHE_MS) return jwksCache.keys;
  try {
    const res = await fetch(JWKS_URL, { cache: "no-store" });
    if (!res.ok) return jwksCache?.keys ?? null;
    const data = (await res.json()) as { keys?: JwksEntry[] };
    if (data.keys) {
      jwksCache = { keys: data.keys, fetchedAt: now };
      return data.keys;
    }
    return jwksCache?.keys ?? null;
  } catch {
    return jwksCache?.keys ?? null;
  }
}

interface GooglePayload {
  sub?: string;
  email?: string;
  name?: string;
  picture?: string;
  email_verified?: boolean;
  aud?: string | string[];
  iss?: string;
  exp?: number;
}

async function verifyGoogleIdToken(token: string): Promise<GooglePayload | null> {
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  const [h, p, s] = parts;

  let header: { alg?: string; kid?: string };
  let payload: GooglePayload;
  try {
    header = JSON.parse(new TextDecoder().decode(b64urlDecode(h)));
    payload = JSON.parse(new TextDecoder().decode(b64urlDecode(p)));
  } catch {
    return null;
  }

  if (header.alg !== "RS256") return null;

  const auds = Array.isArray(payload.aud) ? payload.aud : [payload.aud];
  if (!GOOGLE_CLIENT_ID || !auds.includes(GOOGLE_CLIENT_ID)) return null;
  if (!payload.iss || !payload.iss.startsWith("accounts.google.com")) return null;
  if (typeof payload.exp !== "number" || payload.exp * 1000 < Date.now()) return null;
  if (!payload.sub) return null;

  const keys = await getJwks();
  const jwk = keys?.find((k) => k.kid === header.kid && k.alg === "RS256" && k.kty === "RSA");
  if (!jwk) return null;

  try {
    const key = await crypto.subtle.importKey(
      "jwk",
      { kty: "RSA", n: jwk.n, e: jwk.e, alg: "RS256", use: "sig" },
      { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
      false,
      ["verify"],
    );
    const data = new TextEncoder().encode(`${h}.${p}`);
    const sig = b64urlDecode(s);
    const ok = await crypto.subtle.verify("RSASSA-PKCS1-v1_5", key, sig, data);
    if (!ok) return null;
  } catch {
    return null;
  }

  return payload;
}

export async function POST(req: Request) {
  let credential: string;
  try {
    const body = (await req.json()) as { credential?: unknown };
    if (typeof body.credential !== "string" || !body.credential) {
      return NextResponse.json({ error: "Missing credential." }, { status: 400 });
    }
    credential = body.credential;
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  if (!GOOGLE_CLIENT_ID) {
    return NextResponse.json({ error: "Google sign-in is not configured on this build." }, { status: 503 });
  }

  const payload = await verifyGoogleIdToken(credential);
  if (!payload) {
    return NextResponse.json({ error: "Google could not verify this credential." }, { status: 401 });
  }

  return NextResponse.json({
    sub: payload.sub,
    name: payload.name ?? "",
    email: payload.email ?? "",
    picture: payload.picture ?? "",
    emailVerified: Boolean(payload.email_verified),
  });
}