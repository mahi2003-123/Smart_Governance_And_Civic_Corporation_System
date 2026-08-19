import express from 'express';
import { query } from '../db/index.js';

const router = express.Router();

// GET /api/admin/analytics
router.get('/analytics', async (req, res) => {
  try {
    const totalComp = await query('SELECT COUNT(*) FROM complaints');
    const pendingComp = await query("SELECT COUNT(*) FROM complaints WHERE status = 'PENDING'");
    const inProgressComp = await query("SELECT COUNT(*) FROM complaints WHERE status = 'IN_PROGRESS'");
    const resolvedComp = await query("SELECT COUNT(*) FROM complaints WHERE status = 'RESOLVED'");
    const totalProp = await query('SELECT COUNT(*) FROM proposals');
    const activeNotices = await query("SELECT COUNT(*) FROM notices WHERE expiry_date IS NULL OR expiry_date > NOW()");

    const categoryBreakdownRes = await query(`
      SELECT category, COUNT(*) as count 
      FROM complaints 
      GROUP BY category 
      ORDER BY count DESC
    `);

    res.json({
      totalComplaints: parseInt(totalComp.rows[0].count, 10),
      pendingComplaints: parseInt(pendingComp.rows[0].count, 10),
      inProgressComplaints: parseInt(inProgressComp.rows[0].count, 10),
      resolvedComplaints: parseInt(resolvedComp.rows[0].count, 10),
      totalProposals: parseInt(totalProp.rows[0].count, 10),
      activeNotices: parseInt(activeNotices.rows[0].count, 10),
      categoryBreakdown: categoryBreakdownRes.rows.map((r) => ({
        category: r.category,
        count: parseInt(r.count, 10)
      })),
      monthlyTrends: [
        { month: 'Mar', filed: 65, resolved: 60 },
        { month: 'Apr', filed: 78, resolved: 72 },
        { month: 'May', filed: 90, resolved: 85 },
        { month: 'Jun', filed: 110, resolved: 102 },
        { month: 'Jul', filed: 125, resolved: 118 },
        { month: 'Aug', filed: 18, resolved: 7 }
      ]
    });
  } catch (error) {
    console.error('Error calculating analytics:', error);
    res.status(500).json({ error: 'Failed to generate analytics' });
  }
});

// GET /api/admin/users
router.get('/users', async (req, res) => {
  try {
    const result = await query('SELECT * FROM users ORDER BY created_at DESC');
    const users = result.rows.map((u) => ({
      id: u.id,
      fullName: u.full_name,
      email: u.email,
      phone: u.phone,
      role: u.role,
      ward: u.ward,
      createdAt: u.created_at
    }));
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// POST /api/admin/users (Super Admin registering a Councillor, Field Worker, or Admin)
router.post('/users', async (req, res) => {
  try {
    const { fullName, email, password = 'password123', phone, role, ward } = req.body;

    if (!fullName || !email || !role) {
      return res.status(400).json({ error: 'Full name, email, and role are required' });
    }

    const existing = await query('SELECT 1 FROM users WHERE LOWER(email) = LOWER($1)', [email.trim()]);
    if (existing.rows.length > 0) {
      return res.status(400).json({ error: 'User email already exists in database.' });
    }

    // Enforce 1 Councillor per ward constraint
    if (role === 'COUNCILLOR' && ward && ward !== 'All Wards') {
      const existingCouncillor = await query(
        "SELECT id, full_name, email FROM users WHERE role = 'COUNCILLOR' AND LOWER(ward) = LOWER($1)",
        [ward.trim()]
      );
      if (existingCouncillor.rows.length > 0) {
        const c = existingCouncillor.rows[0];
        return res.status(400).json({
          error: `Ward "${ward}" already has an assigned Councillor (${c.full_name} - ${c.email}). Only one Councillor is permitted per ward.`
        });
      }
    }

    const userId = `usr_${Date.now()}`;
    const insertSql = `
      INSERT INTO users (id, full_name, email, password_hash, phone, role, ward)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `;

    const result = await query(insertSql, [userId, fullName, email.trim(), password, phone, role, ward || 'Ward 1 - Central Town']);
    const u = result.rows[0];

    // Update councillor details in wards table if registering a Councillor
    if (role === 'COUNCILLOR' && ward) {
      await query(
        'UPDATE wards SET councillor_name = $1, councillor_email = $2 WHERE LOWER(name) LIKE LOWER($3) OR LOWER(id) = LOWER($4)',
        [fullName, email.trim(), `%${ward.replace(/^Ward \d+ - /, '')}%`, ward]
      );
    }

    res.status(201).json({
      id: u.id,
      fullName: u.full_name,
      email: u.email,
      phone: u.phone,
      role: u.role,
      ward: u.ward,
      createdAt: u.created_at
    });
  } catch (error) {
    console.error('Error registering user by Super Admin:', error);
    res.status(500).json({ error: error.message || 'Failed to register user in database' });
  }
});

// GET /api/admin/wards
router.get('/wards', async (req, res) => {
  try {
    const result = await query('SELECT * FROM wards ORDER BY ward_number ASC');
    const wards = result.rows.map((w) => ({
      id: w.id,
      wardNumber: w.ward_number,
      name: w.name,
      councillorName: w.councillor_name,
      councillorEmail: w.councillor_email,
      population: w.population,
      activeComplaints: w.active_complaints,
      resolvedComplaints: w.resolved_complaints
    }));
    res.json(wards);
  } catch (error) {
    console.error('Error fetching wards:', error);
    res.status(500).json({ error: 'Failed to fetch wards' });
  }
});

// POST /api/admin/wards
router.post('/wards', async (req, res) => {
  try {
    const { wardNumber, name, councillorName, councillorEmail, population } = req.body;
    const id = `w_${Date.now()}`;

    const insertSql = `
      INSERT INTO wards (id, ward_number, name, councillor_name, councillor_email, population, active_complaints, resolved_complaints)
      VALUES ($1, $2, $3, $4, $5, $6, 0, 0)
      RETURNING *
    `;

    const result = await query(insertSql, [id, wardNumber, name, councillorName, councillorEmail, population || 0]);
    const w = result.rows[0];

    res.status(201).json({
      id: w.id,
      wardNumber: w.ward_number,
      name: w.name,
      councillorName: w.councillor_name,
      councillorEmail: w.councillor_email,
      population: w.population,
      activeComplaints: w.active_complaints,
      resolvedComplaints: w.resolved_complaints
    });
  } catch (error) {
    console.error('Error creating ward:', error);
    res.status(500).json({ error: 'Failed to create ward' });
  }
});

export default router;
