import bcrypt from 'bcryptjs'

export const hashPassword = async (password: string): Promise<string> => {
  try {
    const BCRYPT_ROUNDS = parseInt(process.env.BCRYPT_ROUNDS || '12', 10)
    const salt = await bcrypt.genSalt(BCRYPT_ROUNDS)
    return await bcrypt.hash(password, salt)
  } catch (error) {
    throw new Error('Failed to hash password')
  }
}

export const comparePassword = async (password: string, hashedPassword: string): Promise<boolean> => {
  try {
    return await bcrypt.compare(password, hashedPassword)
  } catch (error) {
    throw new Error('Failed to compare password')
  }
}

export const validatePasswordStrength = (password: string): { isValid: boolean; message?: string } => {
  if (password.length < 8) {
    return { isValid: false, message: 'Password must be at least 8 characters long' }
  }

  if (!/(?=.*[a-z])/.test(password)) {
    return { isValid: false, message: 'Password must contain at least one lowercase letter' }
  }

  if (!/(?=.*[A-Z])/.test(password)) {
    return { isValid: false, message: 'Password must contain at least one uppercase letter' }
  }

  if (!/(?=.*\d)/.test(password)) {
    return { isValid: false, message: 'Password must contain at least one number' }
  }

  if (!/(?=.*[@$!%*?&])/.test(password)) {
    return { isValid: false, message: 'Password must contain at least one special character (@$!%*?&)' }
  }

  return { isValid: true }
}
