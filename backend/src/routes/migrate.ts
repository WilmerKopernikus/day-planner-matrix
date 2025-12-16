import { Router } from 'express';
import { getDb, saveDatabase } from '../db';

const router = Router();

interface MigrationTask {
  id: number;
  focusArea: string;
  name: string;
  subProjectId?: number;
  isSubProject?: boolean;
  completed?: boolean;
  scheduledDates?: string[];
}

interface MigrationData {
  tasks: MigrationTask[];
  focusAreas: string[];
}

// POST /api/migrate - Import data from localStorage
router.post('/', (req, res) => {
  try {
    const db = getDb();
    const data: MigrationData = req.body;

    if (!data.tasks || !data.focusAreas) {
      res.status(400).json({ error: 'Invalid migration data format' });
      return;
    }

    // Clear existing data
    db.run('DELETE FROM scheduled_dates');
    db.run('DELETE FROM tasks');
    db.run('DELETE FROM focus_areas');

    // Insert focus areas
    data.focusAreas.forEach((name, index) => {
      db.run('INSERT INTO focus_areas (name, sort_order) VALUES (?, ?)', [name, index]);
    });

    // Insert tasks with sort_order based on array position
    for (let i = 0; i < data.tasks.length; i++) {
      const task = data.tasks[i];
      db.run(`
        INSERT INTO tasks (id, name, focus_area, sub_project_id, is_sub_project, completed, sort_order)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `, [
        task.id,
        task.name,
        task.focusArea,
        task.subProjectId || null,
        task.isSubProject ? 1 : 0,
        task.completed ? 1 : 0,
        i
      ]);

      // Insert scheduled dates
      if (task.scheduledDates && task.scheduledDates.length > 0) {
        for (const date of task.scheduledDates) {
          db.run(`
            INSERT INTO scheduled_dates (task_id, scheduled_date)
            VALUES (?, ?)
          `, [task.id, date]);
        }
      }
    }

    saveDatabase();

    res.json({
      success: true,
      imported: {
        tasks: data.tasks.length,
        focusAreas: data.focusAreas.length,
        scheduledDates: data.tasks.reduce((sum, t) => sum + (t.scheduledDates?.length || 0), 0)
      }
    });
  } catch (error) {
    console.error('Migration error:', error);
    res.status(500).json({ error: 'Migration failed', details: String(error) });
  }
});

export default router;
