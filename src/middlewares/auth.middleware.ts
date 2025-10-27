import { NextFunction, Request, Response } from 'express'
import { ObjectId } from 'mongodb'
import { getCollection } from '../config/database'
import { HTTP_STATUS } from '../constants/httpStatus'
import { MESSAGES } from '../constants/messages'
import { PrivilegeDocument } from '../models/Privilege'
import { RoleDocument } from '../models/Role'
import { toObjectId } from '../utils/database.helper'
import { extractTokenFromHeader, verifyToken } from '../utils/jwt'

export const authMiddleware = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const token = extractTokenFromHeader(req.headers.authorization)
    
    if (!token) {
      res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        message: MESSAGES.UNAUTHORIZED,
        error: 'No token provided'
      })
      return
    }

    const decoded = verifyToken(token)
    req.user = decoded
    next()
  } catch (error) {
    res.status(HTTP_STATUS.UNAUTHORIZED).json({
      success: false,
      message: MESSAGES.UNAUTHORIZED,
      error: error instanceof Error ? error.message : 'Token verification failed'
    })
  }
}

export const optionalAuthMiddleware = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const token = extractTokenFromHeader(req.headers.authorization)
    
    if (token) {
      const decoded = verifyToken(token)
      req.user = decoded
    }
    
    next()
  } catch (error) {
    // For optional auth, we don't throw error, just continue without user
    next()
  }
}

/**
 * Middleware factory to check if user has required roles
 * @param allowedRoles Array of role codes that are allowed
 * @returns Express middleware function
 */
export const checkRole = (allowedRoles: string[]) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        res.status(HTTP_STATUS.UNAUTHORIZED).json({
          success: false,
          message: MESSAGES.UNAUTHORIZED,
          error: 'User not authenticated'
        })
        return
      }

      const userRoles = req.user.roles || []
      
      // Check if user has at least one of the allowed roles
      const hasRequiredRole = allowedRoles.some(role => userRoles.includes(role))

      if (!hasRequiredRole) {
        res.status(HTTP_STATUS.FORBIDDEN).json({
          success: false,
          message: MESSAGES.FORBIDDEN,
          error: `Access denied. Required roles: ${allowedRoles.join(', ')}`
        })
        return
      }

      next()
    } catch (error) {
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: MESSAGES.INTERNAL_ERROR,
        error: error instanceof Error ? error.message : 'Role check failed'
      })
    }
  }
}

/**
 * Middleware factory to check if user has required privileges
 * Note: For option B implementation, this queries privileges from DB
 * @param requiredPrivileges Array of privilege codes that are required
 * @returns Express middleware function
 */
export const checkPrivilege = (requiredPrivileges: string[]) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        res.status(HTTP_STATUS.UNAUTHORIZED).json({
          success: false,
          message: MESSAGES.UNAUTHORIZED,
          error: 'User not authenticated'
        })
        return
      }

      // Get user's roles
      const userRoles = req.user.roles || []
      
      if (userRoles.length === 0) {
        res.status(HTTP_STATUS.FORBIDDEN).json({
          success: false,
          message: MESSAGES.FORBIDDEN,
          error: 'User has no roles'
        })
        return
      }

      // Find roles by role codes
      const roleCollection = getCollection<RoleDocument>('roles')
      const roles = await roleCollection
        .find({ role_code: { $in: userRoles } })
        .toArray()

      // Collect all privilege IDs
      const privilegeIds = new Set<string>()
      roles.forEach((role: RoleDocument) => {
        if (role.privilege_ids && role.privilege_ids.length > 0) {
          role.privilege_ids.forEach((pid: ObjectId) => privilegeIds.add(pid.toString()))
        }
      })

      if (privilegeIds.size === 0) {
        res.status(HTTP_STATUS.FORBIDDEN).json({
          success: false,
          message: MESSAGES.FORBIDDEN,
          error: 'User has no privileges'
        })
        return
      }

      // Find privileges by IDs
      const privilegeCollection = getCollection<PrivilegeDocument>('privileges')
      const privilegeObjectIds = Array.from(privilegeIds)
        .map(id => toObjectId(id))
        .filter((id): id is ObjectId => id !== null)
      
      const privileges = await privilegeCollection
        .find({ _id: { $in: privilegeObjectIds } })
        .toArray()

      const userPrivileges = privileges.map((p: PrivilegeDocument) => p.privilege_code)

      // Check if user has all required privileges
      const hasAllPrivileges = requiredPrivileges.every(privilege => 
        userPrivileges.includes(privilege)
      )

      if (!hasAllPrivileges) {
        res.status(HTTP_STATUS.FORBIDDEN).json({
          success: false,
          message: MESSAGES.FORBIDDEN,
          error: `Insufficient privileges. Required: ${requiredPrivileges.join(', ')}`
        })
        return
      }

      next()
    } catch (error) {
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: MESSAGES.INTERNAL_ERROR,
        error: error instanceof Error ? error.message : 'Privilege check failed'
      })
    }
  }
}