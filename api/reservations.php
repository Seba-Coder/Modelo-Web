<?php

session_start();
if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['error' => 'No autorizado']);
    exit();
}

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
 
// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}
 
error_reporting(E_ALL);
ini_set('display_errors', 0); // No mostrar errores en output
ini_set('log_errors', 1);
 
require_once 'config.php';
 
try {
    $conn = getDBConnection();
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Error de conexión a base de datos',
        'details' => $e->getMessage()
    ]);
    exit();
}
 
$method = $_SERVER['REQUEST_METHOD'];
 
switch($method) {
    /*case 'GET':
        // Obtener todas las reservas
        $stmt = $conn->query("SELECT * FROM reservations ORDER BY reservation_date ASC, reservation_time ASC");
        $reservations = $stmt->fetchAll();
        echo json_encode($reservations);
        break;*/

    case 'GET':
    // Obtener todas las reservas con hora en HH:MM para la UI
    $stmt = $conn->query("
        SELECT 
            id, name, email, phone, reservation_date,
            DATE_FORMAT(reservation_time, '%H:%i') AS reservation_time,
            guests, message, status
        FROM reservations
        ORDER BY reservation_date ASC, reservation_time ASC
    ");
    $reservations = $stmt->fetchAll();
    echo json_encode($reservations);
    break;
 
    case 'POST':
        // Crear nueva reserva
        $data = json_decode(file_get_contents('php://input'), true);
 
        if ($data === null) {
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => 'Datos JSON inválidos']);
            exit();
        }
 
        if (!isset($data['name']) || empty(trim($data['name']))) {
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => 'El nombre es requerido']);
            exit();
        }
 
        if (!isset($data['email']) || empty(trim($data['email']))) {
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => 'El email es requerido']);
            exit();
        }
 
        if (!isset($data['phone']) || empty(trim($data['phone']))) {
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => 'El teléfono es requerido']);
            exit();
        }
 
        if (!isset($data['date']) || empty($data['date'])) {
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => 'La fecha es requerida']);
            exit();
        }
 
        if (!isset($data['time']) || empty($data['time'])) {
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => 'La hora es requerida']);
            exit();
        }
 
        if (!isset($data['guests']) || empty($data['guests'])) {
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => 'El número de personas es requerido']);
            exit();
        }
 
        try {
            $stmt = $conn->prepare("
                INSERT INTO reservations (name, email, phone, reservation_date, reservation_time, guests, message, status) 
                VALUES (:name, :email, :phone, :reservation_date, :reservation_time, :guests, :message, 'pending')
            ");
 
            $result = $stmt->execute([
                ':name' => htmlspecialchars(trim($data['name'])),
                ':email' => filter_var($data['email'], FILTER_SANITIZE_EMAIL),
                ':phone' => htmlspecialchars(trim($data['phone'])),
                ':reservation_date' => $data['date'],
                ':reservation_time' => $data['time'],
                ':guests' => (int)$data['guests'],
                ':message' => isset($data['message']) ? htmlspecialchars(trim($data['message'])) : ''
            ]);
 
            if ($result) {
                http_response_code(201);
                echo json_encode([
                    'success' => true,
                    'id' => $conn->lastInsertId(),
                    'message' => 'Reserva creada exitosamente'
                ]);
            } else {
                http_response_code(500);
                echo json_encode([
                    'success' => false,
                    'error' => 'No se pudo crear la reserva'
                ]);
            }
        } catch(PDOException $e) {
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'error' => 'Error al crear la reserva',
                'details' => $e->getMessage()
            ]);
        }
        break;
 
    case 'PUT':
        // Actualizar estado de reserva
        $data = json_decode(file_get_contents('php://input'), true);
 
        if (!isset($data['id']) || !isset($data['status'])) {
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => 'Datos incompletos']);
            exit();
        }
 
        try {
            $stmt = $conn->prepare("UPDATE reservations SET status = :status WHERE id = :id");
            $stmt->execute([
                ':status' => $data['status'],
                ':id' => (int)$data['id']
            ]);
 
            echo json_encode(['success' => true, 'message' => 'Reserva actualizada']);
        } catch(PDOException $e) {
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'error' => 'Error al actualizar: ' . $e->getMessage()
            ]);
        }
        break;
 
    case 'DELETE':
        // Eliminar reserva solo si está cancelada
        $data = json_decode(file_get_contents('php://input'), true);

        if (!isset($data['id'])) {
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => 'ID inválido']);
            exit();
        }

        $id = (int)$data['id'];

        try {
            // Verificar existencia y estado
            $stmt = $conn->prepare("SELECT status FROM reservations WHERE id = :id");
            $stmt->execute([':id' => $id]);
            $row = $stmt->fetch(PDO::FETCH_ASSOC);

            if (!$row) {
                http_response_code(404);
                echo json_encode(['success' => false, 'error' => 'Reserva no encontrada']);
                exit();
            }

            if ($row['status'] !== 'cancelled') {
                http_response_code(400);
                echo json_encode(['success' => false, 'error' => 'Solo se pueden eliminar las reservas con estado cancelado']);
                exit();
            }

            // Eliminar
            $stmt = $conn->prepare("DELETE FROM reservations WHERE id = :id");
            $stmt->execute([':id' => $id]);

            echo json_encode(['success' => true, 'message' => 'Reserva eliminada']);
        } catch(PDOException $e) {
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'error' => 'Error al eliminar: ' . $e->getMessage()
            ]);
        }
        break;
 
    default:
        http_response_code(405);
        echo json_encode(['success' => false, 'error' => 'Método no permitido']);
}
?>