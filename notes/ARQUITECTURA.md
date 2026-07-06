# 🏗️ Arquitectura del Proyecto InkaGrill
 
## 📋 Tabla de Contenidos
1. [Visión General](#visión-general)
2. [Estructura de Archivos](#estructura-de-archivos)
3. [Flujo de Datos](#flujo-de-datos)
4. [Comunicación Frontend-Backend](#comunicación-frontend-backend)
5. [Base de Datos](#base-de-datos)
6. [Explicación de Cada Archivo](#explicación-de-cada-archivo)
7. [Diagramas de Flujo](#diagramas-de-flujo)
 
---
 
## Visión General
 
InkaGrill es una aplicación web de restaurante construida con una arquitectura cliente-servidor tradicional:
 
```
┌─────────────┐      HTTP/AJAX       ┌─────────────┐      SQL      ┌─────────────┐
│   CLIENTE   │ ◄─────────────────► │   SERVIDOR  │ ◄────────────► │  BASE DE    │
│  (Browser)  │    JSON Response     │    (PHP)    │   Queries     │    DATOS    │
└─────────────┘                      └─────────────┘               └─────────────┘
   HTML/CSS/JS                           API REST                      MySQL
```
 
**Tecnologías:**
- **Frontend**: HTML5, CSS3, JavaScript (Vanilla)
- **Backend**: PHP 7.4+
- **Base de Datos**: MySQL 5.7+
- **Comunicación**: REST API (JSON)
 
---
 
## Estructura de Archivos
 
```
inkagrill/
│
├── 📄 index.html              # Página principal del sitio web
├── 📄 admin.html              # Panel de administración
│
├── 📁 css/
│   ├── styles.css             # Estilos de la página principal
│   └── admin.css              # Estilos del panel admin
│
├── 📁 js/
│   ├── main.js                # Lógica del frontend principal
│   └── admin.js               # Lógica del panel admin
│
├── 📁 api/
│   ├── config.php             # Configuración de base de datos
│   ├── reservations.php       # API para gestión de reservas
│   └── menu.php               # API para gestión de menú
│
├── 📁 scripts/
│   └── database.sql           # Script de creación de base de datos
│
├── 📄 README.md               # Guía de instalación y uso
└── 📄 ARQUITECTURA.md         # Este archivo (documentación técnica)
```
 
---
 
## Flujo de Datos
 
### 1. Carga Inicial del Sitio Web
 
```
Usuario → index.html → main.js → API (menu.php) → MySQL → JSON Response → main.js → DOM
```
 
**Paso a paso:**
1. Usuario accede a `http://localhost/inkagrill/index.html`
2. El navegador carga `index.html`
3. El HTML carga los archivos CSS (`css/styles.css`) y JS (`js/main.js`)
4. `main.js` ejecuta la función `loadMenu()` al cargar la página
5. `loadMenu()` hace una petición AJAX GET a `api/menu.php`
6. `menu.php` se conecta a MySQL usando `config.php`
7. `menu.php` ejecuta queries SQL para obtener categorías y platos
8. `menu.php` devuelve datos en formato JSON
9. `main.js` recibe el JSON y renderiza el menú en el DOM
 
### 2. Crear una Reserva
 
```
Usuario → Formulario → main.js → Validación → API (reservations.php) → MySQL → Confirmación
```
 
**Paso a paso:**
1. Usuario completa el formulario de reservas
2. Usuario hace clic en "Enviar Reserva"
3. `main.js` captura el evento submit del formulario
4. JavaScript valida los datos localmente (campos requeridos, formato de email)
5. `main.js` envía POST request a `api/reservations.php` con datos JSON
6. `reservations.php` valida los datos en el servidor
7. `reservations.php` inserta la reserva en la tabla `reservations`
8. `reservations.php` devuelve JSON con `{success: true}`
9. `main.js` muestra mensaje de confirmación al usuario
10. El formulario se limpia automáticamente
 
### 3. Panel de Administración
 
```
Admin → admin.html → admin.js → API → MySQL → Tabla de Datos → Acciones CRUD
```
 
**Paso a paso:**
1. Administrador accede a `http://localhost/inkagrill/admin.html`
2. `admin.js` se ejecuta y carga datos:
   - Llama a `loadReservations()` → GET `api/reservations.php`
   - Llama a `loadMenu()` → GET `api/menu.php`
3. Los datos se renderizan en tablas HTML
4. Admin puede realizar acciones:
   - **Confirmar reserva**: PUT request a `reservations.php`
   - **Eliminar reserva**: DELETE request a `reservations.php`
   - **Editar menú**: PUT request a `menu.php`
   - **Agregar plato**: POST request a `menu.php`
 
---
 
## Comunicación Frontend-Backend
 
### Protocolo: REST API con JSON
 
Todas las comunicaciones entre frontend y backend siguen el patrón REST:
 
#### GET - Obtener Datos
```javascript
// Frontend (main.js)
fetch('api/menu.php')
  .then(response => response.json())
  .then(data => console.log(data));
 
// Backend (menu.php) responde:
[
  {
    "id": 1,
    "name": "Entradas",
    "items": [
      {"id": 1, "name": "Empanadas", "price": 150}
    ]
  }
]
```
 
#### POST - Crear Datos
```javascript
// Frontend (main.js)
fetch('api/reservations.php', {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({
    name: 'Juan Pérez',
    email: 'juan@ejemplo.com',
    // ... más datos
  })
});
 
// Backend (reservations.php) responde:
{
  "success": true,
  "id": 42,
  "message": "Reserva creada exitosamente"
}
```
 
#### PUT - Actualizar Datos
```javascript
// Frontend (admin.js)
fetch('api/reservations.php', {
  method: 'PUT',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({
    id: 5,
    status: 'confirmed'
  })
});
```
 
#### DELETE - Eliminar Datos
```javascript
// Frontend (admin.js)
fetch(`api/reservations.php?id=${id}`, {
  method: 'DELETE'
});
```
 
---
 
## Base de Datos
 
### Diagrama de Relaciones
 
```
┌─────────────────────┐
│  menu_categories    │
├─────────────────────┤
│ id (PK)             │
│ name                │
│ display_order       │
│ created_at          │
└──────────┬──────────┘
           │ 1
           │
           │ N
┌──────────▼──────────┐
│    menu_items       │
├─────────────────────┤
│ id (PK)             │
│ category_id (FK)    │◄───── Relación: Una categoría tiene muchos platos
│ name                │
│ description         │
│ price               │
│ display_order       │
│ created_at          │
└─────────────────────┘
 
┌─────────────────────┐
│   reservations      │      (Tabla independiente)
├─────────────────────┤
│ id (PK)             │
│ name                │
│ email               │
│ phone               │
│ reservation_date    │
│ reservation_time    │
│ guests              │
│ message             │
│ status              │
│ created_at          │
└─────────────────────┘
```
 
### Relaciones
- **menu_categories** ↔ **menu_items**: Relación 1:N (una categoría tiene muchos platos)
- **reservations**: Tabla independiente sin relaciones
 
---
 
## Explicación de Cada Archivo
 
### 📄 index.html
 
**Propósito**: Página principal del restaurante
 
**Estructura HTML:**
```html
<!DOCTYPE html>
<html>
<head>
  <!-- Metadatos, título, enlaces a CSS -->
  <link rel="stylesheet" href="css/styles.css">
<headd>
<body>
  <!-- Navbar de navegación -->
  <nav id="navbar">...<navv>
 
  <!-- Hero Section (portada) -->
  <section id="hero">...<sectionn>
 
  <!-- About Section (sobre nosotros) -->
  <section id="about">...<sectionn>
 
  <!-- Menu Section (menú dinámico) -->
  <section id="menu">
    <div id="menu-categories"><divv> <!-- Pestañas de categorías -->
    <div id="menu-items"><divv>      <!-- Platos de cada categoría -->
  <sectionn>
 
  <!-- Gallery Section -->
  <section id="gallery">...<sectionn>
 
  <!-- Location Section -->
  <section id="location">...<sectionn>
 
  <!-- Contact Section (formulario de reservas) -->
  <section id="contact">
    <form id="reservation-form">...<formm>
  <sectionn>
 
  <!-- Footer -->
  <footer>...<footerr>
 
  <!-- Botón flotante de WhatsApp -->
  <a href="https://wa.me/..." class="whatsapp-float">...<aa>
 
  <!-- JavaScript -->
  <script src="js/main.js"><scriptt>
<bodyy>
<htmll>
```
 
**Interacciones:**
- Carga `css/styles.css` para estilos
- Carga `js/main.js` para funcionalidad
- El formulario #reservation-form envía datos a la API
 
---
 
### 📄 admin.html
 
**Propósito**: Panel de administración para gestionar reservas y menú
 
**Estructura HTML:**
```html
<!DOCTYPE html>
<html>
<head>
  <link rel="stylesheet" href="css/admin.css">
<headd>
<body>
  <!-- Navbar admin -->
  <nav>...<navv>
 
  <!-- Sección de Estadísticas -->
  <section id="stats">
    <div>Total Reservas: <span id="total-reservations"><spann><divv>
    <div>Pendientes: <span id="pending-reservations"><spann><divv>
    <div>Confirmadas: <span id="confirmed-reservations"><spann><divv>
  <sectionn>
 
  <!-- Sección de Reservas -->
  <section id="reservations-section">
    <table id="reservations-table">...<tablee>
  <sectionn>
 
  <!-- Sección de Menú -->
  <section id="menu-section">
    <div id="menu-admin">...<divv>
  <sectionn>
 
  <script src="js/admin.js"><scriptt>
<bodyy>
<htmll>
```
 
---
 
### 📄 css/styles.css
 
**Propósito**: Estilos visuales de la página principal
 
**Estructura:**
```css
/* Variables CSS globales */
:root {
  --primary-color: #c54620;
  --secondary-color: #8b2e16;
  --accent-color: #ffd700;
  --text-color: #333;
  --bg-color: #fff;
}
 
/* Reset básico */
* { margin: 0; padding: 0; box-sizing: border-box; }
 
/* Navbar */
#navbar { /* estilos del menú de navegación */ }
 
/* Hero Section */
#hero { /* estilos de la portada */ }
 
/* About Section */
#about { /* estilos de sobre nosotros */ }
 
/* Menu Section */
#menu { /* estilos del menú dinámico */ }
.menu-category-btn { /* botones de categorías */ }
.menu-item { /* tarjetas de platos */ }
 
/* Gallery */
#gallery { /* estilos de galería de fotos */ }
 
/* Location */
#location { /* estilos de ubicación y mapa */ }
 
/* Contact Form */
#contact form { /* estilos del formulario */ }
 
/* WhatsApp Float Button */
.whatsapp-float { /* botón flotante */ }
 
/* Responsive */
@media (max-width: 768px) {
  /* estilos para móviles */
}
```
 
---
 
### 📄 js/main.js
 
**Propósito**: Lógica del frontend principal
 
**Funciones principales:**
 
```javascript
// 1. Navegación suave entre secciones
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', smoothScroll);
});
 
// 2. Cargar menú desde la API
async function loadMenu() {
  const response = await fetch('api/menu.php');
  const categories = await response.json();
 
  // Renderizar categorías (pestañas)
  renderCategories(categories);
 
  // Renderizar platos de la primera categoría
  renderMenuItems(categories[0].items);
}
 
// 3. Renderizar categorías como pestañas
function renderCategories(categories) {
  const container = document.getElementById('menu-categories');
  categories.forEach(category => {
    const button = document.createElement('button');
    button.textContent = category.name;
    button.onclick = () => showCategory(category.id);
    container.appendChild(button);
  });
}
 
// 4. Renderizar platos de una categoría
function renderMenuItems(items) {
  const container = document.getElementById('menu-items');
  container.innerHTML = '';
  items.forEach(item => {
    const card = `
      <div class="menu-item">
        <h3>${item.name}<h33>
        <p>${item.description}<pp>
        <span class="price">$${item.price}<spann>
      <divv>
    `;
    container.innerHTML += card;
  });
}
 
// 5. Manejar envío de formulario de reservas
document.getElementById('reservation-form')
  .addEventListener('submit', async (e) => {
    e.preventDefault();
 
    // Obtener datos del formulario
    const formData = {
      name: document.getElementById('name').value,
      email: document.getElementById('email').value,
      phone: document.getElementById('phone').value,
      date: document.getElementById('date').value,
      time: document.getElementById('time').value,
      guests: document.getElementById('guests').value,
      message: document.getElementById('message').value
    };
 
    // Enviar a la API
    const response = await fetch('api/reservations.php', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(formData)
    });
 
    const result = await response.json();
 
    if (result.success) {
      alert('Reserva creada exitosamente');
      e.target.reset(); // Limpiar formulario
    } else {
      alert('Error: ' + result.message);
    }
  });
 
// Ejecutar al cargar la página
document.addEventListener('DOMContentLoaded', () => {
  loadMenu();
});
```
 
**Flujo de ejecución:**
1. Página carga → `DOMContentLoaded` evento se dispara
2. Se ejecuta `loadMenu()`
3. Se configuran event listeners para navegación y formularios
4. Usuario interactúa → JavaScript responde
 
---
 
### 📄 js/admin.js
 
**Propósito**: Lógica del panel de administración
 
**Funciones principales:**
 
```javascript
// 1. Cargar todas las reservas
async function loadReservations() {
  const response = await fetch('api/reservations.php');
  const reservations = await response.json();
 
  renderReservationsTable(reservations);
  updateStats(reservations);
}
 
// 2. Renderizar tabla de reservas
function renderReservationsTable(reservations) {
  const tbody = document.querySelector('#reservations-table tbody');
  tbody.innerHTML = '';
 
  reservations.forEach(reservation => {
    const row = `
      <tr>
        <td>${reservation.id}<tdd>
        <td>${reservation.name}<tdd>
        <td>${reservation.email}<tdd>
        <td>${reservation.phone}<tdd>
        <td>${reservation.reservation_date}<tdd>
        <td>${reservation.reservation_time}<tdd>
        <td>${reservation.guests}<tdd>
        <td>${reservation.status}<tdd>
        <td>
          <button onclick="confirmReservation(${reservation.id})">
            Confirmar
          <buttonn>
          <button onclick="deleteReservation(${reservation.id})">
            Eliminar
          <buttonn>
        <tdd>
      <trr>
    `;
    tbody.innerHTML += row;
  });
}
 
// 3. Actualizar estadísticas
function updateStats(reservations) {
  document.getElementById('total-reservations').textContent = 
    reservations.length;
 
  document.getElementById('pending-reservations').textContent = 
    reservations.filter(r => r.status === 'pending').length;
 
  document.getElementById('confirmed-reservations').textContent = 
    reservations.filter(r => r.status === 'confirmed').length;
}
 
// 4. Confirmar una reserva
async function confirmReservation(id) {
  const response = await fetch('api/reservations.php', {
    method: 'PUT',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({ id, status: 'confirmed' })
  });
 
  if (response.ok) {
    loadReservations(); // Recargar tabla
  }
}
 
// 5. Eliminar una reserva
async function deleteReservation(id) {
  if (!confirm('¿Eliminar esta reserva?')) return;
 
  const response = await fetch(`api/reservations.php?id=${id}`, {
    method: 'DELETE'
  });
 
  if (response.ok) {
    loadReservations(); // Recargar tabla
  }
}
 
// 6. Cargar menú para gestión
async function loadMenu() {
  const response = await fetch('api/menu.php');
  const categories = await response.json();
  renderMenuAdmin(categories);
}
 
// 7. Agregar nuevo plato
async function addMenuItem(categoryId, itemData) {
  const response = await fetch('api/menu.php', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({
      category_id: categoryId,
      ...itemData
    })
  });
 
  if (response.ok) {
    loadMenu(); // Recargar menú
  }
}
 
// Ejecutar al cargar
document.addEventListener('DOMContentLoaded', () => {
  loadReservations();
  loadMenu();
});
```
 
---
 
### 📄 api/config.php
 
**Propósito**: Configuración de conexión a base de datos
 
**Código:**
```php
<?php
// Configuración de base de datos
define('DB_HOST', 'localhost');
define('DB_NAME', 'inkagrill_db');
define('DB_USER', 'root');
define('DB_PASS', '');
 
// Headers CORS (permitir peticiones desde el frontend)
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json; charset=UTF-8');
 
// Manejar peticiones OPTIONS (preflight)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}
 
// Crear conexión con PDO
try {
    $conn = new PDO(
        "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=utf8mb4",
        DB_USER,
        DB_PASS,
        [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false
        ]
    );
} catch(PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Error de conexión: ' . $e->getMessage()
    ]);
    exit();
}
?>
```
 
**¿Qué hace?**
1. Define constantes de conexión (host, nombre BD, usuario, contraseña)
2. Configura headers CORS para permitir peticiones AJAX
3. Crea objeto PDO para conectarse a MySQL
4. Maneja errores de conexión
 
**¿Quién lo usa?**
- `api/reservations.php`
- `api/menu.php`
 
Ambos archivos incluyen este archivo con `require_once 'config.php';`
 
---
 
### 📄 api/reservations.php
 
**Propósito**: API REST para gestión de reservas
 
**Estructura:**
```php
<?php
require_once 'config.php'; // Incluir conexión a BD
 
$method = $_SERVER['REQUEST_METHOD'];
 
switch ($method) {
    case 'GET':
        // Obtener todas las reservas
        $stmt = $conn->query("
            SELECT * FROM reservations 
            ORDER BY reservation_date DESC, reservation_time DESC
        ");
        $reservations = $stmt->fetchAll();
        echo json_encode($reservations);
        break;
 
    case 'POST':
        // Crear nueva reserva
        $data = json_decode(file_get_contents('php://input'), true);
 
        // Validar datos
        if (!$data['name'] || !$data['email'] || !$data['phone']) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Datos incompletos']);
            exit();
        }
 
        // Insertar en base de datos
        $stmt = $conn->prepare("
            INSERT INTO reservations 
            (name, email, phone, reservation_date, reservation_time, 
             guests, message, status) 
            VALUES 
            (?, ?, ?, ?, ?, ?, ?, 'pending')
        ");
 
        $stmt->execute([
            $data['name'],
            $data['email'],
            $data['phone'],
            $data['date'],
            $data['time'],
            $data['guests'],
            $data['message'] ?? ''
        ]);
 
        echo json_encode([
            'success' => true,
            'id' => $conn->lastInsertId(),
            'message' => 'Reserva creada exitosamente'
        ]);
        break;
 
    case 'PUT':
        // Actualizar estado de reserva
        $data = json_decode(file_get_contents('php://input'), true);
 
        $stmt = $conn->prepare("
            UPDATE reservations 
            SET status = ? 
            WHERE id = ?
        ");
 
        $stmt->execute([$data['status'], $data['id']]);
 
        echo json_encode(['success' => true]);
        break;
 
    case 'DELETE':
        // Eliminar reserva
        $id = $_GET['id'];
 
        $stmt = $conn->prepare("DELETE FROM reservations WHERE id = ?");
        $stmt->execute([$id]);
 
        echo json_encode(['success' => true]);
        break;
 
    default:
        http_response_code(405);
        echo json_encode(['error' => 'Método no permitido']);
}
?>
```
 
**Flujo de ejecución:**
1. Incluye `config.php` para obtener conexión `$conn`
2. Detecta el método HTTP (GET, POST, PUT, DELETE)
3. Ejecuta el código correspondiente al método
4. Devuelve respuesta JSON
 
---
 
### 📄 api/menu.php
 
**Propósito**: API REST para gestión del menú
 
**Estructura similar a reservations.php:**
```php
<?php
require_once 'config.php';
 
$method = $_SERVER['REQUEST_METHOD'];
 
switch ($method) {
    case 'GET':
        // Obtener menú completo
        $stmt = $conn->query("
            SELECT * FROM menu_categories 
            ORDER BY display_order
        ");
        $categories = $stmt->fetchAll();
 
        // Para cada categoría, obtener sus platos
        foreach ($categories as &$category) {
            $stmt = $conn->prepare("
                SELECT * FROM menu_items 
                WHERE category_id = ? 
                ORDER BY display_order
            ");
            $stmt->execute([$category['id']]);
            $category['items'] = $stmt->fetchAll();
        }
 
        echo json_encode($categories);
        break;
 
    case 'POST':
        // Agregar categoría o plato
        // (código similar a reservations.php)
        break;
 
    case 'PUT':
        // Actualizar categoría o plato
        break;
 
    case 'DELETE':
        // Eliminar categoría o plato
        break;
}
?>
```
 
---
 
### 📄 scripts/database.sql
 
**Propósito**: Script SQL para crear la base de datos y tablas
 
**Contenido:**
```sql
-- Crear base de datos
CREATE DATABASE IF NOT EXISTS inkagrill_db 
CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
 
USE inkagrill_db;
 
-- Tabla de categorías del menú
CREATE TABLE menu_categories (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    display_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
 
-- Tabla de platos del menú
CREATE TABLE menu_items (
    id INT PRIMARY KEY AUTO_INCREMENT,
    category_id INT NOT NULL,
    name VARCHAR(150) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    display_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES menu_categories(id) 
        ON DELETE CASCADE
);
 
-- Tabla de reservas
CREATE TABLE reservations (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    reservation_date DATE NOT NULL,
    reservation_time TIME NOT NULL,
    guests INT NOT NULL,
    message TEXT,
    status ENUM('pending', 'confirmed', 'cancelled') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
 
-- Datos de ejemplo
INSERT INTO menu_categories (name, display_order) VALUES
('Entradas', 1),
('Parrilla', 2),
('Cocina Peruana', 3),
('Postres', 4),
('Bebidas', 5);
 
INSERT INTO menu_items (category_id, name, description, price, display_order) VALUES
(1, 'Empanadas', 'Empanadas argentinas artesanales', 150.00, 1),
(2, 'Bife de Chorizo', 'Corte argentino premium 400g', 1500.00, 1),
(3, 'Ceviche', 'Ceviche peruano tradicional', 850.00, 1),
(4, 'Flan Casero', 'Flan con dulce de leche', 350.00, 1),
(5, 'Malbec', 'Vino tinto argentino', 800.00, 1);
```
 
---
 
## Diagramas de Flujo
 
### Flujo 1: Cargar Menú en la Página Principal
 
```
┌──────────────┐
│ Usuario entra│
│  al sitio    │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│ Browser carga│
│  index.html  │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│Browser carga │
│   main.js    │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│DOMContentLoad│
│ evento activo│
└──────┬───────┘
       │
       ▼
┌──────────────┐
│loadMenu()    │
│   ejecuta    │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│ GET request  │
│api/menu.php  │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│ menu.php     │
│  conecta BD  │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│SELECT        │
│categories    │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│Para cada cat │
│SELECT items  │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│ Devuelve     │
│    JSON      │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│main.js recibe│
│    datos     │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│renderiza     │
│categorías    │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│renderiza     │
│  platos      │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│Usuario ve el │
│    menú      │
└──────────────┘
```
 
### Flujo 2: Crear una Reserva
 
```
┌──────────────┐
│Usuario llena │
│  formulario  │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│Usuario click │
│ "Enviar"     │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│main.js capta │
│ submit event │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│Previene      │
│ reload con   │
│e.preventDef. │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│Valida datos  │
│ localmente   │
└──────┬───────┘
       │
       ▼
   ┌───┴───┐
   │Válidos│
   └───┬───┘
       │ No
       ▼
┌──────────────┐
│Muestra error │
│   al usuario │
└──────────────┘
 
       │ Sí
       ▼
┌──────────────┐
│POST request  │
│reservations  │
│  .php        │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│reservations  │
│.php recibe   │
│   JSON       │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│Valida datos  │
│en servidor   │
└──────┬───────┘
       │
       ▼
   ┌───┴───┐
   │Válidos│
   └───┬───┘
       │ No
       ▼
┌──────────────┐
│Devuelve error│
│ HTTP 400     │
└──────────────┘
 
       │ Sí
       ▼
┌──────────────┐
│INSERT INTO   │
│ reservations │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│Devuelve JSON │
│{success:true}│
└──────┬───────┘
       │
       ▼
┌──────────────┐
│main.js recibe│
│  respuesta   │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│Muestra alert │
│"Reserva OK"  │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│Limpia form   │
└──────────────┘
```
 
### Flujo 3: Admin Confirma una Reserva
 
```
┌──────────────┐
│Admin ve tabla│
│ de reservas  │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│Admin click   │
│ "Confirmar"  │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│admin.js llama│
│confirmReserv.│
└──────┬───────┘
       │
       ▼
┌──────────────┐
│PUT request   │
│reservations  │
│  .php        │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│reservations  │
│.php recibe   │
│{id, status}  │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│UPDATE        │
│reservations  │
│SET status    │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│Devuelve      │
│{success:true}│
└──────┬───────┘
       │
       ▼
┌──────────────┐
│admin.js      │
│recarga tabla │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│Admin ve      │
│estado nuevo  │
└──────────────┘
```
 
---
 
## Resumen de Comunicación
 
### index.html ↔ main.js ↔ API
```
index.html (DOM) 
    ↕ (manipulación DOM)
main.js (lógica)
    ↕ (AJAX fetch)
api/menu.php (backend)
api/reservations.php (backend)
    ↕ (SQL queries)
MySQL (base de datos)
```
 
### admin.html ↔ admin.js ↔ API
```
admin.html (DOM)
    ↕ (manipulación DOM)
admin.js (lógica)
    ↕ (AJAX fetch con GET/POST/PUT/DELETE)
api/menu.php (backend)
api/reservations.php (backend)
    ↕ (SQL queries)
MySQL (base de datos)
```
 
### Flujo completo de datos
```
1. Usuario (Browser)
   ↓
2. Frontend (HTML/CSS/JS)
   ↓ HTTP Request (JSON)
3. Backend (PHP APIs)
   ↓ SQL Queries
4. Base de Datos (MySQL)
   ↑ SQL Results
5. Backend (PHP APIs)
   ↑ HTTP Response (JSON)
6. Frontend (HTML/CSS/JS)
   ↑
7. Usuario (Browser)
```
 
---
 
## Conclusión
 
Esta arquitectura sigue el patrón **MVC (Modelo-Vista-Controlador)** adaptado:
 
- **Modelo**: Base de datos MySQL + api/config.php
- **Vista**: HTML + CSS
- **Controlador**: JavaScript (main.js, admin.js) + PHP APIs (menu.php, reservations.php)
 
La comunicación es totalmente asíncrona mediante AJAX con formato JSON, lo que permite una experiencia de usuario fluida sin recargas de página.