CREATE DATABASE IF NOT EXISTS inkagrill CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE inkagrill;

-- Tabla de usuarios para administración
CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  username VARCHAR(50) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de categorías del menú
CREATE TABLE IF NOT EXISTS menu_categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    display_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de items del menú
CREATE TABLE IF NOT EXISTS menu_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    category_id INT NOT NULL,
    name VARCHAR(150) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    display_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES menu_categories(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de reservaciones
CREATE TABLE IF NOT EXISTS reservations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    email VARCHAR(150) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    guests INT NOT NULL,
    reservation_date DATE NOT NULL,
    reservation_time TIME NOT NULL,
    message TEXT,
    status ENUM('pending', 'confirmed', 'cancelled') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insertar categorías iniciales
INSERT INTO menu_categories (name, display_order) VALUES
('Parrilla Argentina', 1),
('Cocina Peruana', 2),
('Bebidas', 3),
('Postres', 4);

-- Insertar items de ejemplo
INSERT INTO menu_items (category_id, name, description, price, display_order) VALUES
-- Parrilla Argentina
(1, 'Bife de Chorizo', 'Corte premium de 400g a la parrilla con chimichurri', 4500.00, 1),
(1, 'Asado de Tira', 'Costillas jugosas cocinadas a la parrilla argentina', 3800.00, 2),
(1, 'Vacío', 'Corte tradicional argentino de 350g con guarnición', 4200.00, 3),
(1, 'Parrillada Completa', 'Selección de carnes premium para 2 personas', 8500.00, 4),

-- Cocina Peruana
(2, 'Ceviche Clásico', 'Pescado fresco marinado en limón con ají y cebolla', 3200.00, 1),
(2, 'Lomo Saltado', 'Tiras de lomo salteadas con papas fritas y arroz', 3500.00, 2),
(2, 'Ají de Gallina', 'Pollo desmechado en salsa cremosa de ají amarillo', 2800.00, 3),
(2, 'Causa Limeña', 'Capas de papa amarilla con relleno de pollo', 2200.00, 4),

-- Bebidas
(3, 'Vino Malbec', 'Copa de vino tinto argentino premium', 800.00, 1),
(3, 'Pisco Sour', 'Cóctel peruano tradicional', 650.00, 2),
(3, 'Cerveza Artesanal', 'Selección de cervezas locales', 550.00, 3),
(3, 'Chicha Morada', 'Bebida tradicional peruana', 450.00, 4),

-- Postres
(4, 'Alfajores', 'Dulce tradicional argentino con dulce de leche', 550.00, 1),
(4, 'Suspiro Limeño', 'Postre peruano de manjar blanco y merengue', 600.00, 2),
(4, 'Flan Casero', 'Flan de vainilla con caramelo', 500.00, 3),
(4, 'Helado Artesanal', 'Selección de sabores locales', 450.00, 4);
