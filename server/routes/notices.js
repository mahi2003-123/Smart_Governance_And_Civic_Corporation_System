import express from 'express';
import { query } from '../db/index.js';

const router = express.Router();

// Auto-migrate schema for notice attachment and attribution fields if missing
query(`
  ALTER TABLE notices ADD COLUMN IF NOT EXISTS attachment_url TEXT;
  ALTER TABLE notices ADD COLUMN IF NOT EXISTS attachment_name VARCHAR(255);
  ALTER TABLE notices ADD COLUMN IF NOT EXISTS attachment_type VARCHAR(50);
  ALTER TABLE notices ADD COLUMN IF NOT EXISTS published_by_role VARCHAR(100);
`).catch((err) => console.log('[Notice DB Init Notice]', err.message));

function formatNotice(row) {
  return {
    id: row.id,
    title: row.title,
    content: row.content,
    ward: row.ward,
    priority: row.priority,
    publishedBy: row.published_by,
    publishedByRole: row.published_by_role || 'Ward Councillor',
    publishDate: row.publish_date,
    expiryDate: row.expiry_date,
    category: row.category,
    attachmentUrl: row.attachment_url,
    attachmentName: row.attachment_name,
    attachmentType: row.attachment_type
  };
}

// GET /api/notices
router.get('/', async (req, res) => {
  try {
    const { ward } = req.query;
    let sql = 'SELECT * FROM notices';
    const params = [];

    if (ward && ward !== 'All Wards' && ward !== 'ALL') {
      params.push(`%${ward}%`);
      sql += ` WHERE LOWER(ward) LIKE LOWER($1) OR ward = 'All Wards' OR ward = 'System Wide (All Registered Users)' OR ward = 'System Wide'`;
    }

    sql += ' ORDER BY publish_date DESC';

    const result = await query(sql, params);
    res.json(result.rows.map(formatNotice));
  } catch (error) {
    console.error('Error fetching notices:', error);
    res.status(500).json({ error: 'Failed to fetch notices' });
  }
});

// POST /api/notices
router.post('/', async (req, res) => {
  try {
    const {
      title,
      content,
      ward,
      priority,
      publishedBy,
      publishedByRole,
      category,
      expiryDate,
      attachmentUrl,
      attachmentName,
      attachmentType
    } = req.body;
    const id = `ntc_${Date.now()}`;

    const insertSql = `
      INSERT INTO notices (id, title, content, ward, priority, published_by, published_by_role, publish_date, expiry_date, category, attachment_url, attachment_name, attachment_type)
      VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), $8, $9, $10, $11, $12)
      RETURNING *
    `;

    const result = await query(insertSql, [
      id,
      title,
      content,
      ward,
      priority,
      publishedBy,
      publishedByRole || 'Ward Councillor',
      expiryDate || null,
      category,
      attachmentUrl || null,
      attachmentName || null,
      attachmentType || null
    ]);

    // Broadcast system notification to all users
    try {
      const notifSql = `
        INSERT INTO notifications (id, user_id, title, message, type, link_url)
        SELECT 'notif_' || md5(random()::text || clock_timestamp()::text || id), id, $1, $2, 'NOTICE', '/citizen/notices'
        FROM users
      `;
      await query(notifSql, [
        `📢 ${priority === 'EMERGENCY' ? 'EMERGENCY ALERT' : 'Official Ward Notice'}: ${title}`,
        `Published by ${publishedBy} (${ward}): ${content.substring(0, 100)}...`
      ]);
    } catch (notifErr) {
      console.warn('Could not broadcast notifications to users table:', notifErr.message);
    }

    res.status(201).json(formatNotice(result.rows[0]));
  } catch (error) {
    console.error('Error creating notice:', error);
    res.status(500).json({ error: 'Failed to create notice' });
  }
});

export default router;
