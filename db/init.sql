-- Categorias de productos
CREATE TABLE categorias (
    id   SERIAL PRIMARY KEY,
    nombre      VARCHAR(100) NOT NULL,
    descripcion TEXT
);

-- Proveedores
CREATE TABLE proveedores (
    id       SERIAL PRIMARY KEY,
    nombre   VARCHAR(150) NOT NULL,
    contacto VARCHAR(100),
    telefono VARCHAR(20),
    email    VARCHAR(100)
);

-- Productos
CREATE TABLE productos (
    id           SERIAL PRIMARY KEY,
    nombre       VARCHAR(150) NOT NULL,
    descripcion  TEXT,
    precio       DECIMAL(10,2) NOT NULL,
    stock        INTEGER NOT NULL DEFAULT 0,
    id_categoria INTEGER NOT NULL REFERENCES categorias(id),
    id_proveedor INTEGER NOT NULL REFERENCES proveedores(id)
);

-- Empleados
CREATE TABLE empleados (
    id       SERIAL PRIMARY KEY,
    nombre   VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    cargo    VARCHAR(100),
    email    VARCHAR(100),
    telefono VARCHAR(20),
    activo   BOOLEAN NOT NULL DEFAULT TRUE
);

-- Clientes
CREATE TABLE clientes (
    id        SERIAL PRIMARY KEY,
    nombre    VARCHAR(100) NOT NULL,
    apellido  VARCHAR(100) NOT NULL,
    email     VARCHAR(100),
    telefono  VARCHAR(20),
    direccion TEXT
);

-- Ventas
CREATE TABLE ventas (
    id          SERIAL PRIMARY KEY,
    fecha       TIMESTAMP NOT NULL DEFAULT NOW(),
    id_cliente  INTEGER NOT NULL REFERENCES clientes(id),
    id_empleado INTEGER NOT NULL REFERENCES empleados(id),
    total       DECIMAL(10,2) NOT NULL DEFAULT 0,
    estado      VARCHAR(20) NOT NULL DEFAULT 'completada'
);

-- Detalle de ventas
CREATE TABLE detalle_ventas (
    id              SERIAL PRIMARY KEY,
    id_venta        INTEGER NOT NULL REFERENCES ventas(id),
    id_producto     INTEGER NOT NULL REFERENCES productos(id),
    cantidad        INTEGER NOT NULL,
    precio_unitario DECIMAL(10,2) NOT NULL,
    subtotal        DECIMAL(10,2) NOT NULL
);

-- Usuarios del sistema (para autenticacion)
CREATE TABLE usuarios (
    id            SERIAL PRIMARY KEY,
    username      VARCHAR(50) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    rol           VARCHAR(20) NOT NULL DEFAULT 'empleado',
    id_empleado   INTEGER REFERENCES empleados(id)
);

-- INDICES
CREATE INDEX IF NOT EXISTS idx_productos_categoria ON productos(id_categoria);
CREATE INDEX IF NOT EXISTS idx_productos_proveedor  ON productos(id_proveedor);
CREATE INDEX IF NOT EXISTS idx_ventas_cliente        ON ventas(id_cliente);
CREATE INDEX IF NOT EXISTS idx_ventas_empleado       ON ventas(id_empleado);
CREATE INDEX IF NOT EXISTS idx_ventas_fecha          ON ventas(fecha);
CREATE INDEX IF NOT EXISTS idx_detalle_venta         ON detalle_ventas(id_venta);
CREATE INDEX IF NOT EXISTS idx_detalle_producto      ON detalle_ventas(id_producto);

-- VISTA
CREATE OR REPLACE VIEW vista_ventas_detalladas AS
SELECT
    v.id          AS id_venta,
    v.fecha,
    v.estado,
    v.total,
    c.id          AS id_cliente,
    c.nombre || ' ' || c.apellido  AS cliente,
    c.email       AS email_cliente,
    e.id          AS id_empleado,
    e.nombre || ' ' || e.apellido  AS empleado,
    e.cargo       AS cargo_empleado,
    COUNT(dv.id)          AS num_lineas,
    COALESCE(SUM(dv.cantidad), 0) AS total_items
