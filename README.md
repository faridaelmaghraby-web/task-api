# Task API

A RESTful task management API built with **Node.js, Express, MongoDB (Mongoose)** and **JWT authentication**, documented with **Swagger / OpenAPI 3**.

- **Live API:** [https://task-api-orcin.vercel.app](https://task-api-orcin.vercel.app)
- **Swagger docs:** [https://task-api-orcin.vercel.app/api-docs](https://task-api-orcin.vercel.app/api-docs)
- **Postman collection:** [`postman/task-api.postman_collection.json`](postman/task-api.postman_collection.json)

## Features

- CRUD endpoints for tasks (create, read, update, delete)
- JWT authentication (register / login); all task routes are protected
- Each user can only access their own tasks
- Request validation with Joi (body and query parameters)
- Mongoose schema validation (`title`, `description`, `status`, `createdAt`)
- Centralised error handling with consistent JSON errors and correct HTTP status codes
- Filtering by status, sorting and pagination on the list endpoint
- Interactive Swagger UI at `/api-docs` (raw spec at `/openapi.json`)
- Security basics: bcrypt password hashing, Helmet, CORS, body size limit

## Tech stack

Node.js 18+, Express 4, Mongoose 8, jsonwebtoken, bcryptjs, Joi, swagger-ui-express, Helmet, Morgan.

## Project structure

```
src/
  app.js                 Express app (middleware + routes)
  server.js              Entry point (DB connection + listen)
  config/db.js           MongoDB connection
  models/                Task and User schemas
  controllers/           Route handlers
  routes/                Route definitions
  middleware/            auth (JWT), validate (Joi), errorHandler
  docs/openapi.js        OpenAPI 3 specification
  utils/                 AppError, asyncHandler
postman/                 Postman collection
```

## Local setup

1. **Clone and install**
   ```bash
   git clone https://github.com/faridaelmaghraby-web/task-api.git
   cd task-api
   npm install
   ```
2. **Configure environment**
   ```bash
   cp .env.example .env
   ```
   Edit `.env`:

   | Variable | Description |
   |---|---|
   | `PORT` | Server port (default `3000`) |
   | `MONGODB_URI` | MongoDB connection string (local or MongoDB Atlas) |
   | `JWT_SECRET` | Long random string used to sign tokens |
   | `JWT_EXPIRES_IN` | Token lifetime, e.g. `1d` |

   Local MongoDB example: `MONGODB_URI=mongodb://127.0.0.1:27017/task-api`
3. **Run**
   ```bash
   npm run dev   # development (nodemon)
   npm start     # production
   ```
4. Open `http://localhost:3000/api-docs`.

## API usage

Base URL: `http://localhost:3000` (or your deployed URL)

### Auth

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/register` | No | Create an account, returns a JWT |
| POST | `/api/auth/login` | No | Log in, returns a JWT |
| GET | `/api/auth/me` | Yes | Current user |

### Tasks (JWT required)

Send the header `Authorization: Bearer <token>`.

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/tasks` | Create a task |
| GET | `/api/tasks` | List your tasks. Query: `status`, `page`, `limit`, `sort` |
| GET | `/api/tasks/:id` | Get one task |
| PUT / PATCH | `/api/tasks/:id` | Update one or more fields |
| DELETE | `/api/tasks/:id` | Delete a task |

**Task fields:** `title` (required, 3-100 chars), `description` (max 1000), `status` (`pending` | `in-progress` | `completed`, default `pending`), `createdAt` (auto).

### Example requests

```bash
# Register
curl -X POST $BASE/api/auth/register -H "Content-Type: application/json" \
  -d '{"name":"Jane Doe","email":"jane@example.com","password":"secret123"}'

# Login (copy the token from the response)
curl -X POST $BASE/api/auth/login -H "Content-Type: application/json" \
  -d '{"email":"jane@example.com","password":"secret123"}'

# Create a task
curl -X POST $BASE/api/tasks -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d '{"title":"Write docs","description":"README + Swagger","status":"pending"}'

# List tasks filtered by status
curl "$BASE/api/tasks?status=pending&page=1&limit=10" -H "Authorization: Bearer $TOKEN"

# Update / delete
curl -X PUT $BASE/api/tasks/$ID -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" -d '{"status":"completed"}'
curl -X DELETE $BASE/api/tasks/$ID -H "Authorization: Bearer $TOKEN"
```

### Error format and status codes

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [{ "field": "title", "message": "title is required" }]
}
```

| Code | Meaning |
|---|---|
| 200 | OK |
| 201 | Created |
| 400 | Validation error, invalid ID or malformed JSON |
| 401 | Missing, invalid or expired token / bad credentials |
| 404 | Task or route not found |
| 409 | Duplicate (email already registered) |
| 500 | Unexpected server error |

## Using the Postman collection

1. Import `postman/task-api.postman_collection.json`.
2. Set the `baseUrl` collection variable (local or deployed URL).
3. Run **Auth → Register** (or **Login**). The JWT is stored automatically in `token`.
4. Run the **Tasks** requests; **Create Task** stores `taskId` for the other requests.

## Deployment (free: Vercel + MongoDB Atlas)

Both services have free plans. The API runs on Vercel as a serverless function (`api/index.js` + `vercel.json`).

1. **Database:** create a free **M0** cluster on [MongoDB Atlas](https://www.mongodb.com/atlas), add a database user, and under *Network Access* allow `0.0.0.0/0` (Vercel uses changing IPs). Copy the connection string and add a database name, e.g. `...mongodb.net/task-api?retryWrites=true&w=majority`.
2. **Push to GitHub** (repository `task-api`).
3. **Vercel:** sign in at [vercel.com](https://vercel.com) with GitHub, click **Add New -> Project**, import `task-api`, leave the framework preset as *Other*, and add these environment variables:
   - `MONGODB_URI` (from step 1)
   - `JWT_SECRET` (any long random string)
   - `JWT_EXPIRES_IN` = `1d`
4. Click **Deploy**. Your base URL is `https://task-api-orcin.vercel.app`.
5. Verify `https://task-api-orcin.vercel.app/health` and `https://task-api-orcin.vercel.app/api-docs`.



## License

MIT
