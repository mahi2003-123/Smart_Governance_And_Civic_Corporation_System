import express from 'express';
import { query } from '../db/index.js';

const router = express.Router();

function formatNotification(row) {
  return {
    id: row.id,
    title: row.title,
    message: row.message,
    type: row.type,
    read: row.read,
    createdAt: row.created_at,
    linkUrl: row.link_url
  };
}

// GET /api/notifications
router.get('/', async (req, res) => {
  try {
    const { userId } = req.query;
    let sql = 'SELECT * FROM notifications';
    const params = [];

    if (userId) {
      params.push(userId);
      sql += ' WHERE user_id = $1';
    }

    sql += ' ORDER BY created_at DESC';

    const result = await query(sql, params);
    res.json(result.rows.map(formatNotification));
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});

// PATCH /api/notifications/:id/read
router.patch('/:id/read', async (req, res) => {
  try {
    const { id } = req.params;
    await query('UPDATE notifications SET read = TRUE WHERE id = $1', [id]);
    const result = await query('SELECT * FROM notifications ORDER BY created_at DESC');
    res.json(result.rows.map(formatNotification));
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ error: 'Failed to update notification' });
  }
});

// PATCH /api/notifications/read-all
router.patch('/read-all', async (req, res) => {
  try {
    await query('UPDATE notifications SET read = TRUE');
    const result = await query('SELECT * FROM notifications ORDER BY created_at DESC');
    res.json(result.rows.map(formatNotification));
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    res.status(500).json({ error: 'Failed to update notifications' });
  }
});

// POST /api/notifications
router.post('/', async (req, res) => {
  try {
    const { userId, title, message, type, linkUrl } = req.body;
    const id = `notif_${Date.now()}`;

    const insertSql = `
      INSERT INTO notifications (id, user_id, title, message, type, read, created_at, link_url)
      VALUES ($1, $2, $3, $4, $5, FALSE, NOW(), $6)
      RETURNING *
    `;

    const result = await query(insertSql, [id, userId || 'usr_citizen_01', title, message, type, linkUrl]);
    res.status(201).json(formatNotification(result.rows[0]));
  } catch (error) {
    console.error('Error creating notification:', error);
    res.status(500).json({ error: 'Failed to create notification' });
  }
});

export default router;