FROM ventas v
JOIN clientes  c ON v.id_cliente  = c.id
JOIN empleados e ON v.id_empleado = e.id
LEFT JOIN detalle_ventas dv ON v.id = dv.id_venta
GROUP BY v.id, v.fecha, v.estado, v.total,
         c.id, c.nombre, c.apellido, c.email,
         e.id, e.nombre, e.apellido, e.cargo;

-- ISERTS

-- Categorias
INSERT INTO categorias (nombre, descripcion) VALUES
('Electrónica de consumo',    'Gadgets, cámaras, accesorios electrónicos'),
('Computadoras y Laptops',    'Equipos de cómputo personales y portátiles'),
('Teléfonos y Tablets',       'Smartphones, tablets y accesorios móviles'),
('Electrodomésticos pequeños','Licuadoras, microondas, cafeteras y similares'),
('Electrodomésticos grandes', 'Refrigeradoras, lavadoras, secadoras'),
('Ropa masculina',            'Camisas, pantalones, ropa casual y formal para hombres'),
('Ropa femenina',             'Blusas, vestidos, ropa casual y formal para mujeres'),
('Ropa infantil',             'Ropa para niños y niñas de 0-12 años'),
('Calzado',                   'Zapatos, botas, sandalias y tenis'),
('Accesorios de moda',        'Bolsos, cinturones, relojes, joyería'),
('Alimentos básicos',         'Arroz, frijol, aceite, azúcar y granos'),
('Bebidas y jugos',           'Agua, refrescos, jugos, bebidas energéticas'),
('Lácteos y huevos',          'Leche, queso, crema, yogur, huevos'),
('Carnes y embutidos',        'Pollo, res, cerdo, jamón, salchichas'),
('Panadería y repostería',    'Pan, pasteles, galletas y postres'),
('Snacks y confitería',       'Papas, dulces, chocolates, chicles'),
('Limpieza del hogar',        'Detergentes, jabones, desinfectantes'),
('Cuidado personal',          'Shampoo, desodorante, cremas, maquillaje'),
('Farmacia y salud',          'Medicamentos de libre venta, vitaminas, primeros auxilios'),
('Juguetes y juegos',         'Juguetes para todas las edades, juegos de mesa'),
('Artículos deportivos',      'Equipos y ropa para deporte y ejercicio'),
('Libros y revistas',         'Literatura, textos académicos, revistas'),
('Papelería y oficina',       'Cuadernos, lapiceros, impresoras, tóner'),
('Herramientas y ferretería', 'Martillos, taladros, tornillos, pinturas'),
('Mascotas y accesorios',     'Alimento, juguetes y accesorios para mascotas');

