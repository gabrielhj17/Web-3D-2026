<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

$db = new PDO('sqlite:' . __DIR__ . '/../data/views.db');
$db->exec('CREATE TABLE IF NOT EXISTS views (model TEXT PRIMARY KEY, count INTEGER DEFAULT 0)');

$model = $_GET['model'] ?? null;
$action = $_GET['action'] ?? 'get';

if (!$model) {
    echo json_encode(['error' => 'No model specified']);
    exit;
}

if ($action === 'increment') {
    $db->exec("INSERT INTO views (model, count) VALUES ('$model', 1) 
               ON CONFLICT(model) DO UPDATE SET count = count + 1");
}

$stmt = $db->query("SELECT count FROM views WHERE model = '$model'");
$row = $stmt->fetch(PDO::FETCH_ASSOC);
$count = $row ? $row['count'] : 0;

echo json_encode(['model' => $model, 'views' => $count]);