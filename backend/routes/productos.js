const router      = require('express').Router();
const pool        = require('../db');
const requireAuth = require('../middleware/auth');

router.use(requireAuth);

// GET /api/productos  — JOIN con categorias y proveedores (JOIN #1)
router.get('/', async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT p.id, p.nombre, p.descripcion, p.precio, p.stock,
             c.id   AS id_categoria,  c.nombre  AS categoria,
             pr.id  AS id_proveedor,  pr.nombre AS proveedor
      FROM productos p
      JOIN categorias  c  ON p.id_categoria = c.id
      JOIN proveedores pr ON p.id_proveedor  = pr.id
      ORDER BY p.nombre
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/productos/:id
router.get('/:id', async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT p.*, c.nombre AS categoria, pr.nombre AS proveedor
       FROM productos p
       JOIN categorias  c  ON p.id_categoria = c.id
       JOIN proveedores pr ON p.id_proveedor  = pr.id
       WHERE p.id = $1`,
      [req.params.id]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'Producto no encontrado.' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/productos
router.post('/', async (req, res) => {
  const { nombre, descripcion, precio, stock, id_categoria, id_proveedor } = req.body;
  if (!nombre || precio == null || !id_categoria || !id_proveedor) {
    return res.status(400).json({ error: 'Nombre, precio, categoría y proveedor son requeridos.' });
  }
  try {
    const { rows } = await pool.query(
      `INSERT INTO productos (nombre, descripcion, precio, stock, id_categoria, id_proveedor)
       VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
      [nombre, descripcion || null, precio, stock || 0, id_categoria, id_proveedor]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/productos/:id
router.put('/:id', async (req, res) => {
  const { nombre, descripcion, precio, stock, id_categoria, id_proveedor } = req.body;
  if (!nombre || precio == null || !id_categoria || !id_proveedor) {
    return res.status(400).json({ error: 'Nombre, precio, categoría y proveedor son requeridos.' });
  }
  try {
    const { rows } = await pool.query(
      `UPDATE productos SET nombre=$1, descripcion=$2, precio=$3, stock=$4,
              id_categoria=$5, id_proveedor=$6
       WHERE id=$7 RETURNING *`,
      [nombre, descripcion || null, precio, stock || 0, id_categoria, id_proveedor, req.params.id]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'Producto no encontrado.' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/productos/:id
router.delete('/:id', async (req, res) => {
  try {
    const { rowCount } = await pool.query('DELETE FROM productos WHERE id=$1', [req.params.id]);
    if (rowCount === 0) return res.status(404).json({ error: 'Producto no encontrado.' });
    res.json({ message: 'Producto eliminado.' });
  } catch (err) {
    if (err.code === '23503') {
      return res.status(400).json({ error: 'No se puede eliminar: producto tiene ventas registradas.' });
    }
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
