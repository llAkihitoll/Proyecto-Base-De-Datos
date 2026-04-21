const router      = require('express').Router();
const pool        = require('../db');
const requireAuth = require('../middleware/auth');

router.use(requireAuth);

// GET /api/ventas  — usa la VIEW vista_ventas_detalladas
router.get('/', async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT * FROM vista_ventas_detalladas ORDER BY fecha DESC'
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/ventas/:id  — venta + detalle (JOIN: detalle_ventas + productos)
router.get('/:id', async (req, res) => {
  try {
    const { rows: venta } = await pool.query(
      'SELECT * FROM vista_ventas_detalladas WHERE id_venta = $1',
      [req.params.id]
    );
    if (venta.length === 0) return res.status(404).json({ error: 'Venta no encontrada.' });

    const { rows: detalle } = await pool.query(
      `SELECT dv.id, dv.cantidad, dv.precio_unitario, dv.subtotal,
              p.id AS id_producto, p.nombre AS producto
       FROM detalle_ventas dv
       JOIN productos p ON dv.id_producto = p.id
       WHERE dv.id_venta = $1
       ORDER BY dv.id`,
      [req.params.id]
    );
    res.json({ ...venta[0], detalle });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/ventas  — TRANSACCION EXPLICITA con manejo de error y ROLLBACK
// Body: { id_cliente, id_empleado, items: [{id_producto, cantidad}] }
router.post('/', async (req, res) => {
  const { id_cliente, id_empleado, items } = req.body;

  if (!id_cliente || !id_empleado || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'Cliente, empleado e items son requeridos.' });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Validar stock y calcular total
    let total = 0;
    const lineItems = [];

    for (const item of items) {
      if (!item.id_producto || !item.cantidad || item.cantidad <= 0) {
        throw new Error('Cada item requiere id_producto y cantidad mayor a 0.');
      }

      const { rows } = await client.query(
        'SELECT id, nombre, precio, stock FROM productos WHERE id = $1 FOR UPDATE',
        [item.id_producto]
      );
      if (rows.length === 0) throw new Error(`Producto ${item.id_producto} no encontrado.`);

      const prod = rows[0];
      if (prod.stock < item.cantidad) {
        throw new Error(`Stock insuficiente para "${prod.nombre}". Disponible: ${prod.stock}, solicitado: ${item.cantidad}.`);
      }

      const subtotal = parseFloat(prod.precio) * item.cantidad;
      total += subtotal;
      lineItems.push({
        id_producto: prod.id,
        nombre: prod.nombre,
        precio: parseFloat(prod.precio),
        cantidad: item.cantidad,
        subtotal,
      });
    }

    // Insertar venta
    const { rows: ventaRows } = await client.query(
      `INSERT INTO ventas (id_cliente, id_empleado, total)
       VALUES ($1, $2, $3) RETURNING *`,
      [id_cliente, id_empleado, total]
    );
    const venta = ventaRows[0];

    // Insertar detalle y descontar stock
    for (const li of lineItems) {
      await client.query(
        `INSERT INTO detalle_ventas (id_venta, id_producto, cantidad, precio_unitario, subtotal)
         VALUES ($1, $2, $3, $4, $5)`,
        [venta.id, li.id_producto, li.cantidad, li.precio, li.subtotal]
      );
      await client.query(
        'UPDATE productos SET stock = stock - $1 WHERE id = $2',
        [li.cantidad, li.id_producto]
      );
    }

    await client.query('COMMIT');
    res.status(201).json({ ...venta, total });
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(400).json({ error: err.message });
  } finally {
    client.release();
  }
});

// DELETE /api/ventas/:id  — cancela la venta y restaura stock (TRANSACCION)
router.delete('/:id', async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Verificar que la venta existe
    const { rows: check } = await client.query(
      'SELECT id FROM ventas WHERE id = $1',
      [req.params.id]
    );
    if (check.length === 0) throw new Error('Venta no encontrada.');

    // Restaurar stock
    const { rows: detalle } = await client.query(
      'SELECT id_producto, cantidad FROM detalle_ventas WHERE id_venta = $1',
      [req.params.id]
    );
    for (const line of detalle) {
      await client.query(
        'UPDATE productos SET stock = stock + $1 WHERE id = $2',
        [line.cantidad, line.id_producto]
      );
    }

    await client.query('DELETE FROM detalle_ventas WHERE id_venta = $1', [req.params.id]);
    await client.query('DELETE FROM ventas WHERE id = $1', [req.params.id]);

    await client.query('COMMIT');
    res.json({ message: 'Venta cancelada y stock restaurado.' });
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(400).json({ error: err.message });
  } finally {
    client.release();
  }
});

module.exports = router;
