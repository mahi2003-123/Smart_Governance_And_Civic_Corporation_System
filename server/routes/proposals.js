import express from 'express';
import { query } from '../db/index.js';

const router = express.Router();

function formatProposal(row) {
  return {
    id: row.id,
    title: row.title,
    category: row.category,
    description: row.description,
    ward: row.ward,
    authorName: row.author_name,
    authorRole: row.author_role,
    upvotes: parseInt(row.upvotes || 0, 10),
    downvotes: parseInt(row.downvotes || 0, 10),
    status: row.status,
    councillorNotes: row.councillor_notes,
    createdAt: row.created_at
  };
}

// GET /api/proposals
router.get('/', async (req, res) => {
  try {
    const { ward } = req.query;
    let sql = 'SELECT * FROM proposals';
    const params = [];

    if (ward && ward !== 'All Wards') {
      params.push(`%${ward}%`);
      sql += ` WHERE LOWER(ward) LIKE LOWER($1)`;
    }

    sql += ' ORDER BY created_at DESC';

    const result = await query(sql, params);
    const proposals = result.rows.map(formatProposal);
    res.json(proposals);
  } catch (error) {
    console.error('Error fetching proposals:', error);
    res.status(500).json({ error: 'Failed to fetch proposals from database' });
  }
});

// POST /api/proposals
router.post('/', async (req, res) => {
  try {
    const { title, category, description, ward, authorName } = req.body;
    const id = `prp_${Date.now()}`;

    const insertSql = `
      INSERT INTO proposals (id, title, category, description, ward, author_name, author_role, upvotes, downvotes, status)
      VALUES ($1, $2, $3, $4, $5, $6, 'CITIZEN', 1, 0, 'ACTIVE')
      RETURNING *
    `;

    const result = await query(insertSql, [id, title, category, description, ward, authorName]);
    const prop = formatProposal(result.rows[0]);
    prop.userVoted = 'UP';
    res.status(201).json(prop);
  } catch (error) {
    console.error('Error creating proposal:', error);
    res.status(500).json({ error: 'Failed to create proposal' });
  }
});

// POST /api/proposals/:id/vote
router.post('/:id/vote', async (req, res) => {
  try {
    const { id } = req.params;
    const { voteType, citizenId = 'usr_citizen_01' } = req.body;

    const propRes = await query('SELECT * FROM proposals WHERE id = $1', [id]);
    if (propRes.rows.length === 0) {
      return res.status(404).json({ error: 'Proposal not found' });
    }

    const row = propRes.rows[0];
    let upvotes = parseInt(row.upvotes || 0, 10);
    let downvotes = parseInt(row.downvotes || 0, 10);

    // Check existing vote in proposal_votes
    const existingVote = await query('SELECT * FROM proposal_votes WHERE proposal_id = $1 AND citizen_id = $2', [id, citizenId]);

    let newUserVoted = undefined;

    if (existingVote.rows.length > 0) {
      const prevType = existingVote.rows[0].vote_type;
      if (prevType === voteType) {
        // Toggle off
        if (voteType === 'UP') upvotes = Math.max(0, upvotes - 1);
        if (voteType === 'DOWN') downvotes = Math.max(0, downvotes - 1);
        await query('DELETE FROM proposal_votes WHERE proposal_id = $1 AND citizen_id = $2', [id, citizenId]);
      } else {
        // Switch vote
        if (prevType === 'UP') upvotes = Math.max(0, upvotes - 1);
        if (prevType === 'DOWN') downvotes = Math.max(0, downvotes - 1);

        if (voteType === 'UP') upvotes += 1;
        if (voteType === 'DOWN') downvotes += 1;

        await query('UPDATE proposal_votes SET vote_type = $1 WHERE proposal_id = $2 AND citizen_id = $3', [voteType, id, citizenId]);
        newUserVoted = voteType;
      }
    } else {
      // New vote
      if (voteType === 'UP') upvotes += 1;
      if (voteType === 'DOWN') downvotes += 1;

      const voteId = `vote_${Date.now()}`;
      await query('INSERT INTO proposal_votes (id, proposal_id, citizen_id, vote_type) VALUES ($1, $2, $3, $4)', [voteId, id, citizenId, voteType]);
      newUserVoted = voteType;
    }

    const updateRes = await query('UPDATE proposals SET upvotes = $1, downvotes = $2 WHERE id = $3 RETURNING *', [upvotes, downvotes, id]);
    const updatedProp = formatProposal(updateRes.rows[0]);
    updatedProp.userVoted = newUserVoted;

    res.json(updatedProp);
  } catch (error) {
    console.error('Error voting on proposal:', error);
    res.status(500).json({ error: 'Failed to process vote' });
  }
});

// PATCH /api/proposals/:id/status
router.patch('/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, councillorNotes } = req.body;

    const updateSql = `
      UPDATE proposals
      SET status = $1, councillor_notes = COALESCE($2, councillor_notes)
      WHERE id = $3 RETURNING *
    `;

    const result = await query(updateSql, [status, councillorNotes || null, id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Proposal not found' });
    }

    res.json(formatProposal(result.rows[0]));
  } catch (error) {
    console.error('Error updating proposal status:', error);
    res.status(500).json({ error: 'Failed to update proposal status' });
  }
});

export default router;
