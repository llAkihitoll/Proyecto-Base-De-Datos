'use strict';

// STATE
let currentUser     = null;
let _productos      = [];
let _categorias     = [];
let _proveedores    = [];
let _clientes       = [];
let _empleados      = [];
let _reporteData    = [];
let _currentReporte = 'ventas-por-empleado';

// DOM BUILDER
function buildDOM() {
  document.getElementById('root').innerHTML = `

    <!-- LOGIN -->
    <div id="login-page">
      <div class="login-card card shadow-lg p-4">
        <h3 class="mb-1 text-center fw-bold">Tienda</h3>
        <p class="text-muted text-center mb-4">Sistema de Gestión</p>
        <div id="login-error" class="alert alert-danger d-none"></div>
        <div class="mb-3">
          <label class="form-label">Usuario</label>
          <input id="login-username" type="text" class="form-control" placeholder="admin" />
        </div>
        <div class="mb-3">
          <label class="form-label">Contraseña</label>
          <input id="login-password" type="password" class="form-control" placeholder="••••••••" />
        </div>
        <button id="btn-login" class="btn btn-primary w-100">Iniciar sesión</button>
      </div>
    </div>

    <!-- MAIN APP -->
    <div id="app" class="d-none">

      <!-- Sidebar -->
      <nav id="sidebar">
        <div class="sidebar-brand">🏪 Tienda</div>
        <div class="sidebar-user">
          <span id="user-badge" class="badge bg-light text-dark"></span>
        </div>
        <ul class="sidebar-nav">
          <li><a href="#" data-section="dashboard">📊 Dashboard</a></li>
          <li class="nav-divider">Inventario</li>
          <li><a href="#" data-section="productos">📦 Productos</a></li>
          <li><a href="#" data-section="categorias">🏷️ Categorías</a></li>
          <li><a href="#" data-section="proveedores">🚚 Proveedores</a></li>
          <li class="nav-divider">Ventas</li>
          <li><a href="#" data-section="ventas">🛒 Ventas</a></li>
          <li><a href="#" data-section="clientes">👥 Clientes</a></li>
          <li><a href="#" data-section="empleados">👤 Empleados</a></li>
          <li class="nav-divider">Análisis</li>
          <li><a href="#" data-section="reportes">📈 Reportes</a></li>
        </ul>
        <button id="btn-logout" class="btn btn-outline-light btn-sm mt-auto">⬅ Cerrar sesión</button>
      </nav>

      <!-- Content -->
      <main id="content">
        <div id="toast-container" class="toast-container position-fixed top-0 end-0 p-3" style="z-index:9999"></div>

        <!-- DASHBOARD -->
        <section id="section-dashboard" class="section">
          <h4 class="section-title">Dashboard</h4>
          <div class="row g-3 mb-4">
            <div class="col-6 col-md-3"><div class="stat-card">
              <div class="stat-value" id="dash-productos">–</div>
              <div class="stat-label">Productos</div>
            </div></div>
            <div class="col-6 col-md-3"><div class="stat-card">
              <div class="stat-value" id="dash-clientes">–</div>
              <div class="stat-label">Clientes</div>
            </div></div>
            <div class="col-6 col-md-3"><div class="stat-card">
              <div class="stat-value" id="dash-ventas">–</div>
              <div class="stat-label">Ventas</div>
            </div></div>
            <div class="col-6 col-md-3"><div class="stat-card">
              <div class="stat-value" id="dash-total">–</div>
              <div class="stat-label">Total vendido</div>
            </div></div>
          </div>
          <div class="card">
            <div class="card-header fw-semibold">Últimas ventas</div>
            <div class="card-body p-0" id="dash-recent"></div>
          </div>
        </section>

        <!-- PRODUCTOS -->
        <section id="section-productos" class="section d-none">
          <div class="section-header">
            <h4 class="section-title">Productos</h4>
            <button id="btn-nuevo-producto" class="btn btn-primary btn-sm">+ Nuevo producto</button>
          </div>
          <div class="card"><div class="card-body p-0" id="productos-table"></div></div>
        </section>

        <!-- CATEGORIAS -->
        <section id="section-categorias" class="section d-none">
          <div class="section-header">
            <h4 class="section-title">Categorías</h4>
            <button id="btn-nueva-categoria" class="btn btn-primary btn-sm">+ Nueva categoría</button>
          </div>
          <div class="card"><div class="card-body p-0" id="categorias-table"></div></div>
        </section>

        <!-- PROVEEDORES -->
        <section id="section-proveedores" class="section d-none">
          <div class="section-header">
            <h4 class="section-title">Proveedores</h4>
            <button id="btn-nuevo-proveedor" class="btn btn-primary btn-sm">+ Nuevo proveedor</button>
          </div>
          <div class="card"><div class="card-body p-0" id="proveedores-table"></div></div>
        </section>

        <!-- CLIENTES -->
        <section id="section-clientes" class="section d-none">
          <div class="section-header">
            <h4 class="section-title">Clientes</h4>
            <button id="btn-nuevo-cliente" class="btn btn-primary btn-sm">+ Nuevo cliente</button>
          </div>
          <div class="card"><div class="card-body p-0" id="clientes-table"></div></div>
        </section>

        <!-- EMPLEADOS -->
        <section id="section-empleados" class="section d-none">
          <div class="section-header">
            <h4 class="section-title">Empleados</h4>
            <button id="btn-nuevo-empleado" class="btn btn-primary btn-sm">+ Nuevo empleado</button>
          </div>
          <div class="card"><div class="card-body p-0" id="empleados-table"></div></div>
        </section>

        <!-- VENTAS -->
        <section id="section-ventas" class="section d-none">
          <div class="row g-3">
            <div class="col-lg-7">
              <div class="section-header">
                <h4 class="section-title">Ventas registradas</h4>
              </div>
              <div class="card"><div class="card-body p-0" id="ventas-table"></div></div>
            </div>
            <div class="col-lg-5">
              <h4 class="section-title">Nueva venta</h4>
              <div class="card">
                <div class="card-body">
                  <div class="mb-2">
                    <label class="form-label">Cliente</label>
                    <select id="venta-cliente" class="form-select form-select-sm"></select>
                  </div>
                  <div class="mb-3">
                    <label class="form-label">Empleado</label>
                    <select id="venta-empleado" class="form-select form-select-sm"></select>
                  </div>
                  <hr />
                  <div class="d-flex justify-content-between align-items-center mb-2">
                    <strong>Productos</strong>
                    <button id="btn-agregar-item" class="btn btn-outline-secondary btn-sm">+ Agregar</button>
                  </div>
                  <div id="venta-items"></div>
                  <hr />
                  <div class="d-flex justify-content-between fw-bold mb-3">
                    <span>Total:</span>
                    <span id="venta-total" class="text-success">Q 0.00</span>
                  </div>
                  <button id="btn-registrar-venta" class="btn btn-success w-100">✔ Registrar venta</button>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- REPORTES -->
        <section id="section-reportes" class="section d-none">
          <h4 class="section-title">Reportes</h4>
          <div class="card mb-3">
            <div class="card-body pb-0">
              <div class="d-flex flex-wrap gap-2 mb-3">
                <button class="btn btn-sm btn-outline-secondary reporte-tab" data-r="ventas-por-empleado">Ventas por empleado</button>
                <button class="btn btn-sm btn-outline-secondary reporte-tab" data-r="productos-mas-vendidos">Productos más vendidos</button>
                <button class="btn btn-sm btn-outline-secondary reporte-tab" data-r="clientes-top">Clientes top (CTE)</button>
                <button class="btn btn-sm btn-outline-secondary reporte-tab" data-r="stock-bajo">Stock bajo (subquery IN)</button>
                <button class="btn btn-sm btn-outline-secondary reporte-tab" data-r="clientes-sin-compras">Sin compras (NOT EXISTS)</button>
                <button class="btn btn-sm btn-outline-secondary reporte-tab" data-r="ventas-por-categoria">Por categoría</button>
                <button class="btn btn-sm btn-outline-secondary reporte-tab" data-r="resumen-mensual">Resumen mensual (VIEW)</button>
              </div>
              <div id="reporte-info" class="alert alert-info py-2 small d-none"></div>
            </div>
          </div>
          <div class="d-flex justify-content-end mb-2">
            <button id="btn-export-csv" class="btn btn-success btn-sm">⬇ Exportar CSV</button>
          </div>
          <div class="card"><div class="card-body p-0" id="reporte-table"></div></div>
        </section>

      </main>
    </div>

    <!-- MODAL: Producto -->
    <div class="modal fade" id="productoModal" tabindex="-1">
      <div class="modal-dialog"><div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title" id="productoModalLabel">Producto</h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
        </div>
        <div class="modal-body">
          <input type="hidden" id="p-id" />
          <div class="mb-2"><label class="form-label">Nombre *</label>
            <input id="p-nombre" type="text" class="form-control form-control-sm" /></div>
          <div class="mb-2"><label class="form-label">Descripción</label>
            <textarea id="p-descripcion" class="form-control form-control-sm" rows="2"></textarea></div>
          <div class="row g-2 mb-2">
            <div class="col-6"><label class="form-label">Precio (Q) *</label>
              <input id="p-precio" type="number" step="0.01" min="0" class="form-control form-control-sm" /></div>
            <div class="col-6"><label class="form-label">Stock</label>
              <input id="p-stock" type="number" min="0" class="form-control form-control-sm" value="0" /></div>
          </div>
          <div class="mb-2"><label class="form-label">Categoría *</label>
            <select id="p-categoria" class="form-select form-select-sm"></select></div>
          <div class="mb-2"><label class="form-label">Proveedor *</label>
            <select id="p-proveedor" class="form-select form-select-sm"></select></div>
          <div id="p-error" class="alert alert-danger py-1 small d-none"></div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary btn-sm" data-bs-dismiss="modal">Cancelar</button>
          <button id="btn-save-producto" class="btn btn-primary btn-sm">Guardar</button>
        </div>
      </div></div>
    </div>

    <!-- MODAL: Cliente -->
    <div class="modal fade" id="clienteModal" tabindex="-1">
      <div class="modal-dialog"><div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title" id="clienteModalLabel">Cliente</h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
        </div>
        <div class="modal-body">
          <input type="hidden" id="c-id" />
          <div class="row g-2 mb-2">
            <div class="col-6"><label class="form-label">Nombre *</label>
              <input id="c-nombre" type="text" class="form-control form-control-sm" /></div>
            <div class="col-6"><label class="form-label">Apellido *</label>
              <input id="c-apellido" type="text" class="form-control form-control-sm" /></div>
          </div>
          <div class="mb-2"><label class="form-label">Email</label>
            <input id="c-email" type="email" class="form-control form-control-sm" /></div>
          <div class="mb-2"><label class="form-label">Teléfono</label>
            <input id="c-telefono" type="text" class="form-control form-control-sm" /></div>
          <div class="mb-2"><label class="form-label">Dirección</label>
            <input id="c-direccion" type="text" class="form-control form-control-sm" /></div>
          <div id="c-error" class="alert alert-danger py-1 small d-none"></div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary btn-sm" data-bs-dismiss="modal">Cancelar</button>
          <button id="btn-save-cliente" class="btn btn-primary btn-sm">Guardar</button>
        </div>
      </div></div>
    </div>

    <!-- MODAL: Empleado -->
    <div class="modal fade" id="empleadoModal" tabindex="-1">
      <div class="modal-dialog"><div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title" id="empleadoModalLabel">Empleado</h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
        </div>
        <div class="modal-body">
          <input type="hidden" id="e-id" />
          <div class="row g-2 mb-2">
            <div class="col-6"><label class="form-label">Nombre *</label>
              <input id="e-nombre" type="text" class="form-control form-control-sm" /></div>
            <div class="col-6"><label class="form-label">Apellido *</label>
              <input id="e-apellido" type="text" class="form-control form-control-sm" /></div>
          </div>
          <div class="mb-2"><label class="form-label">Cargo</label>
            <input id="e-cargo" type="text" class="form-control form-control-sm" /></div>
          <div class="mb-2"><label class="form-label">Email</label>
            <input id="e-email" type="email" class="form-control form-control-sm" /></div>
          <div class="mb-2"><label class="form-label">Teléfono</label>
            <input id="e-telefono" type="text" class="form-control form-control-sm" /></div>
          <div class="form-check mb-2">
            <input id="e-activo" type="checkbox" class="form-check-input" checked />
            <label class="form-check-label" for="e-activo">Activo</label>
          </div>
          <div id="e-error" class="alert alert-danger py-1 small d-none"></div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary btn-sm" data-bs-dismiss="modal">Cancelar</button>
          <button id="btn-save-empleado" class="btn btn-primary btn-sm">Guardar</button>
        </div>
      </div></div>
    </div>

    <!-- MODAL: Categoría -->
    <div class="modal fade" id="categoriaModal" tabindex="-1">
      <div class="modal-dialog"><div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title" id="categoriaModalLabel">Categoría</h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
        </div>
        <div class="modal-body">
          <input type="hidden" id="cat-id" />
          <div class="mb-2"><label class="form-label">Nombre *</label>
            <input id="cat-nombre" type="text" class="form-control form-control-sm" /></div>
          <div class="mb-2"><label class="form-label">Descripción</label>
            <textarea id="cat-descripcion" class="form-control form-control-sm" rows="2"></textarea></div>
          <div id="cat-error" class="alert alert-danger py-1 small d-none"></div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary btn-sm" data-bs-dismiss="modal">Cancelar</button>
          <button id="btn-save-categoria" class="btn btn-primary btn-sm">Guardar</button>
        </div>
      </div></div>
    </div>

    <!-- MODAL: Proveedor -->
    <div class="modal fade" id="proveedorModal" tabindex="-1">
      <div class="modal-dialog"><div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title" id="proveedorModalLabel">Proveedor</h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
        </div>
        <div class="modal-body">
          <input type="hidden" id="prov-id" />
          <div class="mb-2"><label class="form-label">Nombre *</label>
            <input id="prov-nombre" type="text" class="form-control form-control-sm" /></div>
          <div class="mb-2"><label class="form-label">Contacto</label>
            <input id="prov-contacto" type="text" class="form-control form-control-sm" /></div>
          <div class="mb-2"><label class="form-label">Teléfono</label>
            <input id="prov-telefono" type="text" class="form-control form-control-sm" /></div>
          <div class="mb-2"><label class="form-label">Email</label>
            <input id="prov-email" type="email" class="form-control form-control-sm" /></div>
          <div id="prov-error" class="alert alert-danger py-1 small d-none"></div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary btn-sm" data-bs-dismiss="modal">Cancelar</button>
          <button id="btn-save-proveedor" class="btn btn-primary btn-sm">Guardar</button>
        </div>
      </div></div>
    </div>

    <!-- MODAL: Detalle Venta -->
    <div class="modal fade" id="detalleVentaModal" tabindex="-1">
      <div class="modal-dialog modal-lg"><div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">Detalle de venta</h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
        </div>
        <div class="modal-body" id="detalle-venta-body"></div>
        <div class="modal-footer">
          <button class="btn btn-secondary btn-sm" data-bs-dismiss="modal">Cerrar</button>
        </div>
      </div></div>
    </div>
  `;
}

