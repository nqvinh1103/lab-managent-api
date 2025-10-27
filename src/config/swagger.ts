import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Lab Management API',
      version: '1.0.0',
      description: 'API documentation for Lab Management System with JWT authentication',
      contact: {
        name: 'API Support',
        email: 'support@labmanagement.com'
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      }
    },
    servers: [
      {
        url: 'http://localhost:5000/api',
        description: 'Development server'
      },
      {
        url: 'https://api.labmanagement.com/api',
        description: 'Production server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter JWT token. Get token from /api/auth/login'
        }
      },
      schemas: {
        // Request Schemas
        LoginRequest: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: {
              type: 'string',
              format: 'email',
              example: 'admin@lab.com',
              description: 'User email address'
            },
            password: {
              type: 'string',
              format: 'password',
              minLength: 6,
              example: 'password123',
              description: 'User password'
            }
          }
        },
        CreateUserRequest: {
          type: 'object',
          required: ['email', 'password_hash', 'full_name', 'identity_number', 'phone_number', 'gender', 'date_of_birth', 'created_by', 'updated_by'],
          properties: {
            email: {
              type: 'string',
              format: 'email',
              example: 'user@lab.com'
            },
            password_hash: {
              type: 'string',
              format: 'password',
              minLength: 8,
              pattern: '^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)',
              example: 'Password123',
              description: 'Must contain uppercase, lowercase, and number'
            },
            full_name: {
              type: 'string',
              minLength: 2,
              example: 'John Doe'
            },
            identity_number: {
              type: 'string',
              example: '123456789012'
            },
            phone_number: {
              type: 'string',
              example: '+84123456789'
            },
            gender: {
              type: 'string',
              enum: ['male', 'female'],
              example: 'male'
            },
            date_of_birth: {
              type: 'string',
              format: 'date',
              example: '1990-01-01'
            },
            address: {
              type: 'string',
              example: '123 Main Street'
            },
            is_locked: {
              type: 'boolean',
              example: false
            },
            role_ids: {
              type: 'array',
              items: {
                type: 'string'
              },
              example: ['507f1f77bcf86cd799439011']
            },
            created_by: {
              type: 'string',
              example: '507f1f77bcf86cd799439011'
            },
            updated_by: {
              type: 'string',
              example: '507f1f77bcf86cd799439011'
            }
          }
        },
        UpdateUserRequest: {
          type: 'object',
          properties: {
            email: {
              type: 'string',
              format: 'email'
            },
            password_hash: {
              type: 'string',
              format: 'password'
            },
            full_name: {
              type: 'string'
            },
            phone_number: {
              type: 'string'
            },
            gender: {
              type: 'string',
              enum: ['male', 'female']
            },
            date_of_birth: {
              type: 'string',
              format: 'date'
            },
            address: {
              type: 'string'
            },
            is_locked: {
              type: 'boolean'
            },
            updated_by: {
              type: 'string'
            }
          }
        },
        CreateRoleRequest: {
          type: 'object',
          required: ['role_name', 'role_code', 'privilege_ids', 'created_by', 'updated_by'],
          properties: {
            role_name: {
              type: 'string',
              example: 'Lab Technician',
              description: 'Role display name'
            },
            role_code: {
              type: 'string',
              example: 'LAB_TECH',
              description: 'Unique role code (uppercase with underscores)'
            },
            role_description: {
              type: 'string',
              example: 'Lab technician role with basic access to instruments and samples'
            },
            privilege_ids: {
              type: 'array',
              items: {
                type: 'string'
              },
              example: ['507f1f77bcf86cd799439011', '507f1f77bcf86cd799439012'],
              description: 'Array of privilege IDs'
            },
            created_by: {
              type: 'string',
              example: '507f1f77bcf86cd799439011'
            },
            updated_by: {
              type: 'string',
              example: '507f1f77bcf86cd799439011'
            }
          }
        },
        UpdateRoleRequest: {
          type: 'object',
          properties: {
            role_name: {
              type: 'string',
              description: 'Role display name'
            },
            role_code: {
              type: 'string',
              description: 'Role code (uppercase with underscores)'
            },
            role_description: {
              type: 'string'
            },
            privilege_ids: {
              type: 'array',
              items: {
                type: 'string'
              }
            },
            updated_by: {
              type: 'string'
            }
          }
        },
        AssignRoleRequest: {
          type: 'object',
          required: ['roleId'],
          properties: {
            roleId: {
              type: 'string',
              example: '507f1f77bcf86cd799439011'
            }
          }
        },
        AssignPrivilegeRequest: {
          type: 'object',
          required: ['privilegeId'],
          properties: {
            privilegeId: {
              type: 'string',
              example: '507f1f77bcf86cd799439011'
            }
          }
        },
        
        // Response Schemas
        ErrorResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false
            },
            message: {
              type: 'string',
              example: 'Error message'
            },
            error: {
              type: 'string',
              example: 'Detailed error description'
            }
          }
        },
        SuccessResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true
            },
            message: {
              type: 'string',
              example: 'Operation successful'
            },
            data: {
              type: 'object'
            }
          }
        },
        LoginResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true
            },
            message: {
              type: 'string',
              example: 'Login successful'
            },
            data: {
              type: 'object',
              properties: {
                user: {
                  type: 'object',
                  properties: {
                    _id: { type: 'string' },
                    email: { type: 'string' },
                    firstName: { type: 'string' },
                    lastName: { type: 'string' }
                  }
                },
                token: {
                  type: 'string',
                  example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
                },
                refreshToken: {
                  type: 'string',
                  example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
                },
                expiresIn: {
                  type: 'string',
                  example: '24h'
                }
              }
            }
          }
        },
        User: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
              example: '507f1f77bcf86cd799439011'
            },
            email: {
              type: 'string',
              format: 'email',
              example: 'user@lab.com'
            },
            full_name: {
              type: 'string',
              example: 'John Doe'
            },
            identity_number: {
              type: 'string',
              example: '123456789012'
            },
            phone_number: {
              type: 'string',
              example: '+84123456789'
            },
            gender: {
              type: 'string',
              enum: ['male', 'female'],
              example: 'male'
            },
            address: {
              type: 'string',
              example: '123 Main Street'
            },
            date_of_birth: {
              type: 'string',
              format: 'date',
              example: '1990-01-01'
            },
            is_locked: {
              type: 'boolean',
              example: false
            },
            last_activity: {
              type: 'string',
              format: 'date-time'
            },
            role_ids: {
              type: 'array',
              items: {
                type: 'string'
              }
            },
            created_at: {
              type: 'string',
              format: 'date-time'
            },
            created_by: {
              type: 'string'
            },
            updated_at: {
              type: 'string',
              format: 'date-time'
            },
            updated_by: {
              type: 'string'
            }
          }
        },
        Role: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
              example: '507f1f77bcf86cd799439011'
            },
            role_name: {
              type: 'string',
              example: 'Lab Manager'
            },
            role_code: {
              type: 'string',
              example: 'LAB_MANAGER'
            },
            role_description: {
              type: 'string',
              example: 'Lab manager role with full access to lab operations'
            },
            privilege_ids: {
              type: 'array',
              items: {
                type: 'string'
              },
              example: ['507f1f77bcf86cd799439011', '507f1f77bcf86cd799439012']
            },
            created_at: {
              type: 'string',
              format: 'date-time'
            },
            created_by: {
              type: 'string'
            },
            updated_at: {
              type: 'string',
              format: 'date-time'
            },
            updated_by: {
              type: 'string'
            }
          }
        },
        Privilege: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
              example: '507f1f77bcf86cd799439011'
            },
            privilege_code: {
              type: 'string',
              example: 'USER_READ'
            },
            privilege_name: {
              type: 'string',
              example: 'Read Users'
            },
            category: {
              type: 'string',
              example: 'User Management'
            },
            created_at: {
              type: 'string',
              format: 'date-time'
            },
            created_by: {
              type: 'string'
            },
            updated_at: {
              type: 'string',
              format: 'date-time'
            },
            updated_by: {
              type: 'string'
            }
          }
        },
        PaginationResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true
            },
            message: {
              type: 'string',
              example: 'Success'
            },
            data: {
              type: 'array',
              items: {}
            },
            pagination: {
              type: 'object',
              properties: {
                page: {
                  type: 'integer',
                  example: 1
                },
                limit: {
                  type: 'integer',
                  example: 10
                },
                total: {
                  type: 'integer',
                  example: 100
                },
                totalPages: {
                  type: 'integer',
                  example: 10
                }
              }
            }
          }
        }
      }
    },
    tags: [
      {
        name: 'Authentication',
        description: 'Authentication endpoints for login, logout, and token refresh'
      },
      {
        name: 'Users',
        description: 'User management endpoints (requires ADMIN or LAB_MANAGER role)'
      },
      {
        name: 'Roles',
        description: 'Role management endpoints (requires ADMIN or LAB_MANAGER role)'
      }
    ]
  },
  apis: ['./src/docs/*.ts'] // Path to the API docs
};

export const swaggerSpec = swaggerJsdoc(options);


