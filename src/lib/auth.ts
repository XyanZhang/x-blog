import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { NextRequest } from 'next/server'
import { prisma } from './prisma'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

export interface JWTPayload {
  userId: string
  email: string
  username: string
  role: string
}

// 密码哈希
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 12
  return bcrypt.hash(password, saltRounds)
}

// 验证密码
export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}

// 生成JWT令牌
export function generateToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' })
}

// 验证JWT令牌
export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload
  } catch {
    return null
  }
}

// 从请求中获取用户信息
export async function getUserFromRequest(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value || 
                  request.headers.get('authorization')?.replace('Bearer ', '')
    
    if (!token) {
      return null
    }

    const payload = verifyToken(token)
    if (!payload) {
      return null
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        username: true,
        email: true,
        displayName: true,
        avatar: true,
        role: true,
        isActive: true,
        isVerified: true,
      }
    })

    return user
  } catch {
    console.error('Error getting user from request')
    return null
  }
}

// 验证邮箱格式
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// 验证密码强度
export function isValidPassword(password: string): { valid: boolean; message?: string } {
  if (password.length < 8) {
    return { valid: false, message: '密码长度至少8位' }
  }
  
  if (!/(?=.*[a-z])/.test(password)) {
    return { valid: false, message: '密码必须包含小写字母' }
  }
  
  if (!/(?=.*[A-Z])/.test(password)) {
    return { valid: false, message: '密码必须包含大写字母' }
  }
  
  if (!/(?=.*\d)/.test(password)) {
    return { valid: false, message: '密码必须包含数字' }
  }
  
  return { valid: true }
}

// 验证用户名格式
export function isValidUsername(username: string): { valid: boolean; message?: string } {
  if (username.length < 3) {
    return { valid: false, message: '用户名长度至少3位' }
  }
  
  if (username.length > 20) {
    return { valid: false, message: '用户名长度不能超过20位' }
  }
  
  if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
    return { valid: false, message: '用户名只能包含字母、数字、下划线和连字符' }
  }
  
  return { valid: true }
} 