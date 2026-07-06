<?php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once 'config.php';

$method = $_SERVER['REQUEST_METHOD'];

switch($method) {
    case 'POST':
        $data = json_decode(file_get_contents('php://input'), true);
        $username = trim($data['username'] ?? '');
        $password = trim($data['password'] ?? '');

        if (!$username || !$password) {
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => 'Usuario y contraseña requeridos']);
            exit();
        }

        try {
            $conn = getDBConnection();
            $stmt = $conn->prepare("SELECT id, password FROM users WHERE username = ?");
            $stmt->execute([$username]);
            $user = $stmt->fetch(PDO::FETCH_ASSOC);

            if ($user && password_verify($password, $user['password'])) {
                session_start();
                $_SESSION['user_id'] = $user['id'];
                $_SESSION['username'] = $username;
                echo json_encode(['success' => true, 'message' => 'Login exitoso']);
            } else {
                http_response_code(401);
                echo json_encode(['success' => false, 'error' => 'Usuario o contraseña incorrectos']);
            }
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['success' => false, 'error' => $e->getMessage()]);
        }
        break;

    case 'GET':
        session_start();
        if (isset($_SESSION['user_id'])) {
            echo json_encode(['success' => true, 'username' => $_SESSION['username']]);
        } else {
            http_response_code(401);
            echo json_encode(['success' => false, 'error' => 'No autenticado']);
        }
        break;
}
?>