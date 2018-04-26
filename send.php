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

//	echo "\n\n data from currentAccount = ".$data;

	$dataJSON = json_decode($data);
	$now = microtime(true) * 10000; // at microseconds
	$dataJSON->{'meta'}->{'savedDate'} = $now;
	$DBdata = json_encode($dataJSON, JSON_UNESCAPED_UNICODE);

	if ($dataJSON->{'accounts'}) {
		$sql = "INSERT INTO json_data(json_id, data) VALUES($userId, '$DBdata') ON DUPLICATE KEY UPDATE data='$DBdata'";
		echo "Full object was saved \n";
	} else {
		$accountIndex = json_encode($dataJSON->{'meta'}->{'index'});
		$sql = "UPDATE json_data SET data=JSON_SET(data, '$.accounts[$accountIndex]', '$DBdata') where json_id = $userId";
//		$sql = "update t1 set data = JSON_SET(data, '$.key3', 'I am ID3') where id = 2;";
		echo "Only current account was saved \n";
	}

	if ($conn->query($sql) === TRUE) {
		echo $DBdata;
	} else {
		echo "Error: " . $sql . "<br>" . $conn->error;
	}

//	$accountIndex = json_encode($dataJSON->{'meta'}->{'index'});
//	$now = microtime(true) * 10000; // at microseconds
//	$savedDate = json_encode($dataJSON->{'meta'}->{'savedDate'} = $now);
//	$newData = json_encode($dataJSON, JSON_UNESCAPED_UNICODE);
//    echo "\n accountIndex = ".$accountIndex;
//    echo "\n savedDate = ".$savedDate;
//    echo "\n timeOnServer = ".$now;
//    echo "\n newData = ".$newData;

//	$sql = "INSERT INTO json_data(json_id, data) VALUES($userId, '$data') ON DUPLICATE KEY UPDATE data='$data'";
//	$sql = "INSERT INTO json_data(json_id, data) VALUES($userId, '$newData') ON DUPLICATE KEY UPDATE data='$newData'";
//
//	if ($conn->query($sql) === TRUE) {
//		echo "New record created successfully";
//	} else {
//		echo "Error: " . $sql . "<br>" . $conn->error;
//	}

	$conn->close();
} else {
	echo 'The user is not registered';
}

?>