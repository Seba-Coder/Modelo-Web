<?php

session_start();
if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['error' => 'No autorizado']);
    exit();
}

require_once 'config.php';

$conn = getDBConnection();
$method = $_SERVER['REQUEST_METHOD'];

switch($method) {
    case 'GET':
        // Obtener menú completo con categorías y platos
        $stmt = $conn->query("
            SELECT 
                c.id as category_id,
                c.name as category_name,
                c.display_order as category_order,
                i.id as item_id,
                i.name as item_name,
                i.description,
                i.price,
                i.display_order as item_order
            FROM menu_categories c
            LEFT JOIN menu_items i ON c.id = i.category_id
            ORDER BY c.display_order ASC, i.display_order ASC
        ");
        
        $results = $stmt->fetchAll();
        
        // Organizar datos por categoría
        $menu = [];
        foreach ($results as $row) {
            $catId = $row['category_id'];
            
            if (!isset($menu[$catId])) {
                $menu[$catId] = [
                    'id' => $catId,
                    'name' => $row['category_name'],
                    'order' => $row['category_order'],
                    'items' => []
                ];
            }
            
            if ($row['item_id']) {
                $menu[$catId]['items'][] = [
                    'id' => $row['item_id'],
                    'name' => $row['item_name'],
                    'description' => $row['description'],
                    'price' => $row['price'],
                    'order' => $row['item_order']
                ];
            }
        }
        
        echo json_encode(array_values($menu));
        break;
        
    case 'POST':
        // Agregar nuevo plato o categoría
        $data = json_decode(file_get_contents('php://input'), true);
        
        if (isset($data['type']) && $data['type'] === 'category') {
            // Agregar categoría
            $stmt = $conn->prepare("SELECT MAX(display_order) as max_order FROM menu_categories");
            $stmt->execute();
            $result = $stmt->fetch();
            $newOrder = ($result['max_order'] ?? -1) + 1;
            
            $stmt = $conn->prepare("
                INSERT INTO menu_categories (name, display_order) 
                VALUES (:name, :display_order)
            ");
            $stmt->execute([
                ':name' => htmlspecialchars($data['name']),
                ':display_order' => $newOrder
            ]);
            echo json_encode(['success' => true, 'id' => $conn->lastInsertId()]);
        } else {
            // Agregar plato
            $stmt = $conn->prepare("SELECT MAX(display_order) as max_order FROM menu_items WHERE category_id = :category_id");
            $stmt->execute([':category_id' => (int)$data['category_id']]);
            $result = $stmt->fetch();
            $newOrder = ($result['max_order'] ?? -1) + 1;
            
            $stmt = $conn->prepare("
                INSERT INTO menu_items (category_id, name, description, price, display_order) 
                VALUES (:category_id, :name, :description, :price, :display_order)
            ");
            $stmt->execute([
                ':category_id' => (int)$data['category_id'],
                ':name' => htmlspecialchars($data['name']),
                ':description' => htmlspecialchars($data['description']),
                ':price' => $data['price'],
                ':display_order' => $newOrder
            ]);
            echo json_encode(['success' => true, 'id' => $conn->lastInsertId()]);
        }
        break;
        
    case 'PUT':
        // Actualizar plato, categoría o reordenar
        $data = json_decode(file_get_contents('php://input'), true);
        
        if (isset($data['type']) && $data['type'] === 'reorder') {
            // Reordenar menú completo
            $conn->beginTransaction();
            
            try {
                foreach ($data['menu'] as $index => $category) {
                    $stmt = $conn->prepare("UPDATE menu_categories SET display_order = :order WHERE id = :id");
                    $stmt->execute([':order' => $index, ':id' => (int)$category['id']]);
                    
                    if (isset($category['items'])) {
                        foreach ($category['items'] as $itemIndex => $item) {
                            $stmt = $conn->prepare("UPDATE menu_items SET display_order = :order WHERE id = :id");
                            $stmt->execute([':order' => $itemIndex, ':id' => (int)$item['id']]);
                        }
                    }
                }
                
                $conn->commit();
                echo json_encode(['success' => true]);
            } catch (Exception $e) {
                $conn->rollBack();
                http_response_code(500);
                echo json_encode(['error' => 'Error al reordenar el menú']);
            }
        } elseif (isset($data['type']) && $data['type'] === 'category') {
            // Actualizar categoría
            $stmt = $conn->prepare("UPDATE menu_categories SET name = :name WHERE id = :id");
            $stmt->execute([
                ':name' => htmlspecialchars($data['name']),
                ':id' => (int)$data['id']
            ]);
            echo json_encode(['success' => true]);
        } else {
            // Actualizar plato
            $stmt = $conn->prepare("
                UPDATE menu_items 
                SET name = :name, description = :description, price = :price
                WHERE id = :id
            ");
            $stmt->execute([
                ':name' => htmlspecialchars($data['name']),
                ':description' => htmlspecialchars($data['description']),
                ':price' => $data['price'],
                ':id' => (int)$data['id']
            ]);
            echo json_encode(['success' => true]);
        }
        break;
        
    case 'DELETE':
        // Eliminar plato o categoría
        $data = json_decode(file_get_contents('php://input'), true);
        
        if (!isset($data['id']) || !isset($data['type'])) {
            http_response_code(400);
            echo json_encode(['error' => 'Datos incompletos']);
            exit();
        }
        
        if ($data['type'] === 'category') {
            // Primero eliminar todos los items de la categoría
            $stmt = $conn->prepare("DELETE FROM menu_items WHERE category_id = :id");
            $stmt->execute([':id' => (int)$data['id']]);
            
            // Luego eliminar la categoría
            $stmt = $conn->prepare("DELETE FROM menu_categories WHERE id = :id");
            $stmt->execute([':id' => (int)$data['id']]);
        } else {
            // Eliminar plato
            $stmt = $conn->prepare("DELETE FROM menu_items WHERE id = :id");
            $stmt->execute([':id' => (int)$data['id']]);
        }
        
        echo json_encode(['success' => true]);
        break;
        
    default:
        http_response_code(405);
        echo json_encode(['error' => 'Método no permitido']);
}
?>
