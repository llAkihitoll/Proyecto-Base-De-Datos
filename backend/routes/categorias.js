const router      = require('express').Router();
const pool        = require('../db');
const requireAuth = require('../middleware/auth');

router.use(requireAuth);

// GET /api/categorias
router.get('/', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM categorias ORDER BY nombre');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/categorias
router.post('/', async (req, res) => {
  const { nombre, descripcion } = req.body;
  if (!nombre) return res.status(400).json({ error: 'El nombre es requerido.' });
  try {
    const { rows } = await pool.query(
      'INSERT INTO categorias (nombre, descripcion) VALUES ($1, $2) RETURNING *',
      [nombre, descripcion || null]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/categorias/:id
router.put('/:id', async (req, res) => {
  const { nombre, descripcion } = req.body;
  if (!nombre) return res.status(400).json({ error: 'El nombre es requerido.' });
  try {
    const { rows } = await pool.query(
      'UPDATE categorias SET nombre=$1, descripcion=$2 WHERE id=$3 RETURNING *',
      [nombre, descripcion || null, req.params.id]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'Categoría no encontrada.' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/categorias/:id
router.delete('/:id', async (req, res) => {
  try {
    const { rowCount } = await pool.query('DELETE FROM categorias WHERE id=$1', [req.params.id]);
    if (rowCount === 0) return res.status(404).json({ error: 'Categoría no encontrada.' });
    res.json({ message: 'Categoría eliminada.' });
  } catch (err) {
    if (err.code === '23503') {
      return res.status(400).json({ error: 'No se puede eliminar: tiene productos asociados.' });
    }
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