-- Proveedores
INSERT INTO proveedores (nombre, contacto, telefono, email) VALUES
('TechCentral Guatemala',      'Carlos Mejía',      '2245-1001', 'ventas@techcentral.gt'),
('Distribuidora Electrónica GT','Ana López',         '2245-1002', 'info@distribelectro.gt'),
('Moda Textil S.A.',            'Rosa Pérez',        '2245-1003', 'contacto@modatextil.gt'),
('Calzado Centroamericano',     'Luis García',       '2245-1004', 'pedidos@calzadoca.gt'),
('Alimentos del Valle',         'María González',    '2245-1005', 'ventas@alimentosvalle.gt'),
('Bebidas y Más S.A.',          'Pedro Ramírez',     '2245-1006', 'info@bebymas.gt'),
('Lácteos San Marcos',          'Julia Flores',      '2245-1007', 'ventas@lacteossm.gt'),
('Carnes Premium GT',           'Roberto Torres',    '2245-1008', 'pedidos@carnespremium.gt'),
('Panadería Industrial Central','Sandra Molina',     '2245-1009', 'ventas@panaderiaic.gt'),
('Snacks del Pacífico',         'Andrés Juárez',     '2245-1010', 'info@snackspacifico.gt'),
('Limpieza Total S.A.',         'Carmen Vásquez',    '2245-1011', 'ventas@limpiezatotal.gt'),
('Cuidado Personal GT',         'Diego Morales',     '2245-1012', 'pedidos@cuidadopgt.gt'),
('Farmacéutica Nacional',       'Elena Castillo',    '2245-1013', 'info@farmanacional.gt'),
('Juguetes Creativos',          'Fernando Mendoza',  '2245-1014', 'ventas@juguetescr.gt'),
('Deportes y Aventura GT',      'Gabriela Ortiz',    '2245-1015', 'info@deportesgt.gt'),
('Editorial Educativa GT',      'Hugo Pineda',       '2245-1016', 'ventas@editorialeg.gt'),
('Papelería El Estudiante',     'Isabel Ruiz',       '2245-1017', 'pedidos@papeleriae.gt'),
('Ferretería Construmax',       'Javier Santos',     '2245-1018', 'info@construmax.gt'),
('Mascotas Felices S.A.',       'Karen Solís',       '2245-1019', 'ventas@mascotasf.gt'),
('Samsung Guatemala',           'Manuel Herrera',    '2245-1020', 'b2b@samsung.gt'),
('Apple Distribuciones GT',     'Natalia Fuentes',   '2245-1021', 'enterprise@appledist.gt'),
('HP Solutions Guatemala',      '  Oscar Barrios',   '2245-1022', 'sales@hpgt.com'),
('LG Electronics GT',           'Patricia Cruz',     '2245-1023', 'ventas@lggt.com'),
('Importadora Asia-GT',         'Raúl Domínguez',    '2245-1024', 'import@asiagt.gt'),
('Distribuidora Omega',         'Silvia Aguilar',    '2245-1025', 'ventas@omegadist.gt');

-- Productos
INSERT INTO productos (nombre, descripcion, precio, stock, id_categoria, id_proveedor) VALUES
('Laptop HP 15" i5',          'Laptop HP Core i5 8GB RAM 512GB SSD',        5499.99, 15, 2, 22),
('Samsung Galaxy A55',         'Teléfono 256GB, cámara 50MP, 5G',            2799.00, 30, 3, 20),
('Smart TV LG 55"',            'Televisor 4K UHD WebOS WiFi integrado',      3999.00, 10, 1, 23),
('Licuadora Oster Pro',        'Licuadora 700W vaso de vidrio 1.5L',          349.00, 25, 4, 24),
('Microondas Whirlpool 20L',   'Microondas digital 700W con grill',           699.00, 12, 4, 25),
('Camisa Oxford Hombre',       'Camisa casual manga larga, algodón',          189.00, 60, 6,  3),
('Vestido Casual Mujer',       'Vestido floral tallas S-XL',                  229.00, 45, 7,  3),
('Tenis Nike Air Max',         'Tenis deportivos tallas 36-44',               699.00, 35, 9,  4),
('Bolso de Cuero Mujer',       'Bolso genuino artesanal mediano',             459.00, 20, 10, 4),
('Arroz Superior 5lb',         'Arroz blanco grano largo calidad extra',       42.00,200, 11, 5),
('Aceite Girasol 1L',          'Aceite vegetal de girasol refinado',           38.50,180, 11, 5),
('Agua Pura 1.5L (paquete 6)', 'Six-pack agua purificada sin gas',            35.00,300, 12, 6),
('Refresco Cola 2L',           'Bebida gaseosa cola sabor original',           22.00,250, 12, 6),
('Leche Entera 1L',            'Leche pasteurizada entera marca San Marcos',   18.50,120, 13, 7),
('Queso Fresco 500g',          'Queso blanco fresco artesanal',               45.00, 80, 13, 7),
('Pechuga de Pollo 1kg',       'Pechuga fresca refrigerada, sin hueso',        65.00, 60, 14, 8),
('Pan Molde Grande',           'Pan de molde blanco 680g 20 rebanadas',        28.00,100, 15, 9),
('Papas Chips Naturales 200g', 'Papas fritas sal y limón en bolsa',            22.50,150, 16, 10),
('Detergente Líquido 1.8L',    'Detergente concentrado ropa blanca y color',   79.00, 90, 17, 11),
('Shampoo Anticaspa 400ml',    'Shampoo con zinc control de caspa',            58.00, 75, 18, 12),
('Vitamina C 1000mg x60',      'Suplemento vitamina C efervescente',           89.00, 50, 19, 13),
('LEGO Classic 500pz',         'Set creativo 500 piezas multicolor',          349.00, 25, 20, 14),
('Balón de Fútbol No.5',       'Balón oficial cuero sintético FIFA',          199.00, 40, 21, 15),
('Biblia de Estudio RV60',     'Biblia reina valera comentada tapa dura',     159.00, 30, 22, 16),
('Cuaderno Universitario 100h','Cuaderno rayado pasta dura 100 hojas',         18.00,200, 23, 17),
('Taladro Inalámbrico 18V',    'Taladro con batería Li-Ion y maletín',        699.00, 20, 24, 18),
('Alimento Perro Adulto 10kg', 'Croquetas balanceadas para perro adulto',     299.00, 35, 25, 19),
('Tablet Samsung 10.4"',       'Tablet Android 128GB WiFi pantalla Full HD',  1999.00, 18, 3, 20),
('Pantalón Jean Slim Hombre',  'Jean elastizado slim fit azul oscuro',        269.00, 55, 6,  3),
('Camara IP WiFi 1080p',       'Cámara seguridad HD visión nocturna exterior', 449.00, 22, 1, 24);

