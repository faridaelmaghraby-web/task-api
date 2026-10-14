const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const openapi = require('./docs/openapi');
const authRoutes = require('./routes/authRoutes');
const taskRoutes = require('./routes/taskRoutes');
const { notFound, errorHandler } = require('./middleware/errorHandler');
const connectDB = require('./config/db');
const AppError = require('./utils/AppError');

const app = express();

app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors());
app.use(express.json({ limit: '10kb' }));
if (process.env.NODE_ENV !== 'test') app.use(morgan('dev'));

app.get('/', (req, res) =>
  res.json({ success: true, message: 'Task API is running', docs: '/api-docs', health: '/health' })
);
app.get('/health', (req, res) => res.json({ status: 'ok', uptime: process.uptime() }));

app.get('/api-docs', (req, res) => {
  res.type('html').send(`<!DOCTYPE html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Task API Docs</title>
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/swagger-ui-dist@5/swagger-ui.css"></head>
<body><div id="swagger-ui"></div>
<script src="https://cdn.jsdelivr.net/npm/swagger-ui-dist@5/swagger-ui-bundle.js"></script>
<script>window.ui = SwaggerUIBundle({ url: '/openapi.json', dom_id: '#swagger-ui', persistAuthorization: true });</script>
</body></html>`);
});
app.get('/openapi.json', (req, res) => res.json(openapi));

// Make sure MongoDB is connected before any /api route runs (works on Vercel and locally)
app.use('/api', async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    next(new AppError('Database unavailable. Check MONGODB_URI and Atlas network access.', 503));
  }
});

app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