// EVENT BINDING 
function bindEvents() {
  // Auth
  document.getElementById('btn-login').addEventListener('click', login);
  document.getElementById('login-password').addEventListener('keydown', e => {
    if (e.key === 'Enter') login();
  });
  document.getElementById('btn-logout').addEventListener('click', logout);

  // Sidebar navigation
  document.querySelectorAll('[data-section]').forEach(link => {
    link.addEventListener('click', e => {
      e.preventDefault();
      nav(link.dataset.section);
    });
  });

  // CRUD buttons
  document.getElementById('btn-nuevo-producto').addEventListener('click',  () => openProductoModal());
  document.getElementById('btn-nueva-categoria').addEventListener('click', () => openCategoriaModal());
  document.getElementById('btn-nuevo-proveedor').addEventListener('click', () => openProveedorModal());
  document.getElementById('btn-nuevo-cliente').addEventListener('click',   () => openClienteModal());
  document.getElementById('btn-nuevo-empleado').addEventListener('click',  () => openEmpleadoModal());

  // Modal save buttons
  document.getElementById('btn-save-producto').addEventListener('click',  saveProducto);
  document.getElementById('btn-save-categoria').addEventListener('click', saveCategoria);
  document.getElementById('btn-save-proveedor').addEventListener('click', saveProveedor);
  document.getElementById('btn-save-cliente').addEventListener('click',   saveCliente);
  document.getElementById('btn-save-empleado').addEventListener('click',  saveEmpleado);

  // Ventas
  document.getElementById('btn-agregar-item').addEventListener('click',    addVentaItem);
  document.getElementById('btn-registrar-venta').addEventListener('click', submitVenta);

  // Reportes tabs
  document.querySelectorAll('.reporte-tab').forEach(btn => {
    btn.addEventListener('click', () => loadReporte(btn.dataset.r));
  });
  document.getElementById('btn-export-csv').addEventListener('click', exportCSV);
}

