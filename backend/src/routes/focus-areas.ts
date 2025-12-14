import { Router } from 'express';
import { getDb, saveDatabase } from '../db';

const router = Router();

// GET /api/focus-areas - Get all focus areas
router.get('/', (_req, res) => {
  try {
    const db = getDb();
    const result = db.exec(`
      SELECT id, name, sort_order
      FROM focus_areas
      ORDER BY sort_order ASC, id ASC
    `);

    if (!result.length || !result[0].values.length) {
      res.json([]);
      return;
    }

    const focusAreas = result[0].values.map((row) => row[1] as string);
    res.json(focusAreas);
  } catch (error) {
    console.error('Error fetching focus areas:', error);
    res.status(500).json({ error: 'Failed to fetch focus areas' });
  }
});

// POST /api/focus-areas - Create a new focus area
router.post('/', (req, res) => {
  try {
    const db = getDb();
    const { name } = req.body;

    if (!name || !name.trim()) {
      res.status(400).json({ error: 'Name is required' });
      return;
    }

    const trimmedName = name.trim();

    // Get max sort_order
    const maxOrderResult = db.exec(`
      SELECT MAX(sort_order) as max_order FROM focus_areas
    `);

    const maxOrder = maxOrderResult.length && maxOrderResult[0].values.length
      ? (maxOrderResult[0].values[0][0] as number | null) ?? -1
      : -1;

    const newOrder = maxOrder + 1;

    db.run(`
      INSERT OR IGNORE INTO focus_areas (name, sort_order)
      VALUES (?, ?)
    `, [trimmedName, newOrder]);

    saveDatabase();
    res.status(201).json({ name: trimmedName });
  } catch (error) {
    console.error('Error creating focus area:', error);
    res.status(500).json({ error: 'Failed to create focus area' });
  }
});

// PUT /api/focus-areas/reorder - Reorder focus areas
router.put('/reorder', (req, res) => {
  try {
    const db = getDb();
    const { order } = req.body;

    if (!Array.isArray(order)) {
      res.status(400).json({ error: 'Order array is required' });
      return;
    }

    order.forEach((name: string, index: number) => {
      db.run(`UPDATE focus_areas SET sort_order = ? WHERE name = ?`, [index, name]);
    });

    saveDatabase();
    res.json({ success: true });
  } catch (error) {
    console.error('Error reordering focus areas:', error);
    res.status(500).json({ error: 'Failed to reorder focus areas' });
  }
});

// DELETE /api/focus-areas/:name - Delete a focus area
router.delete('/:name', (req, res) => {
  try {
    const db = getDb();
    const name = decodeURIComponent(req.params.name);

    // Get task IDs for this focus area
    const tasksResult = db.exec(`SELECT id FROM tasks WHERE focus_area = '${name.replace(/'/g, "''")}'`);
    
    if (tasksResult.length && tasksResult[0].values.length) {
      const taskIds = tasksResult[0].values.map((row) => row[0]);
      // Delete scheduled dates for these tasks
      db.run(`DELETE FROM scheduled_dates WHERE task_id IN (${taskIds.join(',')})`);
    }

    // Delete associated tasks
    db.run(`DELETE FROM tasks WHERE focus_area = ?`, [name]);

    // Delete the focus area
    db.run(`DELETE FROM focus_areas WHERE name = ?`, [name]);

    saveDatabase();
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting focus area:', error);
    res.status(500).json({ error: 'Failed to delete focus area' });
  }
});

export default router;
