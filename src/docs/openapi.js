const errorResponse = (description) => ({
  description,
  content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } },
});
const idParam = {
  name: 'id', in: 'path', required: true,
  schema: { type: 'string', example: '66a1f0c2b5d4e8a1c2d3e4f5' },
  description: 'MongoDB ObjectId of the task',
};
const secured = [{ bearerAuth: [] }];
const json = (ref) => ({ 'application/json': { schema: { $ref: `#/components/schemas/${ref}` } } });

module.exports = {
  openapi: '3.0.3',
  info: {
    title: 'Task Management API',
    version: '1.0.0',
    description:
      'RESTful API for managing tasks. Register or log in to obtain a JWT, then click **Authorize** and paste the token to call protected endpoints.',
  },
  servers: [{ url: '/', description: 'Current server' }],
  tags: [
    { name: 'Auth', description: 'Registration and login' },
    { name: 'Tasks', description: 'Task CRUD (JWT required)' },
    { name: 'System', description: 'Health check' },
  ],
  paths: {
    '/health': {
      get: { tags: ['System'], summary: 'Health check', responses: { 200: { description: 'API is up' } } },
    },
    '/api/auth/register': {
      post: {
        tags: ['Auth'], summary: 'Register a new user',
        requestBody: { required: true, content: json('RegisterInput') },
        responses: {
          201: { description: 'User created', content: json('AuthResponse') },
          400: errorResponse('Validation error'),
          409: errorResponse('Email already registered'),
        },
      },
    },
    '/api/auth/login': {
      post: {
        tags: ['Auth'], summary: 'Log in and receive a JWT',
        requestBody: { required: true, content: json('LoginInput') },
        responses: {
          200: { description: 'Login successful', content: json('AuthResponse') },
          400: errorResponse('Validation error'),
          401: errorResponse('Invalid credentials'),
        },
      },
    },
    '/api/auth/me': {
      get: {
        tags: ['Auth'], summary: 'Get the current user', security: secured,
        responses: { 200: { description: 'Current user' }, 401: errorResponse('Unauthorized') },
      },
    },
    '/api/tasks': {
      get: {
        tags: ['Tasks'], summary: 'List your tasks (filter, sort, paginate)', security: secured,
        parameters: [
          { name: 'status', in: 'query', schema: { type: 'string', enum: ['pending', 'in-progress', 'completed'] } },
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1, minimum: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 10, minimum: 1, maximum: 100 } },
          { name: 'sort', in: 'query', schema: { type: 'string', enum: ['createdAt', '-createdAt', 'title', '-title'], default: '-createdAt' } },
        ],
        responses: {
          200: { description: 'List of tasks', content: json('TaskListResponse') },
          400: errorResponse('Invalid query parameters'),
          401: errorResponse('Unauthorized'),
        },
      },
      post: {
        tags: ['Tasks'], summary: 'Create a task', security: secured,
        requestBody: { required: true, content: json('TaskInput') },
        responses: {
          201: { description: 'Task created', content: json('TaskResponse') },
          400: errorResponse('Validation error'),
          401: errorResponse('Unauthorized'),
        },
      },
    },
    '/api/tasks/{id}': {
      get: {
        tags: ['Tasks'], summary: 'Get a task by ID', security: secured, parameters: [idParam],
        responses: {
          200: { description: 'The task', content: json('TaskResponse') },
          400: errorResponse('Invalid ID'), 401: errorResponse('Unauthorized'), 404: errorResponse('Task not found'),
        },
      },
      put: {
        tags: ['Tasks'], summary: 'Update a task (send one or more fields)', security: secured, parameters: [idParam],
        requestBody: { required: true, content: json('TaskUpdate') },
        responses: {
          200: { description: 'Updated task', content: json('TaskResponse') },
          400: errorResponse('Validation error'), 401: errorResponse('Unauthorized'), 404: errorResponse('Task not found'),
        },
      },
      patch: {
        tags: ['Tasks'], summary: 'Partially update a task', security: secured, parameters: [idParam],
        requestBody: { required: true, content: json('TaskUpdate') },
        responses: {
          200: { description: 'Updated task', content: json('TaskResponse') },
          400: errorResponse('Validation error'), 401: errorResponse('Unauthorized'), 404: errorResponse('Task not found'),
        },
      },
      delete: {
        tags: ['Tasks'], summary: 'Delete a task', security: secured, parameters: [idParam],
        responses: {
          200: { description: 'Task deleted' },
          400: errorResponse('Invalid ID'), 401: errorResponse('Unauthorized'), 404: errorResponse('Task not found'),
        },
      },
    },
  },
  components: {
    securitySchemes: { bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' } },
    schemas: {
      RegisterInput: {
        type: 'object', required: ['name', 'email', 'password'],
        properties: {
          name: { type: 'string', example: 'Jane Doe' },
          email: { type: 'string', format: 'email', example: 'jane@example.com' },
          password: { type: 'string', minLength: 6, example: 'secret123' },
        },
      },
      LoginInput: {
        type: 'object', required: ['email', 'password'],
        properties: {
          email: { type: 'string', format: 'email', example: 'jane@example.com' },
          password: { type: 'string', example: 'secret123' },
        },
      },
      AuthResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          token: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
          user: { type: 'object', properties: { id: { type: 'string' }, name: { type: 'string' }, email: { type: 'string' } } },
        },
      },
      Task: {
        type: 'object',
        properties: {
          _id: { type: 'string', example: '66a1f0c2b5d4e8a1c2d3e4f5' },
          title: { type: 'string', example: 'Write documentation' },
          description: { type: 'string', example: 'Finish the README and Swagger docs' },
          status: { type: 'string', enum: ['pending', 'in-progress', 'completed'], example: 'pending' },
          createdAt: { type: 'string', format: 'date-time' },
          owner: { type: 'string' },
        },
      },
      TaskInput: {
        type: 'object', required: ['title'],
        properties: {
          title: { type: 'string', minLength: 3, maxLength: 100, example: 'Write documentation' },
          description: { type: 'string', maxLength: 1000, example: 'Finish the README and Swagger docs' },
          status: { type: 'string', enum: ['pending', 'in-progress', 'completed'], default: 'pending' },
        },
      },
      TaskUpdate: {
        type: 'object', minProperties: 1,
        properties: {
          title: { type: 'string', minLength: 3, maxLength: 100 },
          description: { type: 'string', maxLength: 1000 },
          status: { type: 'string', enum: ['pending', 'in-progress', 'completed'] },
        },
      },
      TaskResponse: {
        type: 'object',
        properties: { success: { type: 'boolean', example: true }, data: { $ref: '#/components/schemas/Task' } },
      },
      TaskListResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          count: { type: 'integer' },
          pagination: {
            type: 'object',
            properties: { page: { type: 'integer' }, limit: { type: 'integer' }, total: { type: 'integer' }, pages: { type: 'integer' } },
          },
          data: { type: 'array', items: { $ref: '#/components/schemas/Task' } },
        },
      },
      Error: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: false },
          message: { type: 'string', example: 'Validation failed' },
          errors: {
            type: 'array',
            items: { type: 'object', properties: { field: { type: 'string' }, message: { type: 'string' } } },
          },
        },
      },
    },
  },
};