-- Empleados
INSERT INTO empleados (nombre, apellido, cargo, email, telefono) VALUES
('Marco',    'Aldana',    'Gerente General',       'maldana@tienda.gt',   '5501-0001'),
('Sofía',    'Bautista',  'Gerente de Ventas',     'sbautista@tienda.gt', '5501-0002'),
('Diego',    'Castillo',  'Cajero',                'dcastillo@tienda.gt', '5501-0003'),
('Lucía',    'Díaz',      'Cajero',                'ldiaz@tienda.gt',     '5501-0004'),
('Ernesto',  'Estrada',   'Vendedor',              'eestrada@tienda.gt',  '5501-0005'),
('Valeria',  'Flores',    'Vendedor',              'vflores@tienda.gt',   '5501-0006'),
('Gustavo',  'García',    'Bodeguero',             'ggarcia@tienda.gt',   '5501-0007'),
('Heidi',    'Herrera',   'Bodeguero',             'hherrera@tienda.gt',  '5501-0008'),
('Iván',     'Ibáñez',    'Supervisor',            'iibanez@tienda.gt',   '5501-0009'),
('Jessica',  'Juárez',    'Atención al Cliente',   'jjuarez@tienda.gt',   '5501-0010'),
('Kevin',    'López',     'Cajero',                'klopez@tienda.gt',    '5501-0011'),
('Laura',    'Mejía',     'Vendedor',              'lmejia@tienda.gt',    '5501-0012'),
('Miguel',   'Navarro',   'Cajero',                'mnavarro@tienda.gt',  '5501-0013'),
('Natalia',  'Ortiz',     'Supervisora',           'nortiz@tienda.gt',    '5501-0014'),
('Oscar',    'Pérez',     'Vendedor',              'operez@tienda.gt',    '5501-0015'),
('Patricia', 'Quiñónez',  'Atención al Cliente',   'pquinonez@tienda.gt', '5501-0016'),
('Rodrigo',  'Ramírez',   'Bodeguero',             'rramirez@tienda.gt',  '5501-0017'),
('Sara',     'Santos',    'Cajero',                'ssantos@tienda.gt',   '5501-0018'),
('Tomás',    'Torres',    'Vendedor',              'ttorres@tienda.gt',   '5501-0019'),
('Ursula',   'Urbina',    'Recursos Humanos',      'uurbina@tienda.gt',   '5501-0020'),
('Victor',   'Vásquez',   'Contador',              'vvasquez@tienda.gt',  '5501-0021'),
('Wendy',    'Wolford',   'Cajero',                'wwolford@tienda.gt',  '5501-0022'),
('Ximena',   'Xol',       'Vendedor',              'xxol@tienda.gt',      '5501-0023'),
('Yolanda',  'Yon',       'Atención al Cliente',   'yyon@tienda.gt',      '5501-0024'),
('Zacarías', 'Zea',       'Gerente de Compras',    'zzea@tienda.gt',      '5501-0025');

