const router      = require('express').Router();
const pool        = require('../db');
const requireAuth = require('../middleware/auth');

router.use(requireAuth);

// GET /api/proveedores
router.get('/', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM proveedores ORDER BY nombre');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/proveedores
router.post('/', async (req, res) => {
  const { nombre, contacto, telefono, email } = req.body;
  if (!nombre) return res.status(400).json({ error: 'El nombre es requerido.' });
  try {
    const { rows } = await pool.query(
      'INSERT INTO proveedores (nombre, contacto, telefono, email) VALUES ($1,$2,$3,$4) RETURNING *',
      [nombre, contacto || null, telefono || null, email || null]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/proveedores/:id
router.put('/:id', async (req, res) => {
  const { nombre, contacto, telefono, email } = req.body;
  if (!nombre) return res.status(400).json({ error: 'El nombre es requerido.' });
  try {
    const { rows } = await pool.query(
      'UPDATE proveedores SET nombre=$1, contacto=$2, telefono=$3, email=$4 WHERE id=$5 RETURNING *',
      [nombre, contacto || null, telefono || null, email || null, req.params.id]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'Proveedor no encontrado.' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/proveedores/:id
router.delete('/:id', async (req, res) => {
  try {
    const { rowCount } = await pool.query('DELETE FROM proveedores WHERE id=$1', [req.params.id]);
    if (rowCount === 0) return res.status(404).json({ error: 'Proveedor no encontrado.' });
    res.json({ message: 'Proveedor eliminado.' });
  } catch (err) {
    if (err.code === '23503') {
      return res.status(400).json({ error: 'No se puede eliminar: tiene productos asociados.' });
    }
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
