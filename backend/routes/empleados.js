const router      = require('express').Router();
const pool        = require('../db');
const requireAuth = require('../middleware/auth');

router.use(requireAuth);

// GET /api/empleados
router.get('/', async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT * FROM empleados ORDER BY apellido, nombre'
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/empleados
router.post('/', async (req, res) => {
  const { nombre, apellido, cargo, email, telefono } = req.body;
  if (!nombre || !apellido) {
    return res.status(400).json({ error: 'Nombre y apellido son requeridos.' });
  }
  try {
    const { rows } = await pool.query(
      `INSERT INTO empleados (nombre, apellido, cargo, email, telefono)
       VALUES ($1,$2,$3,$4,$5) RETURNING *`,
      [nombre, apellido, cargo || null, email || null, telefono || null]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/empleados/:id
router.put('/:id', async (req, res) => {
  const { nombre, apellido, cargo, email, telefono, activo } = req.body;
  if (!nombre || !apellido) {
    return res.status(400).json({ error: 'Nombre y apellido son requeridos.' });
  }
  try {
    const { rows } = await pool.query(
      `UPDATE empleados SET nombre=$1, apellido=$2, cargo=$3, email=$4, telefono=$5, activo=$6
       WHERE id=$7 RETURNING *`,
      [nombre, apellido, cargo || null, email || null, telefono || null, activo !== false, req.params.id]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'Empleado no encontrado.' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/empleados/:id
router.delete('/:id', async (req, res) => {
  try {
    const { rowCount } = await pool.query('DELETE FROM empleados WHERE id=$1', [req.params.id]);
    if (rowCount === 0) return res.status(404).json({ error: 'Empleado no encontrado.' });
    res.json({ message: 'Empleado eliminado.' });
  } catch (err) {
    if (err.code === '23503') {
      return res.status(400).json({ error: 'No se puede eliminar: empleado tiene ventas registradas.' });
    }
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