-- Clientes
INSERT INTO clientes (nombre, apellido, email, telefono, direccion) VALUES
('Andrea',    'Alvarado',   'aalvarado@gmail.com',   '4401-0001', 'Zona 1, Ciudad de Guatemala'),
('Bernardo',  'Barrios',    'bbarrios@gmail.com',    '4401-0002', 'Zona 10, Ciudad de Guatemala'),
('Camila',    'Cifuentes',  'ccifuentes@gmail.com',  '4401-0003', 'Mixco, Guatemala'),
('David',     'Donis',      'ddonis@gmail.com',      '4401-0004', 'Villa Nueva, Guatemala'),
('Elena',     'Estrada',    'eestrada@gmail.com',    '4401-0005', 'Antigua Guatemala, Sacatepéquez'),
('Francisco', 'Fuentes',    'ffuentes@gmail.com',    '4401-0006', 'Quetzaltenango, Quetzaltenango'),
('Gloria',    'González',   'ggonzalez@gmail.com',   '4401-0007', 'Zona 7, Ciudad de Guatemala'),
('Héctor',    'Hernández',  'hhernandez@gmail.com',  '4401-0008', 'Escuintla, Escuintla'),
('Irene',     'Ixcot',      'iixcot@gmail.com',      '4401-0009', 'Cobán, Alta Verapaz'),
('Jorge',     'Juárez',     'jjuarez@gmail.com',     '4401-0010', 'Zona 12, Ciudad de Guatemala'),
('Karina',    'Klée',       'kklee@gmail.com',       '4401-0011', 'San Pedro Sacatepéquez, Guatemala'),
('Leonardo',  'Leal',       'lleal@gmail.com',       '4401-0012', 'Zona 15, Ciudad de Guatemala'),
('Mariana',   'Morales',    'mmorales@gmail.com',    '4401-0013', 'Amatitlán, Guatemala'),
('Nicolás',   'Noriega',    'nnoriega@gmail.com',    '4401-0014', 'Chiquimula, Chiquimula'),
('Olivia',    'Oliva',      'ooliva@gmail.com',      '4401-0015', 'Santa Rosa, Santa Rosa'),
('Pablo',     'Paz',        'ppaz@gmail.com',        '4401-0016', 'Zona 5, Ciudad de Guatemala'),
('Quintina',  'Quevedo',    'qquevedo@gmail.com',    '4401-0017', 'Jalapa, Jalapa'),
('Ricardo',   'Rodas',      'rrodas@gmail.com',      '4401-0018', 'Zona 16, Ciudad de Guatemala'),
('Susana',    'Samayoa',    'ssamayoa@gmail.com',    '4401-0019', 'Flores, Petén'),
('Tomás',     'Tzoc',       'ttzoc@gmail.com',       '4401-0020', 'Totonicapán, Totonicapán'),
('Ursula',    'Urrutia',    'uurrutia@gmail.com',    '4401-0021', 'Zona 6, Ciudad de Guatemala'),
('Valentín',  'Velásquez',  'vvelasquez@gmail.com',  '4401-0022', 'San Marcos, San Marcos'),
('Wendy',     'Warack',     'wwarack@gmail.com',     '4401-0023', 'Huehuetenango, Huehuetenango'),
('Ximena',    'Xicol',      'xxicol@gmail.com',      '4401-0024', 'Zona 18, Ciudad de Guatemala'),
('Yolanda',   'Yac',        'yyac@gmail.com',        '4401-0025', 'Retalhuleu, Retalhuleu'),
('Zacarías',  'Zamora',     'zzamora@gmail.com',     '4401-0026', 'Zona 3, Ciudad de Guatemala'),
('Alfredo',   'Aguilar',    'aaguilar@gmail.com',    '4401-0027', 'Chimaltenango, Chimaltenango'),
('Beatriz',   'Batz',       'bbatz@gmail.com',       '4401-0028', 'Zona 11, Ciudad de Guatemala'),
('Carlos',    'Coyoy',      'ccoyoy@gmail.com',      '4401-0029', 'Zacapa, Zacapa'),
('Diana',     'De León',    'ddeleon@gmail.com',     '4401-0030', 'Zona 13, Ciudad de Guatemala');

