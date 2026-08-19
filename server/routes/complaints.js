import express from 'express';
import { query } from '../db/index.js';

const router = express.Router();

// Helper to format database row into complaint object
function formatComplaint(row, timelineRows = [], commentRows = []) {
  return {
    id: row.id,
    trackingNumber: row.tracking_number,
    title: row.title,
    category: row.category,
    priority: row.priority,
    description: row.description,
    ward: row.ward,
    locationAddress: row.location_address,
    latitude: row.latitude,
    longitude: row.longitude,
    status: row.status,
    citizenId: row.citizen_id,
    citizenName: row.citizen_name,
    citizenPhone: row.citizen_phone,
    assignedWorkerId: row.assigned_worker_id,
    assignedWorkerName: row.assigned_worker_name,
    images: typeof row.images === 'string' ? JSON.parse(row.images) : (row.images || []),
    completionImage: row.completion_image,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    timeline: timelineRows.map((t) => ({
      id: t.id,
      title: t.title,
      description: t.description,
      timestamp: t.timestamp,
      actorName: t.actor_name,
      actorRole: t.actor_role,
      status: t.status
    })),
    comments: commentRows.map((c) => ({
      id: c.id,
      authorName: c.author_name,
      authorRole: c.author_role,
      content: c.content,
      createdAt: c.created_at
    }))
  };
}

// GET /api/complaints
router.get('/', async (req, res) => {
  try {
    const { status, category, ward, search, citizenId, assignedWorkerId } = req.query;

    let sql = 'SELECT * FROM complaints WHERE 1=1';
    const params = [];

    if (status) {
      params.push(status);
      sql += ` AND status = $${params.length}`;
    }
    if (category) {
      params.push(category);
      sql += ` AND category = $${params.length}`;
    }
    if (ward) {
      params.push(`%${ward}%`);
      sql += ` AND LOWER(ward) LIKE LOWER($${params.length})`;
    }
    if (citizenId) {
      params.push(citizenId);
      sql += ` AND citizen_id = $${params.length}`;
    }
    if (assignedWorkerId) {
      params.push(assignedWorkerId);
      sql += ` AND assigned_worker_id = $${params.length}`;
    }
    if (search) {
      params.push(`%${search}%`);
      sql += ` AND (LOWER(title) LIKE LOWER($${params.length}) OR LOWER(tracking_number) LIKE LOWER($${params.length}) OR LOWER(description) LIKE LOWER($${params.length}) OR LOWER(location_address) LIKE LOWER($${params.length}))`;
    }

    sql += ' ORDER BY created_at DESC';

    const complaintsRes = await query(sql, params);
    const complaints = [];

    for (const row of complaintsRes.rows) {
      const tlRes = await query('SELECT * FROM complaint_timeline WHERE complaint_id = $1 ORDER BY timestamp ASC', [row.id]);
      const cmRes = await query('SELECT * FROM complaint_comments WHERE complaint_id = $1 ORDER BY created_at ASC', [row.id]);
      complaints.push(formatComplaint(row, tlRes.rows, cmRes.rows));
    }

    res.json(complaints);
  } catch (error) {
    console.error('Error fetching complaints:', error);
    res.status(500).json({ error: 'Failed to fetch complaints from database' });
  }
});

// GET /api/complaints/:id
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const resComp = await query('SELECT * FROM complaints WHERE id = $1 OR tracking_number = $1', [id]);
    if (resComp.rows.length === 0) {
      return res.status(404).json({ error: 'Complaint not found' });
    }

    const row = resComp.rows[0];
    const tlRes = await query('SELECT * FROM complaint_timeline WHERE complaint_id = $1 ORDER BY timestamp ASC', [row.id]);
    const cmRes = await query('SELECT * FROM complaint_comments WHERE complaint_id = $1 ORDER BY created_at ASC', [row.id]);

    res.json(formatComplaint(row, tlRes.rows, cmRes.rows));
  } catch (error) {
    console.error('Error fetching complaint details:', error);
    res.status(500).json({ error: 'Failed to fetch complaint details' });
  }
});

// POST /api/complaints
router.post('/', async (req, res) => {
  try {
    const { title, category, priority, description, ward, locationAddress, citizenId, citizenName, citizenPhone, images } = req.body;

    const id = `cmp_${Date.now()}`;
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const trackingNumber = `SGCS-2026-${randomSuffix}`;

    const insertSql = `
      INSERT INTO complaints (id, tracking_number, title, category, priority, description, ward, location_address, status, citizen_id, citizen_name, citizen_phone, images)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'PENDING', $9, $10, $11, $12)
      RETURNING *
    `;

    const imagesJson = JSON.stringify(images && images.length > 0 ? images : [
      'https://images.unsplash.com/photo-1541888946425-d0fbb186a5b3?auto=format&fit=crop&q=80&w=600'
    ]);

    const compRes = await query(insertSql, [id, trackingNumber, title, category, priority, description, ward, locationAddress, citizenId, citizenName, citizenPhone, imagesJson]);

    // Insert timeline
    const tlId = `tl_${Date.now()}`;
    await query(
      `INSERT INTO complaint_timeline (id, complaint_id, title, description, timestamp, actor_name, actor_role, status)
       VALUES ($1, $2, $3, $4, NOW(), $5, $6, $7)`,
      [tlId, id, 'Complaint Registered', 'Filed through SGCS Citizen Portal.', citizenName, 'CITIZEN', 'PENDING']
    );

    const row = compRes.rows[0];
    const tlRes = await query('SELECT * FROM complaint_timeline WHERE complaint_id = $1', [id]);

    res.status(201).json(formatComplaint(row, tlRes.rows, []));
  } catch (error) {
    console.error('Error creating complaint:', error);
    res.status(500).json({ error: 'Failed to create complaint in database' });
  }
});

