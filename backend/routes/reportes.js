const router      = require('express').Router();
const pool        = require('../db');
const requireAuth = require('../middleware/auth');

router.use(requireAuth);

// Ventas por empleado 
// JOIN empleados + ventas  |  GROUP BY + HAVING + funciones de agregación
router.get('/ventas-por-empleado', async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT
        e.id,
        e.nombre || ' ' || e.apellido AS empleado,
        e.cargo,
        COUNT(v.id)       AS num_ventas,
        SUM(v.total)      AS total_vendido,
        AVG(v.total)      AS promedio_venta,
        MAX(v.total)      AS venta_maxima
      FROM empleados e
      JOIN ventas v ON e.id = v.id_empleado
      GROUP BY e.id, e.nombre, e.apellido, e.cargo
      HAVING COUNT(v.id) > 0
      ORDER BY total_vendido DESC
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Productos más vendidos
// JOIN: detalle_ventas + productos + categorias
router.get('/productos-mas-vendidos', async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT
        p.id,
        p.nombre                   AS producto,
        c.nombre                   AS categoria,
        SUM(dv.cantidad)           AS total_vendido,
        SUM(dv.subtotal)           AS ingresos_totales,
        p.stock                    AS stock_actual
      FROM detalle_ventas dv
      JOIN productos   p ON dv.id_producto  = p.id
      JOIN categorias  c ON p.id_categoria  = c.id
      GROUP BY p.id, p.nombre, c.nombre, p.stock
      ORDER BY total_vendido DESC
      LIMIT 20
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Clientes top
// WITH (CTE) + LEFT JOIN clientes + ventas
router.get('/clientes-top', async (req, res) => {
  try {
    const { rows } = await pool.query(`
      WITH resumen_clientes AS (
        SELECT
          c.id,
          c.nombre || ' ' || c.apellido   AS cliente,
          c.email,
          c.telefono,
          COUNT(v.id)                     AS num_compras,
          COALESCE(SUM(v.total), 0)       AS total_gastado,
          MAX(v.fecha)                    AS ultima_compra
        FROM clientes c
        LEFT JOIN ventas v ON c.id = v.id_cliente
        GROUP BY c.id, c.nombre, c.apellido, c.email, c.telefono
      )
      SELECT *
      FROM resumen_clientes
      ORDER BY total_gastado DESC
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Productos con stock bajo
// Subquery con IN
// JOIN productos + categorias + proveedores
router.get('/stock-bajo', async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT
        p.id,
        p.nombre          AS producto,
        p.stock,
        p.precio,
        c.nombre          AS categoria,
        pr.nombre         AS proveedor,
        pr.email          AS email_proveedor
      FROM productos p
      JOIN categorias  c  ON p.id_categoria = c.id
      JOIN proveedores pr ON p.id_proveedor  = pr.id
      WHERE p.id IN (
        SELECT id FROM productos WHERE stock < 20
      )
      ORDER BY p.stock ASC
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Clientes sin compras
// Subquery correlacionado con NOT EXISTS
router.get('/clientes-sin-compras', async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT
        c.id,
        c.nombre || ' ' || c.apellido AS cliente,
        c.email,
        c.telefono,
        c.direccion
      FROM clientes c
      WHERE NOT EXISTS (
        SELECT 1 FROM ventas v WHERE v.id_cliente = c.id
      )
      ORDER BY c.apellido, c.nombre
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Ventas por categoría
// JOIN: categorias + productos + detalle_ventas  |  GROUP BY + agregación
router.get('/ventas-por-categoria', async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT
        c.id,
        c.nombre                        AS categoria,
        COUNT(DISTINCT dv.id_venta)     AS num_ventas,
        SUM(dv.cantidad)                AS unidades_vendidas,
        SUM(dv.subtotal)                AS ingresos
      FROM categorias c
      JOIN productos       p  ON c.id           = p.id_categoria
      JOIN detalle_ventas  dv ON p.id            = dv.id_producto
      GROUP BY c.id, c.nombre
      ORDER BY ingresos DESC
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Resumen mensual de ventas
// Usa la VIEW vista_ventas_detalladas  |  GROUP BY + agregación
router.get('/resumen-mensual', async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT
        TO_CHAR(DATE_TRUNC('month', fecha), 'YYYY-MM') AS mes,
        COUNT(*)               AS num_ventas,
        SUM(total)             AS total_mes,
        AVG(total)             AS promedio_venta,
        MAX(total)             AS venta_maxima,
        MIN(total)             AS venta_minima
      FROM vista_ventas_detalladas
      GROUP BY DATE_TRUNC('month', fecha)
      ORDER BY DATE_TRUNC('month', fecha) DESC
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