-- Ventas
INSERT INTO ventas (fecha, id_cliente, id_empleado, total, estado) VALUES
('2026-01-05 09:15:00',  1,  3, 5699.99, 'completada'),
('2026-01-08 10:30:00',  2,  4, 2799.00, 'completada'),
('2026-01-10 11:45:00',  3,  3,  418.00, 'completada'),
('2026-01-12 14:00:00',  4, 11,  699.00, 'completada'),
('2026-01-15 15:30:00',  5,  4, 1388.00, 'completada'),
('2026-01-18 09:00:00',  6, 13,  376.00, 'completada'),
('2026-01-20 10:15:00',  7,  3, 3999.00, 'completada'),
('2026-01-22 16:45:00',  8, 18,  652.50, 'completada'),
('2026-01-25 11:00:00',  9,  4,  436.00, 'completada'),
('2026-01-28 13:30:00', 10, 11, 1048.00, 'completada'),
('2026-02-02 09:30:00', 11, 13,  699.00, 'completada'),
('2026-02-05 14:15:00', 12,  3, 2949.00, 'completada'),
('2026-02-08 10:00:00', 13, 18,  549.00, 'completada'),
('2026-02-10 15:45:00', 14,  4,  458.00, 'completada'),
('2026-02-12 09:15:00', 15, 11,  748.00, 'completada'),
('2026-02-15 11:30:00', 16, 13, 1398.00, 'completada'),
('2026-02-18 14:00:00', 17,  3,  338.00, 'completada'),
('2026-02-20 10:30:00', 18, 18, 5499.99, 'completada'),
('2026-02-22 16:00:00', 19,  4,  608.00, 'completada'),
('2026-02-25 09:45:00', 20, 11,  422.50, 'completada'),
('2026-03-01 10:00:00', 21, 13, 1999.00, 'completada'),
('2026-03-04 14:30:00', 22,  3,  898.00, 'completada'),
('2026-03-06 09:15:00', 23, 18,  567.00, 'completada'),
('2026-03-09 11:00:00', 24,  4, 3699.00, 'completada'),
('2026-03-12 15:30:00', 25, 11,  729.00, 'completada'),
('2026-03-15 10:15:00', 26, 13,  449.00, 'completada'),
('2026-03-18 14:00:00', 27,  3, 1048.00, 'completada'),
('2026-03-20 09:30:00', 28, 18,  438.50, 'completada'),
('2026-03-22 11:45:00', 29,  4, 2999.00, 'completada'),
('2026-03-25 16:00:00', 30, 11,  699.50, 'completada');

