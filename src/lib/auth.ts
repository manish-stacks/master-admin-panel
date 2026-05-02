import jwt from 'jsonwebtoken'
import { cookies } from 'next/headers'

export interface JWTPayload {
  userId: string
  email: string
  role: string
  name: string
}

function getSecret() {
  return process.env.JWT_SECRET || 'nexuscms-fallback-secret-key-2024'
}

function getRefreshSecret() {
  return process.env.JWT_REFRESH_SECRET || 'nexuscms-fallback-refresh-secret-2024'
}

export function signAccessToken(payload: JWTPayload) {
  return jwt.sign(payload, getSecret(), { expiresIn: '7d' })
}

export function signRefreshToken(payload: JWTPayload) {
  return jwt.sign(
    { ...payload, nonce: Math.random().toString(36).slice(2) },
    getRefreshSecret(),
    { expiresIn: '30d' }
  )
}

export function verifyAccessToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, getSecret()) as JWTPayload
  } catch {
    return null
  }
}

export async function getCurrentUser(): Promise<JWTPayload | null> {
  try {
    const cookieStore = cookies()
    const token = cookieStore.get('access_token')?.value
    if (!token) return null
    return verifyAccessToken(token)
  } catch {
    return null
  }
}
