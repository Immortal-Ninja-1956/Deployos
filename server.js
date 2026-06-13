import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import neoHandler from './api/neo.js';
import fieldReportHandler from './api/field-report.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Log incoming requests
app.use((req, res, next) => {
  console.log(`[Server] ${req.method} ${req.url}`);
  next();
});

// Expose the API endpoints
app.all('/api/neo', neoHandler);
app.all('/api/field-report', fieldReportHandler);

// Basic health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
