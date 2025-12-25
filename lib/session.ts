import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import type { User } from "@/lib/auth"

const SESSION_COOKIE_NAME = "solar_session"
const SESSION_EXPIRY_HOURS = 12
const encoder = new TextEncoder()
const decoder = new TextDecoder()

interface SessionPayload {
  sub: string
  email: string
  name: string
  role: User["role"]
  organizationId?: string
  verified?: boolean
  exp: number
}

function getSecretBytes() {
  const secret = process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET || "dev-secret"
  return encoder.encode(secret)
}

function toBase64(bytes: Uint8Array) {
  if (typeof btoa !== "undefined") {
    let binary = ""
    bytes.forEach((byte) => {
      binary += String.fromCharCode(byte)
    })
    return btoa(binary)
  }

  // Node.js fallback
  return Buffer.from(bytes).toString("base64")
}

function fromBase64(base64: string) {
  if (typeof atob !== "undefined") {
    const binary = atob(base64)
    const bytes = new Uint8Array(binary.length)
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i)
    }
    return bytes
  }

  return new Uint8Array(Buffer.from(base64, "base64"))
}

function base64UrlEncodeFromString(input: string) {
  const base64 = toBase64(encoder.encode(input))
  return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "")
}

function base64UrlEncodeFromBytes(bytes: Uint8Array) {
  const base64 = toBase64(bytes)
  return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "")
}

function base64UrlDecodeToString(input: string) {
  const normalized = input.replace(/-/g, "+").replace(/_/g, "/") + "=".repeat((4 - (input.length % 4)) % 4)
  return decoder.decode(fromBase64(normalized))
}

async function signSegment(segment: string) {
  const cryptoObj = globalThis.crypto
  const key = await cryptoObj.subtle.importKey("raw", getSecretBytes(), { name: "HMAC", hash: "SHA-256" }, false, [
    "sign",
  ])
  const signature = await cryptoObj.subtle.sign("HMAC", key, encoder.encode(segment))
  return base64UrlEncodeFromBytes(new Uint8Array(signature))
}

async function verifySignature(payloadSegment: string, signatureSegment: string) {
  const expected = await signSegment(payloadSegment)
  return expected === signatureSegment
}

export async function createSessionToken(user: User) {
  const expiresAt = Date.now() + SESSION_EXPIRY_HOURS * 60 * 60 * 1000
  const payload: SessionPayload = {
    sub: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    organizationId: user.organizationId,
    verified: user.verified,
    exp: expiresAt,
  }

  const payloadSegment = base64UrlEncodeFromString(JSON.stringify(payload))
  const signatureSegment = await signSegment(payloadSegment)
  return `${payloadSegment}.${signatureSegment}`
}

export async function verifySessionToken(token?: string) {
  if (!token) return null
  const [payloadSegment, signatureSegment] = token.split(".")
  if (!payloadSegment || !signatureSegment) return null

  const isValid = await verifySignature(payloadSegment, signatureSegment)
  if (!isValid) return null

  try {
    const payload = JSON.parse(base64UrlDecodeToString(payloadSegment)) as SessionPayload
    if (Date.now() > payload.exp) {
      return null
    }
    return payload
  } catch {
    return null
  }
}

export function attachSessionCookie(response: NextResponse, token: string) {
  response.cookies.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_EXPIRY_HOURS * 60 * 60,
  })
}

export function clearSessionCookie(response: NextResponse) {
  response.cookies.set(SESSION_COOKIE_NAME, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  })
}

export function getSessionTokenFromCookies() {
  const cookieStore = cookies()
  return cookieStore.get(SESSION_COOKIE_NAME)?.value
}

export { SESSION_COOKIE_NAME }