// API HELPER
async function api(method, url, body = null) {
  const opts = {
    method,
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
  };
  if (body !== null) opts.body = JSON.stringify(body);
  const res  = await fetch(url, opts);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `Error ${res.status}`);
  return data;
}

// TOASTS
function toast(msg, type = 'success') {
  const id  = 'toast-' + Date.now();
  const col = { success: 'success', danger: 'danger', warning: 'warning', info: 'info' }[type] || 'secondary';
  document.getElementById('toast-container').insertAdjacentHTML('beforeend', `
    <div id="${id}" class="toast align-items-center text-bg-${col} border-0" role="alert">
      <div class="d-flex">
        <div class="toast-body">${msg}</div>
        <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
      </div>
    </div>`);
  const el = document.getElementById(id);
  const t  = new bootstrap.Toast(el, { delay: 4000 });
  t.show();
  el.addEventListener('hidden.bs.toast', () => el.remove());
}

// AUTH
async function checkAuth() {
  try {
    currentUser = await api('GET', '/api/auth/me');
    showApp();
  } catch {
    showLogin();
  }
}

function showLogin() {
  document.getElementById('login-page').style.display = 'flex';
  document.getElementById('app').classList.add('d-none');
}

function showApp() {
  document.getElementById('login-page').style.display = 'none';
  document.getElementById('app').classList.remove('d-none');
  document.getElementById('user-badge').textContent = `${currentUser.username} (${currentUser.rol})`;
  nav('dashboard');
}