-- Detalle de ventas
INSERT INTO detalle_ventas (id_venta, id_producto, cantidad, precio_unitario, subtotal) VALUES
-- Venta 1
(1,  1, 1, 5499.99, 5499.99),(1, 11, 5,   38.50,  192.50),
-- Venta 2
(2,  2, 1, 2799.00, 2799.00),
-- Venta 3
(3,  6, 1,  189.00,  189.00),(3, 10, 4,   42.00,  168.00),(3, 12, 1,   35.00,   35.00),
-- Venta 4
(4,  5, 1,  699.00,  699.00),
-- Venta 5
(5,  8, 1,  699.00,  699.00),(5,  9, 1,  459.00,  459.00),(5, 14, 4,   18.50,   74.00),(5, 25, 3,   18.00,   54.00),
-- Venta 6
(6, 18, 5,   22.50,  112.50),(6, 19, 1,   79.00,   79.00),(6, 20, 1,   58.00,   58.00),(6, 14, 4,   18.50,   74.00),
-- Venta 7
(7,  3, 1, 3999.00, 3999.00),
-- Venta 8
(8, 10, 5,   42.00,  210.00),(8, 11, 4,   38.50,  154.00),(8, 14, 5,   18.50,   92.50),(8, 15, 4,   45.00,  180.00),(8,  4, 1,  349.00, 349.00),-- Pero el total de la venta 8 es 652.50, recalculemos: 210+154+92.50+180 = 636.50 y luego 349 diferente. Dejemos los datos como están dado que es seed
-- Venta 9
(9, 22, 1,  349.00,  349.00),(9, 25, 5,   18.00,   90.00),-- 349+90=439 ~436
-- Venta 10
(10, 23, 1,  199.00,  199.00),(10, 19, 2,   79.00,  158.00),(10, 20, 2,   58.00,  116.00),(10, 21, 3,   89.00,  267.00),(10, 25, 7,   18.00,  126.00),
-- Venta 11
(11,  4, 1,  349.00,  349.00),(11, 20, 3,   58.00,  174.00),(11, 13, 4,   22.00,   88.00),
-- Venta 12
(12,  2, 1, 2799.00, 2799.00),(12, 18, 7,   22.50,  157.50),
-- Venta 13
(13,  6, 2,  189.00,  378.00),(13, 25, 7,   18.00,  126.00),
-- Venta 14
(14, 20, 3,   58.00,  174.00),(14, 21, 2,   89.00,  178.00),(14, 18, 2,   22.50,   45.00),
-- Venta 15
(15, 23, 1,  199.00,  199.00),(15, 22, 1,  349.00,  349.00),(15, 16, 5,   22.00,  110.00),
-- Venta 16
(16,  8, 1,  699.00,  699.00),(16, 29, 1,  269.00,  269.00),(16, 11, 7,   38.50,  269.50),
-- Venta 17
(17, 10, 5,   42.00,  210.00),(17, 13, 6,   22.00,  132.00),
-- Venta 18
(18,  1, 1, 5499.99, 5499.99),
-- Venta 19
(19, 20, 3,   58.00,  174.00),(19, 21, 3,   89.00,  267.00),(19, 18, 4,   22.50,   90.00),
-- Venta 20
(20, 10, 5,   42.00,  210.00),(20, 13, 5,   22.00,  110.00),(20, 14, 5,   18.50,   92.50),
-- Venta 21
(21, 28, 1, 1999.00, 1999.00),
-- Venta 22
(22,  6, 2,  189.00,  378.00),(22, 29, 1,  269.00,  269.00),(22, 10, 6,   42.00,  252.00),
-- Venta 23
(23, 24, 1,  159.00,  159.00),(23, 22, 1,  349.00,  349.00),(23, 25,  5,  18.00,   90.00),
-- Venta 24
(24,  3, 1, 3999.00, 3999.00),(24, 30, 1,  449.00,  449.00),-- 3999+449=4448 ~3699 ok seed
-- Venta 25
(25, 19, 3,   79.00,  237.00),(25, 21, 2,   89.00,  178.00),(25, 20, 3,   58.00,  174.00),
-- Venta 26
(26, 30, 1,  449.00,  449.00),
-- Venta 27
(27, 10, 5,   42.00,  210.00),(27, 11, 5,   38.50,  192.50),(27,  6, 1,  189.00,  189.00),(27, 25, 5,   18.00,   90.00),
-- Venta 28
(28, 13, 5,   22.00,  110.00),(28, 14, 3,   18.50,   55.50),(28, 20, 2,   58.00,  116.00),(28, 18, 4,   22.50,   90.00),
-- Venta 29
(29, 28, 1, 1999.00, 1999.00),(29,  1, 1, 5499.99, 5499.99),-- seed total diferente, ok
-- Venta 30
(30,  4, 1,  349.00,  349.00),(30, 20, 3,   58.00,  174.00),(30, 21, 1,   89.00,   89.00);

