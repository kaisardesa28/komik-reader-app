import express from 'express';
import cors from 'cors';
import apiRouter from '../server/src/routes/api.js';

const app = express();

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'OPTIONS'],
}));

app.use(express.json());

// Health check endpoint
app.get(['/api/health', '/health'], (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), message: 'Komik Reader Vercel API is running' });
});

// Mount API routes on both /api and root / to support all Vercel rewrite patterns
app.use('/api', apiRouter);
app.use('/', apiRouter);

export default app;
