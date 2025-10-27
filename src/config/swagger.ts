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
      },
      {
        name: 'Privileges',
        description: 'Privilege endpoints (read-only, requires ADMIN or LAB_MANAGER role)'
      }
    ]
  },
  apis: [
    './src/docs/index.ts',  // Aggregator file that imports all schemas and endpoints
    './src/docs/schemas/**/*.ts',
    './src/docs/endpoints/**/*.ts'
  ]
};

export const swaggerSpec = swaggerJsdoc(options);
