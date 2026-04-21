require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');
const passport = require('./config/passport');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');
const AppError = require('./utils/AppError');

const authRoutes = require('./routes/authRoutes');
const taskRoutes = require('./routes/taskRoutes');
const orgRoutes  = require('./routes/orgRoutes');

const app = express();

// Security headers — prevents XSS, clickjacking, sniffing attacks
app.use(helmet({ contentSecurityPolicy: false }));

// Body parsing
app.use(cors({ origin: ['http://localhost:5173', 'http://localhost:3000'], credentials: true }));
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: false }));

// Sanitize req.body, req.params, req.query — strips MongoDB operators ($, .)
app.use(mongoSanitize());

// Passport (session: false — we use JWT, not cookies)
app.use(passport.initialize());

// Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/tasks', taskRoutes);
app.use('/api/v1/org', orgRoutes);

// Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Health check
app.get('/health', (req, res) => res.json({ status: 'ok' }));

// 404 handler
app.all('*', (req, res, next) =>
  next(new AppError(`Route ${req.originalUrl} not found.`, 404))
);

// Global error handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
});

module.exports = app;
