export const testResultPaths = {
  '/test-results': {
    post: {
      tags: ['Test Results'],
      summary: 'Create a new test result',
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/TestResult'
            }
          }
        }
      },
      responses: {
        201: {
          description: 'Test result created successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: {
                    type: 'boolean'
                  },
                  message: {
                    type: 'string'
                  },
                  data: {
                    $ref: '#/components/schemas/TestResult'
                  }
                }
              }
            }
          }
        },
        401: {
          description: 'Unauthorized'
        },
        500: {
          description: 'Internal Server Error'
        }
      }
    },
    get: {
      tags: ['Test Results'],
      summary: 'Get all test results',
      security: [{ bearerAuth: [] }],
      responses: {
        200: {
          description: 'List of test results',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: {
                    type: 'boolean'
                  },
                  message: {
                    type: 'string'
                  },
                  data: {
                    type: 'array',
                    items: {
                      $ref: '#/components/schemas/TestResult'
                    }
                  }
                }
              }
            }
          }
        },
        401: {
          description: 'Unauthorized'
        },
        500: {
          description: 'Internal Server Error'
        }
      }
    }
  },
  '/test-results/{id}': {
    get: {
      tags: ['Test Results'],
      summary: 'Get a test result by ID',
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          in: 'path',
          name: 'id',
          required: true,
          schema: {
            type: 'string'
          }
        }
      ],
      responses: {
        200: {
          description: 'Test result found',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: {
                    type: 'boolean'
                  },
                  message: {
                    type: 'string'
                  },
                  data: {
                    $ref: '#/components/schemas/TestResult'
                  }
                }
              }
            }
          }
        },
        401: {
          description: 'Unauthorized'
        },
        404: {
          description: 'Test result not found'
        },
        500: {
          description: 'Internal Server Error'
        }
      }
    },
    put: {
      tags: ['Test Results'],
      summary: 'Update a test result',
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          in: 'path',
          name: 'id',
          required: true,
          schema: {
            type: 'string'
          }
        }
      ],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/UpdateTestResult'
            }
          }
        }
      },
      responses: {
        200: {
          description: 'Test result updated successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: {
                    type: 'boolean'
                  },
                  message: {
                    type: 'string'
                  },
                  data: {
                    $ref: '#/components/schemas/TestResult'
                  }
                }
              }
            }
          }
        },
        401: {
          description: 'Unauthorized'
        },
        404: {
          description: 'Test result not found'
        },
        500: {
          description: 'Internal Server Error'
        }
      }
    },
    delete: {
      tags: ['Test Results'],
      summary: 'Delete a test result',
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          in: 'path',
          name: 'id',
          required: true,
          schema: {
            type: 'string'
          }
        }
      ],
      responses: {
        200: {
          description: 'Test result deleted successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: {
                    type: 'boolean'
                  },
                  message: {
                    type: 'string'
                  }
                }
              }
            }
          }
        },
        401: {
          description: 'Unauthorized'
        },
        404: {
          description: 'Test result not found'
        },
        500: {
          description: 'Internal Server Error'
        }
      }
    }
  }
};