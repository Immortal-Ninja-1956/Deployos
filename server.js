import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import neoHandler from './api/neo.js';
import fieldReportHandler from './api/field-report.js';
import healthHandler from './api/health.js';
import searchHandler from './api/search.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: '10kb' }));

// Set security headers globally for local dev
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'no-referrer');
  next();
});

// Log incoming requests
app.use((req, res, next) => {
  console.log(`[Server] ${req.method} ${req.url}`);
  next();
});

// Expose the API endpoints
app.all('/api/neo', neoHandler);
app.all('/api/field-report', fieldReportHandler);
app.all('/api/health', healthHandler);
app.all('/api/search', searchHandler);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
