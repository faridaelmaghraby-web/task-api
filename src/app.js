const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const swaggerUi = require('swagger-ui-express');

const openapi = require('./docs/openapi');
const authRoutes = require('./routes/authRoutes');
const taskRoutes = require('./routes/taskRoutes');
const { notFound, errorHandler } = require('./middleware/errorHandler');

const app = express();

app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors());
app.use(express.json({ limit: '10kb' }));
if (process.env.NODE_ENV !== 'test') app.use(morgan('dev'));

app.get('/', (req, res) =>
  res.json({ success: true, message: 'Task API is running', docs: '/api-docs', health: '/health' })
);
app.get('/health', (req, res) => res.json({ status: 'ok', uptime: process.uptime() }));

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(openapi, { customSiteTitle: 'Task API Docs' }));
app.get('/openapi.json', (req, res) => res.json(openapi));

app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
