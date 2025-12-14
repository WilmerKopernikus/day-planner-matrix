import { Router } from 'express';
import { getDb, saveDatabase } from '../db';

const router = Router();

// GET /api/tasks - Get all tasks
router.get('/', (_req, res) => {
  try {
    const db = getDb();
    const tasks = db.exec(`
      SELECT id, name, focus_area, sub_project_id, is_sub_project, completed
      FROM tasks
      ORDER BY id ASC
    `);

    if (!tasks.length || !tasks[0].values.length) {
      res.json([]);
      return;
    }

    const tasksWithDates = tasks[0].values.map((row) => {
      const taskId = row[0] as number;
      const datesResult = db.exec(`
        SELECT scheduled_date FROM scheduled_dates WHERE task_id = ${taskId}
      `);

      const scheduledDates = datesResult.length && datesResult[0].values.length
        ? datesResult[0].values.map((d) => d[0] as string)
        : [];

      return {
        id: taskId,
        name: row[1] as string,
        focusArea: row[2] as string,
        subProjectId: row[3] || undefined,
        isSubProject: row[4] === 1 || undefined,
        completed: row[5] === 1 || undefined,
        scheduledDates,
      };
    });

    res.json(tasksWithDates);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
});

// POST /api/tasks - Create a new task
router.post('/', (req, res) => {
  try {
    const db = getDb();
    const { name, focusArea, subProjectId, isSubProject } = req.body;

    if (!name || !focusArea) {
      res.status(400).json({ error: 'Name and focusArea are required' });
      return;
    }

    db.run(`
      INSERT INTO tasks (name, focus_area, sub_project_id, is_sub_project)
      VALUES (?, ?, ?, ?)
    `, [name, focusArea, subProjectId || null, isSubProject ? 1 : 0]);

    const result = db.exec('SELECT last_insert_rowid() as id');
    const newId = result[0].values[0][0] as number;

    saveDatabase();

    const newTask = {
      id: newId,
      name,
      focusArea,
      subProjectId: subProjectId || undefined,
      isSubProject: isSubProject || undefined,
      scheduledDates: [],
    };

    res.status(201).json(newTask);
  } catch (error) {
    console.error('Error creating task:', error);
    res.status(500).json({ error: 'Failed to create task' });
  }
});

// PUT /api/tasks/:id - Update a task
router.put('/:id', (req, res) => {
  try {
    const db = getDb();
    const taskId = parseInt(req.params.id, 10);
    const { name, focusArea, subProjectId, isSubProject, completed, scheduledDates } = req.body;

    // Get current task
    const current = db.exec(`SELECT * FROM tasks WHERE id = ${taskId}`);
    if (!current.length || !current[0].values.length) {
      res.status(404).json({ error: 'Task not found' });
      return;
    }

    db.run(`
      UPDATE tasks
      SET name = ?,
          focus_area = ?,
          sub_project_id = ?,
          is_sub_project = ?,
          completed = ?,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [
      name ?? current[0].values[0][1],
      focusArea ?? current[0].values[0][2],
      subProjectId ?? current[0].values[0][3],
      isSubProject !== undefined ? (isSubProject ? 1 : 0) : current[0].values[0][4],
      completed !== undefined ? (completed ? 1 : 0) : current[0].values[0][5],
      taskId
    ]);

    // Update scheduled dates if provided
    if (Array.isArray(scheduledDates)) {
      db.run('DELETE FROM scheduled_dates WHERE task_id = ?', [taskId]);

      for (const date of scheduledDates) {
        db.run(`
          INSERT INTO scheduled_dates (task_id, scheduled_date) VALUES (?, ?)
        `, [taskId, date]);
      }
    }

    saveDatabase();
    res.json({ success: true });
  } catch (error) {
    console.error('Error updating task:', error);
    res.status(500).json({ error: 'Failed to update task' });
  }
});

// POST /api/tasks/:id/schedule - Add a scheduled date to a task
router.post('/:id/schedule', (req, res) => {
  try {
    const db = getDb();
    const taskId = parseInt(req.params.id, 10);
    const { date } = req.body;

    if (!date) {
      res.status(400).json({ error: 'Date is required' });
      return;
    }

    db.run(`
      INSERT OR IGNORE INTO scheduled_dates (task_id, scheduled_date)
      VALUES (?, ?)
    `, [taskId, date]);

    saveDatabase();
    res.json({ success: true });
  } catch (error) {
    console.error('Error scheduling task:', error);
    res.status(500).json({ error: 'Failed to schedule task' });
  }
});

// DELETE /api/tasks/:id - Delete a task
router.delete('/:id', (req, res) => {
  try {
    const db = getDb();
    const taskId = parseInt(req.params.id, 10);

    db.run('DELETE FROM scheduled_dates WHERE task_id = ?', [taskId]);
    db.run('DELETE FROM tasks WHERE id = ?', [taskId]);

    saveDatabase();
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting task:', error);
    res.status(500).json({ error: 'Failed to delete task' });
  }
});

export default router;
