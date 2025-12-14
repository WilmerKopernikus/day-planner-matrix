import express from 'express';
import cors from 'cors';
import { initializeDatabase } from './db';
import tasksRouter from './routes/tasks';
import focusAreasRouter from './routes/focus-areas';
import migrateRouter from './routes/migrate';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: 'http://localhost:4200',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));

// Routes
app.use('/api/tasks', tasksRouter);
app.use('/api/focus-areas', focusAreasRouter);
app.use('/api/migrate', migrateRouter);

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Start server after database is ready
async function start() {
  await initializeDatabase();
  
  app.listen(PORT, () => {
    console.log(`🚀 Backend running at http://localhost:${PORT}`);
    console.log(`📋 API endpoints:`);
    console.log(`   GET    /api/health`);
    console.log(`   GET    /api/tasks`);
    console.log(`   POST   /api/tasks`);
    console.log(`   PUT    /api/tasks/:id`);
    console.log(`   DELETE /api/tasks/:id`);
    console.log(`   GET    /api/focus-areas`);
    console.log(`   POST   /api/focus-areas`);
    console.log(`   DELETE /api/focus-areas/:name`);
    console.log(`   POST   /api/migrate`);
  });
}

start().catch(console.error);
