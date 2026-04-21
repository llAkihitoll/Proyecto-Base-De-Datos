const router      = require('express').Router();
const pool        = require('../db');
const requireAuth = require('../middleware/auth');

router.use(requireAuth);

// GET /api/clientes
router.get('/', async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT * FROM clientes ORDER BY apellido, nombre'
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/clientes/:id
router.get('/:id', async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT * FROM clientes WHERE id = $1',
      [req.params.id]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'Cliente no encontrado.' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/clientes
router.post('/', async (req, res) => {
  const { nombre, apellido, email, telefono, direccion } = req.body;
  if (!nombre || !apellido) {
    return res.status(400).json({ error: 'Nombre y apellido son requeridos.' });
  }
  try {
    const { rows } = await pool.query(
      `INSERT INTO clientes (nombre, apellido, email, telefono, direccion)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [nombre, apellido, email || null, telefono || null, direccion || null]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/clientes/:id
router.put('/:id', async (req, res) => {
  const { nombre, apellido, email, telefono, direccion } = req.body;
  if (!nombre || !apellido) {
    return res.status(400).json({ error: 'Nombre y apellido son requeridos.' });
  }
  try {
    const { rows } = await pool.query(
      `UPDATE clientes
       SET nombre=$1, apellido=$2, email=$3, telefono=$4, direccion=$5
       WHERE id=$6 RETURNING *`,
      [nombre, apellido, email || null, telefono || null, direccion || null, req.params.id]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'Cliente no encontrado.' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/clientes/:id
router.delete('/:id', async (req, res) => {
  try {
    const { rowCount } = await pool.query(
      'DELETE FROM clientes WHERE id = $1',
      [req.params.id]
    );
    if (rowCount === 0) return res.status(404).json({ error: 'Cliente no encontrado.' });
    res.json({ message: 'Cliente eliminado.' });
  } catch (err) {
    if (err.code === '23503') {
      return res.status(400).json({ error: 'No se puede eliminar: el cliente tiene ventas registradas.' });
    }
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