async function login() {
  const username = document.getElementById('login-username').value.trim();
  const password = document.getElementById('login-password').value;
  const errEl    = document.getElementById('login-error');
  errEl.classList.add('d-none');
  if (!username || !password) {
    errEl.textContent = 'Por favor ingresa usuario y contraseña.';
    errEl.classList.remove('d-none');
    return;
  }
  try {
    currentUser = await api('POST', '/api/auth/login', { username, password });
    showApp();
  } catch (err) {
    errEl.textContent = err.message;
    errEl.classList.remove('d-none');
  }
}

async function logout() {
  await api('POST', '/api/auth/logout').catch(() => {});
  currentUser = null;
  showLogin();
}

// NAVIGATION
function nav(name) {
  document.querySelectorAll('.section').forEach(s => s.classList.add('d-none'));
  document.querySelectorAll('[data-section]').forEach(l => l.classList.remove('active'));
  const sec = document.getElementById('section-' + name);
  if (sec) sec.classList.remove('d-none');
  const lnk = document.querySelector(`[data-section="${name}"]`);
  if (lnk) lnk.classList.add('active');

  const loaders = {
    dashboard:   loadDashboard,
    productos:   loadProductos,
    clientes:    loadClientes,
    empleados:   loadEmpleados,
    categorias:  loadCategorias,
    proveedores: loadProveedores,
    ventas:      loadVentas,
    reportes:    () => loadReporte(_currentReporte),
  };
  loaders[name]?.();
}

// HELPERS
function fmt(n) {
  return 'Q ' + parseFloat(n || 0).toLocaleString('es-GT', {
    minimumFractionDigits: 2, maximumFractionDigits: 2,
  });
}

