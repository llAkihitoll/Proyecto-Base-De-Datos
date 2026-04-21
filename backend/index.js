const express  = require('express');
const session  = require('express-session');
const cors     = require('cors');
const bcrypt   = require('bcryptjs');
const pool     = require('./db');

const app  = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({
  secret: process.env.SESSION_SECRET || 'dev_secret',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 8 * 60 * 60 * 1000 }, // 8 horas
}));

// Rutas API
app.use('/api/auth',        require('./routes/auth'));
app.use('/api/categorias',  require('./routes/categorias'));
app.use('/api/proveedores', require('./routes/proveedores'));
app.use('/api/productos',   require('./routes/productos'));
app.use('/api/empleados',   require('./routes/empleados'));
app.use('/api/clientes',    require('./routes/clientes'));
app.use('/api/ventas',      require('./routes/ventas'));
app.use('/api/reportes',    require('./routes/reportes'));

// Crear usuario admin si no existe
async function seedAdmin() {
  try {
    const { rows } = await pool.query('SELECT COUNT(*) FROM usuarios');
    if (parseInt(rows[0].count) === 0) {
      const hash = await bcrypt.hash('admin123', 10);
      await pool.query(
        `INSERT INTO usuarios (username, password_hash, rol) VALUES ($1, $2, $3)`,
        ['admin', hash, 'admin']
      );
      console.log('✔  Usuario admin creado  →  admin / admin123');
    }
  } catch (err) {
    console.error('Error al crear usuario admin:', err.message);
  }
}

// Arranque
app.listen(PORT, async () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
  await seedAdmin();
});
