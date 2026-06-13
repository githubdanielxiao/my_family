import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import authRoutes from './routes/auth.js';
import memberRoutes from './routes/members.js';
import permissionRoutes from './routes/permissions.js';
import { authenticateToken } from './middleware/auth.js';
import { initializeDatabase } from './config/database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Initialize Database
await initializeDatabase();

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/members', authenticateToken, memberRoutes);
app.use('/api/permissions', authenticateToken, permissionRoutes);

// Health Check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: err.message || 'Internal Server Error',
    timestamp: new Date().toISOString()
  });
});

app.listen(PORT, () => {
  console.log(`\n🚀 Family Management System Backend`);
  console.log(`📍 Server running on http://localhost:${PORT}`);
  console.log(`🌐 CORS enabled for ${process.env.CLIENT_URL}`);
  console.log(`📅 Started at ${new Date().toISOString()}\n`);
});
