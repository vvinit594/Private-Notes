const express = require('express');
const { requireAuth } = require('../middleware/requireAuth');
const { createSupabaseClientForRequest } = require('../lib/supabase');

const router = express.Router();

function isNonEmptyString(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

// List notes (current user)
router.get('/', requireAuth, async (req, res) => {
  try {
    const supabase = createSupabaseClientForRequest(req);

    const { data, error } = await supabase
      .from('notes')
      .select('id,title,created_at')
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false });

    if (error) return res.status(500).json({ error: error.message });
    return res.json({ notes: data });
  } catch (err) {
    return res.status(500).json({ error: 'Server error' });
  }
});

// Get single note (must belong to current user)
router.get('/:id', requireAuth, async (req, res) => {
  try {
    const supabase = createSupabaseClientForRequest(req);

    const { data, error } = await supabase
      .from('notes')
      .select('id,user_id,title,content,created_at')
      .eq('id', req.params.id)
      .eq('user_id', req.user.id)
      .maybeSingle();

    if (error) return res.status(500).json({ error: error.message });
    if (!data) return res.status(404).json({ error: 'Note not found' });

    return res.json({ note: data });
  } catch (err) {
    return res.status(500).json({ error: 'Server error' });
  }
});

// Create note
router.post('/', requireAuth, async (req, res) => {
  try {
    const { title, content } = req.body || {};

    if (!isNonEmptyString(title) || !isNonEmptyString(content)) {
      return res
        .status(400)
        .json({ error: 'Both title and content are required' });
    }

    const supabase = createSupabaseClientForRequest(req);

    const { data, error } = await supabase
      .from('notes')
      .insert({
        user_id: req.user.id,
        title: title.trim(),
        content: content.trim(),
      })
      .select('id,title,content,created_at')
      .single();

    if (error) return res.status(500).json({ error: error.message });

    return res.status(201).json({ note: data });
  } catch (err) {
    return res.status(500).json({ error: 'Server error' });
  }
});

// Delete note
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const supabase = createSupabaseClientForRequest(req);

    const { data, error } = await supabase
      .from('notes')
      .delete()
      .eq('id', req.params.id)
      .eq('user_id', req.user.id)
      .select('id')
      .maybeSingle();

    if (error) return res.status(500).json({ error: error.message });
    if (!data) return res.status(404).json({ error: 'Note not found' });

    return res.status(204).send();
  } catch (err) {
    return res.status(500).json({ error: 'Server error' });
  }
});

module.exports = { notesRouter: router };