function fmtDate(d) {
  if (!d) return '';
  return new Date(d).toLocaleString('es-GT', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

function makeTable(rows, cols, actionsFn = null) {
  if (!rows || rows.length === 0) return '<p class="text-muted p-3 mb-0">No hay registros.</p>';
  const head    = cols.map(c => `<th>${c.label}</th>`).join('');
  const actHead = actionsFn ? '<th style="width:1%">Acciones</th>' : '';
  const body    = rows.map(r => {
    const cells = cols.map(c => {
      let val = r[c.key] ?? '';
      if (c.fmt === 'money') val = fmt(val);
      if (c.fmt === 'date')  val = fmtDate(val);
      if (c.fmt === 'bool')  val = val ? '✔' : '✘';
      if (c.badge) val = `<span class="badge ${c.badge(val)}">${val}</span>`;
      return `<td>${val}</td>`;
    }).join('');
    const act = actionsFn ? `<td class="text-nowrap">${actionsFn(r)}</td>` : '';
    return `<tr>${cells}${act}</tr>`;
  }).join('');
  return `<div class="table-responsive">
    <table class="table table-sm table-hover mb-0">
      <thead class="table-dark"><tr>${head}${actHead}</tr></thead>
      <tbody>${body}</tbody>
    </table></div>`;
}

function showModalError(prefix, msg) {
  const el = document.getElementById(`${prefix}-error`);
  if (!el) return;
  el.textContent = msg;
  el.classList.remove('d-none');
}

function hideModalError(prefix) {
  document.getElementById(`${prefix}-error`)?.classList.add('d-none');
}

// DASHBOARD
async function loadDashboard() {
  try {
    const [prods, clts, ventas] = await Promise.all([
      api('GET', '/api/productos'),
      api('GET', '/api/clientes'),
      api('GET', '/api/ventas'),
    ]);
    document.getElementById('dash-productos').textContent = prods.length;
    document.getElementById('dash-clientes').textContent  = clts.length;
    document.getElementById('dash-ventas').textContent    = ventas.length;
    document.getElementById('dash-total').textContent =
      fmt(ventas.reduce((s, v) => s + parseFloat(v.total || 0), 0));
    document.getElementById('dash-recent').innerHTML = makeTable(
      ventas.slice(0, 8),
      [
        { key: 'id_venta', label: '#' },
        { key: 'fecha',    label: 'Fecha',    fmt: 'date' },
        { key: 'cliente',  label: 'Cliente' },
        { key: 'empleado', label: 'Empleado' },
        { key: 'total',    label: 'Total',    fmt: 'money' },
        { key: 'estado',   label: 'Estado' },
      ]
    );
  } catch (err) { toast(err.message, 'danger'); }
}

// PRODUCTOS
async function loadProductos() {
  try {
    [_productos, _categorias, _proveedores] = await Promise.all([
      api('GET', '/api/productos'),
      api('GET', '/api/categorias'),
      api('GET', '/api/proveedores'),
    ]);
    document.getElementById('productos-table').innerHTML = makeTable(
      _productos,
      [
        { key: 'id',        label: 'ID' },
        { key: 'nombre',    label: 'Nombre' },
        { key: 'categoria', label: 'Categoría' },
        { key: 'proveedor', label: 'Proveedor' },
        { key: 'precio',    label: 'Precio', fmt: 'money' },
        { key: 'stock',     label: 'Stock',
          badge: v => parseInt(v) < 10 ? 'badge-stock-low' : 'badge-stock-ok' },
      ],
      r => `
        <button class="btn btn-xs btn-outline-primary me-1"
                onclick="openProductoModal(${r.id})">Editar</button>
        <button class="btn btn-xs btn-outline-danger"
                onclick="delProducto(${r.id})">Eliminar</button>`
    );
  } catch (err) { toast(err.message, 'danger'); }
}

function openProductoModal(id = null) {
  hideModalError('p');
  document.getElementById('p-id').value          = id || '';
  document.getElementById('p-nombre').value      = '';
  document.getElementById('p-descripcion').value = '';
  document.getElementById('p-precio').value      = '';
  document.getElementById('p-stock').value       = '0';
  document.getElementById('productoModalLabel').textContent = id ? 'Editar producto' : 'Nuevo producto';

  const catSel  = document.getElementById('p-categoria');
  const provSel = document.getElementById('p-proveedor');
  catSel.innerHTML  = _categorias.map(c  => `<option value="${c.id}">${c.nombre}</option>`).join('');
  provSel.innerHTML = _proveedores.map(p => `<option value="${p.id}">${p.nombre}</option>`).join('');

  if (id) {
    const p = _productos.find(x => x.id === id);
    if (p) {
      document.getElementById('p-nombre').value      = p.nombre      || '';
      document.getElementById('p-descripcion').value = p.descripcion || '';
      document.getElementById('p-precio').value      = p.precio;
      document.getElementById('p-stock').value       = p.stock;
      catSel.value  = p.id_categoria;
      provSel.value = p.id_proveedor;
    }
  }
  new bootstrap.Modal(document.getElementById('productoModal')).show();
}

async function saveProducto() {
  hideModalError('p');
  const id   = document.getElementById('p-id').value;
  const body = {
    nombre:       document.getElementById('p-nombre').value.trim(),
    descripcion:  document.getElementById('p-descripcion').value.trim(),
    precio:       parseFloat(document.getElementById('p-precio').value),
    stock:        parseInt(document.getElementById('p-stock').value) || 0,
    id_categoria: parseInt(document.getElementById('p-categoria').value),
    id_proveedor: parseInt(document.getElementById('p-proveedor').value),
  };
  if (!body.nombre) return showModalError('p', 'El nombre es requerido.');
  if (isNaN(body.precio) || body.precio < 0) return showModalError('p', 'Precio inválido.');
  try {
    if (id) { await api('PUT',  `/api/productos/${id}`, body); toast('Producto actualizado.'); }
    else    { await api('POST', '/api/productos',        body); toast('Producto creado.'); }
    bootstrap.Modal.getInstance(document.getElementById('productoModal')).hide();
    loadProductos();
  } catch (err) { showModalError('p', err.message); }
}

async function delProducto(id) {
  if (!confirm('¿Eliminar este producto?')) return;
  try {
    await api('DELETE', `/api/productos/${id}`);
    toast('Producto eliminado.');
    loadProductos();
  } catch (err) { toast(err.message, 'danger'); }
}

// CATEGORIAS 
async function loadCategorias() {
  try {
    _categorias = await api('GET', '/api/categorias');
    document.getElementById('categorias-table').innerHTML = makeTable(
      _categorias,
      [
        { key: 'id',          label: 'ID' },
        { key: 'nombre',      label: 'Nombre' },
        { key: 'descripcion', label: 'Descripción' },
      ],
      r => `
        <button class="btn btn-xs btn-outline-primary me-1"
                onclick="openCategoriaModal(${r.id})">Editar</button>
        <button class="btn btn-xs btn-outline-danger"
                onclick="delCategoria(${r.id})">Eliminar</button>`
    );
  } catch (err) { toast(err.message, 'danger'); }
}

function openCategoriaModal(id = null) {
  hideModalError('cat');
  document.getElementById('cat-id').value          = id || '';
  document.getElementById('cat-nombre').value      = '';
  document.getElementById('cat-descripcion').value = '';
  document.getElementById('categoriaModalLabel').textContent = id ? 'Editar categoría' : 'Nueva categoría';
  if (id) {
    const c = _categorias.find(x => x.id === id);
    if (c) {
      document.getElementById('cat-nombre').value      = c.nombre      || '';
      document.getElementById('cat-descripcion').value = c.descripcion || '';
    }
  }
  new bootstrap.Modal(document.getElementById('categoriaModal')).show();
}

async function saveCategoria() {
  hideModalError('cat');
  const id   = document.getElementById('cat-id').value;
  const body = {
    nombre:      document.getElementById('cat-nombre').value.trim(),
    descripcion: document.getElementById('cat-descripcion').value.trim(),
  };
  if (!body.nombre) return showModalError('cat', 'El nombre es requerido.');
  try {
    if (id) { await api('PUT',  `/api/categorias/${id}`, body); toast('Categoría actualizada.'); }
    else    { await api('POST', '/api/categorias',        body); toast('Categoría creada.'); }
    bootstrap.Modal.getInstance(document.getElementById('categoriaModal')).hide();
    loadCategorias();
  } catch (err) { showModalError('cat', err.message); }
}

async function delCategoria(id) {
  if (!confirm('¿Eliminar esta categoría?')) return;
  try {
    await api('DELETE', `/api/categorias/${id}`);
    toast('Categoría eliminada.');
    loadCategorias();
  } catch (err) { toast(err.message, 'danger'); }
}

// PROVEEDORES 
async function loadProveedores() {
  try {
    _proveedores = await api('GET', '/api/proveedores');
    document.getElementById('proveedores-table').innerHTML = makeTable(
      _proveedores,
      [
        { key: 'id',       label: 'ID' },
        { key: 'nombre',   label: 'Nombre' },
        { key: 'contacto', label: 'Contacto' },
        { key: 'telefono', label: 'Teléfono' },
        { key: 'email',    label: 'Email' },
      ],
      r => `
        <button class="btn btn-xs btn-outline-primary me-1"
                onclick="openProveedorModal(${r.id})">Editar</button>
        <button class="btn btn-xs btn-outline-danger"
                onclick="delProveedor(${r.id})">Eliminar</button>`
    );
  } catch (err) { toast(err.message, 'danger'); }
}

function openProveedorModal(id = null) {
  hideModalError('prov');
  document.getElementById('prov-id').value       = id || '';
  document.getElementById('prov-nombre').value   = '';
  document.getElementById('prov-contacto').value = '';
  document.getElementById('prov-telefono').value = '';
  document.getElementById('prov-email').value    = '';
  document.getElementById('proveedorModalLabel').textContent = id ? 'Editar proveedor' : 'Nuevo proveedor';
  if (id) {
    const p = _proveedores.find(x => x.id === id);
    if (p) {
      document.getElementById('prov-nombre').value   = p.nombre   || '';
      document.getElementById('prov-contacto').value = p.contacto || '';
      document.getElementById('prov-telefono').value = p.telefono || '';
      document.getElementById('prov-email').value    = p.email    || '';
    }
  }
  new bootstrap.Modal(document.getElementById('proveedorModal')).show();
}

async function saveProveedor() {
  hideModalError('prov');
  const id   = document.getElementById('prov-id').value;
  const body = {
    nombre:   document.getElementById('prov-nombre').value.trim(),
    contacto: document.getElementById('prov-contacto').value.trim(),
    telefono: document.getElementById('prov-telefono').value.trim(),
    email:    document.getElementById('prov-email').value.trim(),
  };
  if (!body.nombre) return showModalError('prov', 'El nombre es requerido.');
  try {
    if (id) { await api('PUT',  `/api/proveedores/${id}`, body); toast('Proveedor actualizado.'); }
    else    { await api('POST', '/api/proveedores',        body); toast('Proveedor creado.'); }
    bootstrap.Modal.getInstance(document.getElementById('proveedorModal')).hide();
    loadProveedores();
  } catch (err) { showModalError('prov', err.message); }
}

async function delProveedor(id) {
  if (!confirm('¿Eliminar este proveedor?')) return;
  try {
    await api('DELETE', `/api/proveedores/${id}`);
    toast('Proveedor eliminado.');
    loadProveedores();
  } catch (err) { toast(err.message, 'danger'); }
}

// CLIENTES 
async function loadClientes() {
  try {
    _clientes = await api('GET', '/api/clientes');
    document.getElementById('clientes-table').innerHTML = makeTable(
      _clientes,
      [
        { key: 'id',        label: 'ID' },
        { key: 'nombre',    label: 'Nombre' },
        { key: 'apellido',  label: 'Apellido' },
        { key: 'email',     label: 'Email' },
        { key: 'telefono',  label: 'Teléfono' },
        { key: 'direccion', label: 'Dirección' },
      ],
      r => `
        <button class="btn btn-xs btn-outline-primary me-1"
                onclick="openClienteModal(${r.id})">Editar</button>
        <button class="btn btn-xs btn-outline-danger"
                onclick="delCliente(${r.id})">Eliminar</button>`
    );
  } catch (err) { toast(err.message, 'danger'); }
}

function openClienteModal(id = null) {
  hideModalError('c');
  document.getElementById('c-id').value        = id || '';
  document.getElementById('c-nombre').value    = '';
  document.getElementById('c-apellido').value  = '';
  document.getElementById('c-email').value     = '';
  document.getElementById('c-telefono').value  = '';
  document.getElementById('c-direccion').value = '';
  document.getElementById('clienteModalLabel').textContent = id ? 'Editar cliente' : 'Nuevo cliente';
  if (id) {
    const c = _clientes.find(x => x.id === id);
    if (c) {
      document.getElementById('c-nombre').value    = c.nombre    || '';
      document.getElementById('c-apellido').value  = c.apellido  || '';
      document.getElementById('c-email').value     = c.email     || '';
      document.getElementById('c-telefono').value  = c.telefono  || '';
      document.getElementById('c-direccion').value = c.direccion || '';
    }
  }
  new bootstrap.Modal(document.getElementById('clienteModal')).show();
}

async function saveCliente() {
  hideModalError('c');
  const id   = document.getElementById('c-id').value;
  const body = {
    nombre:    document.getElementById('c-nombre').value.trim(),
    apellido:  document.getElementById('c-apellido').value.trim(),
    email:     document.getElementById('c-email').value.trim(),
    telefono:  document.getElementById('c-telefono').value.trim(),
    direccion: document.getElementById('c-direccion').value.trim(),
  };
  if (!body.nombre || !body.apellido) return showModalError('c', 'Nombre y apellido son requeridos.');
  try {
    if (id) { await api('PUT',  `/api/clientes/${id}`, body); toast('Cliente actualizado.'); }
    else    { await api('POST', '/api/clientes',        body); toast('Cliente creado.'); }
    bootstrap.Modal.getInstance(document.getElementById('clienteModal')).hide();
    loadClientes();
  } catch (err) { showModalError('c', err.message); }
}

async function delCliente(id) {
  if (!confirm('¿Eliminar este cliente?')) return;
  try {
    await api('DELETE', `/api/clientes/${id}`);
    toast('Cliente eliminado.');
    loadClientes();
  } catch (err) { toast(err.message, 'danger'); }
}

// EMPLEADOS
async function loadEmpleados() {
  try {
    _empleados = await api('GET', '/api/empleados');
    document.getElementById('empleados-table').innerHTML = makeTable(
      _empleados,
      [
        { key: 'id',       label: 'ID' },
        { key: 'nombre',   label: 'Nombre' },
        { key: 'apellido', label: 'Apellido' },
        { key: 'cargo',    label: 'Cargo' },
        { key: 'email',    label: 'Email' },
        { key: 'telefono', label: 'Teléfono' },
        { key: 'activo',   label: 'Activo', fmt: 'bool' },
      ],
      r => `
        <button class="btn btn-xs btn-outline-primary me-1"
                onclick="openEmpleadoModal(${r.id})">Editar</button>
        <button class="btn btn-xs btn-outline-danger"
                onclick="delEmpleado(${r.id})">Eliminar</button>`
    );
  } catch (err) { toast(err.message, 'danger'); }
}

function openEmpleadoModal(id = null) {
  hideModalError('e');
  document.getElementById('e-id').value       = id || '';
  document.getElementById('e-nombre').value   = '';
  document.getElementById('e-apellido').value = '';
  document.getElementById('e-cargo').value    = '';
  document.getElementById('e-email').value    = '';
  document.getElementById('e-telefono').value = '';
  document.getElementById('e-activo').checked = true;
  document.getElementById('empleadoModalLabel').textContent = id ? 'Editar empleado' : 'Nuevo empleado';
  if (id) {
    const e = _empleados.find(x => x.id === id);
    if (e) {
      document.getElementById('e-nombre').value   = e.nombre   || '';
      document.getElementById('e-apellido').value = e.apellido || '';
      document.getElementById('e-cargo').value    = e.cargo    || '';
      document.getElementById('e-email').value    = e.email    || '';
      document.getElementById('e-telefono').value = e.telefono || '';
      document.getElementById('e-activo').checked = e.activo;
    }
  }
  new bootstrap.Modal(document.getElementById('empleadoModal')).show();
}

async function saveEmpleado() {
  hideModalError('e');
  const id   = document.getElementById('e-id').value;
  const body = {
    nombre:   document.getElementById('e-nombre').value.trim(),
    apellido: document.getElementById('e-apellido').value.trim(),
    cargo:    document.getElementById('e-cargo').value.trim(),
    email:    document.getElementById('e-email').value.trim(),
    telefono: document.getElementById('e-telefono').value.trim(),
    activo:   document.getElementById('e-activo').checked,
  };
  if (!body.nombre || !body.apellido) return showModalError('e', 'Nombre y apellido son requeridos.');
  try {
    if (id) { await api('PUT',  `/api/empleados/${id}`, body); toast('Empleado actualizado.'); }
    else    { await api('POST', '/api/empleados',        body); toast('Empleado creado.'); }
    bootstrap.Modal.getInstance(document.getElementById('empleadoModal')).hide();
    loadEmpleados();
  } catch (err) { showModalError('e', err.message); }
}

async function delEmpleado(id) {
  if (!confirm('¿Eliminar este empleado?')) return;
  try {
    await api('DELETE', `/api/empleados/${id}`);
    toast('Empleado eliminado.');
    loadEmpleados();
  } catch (err) { toast(err.message, 'danger'); }
}

// VENTAS
async function loadVentas() {
  try {
    const [ventas, clts, emps, prods, cats, provs] = await Promise.all([
      api('GET', '/api/ventas'),
      api('GET', '/api/clientes'),
      api('GET', '/api/empleados'),
      api('GET', '/api/productos'),
      api('GET', '/api/categorias'),
      api('GET', '/api/proveedores'),
    ]);
    _clientes    = clts;
    _empleados   = emps;
    _productos   = prods;
    _categorias  = cats;
    _proveedores = provs;

    document.getElementById('ventas-table').innerHTML = makeTable(
      ventas,
      [
        { key: 'id_venta',   label: '#' },
        { key: 'fecha',      label: 'Fecha',    fmt: 'date' },
        { key: 'cliente',    label: 'Cliente' },
        { key: 'empleado',   label: 'Empleado' },
        { key: 'num_lineas', label: 'Líneas' },
        { key: 'total',      label: 'Total',    fmt: 'money' },
        { key: 'estado',     label: 'Estado' },
      ],
      r => `
        <button class="btn btn-xs btn-outline-info me-1"
                onclick="verDetalle(${r.id_venta})">Ver</button>
        <button class="btn btn-xs btn-outline-danger"
                onclick="cancelarVenta(${r.id_venta})">Cancelar</button>`
    );

    const cltSel = document.getElementById('venta-cliente');
    const empSel = document.getElementById('venta-empleado');
    cltSel.innerHTML = _clientes.map(c =>
      `<option value="${c.id}">${c.nombre} ${c.apellido}</option>`).join('');
    empSel.innerHTML = _empleados.filter(e => e.activo).map(e =>
      `<option value="${e.id}">${e.nombre} ${e.apellido} — ${e.cargo || ''}</option>`).join('');

    document.getElementById('venta-items').innerHTML = '';
    updateVentaTotal();
  } catch (err) { toast(err.message, 'danger'); }
}

function addVentaItem() {
  const container = document.getElementById('venta-items');
  const idx       = Date.now();
  container.insertAdjacentHTML('beforeend', `
    <div class="venta-item-row" id="item-${idx}">
      <select class="form-select form-select-sm item-prod" onchange="updateVentaTotal()">
        ${_productos.map(p =>
          `<option value="${p.id}" data-price="${p.precio}" data-stock="${p.stock}">
            ${p.nombre} (Stock: ${p.stock})
          </option>`).join('')}
      </select>
      <input type="number" class="form-control form-control-sm item-qty"
             min="1" value="1" onchange="updateVentaTotal()" oninput="updateVentaTotal()" />
      <span class="item-sub">–</span>
      <button class="btn btn-sm btn-outline-danger"
              onclick="document.getElementById('item-${idx}').remove(); updateVentaTotal()">✕</button>
    </div>`);
  updateVentaTotal();
}

function updateVentaTotal() {
  let total = 0;
  document.querySelectorAll('.venta-item-row').forEach(row => {
    const sel   = row.querySelector('.item-prod');
    const qty   = parseInt(row.querySelector('.item-qty').value) || 0;
    const price = parseFloat(sel.selectedOptions[0]?.dataset.price || 0);
    const sub   = price * qty;
    row.querySelector('.item-sub').textContent = fmt(sub);
    total += sub;
  });
  document.getElementById('venta-total').textContent = fmt(total);
}

async function submitVenta() {
  const id_cliente  = parseInt(document.getElementById('venta-cliente').value);
  const id_empleado = parseInt(document.getElementById('venta-empleado').value);
  const rows        = document.querySelectorAll('.venta-item-row');

  if (rows.length === 0) { toast('Agrega al menos un producto.', 'warning'); return; }

  const items = [];
  let valid   = true;
  rows.forEach(row => {
    const id_producto = parseInt(row.querySelector('.item-prod').value);
    const cantidad    = parseInt(row.querySelector('.item-qty').value);
    const stock       = parseInt(row.querySelector('.item-prod').selectedOptions[0]?.dataset.stock || 0);
    if (!cantidad || cantidad <= 0) { valid = false; return; }
    if (cantidad > stock) {
      toast(`Stock insuficiente (disponible: ${stock}).`, 'danger');
      valid = false;
    }
    items.push({ id_producto, cantidad });
  });
  if (!valid) return;

  try {
    await api('POST', '/api/ventas', { id_cliente, id_empleado, items });
    toast('Venta registrada exitosamente.');
    loadVentas();
  } catch (err) { toast(err.message, 'danger'); }
}

async function verDetalle(id) {
  try {
    const data = await api('GET', `/api/ventas/${id}`);
    const rows = data.detalle.map(d => `
      <tr>
        <td>${d.producto}</td>
        <td class="text-end">${d.cantidad}</td>
        <td class="text-end">${fmt(d.precio_unitario)}</td>
        <td class="text-end">${fmt(d.subtotal)}</td>
      </tr>`).join('');
    document.getElementById('detalle-venta-body').innerHTML = `
      <div class="row mb-3">
        <div class="col-6"><strong>Venta #</strong> ${data.id_venta}</div>
        <div class="col-6"><strong>Fecha:</strong> ${fmtDate(data.fecha)}</div>
        <div class="col-6"><strong>Cliente:</strong> ${data.cliente}</div>
        <div class="col-6"><strong>Empleado:</strong> ${data.empleado}</div>
        <div class="col-6"><strong>Estado:</strong> ${data.estado}</div>
      </div>
      <table class="table table-sm">
        <thead class="table-dark">
          <tr><th>Producto</th><th class="text-end">Cant.</th>
              <th class="text-end">Precio unit.</th><th class="text-end">Subtotal</th></tr>
        </thead>
        <tbody>${rows}</tbody>
        <tfoot>
          <tr class="fw-bold">
            <td colspan="3" class="text-end">Total:</td>
            <td class="text-end">${fmt(data.total)}</td>
          </tr>
        </tfoot>
      </table>`;
    new bootstrap.Modal(document.getElementById('detalleVentaModal')).show();
  } catch (err) { toast(err.message, 'danger'); }
}

async function cancelarVenta(id) {
  if (!confirm(`¿Cancelar venta #${id}? Se restaurará el stock.`)) return;
  try {
    await api('DELETE', `/api/ventas/${id}`);
    toast('Venta cancelada y stock restaurado.');
    loadVentas();
  } catch (err) { toast(err.message, 'danger'); }
}

// REPORTES
const REPORTE_META = {
  'ventas-por-empleado': {
    info: 'JOIN empleados + ventas  |  GROUP BY + HAVING + funciones de agregación (COUNT, SUM, AVG, MAX)',
    cols: [
      { key: 'empleado',       label: 'Empleado' },
      { key: 'cargo',          label: 'Cargo' },
      { key: 'num_ventas',     label: 'N° ventas' },
      { key: 'total_vendido',  label: 'Total vendido',  fmt: 'money' },
      { key: 'promedio_venta', label: 'Promedio/venta', fmt: 'money' },
      { key: 'venta_maxima',   label: 'Venta máxima',   fmt: 'money' },
    ],
  },
  'productos-mas-vendidos': {
    info: 'JOIN múltiple: detalle_ventas + productos + categorias  |  GROUP BY + SUM',
    cols: [
      { key: 'producto',         label: 'Producto' },
      { key: 'categoria',        label: 'Categoría' },
      { key: 'total_vendido',    label: 'Unidades' },
      { key: 'ingresos_totales', label: 'Ingresos', fmt: 'money' },
      { key: 'stock_actual',     label: 'Stock actual' },
    ],
  },
  'clientes-top': {
    info: 'CTE (WITH resumen_clientes AS …)  +  LEFT JOIN clientes + ventas',
    cols: [
      { key: 'cliente',       label: 'Cliente' },
      { key: 'email',         label: 'Email' },
      { key: 'num_compras',   label: 'Compras' },
      { key: 'total_gastado', label: 'Total gastado', fmt: 'money' },
      { key: 'ultima_compra', label: 'Última compra', fmt: 'date' },
    ],
  },
  'stock-bajo': {
    info: 'Subquery IN: WHERE p.id IN (SELECT id FROM productos WHERE stock < 20)  |  JOIN productos + categorias + proveedores',
    cols: [
      { key: 'producto',        label: 'Producto' },
      { key: 'stock',           label: 'Stock',
        badge: v => parseInt(v) < 10 ? 'badge-stock-low' : 'bg-warning text-dark' },
      { key: 'precio',          label: 'Precio',    fmt: 'money' },
      { key: 'categoria',       label: 'Categoría' },
      { key: 'proveedor',       label: 'Proveedor' },
      { key: 'email_proveedor', label: 'Email proveedor' },
    ],
  },
  'clientes-sin-compras': {
    info: 'Subquery correlacionado NOT EXISTS: WHERE NOT EXISTS (SELECT 1 FROM ventas WHERE id_cliente = c.id)',
    cols: [
      { key: 'cliente',   label: 'Cliente' },
      { key: 'email',     label: 'Email' },
      { key: 'telefono',  label: 'Teléfono' },
      { key: 'direccion', label: 'Dirección' },
    ],
  },
  'ventas-por-categoria': {
    info: 'JOIN categorias + productos + detalle_ventas  |  GROUP BY + COUNT DISTINCT + SUM',
    cols: [
      { key: 'categoria',         label: 'Categoría' },
      { key: 'num_ventas',        label: 'N° ventas' },
      { key: 'unidades_vendidas', label: 'Unidades' },
      { key: 'ingresos',          label: 'Ingresos', fmt: 'money' },
    ],
  },
  'resumen-mensual': {
    info: 'Usando VIEW vista_ventas_detalladas  |  DATE_TRUNC + GROUP BY mes + funciones de agregación',
    cols: [
      { key: 'mes',            label: 'Mes' },
      { key: 'num_ventas',     label: 'N° ventas' },
      { key: 'total_mes',      label: 'Total mes',      fmt: 'money' },
      { key: 'promedio_venta', label: 'Promedio/venta', fmt: 'money' },
      { key: 'venta_maxima',   label: 'Máx.',           fmt: 'money' },
      { key: 'venta_minima',   label: 'Mín.',           fmt: 'money' },
    ],
  },
};

async function loadReporte(nombre) {
  _currentReporte = nombre;
  document.querySelectorAll('.reporte-tab').forEach(t => t.classList.remove('active'));
  document.querySelector(`[data-r="${nombre}"]`)?.classList.add('active');

  const infoEl = document.getElementById('reporte-info');
  const meta   = REPORTE_META[nombre] || {};
  if (meta.info) {
    infoEl.textContent = `SQL: ${meta.info}`;
    infoEl.classList.remove('d-none');
  } else {
    infoEl.classList.add('d-none');
  }

  const container = document.getElementById('reporte-table');
  container.innerHTML = '<p class="text-muted p-3">Cargando...</p>';
  try {
    _reporteData = await api('GET', `/api/reportes/${nombre}`);
    container.innerHTML = makeTable(_reporteData, meta.cols || []);
  } catch (err) {
    container.innerHTML = `<div class="alert alert-danger m-3">${err.message}</div>`;
  }
}

function exportCSV() {
  if (!_reporteData || _reporteData.length === 0) {
    toast('No hay datos para exportar.', 'warning');
    return;
  }
  const keys  = Object.keys(_reporteData[0]);
  const lines = [
    keys.join(','),
    ..._reporteData.map(row =>
      keys.map(k => {
        const v = row[k] ?? '';
        const s = String(v).replace(/"/g, '""');
        return s.includes(',') || s.includes('"') || s.includes('\n') ? `"${s}"` : s;
      }).join(',')
    ),
  ];
  const blob = new Blob(['\uFEFF' + lines.join('\r\n')], { type: 'text/csv;charset=utf-8;' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = `reporte_${_currentReporte}_${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
  toast('CSV descargado.');
}

// INIT 
document.addEventListener('DOMContentLoaded', () => {
  buildDOM();
  bindEvents();
  checkAuth();
});
