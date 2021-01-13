<?php
$servername = "localhost";
$username = "root";
$password = "";
$dbname = "game";


$conn = new mysqli($servername, $username, $password, $dbname);

if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}
$name = $_POST["name"];
$rate = $_POST["rate"];

$sql = "INSERT INTO Players (name, rate)
VALUES ('$name', $rate)";

if ($conn->query($sql) === TRUE) {
    echo "New record created successfully";
} else {
    echo "Error: " . $sql . "<br>" . $conn->error;
}

$conn->close();
?>