const router  = require('express').Router();
const bcrypt  = require('bcryptjs');
const pool    = require('../db');

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Usuario y contraseña requeridos.' });
  }
  try {
    const { rows } = await pool.query(
      'SELECT * FROM usuarios WHERE username = $1',
      [username]
    );
    if (rows.length === 0) {
      return res.status(401).json({ error: 'Credenciales incorrectas.' });
    }
    const user = rows[0];
    const ok   = await bcrypt.compare(password, user.password_hash);
    if (!ok) {
      return res.status(401).json({ error: 'Credenciales incorrectas.' });
    }
    req.session.userId   = user.id;
    req.session.username = user.username;
    req.session.rol      = user.rol;
    return res.json({ message: 'Login exitoso.', rol: user.rol, username: user.username });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Error interno del servidor.' });
  }
});

// POST /api/auth/logout
router.post('/logout', (req, res) => {
  req.session.destroy(() => {
    res.json({ message: 'Sesión cerrada.' });
  });
});

// GET /api/auth/me
router.get('/me', (req, res) => {
  if (req.session && req.session.userId) {
    return res.json({ userId: req.session.userId, username: req.session.username, rol: req.session.rol });
  }
  return res.status(401).json({ error: 'No autenticado.' });
});

module.exports = router;
