import jwt from 'jsonwebtoken'

export interface TokenPayload {
  id: string
  email: string
  roles: string[] // Array of role codes (e.g., ["ADMIN", "DOCTOR"])
}

export const signToken = (payload: TokenPayload): string => {
  const JWT_SECRET = process.env.JWT_SECRET
  const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d'
  
  if (!JWT_SECRET) {
    throw new Error('JWT_SECRET environment variable is required')
  }
  
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN
  } as jwt.SignOptions)
}

export const verifyToken = (token: string): TokenPayload => {
  const JWT_SECRET = process.env.JWT_SECRET
  
  if (!JWT_SECRET) {
    throw new Error('JWT_SECRET environment variable is required')
  }
  
  try {
    return jwt.verify(token, JWT_SECRET) as TokenPayload
  } catch (error) {
    throw new Error('Invalid or expired token')
  }
}

export const decodeToken = (token: string): TokenPayload | null => {
  try {
    return jwt.decode(token) as TokenPayload
  } catch (error) {
    return null
  }
}

export const extractTokenFromHeader = (authHeader: string | undefined): string | null => {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null
  }
  return authHeader.substring(7)
}
