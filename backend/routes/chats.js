const express = require('express');
const pool = require('../db');
const { verifyToken } = require('./auth');

const router = express.Router();

// Get all conversations for user
router.get('/', verifyToken, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM conversations WHERE user_id = $1 ORDER BY updated_at DESC',
      [req.userId]
    );

    res.json({ conversations: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get messages for a conversation
router.get('/:conversationId/messages', verifyToken, async (req, res) => {
  try {
    const { conversationId } = req.params;

    // Verify ownership
    const convCheck = await pool.query(
      'SELECT * FROM conversations WHERE id = $1 AND user_id = $2',
      [conversationId, req.userId]
    );

    if (convCheck.rows.length === 0) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const result = await pool.query(
      'SELECT * FROM messages WHERE conversation_id = $1 ORDER BY created_at ASC',
      [conversationId]
    );

    res.json({ messages: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create new conversation
router.post('/', verifyToken, async (req, res) => {
  const { title } = req.body;

  try {
    const result = await pool.query(
      'INSERT INTO conversations (user_id, title) VALUES ($1, $2) RETURNING *',
      [req.userId, title || 'New Conversation']
    );

    res.json({ conversation: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Add message to conversation
router.post('/:conversationId/messages', verifyToken, async (req, res) => {
  const { conversationId } = req.params;
  const { role, content, docsUsed } = req.body;

  try {
    // Verify ownership
    const convCheck = await pool.query(
      'SELECT * FROM conversations WHERE id = $1 AND user_id = $2',
      [conversationId, req.userId]
    );

    if (convCheck.rows.length === 0) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const result = await pool.query(
      'INSERT INTO messages (conversation_id, role, content, docs_used) VALUES ($1, $2, $3, $4) RETURNING *',
      [conversationId, role, content, JSON.stringify(docsUsed || null)]
    );

    // Update conversation timestamp
    await pool.query(
      'UPDATE conversations SET updated_at = CURRENT_TIMESTAMP WHERE id = $1',
      [conversationId]
    );

    res.json({ message: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update conversation title
router.patch('/:conversationId', verifyToken, async (req, res) => {
  const { conversationId } = req.params;
  const { title } = req.body;

  try {
    const result = await pool.query(
      'UPDATE conversations SET title = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 AND user_id = $3 RETURNING *',
      [title, conversationId, req.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    res.json({ conversation: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete conversation
router.delete('/:conversationId', verifyToken, async (req, res) => {
  const { conversationId } = req.params;

  try {
    const result = await pool.query(
      'DELETE FROM conversations WHERE id = $1 AND user_id = $2 RETURNING *',
      [conversationId, req.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    res.json({ message: 'Deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;