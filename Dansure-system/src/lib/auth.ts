import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'

const JWT_SECRET = process.env.JWT_SECRET || 'dansure-secret-key-2024'

export interface User {
  id: string
  username: string
  name: string
  role: 'admin' | 'staff'
}

export function signToken(user: User): string {
  return jwt.sign(user, JWT_SECRET, { expiresIn: '7d' })
}

export function verifyToken(token: string): User | null {
  try {
    return jwt.verify(token, JWT_SECRET) as User
  } catch {
    return null
  }
}

export function hashPassword(password: string): string {
  return bcrypt.hashSync(password, 10)
}

export function comparePassword(password: string, hash: string): boolean {
  return bcrypt.compareSync(password, hash)
}
