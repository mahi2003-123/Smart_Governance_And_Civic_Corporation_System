import express from 'express';
import { query } from '../db/index.js';

const router = express.Router();

function formatNotice(row) {
  return {
    id: row.id,
    title: row.title,
    content: row.content,
    ward: row.ward,
    priority: row.priority,
    publishedBy: row.published_by,
    publishDate: row.publish_date,
    expiryDate: row.expiry_date,
    category: row.category
  };
}

// GET /api/notices
router.get('/', async (req, res) => {
  try {
    const { ward } = req.query;
    let sql = 'SELECT * FROM notices';
    const params = [];

    if (ward && ward !== 'All Wards') {
      params.push(`%${ward}%`);
      sql += ` WHERE LOWER(ward) LIKE LOWER($1) OR ward = 'All Wards'`;
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
    const { title, content, ward, priority, publishedBy, category, expiryDate } = req.body;
    const id = `ntc_${Date.now()}`;

    const insertSql = `
      INSERT INTO notices (id, title, content, ward, priority, published_by, publish_date, expiry_date, category)
      VALUES ($1, $2, $3, $4, $5, $6, NOW(), $7, $8)
      RETURNING *
    `;

    const result = await query(insertSql, [id, title, content, ward, priority, publishedBy, expiryDate || null, category]);
    res.status(201).json(formatNotice(result.rows[0]));
  } catch (error) {
    console.error('Error creating notice:', error);
    res.status(500).json({ error: 'Failed to create notice' });
  }
});

export default router;
