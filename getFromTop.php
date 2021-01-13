<?php
$servername = "localhost";
$username = "root";
$password = "";
$dbname = "game";


$conn = new mysqli($servername, $username, $password, $dbname);

if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

$res = $conn->query("SELECT * FROM Players ORDER BY rate DESC LIMIT 9");


$array = [];

while ($row = $res->fetch_assoc()) {
    array_push($array, 'Имя:'.$row['name'].' - Баллы:'.$row['rate']);
}

echo json_encode($array);

$conn->close();




?>