// PATCH /api/complaints/:id/status
router.patch('/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, actorName, actorRole, note, completionImage } = req.body;

    const compCheck = await query('SELECT * FROM complaints WHERE id = $1', [id]);
    if (compCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Complaint not found' });
    }

    let updateSql = `UPDATE complaints SET status = $1, updated_at = NOW()`;
    const params = [status];

    if (completionImage) {
      params.push(completionImage);
      updateSql += `, completion_image = $${params.length}`;
    }

    params.push(id);
    updateSql += ` WHERE id = $${params.length} RETURNING *`;

    const updateRes = await query(updateSql, params);

    // Add to timeline
    const tlId = `tl_${Date.now()}`;
    await query(
      `INSERT INTO complaint_timeline (id, complaint_id, title, description, timestamp, actor_name, actor_role, status)
       VALUES ($1, $2, $3, $4, NOW(), $5, $6, $7)`,
      [tlId, id, `Status updated to ${status.replace('_', ' ')}`, note || `Status changed by ${actorName}`, actorName, actorRole, status]
    );

    const row = updateRes.rows[0];
    const tlRes = await query('SELECT * FROM complaint_timeline WHERE complaint_id = $1 ORDER BY timestamp ASC', [id]);
    const cmRes = await query('SELECT * FROM complaint_comments WHERE complaint_id = $1 ORDER BY created_at ASC', [id]);

    res.json(formatComplaint(row, tlRes.rows, cmRes.rows));
  } catch (error) {
    console.error('Error updating complaint status:', error);
    res.status(500).json({ error: 'Failed to update status' });
  }
});

// PATCH /api/complaints/:id/assign
router.patch('/:id/assign', async (req, res) => {
  try {
    const { id } = req.params;
    const { workerId, workerName, assignerName } = req.body;

    const updateSql = `
      UPDATE complaints 
      SET assigned_worker_id = $1, assigned_worker_name = $2, status = 'IN_PROGRESS', updated_at = NOW()
      WHERE id = $3 RETURNING *
    `;

    const updateRes = await query(updateSql, [workerId, workerName, id]);
    if (updateRes.rows.length === 0) {
      return res.status(404).json({ error: 'Complaint not found' });
    }

    const tlId = `tl_${Date.now()}`;
    await query(
      `INSERT INTO complaint_timeline (id, complaint_id, title, description, timestamp, actor_name, actor_role, status)
       VALUES ($1, $2, $3, $4, NOW(), $5, $6, $7)`,
      [tlId, id, `Assigned to ${workerName}`, `Assigned for field action by Councillor ${assignerName}`, assignerName, 'COUNCILLOR', 'IN_PROGRESS']
    );

    const row = updateRes.rows[0];
    const tlRes = await query('SELECT * FROM complaint_timeline WHERE complaint_id = $1 ORDER BY timestamp ASC', [id]);
    const cmRes = await query('SELECT * FROM complaint_comments WHERE complaint_id = $1 ORDER BY created_at ASC', [id]);

    res.json(formatComplaint(row, tlRes.rows, cmRes.rows));
  } catch (error) {
    console.error('Error assigning worker:', error);
    res.status(500).json({ error: 'Failed to assign worker' });
  }
});

// POST /api/complaints/:id/comments
router.post('/:id/comments', async (req, res) => {
  try {
    const { id } = req.params;
    const { authorName, authorRole, content } = req.body;

    const cmtId = `cmt_${Date.now()}`;
    await query(
      `INSERT INTO complaint_comments (id, complaint_id, author_name, author_role, content, created_at)
       VALUES ($1, $2, $3, $4, $5, NOW())`,
      [cmtId, id, authorName, authorRole, content]
    );

    await query('UPDATE complaints SET updated_at = NOW() WHERE id = $1', [id]);

    const compRes = await query('SELECT * FROM complaints WHERE id = $1', [id]);
    const row = compRes.rows[0];
    const tlRes = await query('SELECT * FROM complaint_timeline WHERE complaint_id = $1 ORDER BY timestamp ASC', [id]);
    const cmRes = await query('SELECT * FROM complaint_comments WHERE complaint_id = $1 ORDER BY created_at ASC', [id]);

    res.json(formatComplaint(row, tlRes.rows, cmRes.rows));
  } catch (error) {
    console.error('Error adding comment:', error);
    res.status(500).json({ error: 'Failed to add comment' });
  }
});

export default router;
