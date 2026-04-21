const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Task Manager API',
      version: '1.0.0',
      description: 'Multi-tenant Task Management System',
    },
    servers: [{ url: 'http://localhost:4000/api/v1' }],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        RegisterInput: {
          type: 'object',
          required: ['orgName', 'name', 'email', 'password'],
          properties: {
            orgName:  { type: 'string',  example: 'My Company' },
            name:     { type: 'string',  example: 'John Doe' },
            email:    { type: 'string',  example: 'john@example.com' },
            password: { type: 'string',  example: 'secret123' },
            role: {
              type: 'string',
              enum: ['admin', 'member'],
              example: 'member',
              description: 'Optional. If omitted: first user in org → admin, others → member',
            },
          },
        },
        LoginInput: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email:    { type: 'string', example: 'john@example.com' },
            password: { type: 'string', example: 'secret123' },
          },
        },
        TaskInput: {
          type: 'object',
          required: ['title'],
          properties: {
            title:       { type: 'string', example: 'Fix login bug' },
            description: { type: 'string', example: 'Users cannot log in on mobile' },
          },
        },
        Task: {
          type: 'object',
          properties: {
            _id:             { type: 'string' },
            title:           { type: 'string' },
            description:     { type: 'string' },
            organization_id: { type: 'string' },
            created_by:      { type: 'object', properties: { name: { type: 'string' }, email: { type: 'string' } } },
            createdAt:       { type: 'string', format: 'date-time' },
          },
        },
      },
    },
  },
  apis: ['./routes/*.js'],
};

module.exports = swaggerJsdoc(options);
