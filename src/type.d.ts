import { JwtPayload } from 'jsonwebtoken'

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload & { 
        id: string
        email: string
        roles: string[]
      }
    }
  }
}

export interface ApiResponse<T = any> {
  success: boolean
  message: string
  data?: T
  error?: string
}

export interface PaginationQuery {
  page?: number
  limit?: number
  sort?: string
  order?: 'asc' | 'desc'
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}
