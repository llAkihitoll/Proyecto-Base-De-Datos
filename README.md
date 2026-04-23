# Tienda — Sistema de Gestión de Inventario y Ventas

Aplicación web para gestionar inventario, ventas y reportes de una tienda. Incluye frontend (SPA),
backend (Node.js/Express) y base de datos PostgreSQL, todo orquestado con Docker.

## Requisitos previos

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) instalado y en ejecución.

## Levantar el proyecto

```bash
# 1. Clona el repositorio
git clone <url-del-repositorio>
cd Proyecto_BD

# 2. Copia el archivo de entorno (ya incluye las credenciales de calificación)
cp .env.example .env

# 3. Levanta todos los servicios
docker compose up --build
```

La aplicación estará disponible en **http://localhost** (puerto 80)

> El backend API corre en el puerto 3000 internamente; el frontend (nginx) hace proxy de `/api/` hacia él.

### Credenciales de acceso

| Campo    | Valor      |
|----------|------------|
| Usuario  | `admin`    |
| Contraseña | `admin123` |

> Las credenciales de base de datos son `proy2 / secret` tal como requiere la rúbrica.

## Detener el proyecto

```bash
docker compose down
# Para eliminar también los datos persistidos:
docker compose down -v
```

---

## Estructura del proyecto

```
Proyecto_BD/
├── docker-compose.yml      # Orquestación de servicios
├── .env                    # Variables de entorno (NO commitear en producción)
├── .env.example            # Plantilla de variables
├── db/
│   └── init.sql            # DDL + índices + vista + datos de prueba
├── backend/
│   ├── Dockerfile
│   ├── package.json
│   ├── index.js             # Servidor Express principal
│   ├── db.js                # Pool de conexión PostgreSQL
│   ├── middleware/
│   │   └── auth.js          # Middleware de autenticación por sesión
│   └── routes/
│       ├── auth.js          # Login / logout / me
│       ├── categorias.js    # CRUD categorías
│       ├── proveedores.js   # CRUD proveedores
│       ├── productos.js     # CRUD productos (JOIN categorías + proveedores)
│       ├── empleados.js     # CRUD empleados
│       ├── clientes.js      # CRUD clientes
│       ├── ventas.js        # Ventas con transacción BEGIN/COMMIT/ROLLBACK
│       └── reportes.js      # Consultas avanzadas (JOINs, subqueries, CTE, VIEW)
└── Frontend/
    ├── Dockerfile
    ├── nginx.conf
    ├── index.html           # Shell mínimo (punto de entrada)
    ├── style.css            # Estilos
    └── app.js               # Lógica + generación de DOM
```

---

## Funcionalidades implementadas

### Diseño de base de datos
- 8 tablas: `categorias`, `proveedores`, `productos`, `empleados`, `clientes`, `ventas`,
  `detalle_ventas`, `usuarios`
- Índices en columnas de búsqueda frecuente (`id_categoria`, `id_proveedor`, `id_cliente`,
  `id_empleado`, `fecha`, `id_venta`, `id_producto`)
- Vista `vista_ventas_detalladas` con datos enriquecidos de ventas
- +25 registros por tabla en datos de prueba

### SQL visible en la UI
| Criterio | Descripción |
|---|---|
| JOIN múltiple #1 | Listado de productos: `productos JOIN categorias JOIN proveedores` |
| JOIN múltiple #2 | Reporte productos más vendidos: `detalle_ventas JOIN productos JOIN categorias` |
| JOIN múltiple #3 | Reporte stock bajo: `productos JOIN categorias JOIN proveedores` |
| Subquery IN | Reporte stock bajo: `WHERE id IN (SELECT id FROM productos WHERE stock < 20)` |
| Subquery NOT EXISTS | Reporte clientes sin compras: `WHERE NOT EXISTS (SELECT 1 FROM ventas …)` |
| GROUP BY + HAVING + agregación | Reporte ventas por empleado: COUNT, SUM, AVG, MAX |
| CTE (WITH) | Reporte clientes top: `WITH resumen_clientes AS (…)` |
| VIEW | Lista de ventas usa `vista_ventas_detalladas` |
| Transacción con ROLLBACK | `POST /api/ventas` — valida stock, inserta venta/detalle, descuenta stock; hace ROLLBACK ante cualquier error |

### Aplicación web
- CRUD completo: **Productos**, **Clientes**, **Empleados**, **Categorías**, **Proveedores**
- Módulo de ventas: creación con múltiples líneas, validación de stock en tiempo real, cancelación
- 7 reportes con datos reales de la BD, exportables a **CSV**
- Manejo visible de errores en formularios y operaciones
- Autenticación con sesión (login / logout)
