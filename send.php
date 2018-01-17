<?php

// to connect wp-load.php on this file in order to use wordpress functions
require( dirname(__FILE__) . '/wp-load.php' );



$current_user = wp_get_current_user();

//echo 'Username: ' . $current_user->user_login . '<br />';
//echo 'email: ' . $current_user->user_email . '<br />';
//echo 'first name: ' . $current_user->user_firstname . '<br />';
//echo 'last name: ' . $current_user->user_lastname . '<br />';
//echo 'Отображаемое имя: ' . $current_user->display_name . '<br />';
//echo 'ID: ' . $current_user->ID . '<br />';

$userId = $current_user->ID;

if ($userId > 0) {
	$servername = "localhost";
	$username = "root";
	$password = "";
	$dbname = "ecalc";

	// Create connection
	$conn = new mysqli($servername, $username, $password, $dbname);

	// Check connection
	if ($conn->connect_error) {
		die("Connection failed: " . $conn->connect_error);
	}

	$data = file_get_contents("php://input"); // Read body
	//echo $data;

//	$sql = "INSERT IGNORE INTO json_data SET json_id = $userId, data = '$data';";
	$sql = "INSERT INTO json_data(json_id, data) VALUES($userId, '$data') ON DUPLICATE KEY UPDATE data='$data'";

	if ($conn->query($sql) === TRUE) {
		echo "New record created successfully";
	} else {
		echo "Error: " . $sql . "<br>" . $conn->error;
	}

	$conn->close();
} else {
	echo 'The user is not registered';
}

?>