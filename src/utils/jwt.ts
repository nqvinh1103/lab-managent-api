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

/**
 * Verify token but ignore expiration
 * Used for refresh token endpoint to allow refreshing expired tokens
 * Still verifies signature to ensure token is valid
 */
export const verifyTokenWithIgnoreExpiration = (token: string): TokenPayload => {
  const JWT_SECRET = process.env.JWT_SECRET
  
  if (!JWT_SECRET) {
    throw new Error('JWT_SECRET environment variable is required')
  }
  
  try {
    // Verify signature but ignore expiration
    const decoded = jwt.verify(token, JWT_SECRET, {
      ignoreExpiration: true
    }) as TokenPayload
    
    // Check if token is too old (optional: limit to 7 days after expiration)
    // This prevents using very old tokens for refresh
    const maxAgeAfterExpiration = 7 * 24 * 60 * 60 * 1000 // 7 days in milliseconds
    
    // Decode to get expiration time
    const decodedWithoutVerify = jwt.decode(token) as any
    if (decodedWithoutVerify && decodedWithoutVerify.exp) {
      const expirationTime = decodedWithoutVerify.exp * 1000 // Convert to milliseconds
      const now = Date.now()
      
      // If token expired more than 7 days ago, reject it
      if (expirationTime + maxAgeAfterExpiration < now) {
        throw new Error('Token is too old to refresh')
      }
    }
    
    return decoded
  } catch (error) {
    if (error instanceof Error && error.message === 'Token is too old to refresh') {
      throw error
    }
    throw new Error('Invalid token signature')
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
