<?php

$userID = $_POST["userID"];

if ($userID > 0) {
    $servername = $GLOBALS['server_name_php'];
    $username = $GLOBALS['user_name_php'];
    $password = $GLOBALS['password_php'];
    $dbname = $GLOBALS['dbname_php'];

    // Create connection
    $conn = new mysqli($servername, $username, $password, $dbname);

    // Check connection
    if ($conn->connect_error) {
        die("Connection failed: " . $conn->connect_error);
    }

    $result = mysqli_query($conn, "SELECT data FROM json_data WHERE json_id = (SELECT json_id FROM wp_users WHERE ID = '$userID')");
    if (!$result) {
        echo 'Request error: ' . mysql_error();
        exit;
    } else {
        $row = mysqli_fetch_row($result);
        $loadedData = $row[0];
        $loadedData = str_replace("{{", "{ {", $loadedData);
        $loadedData = str_replace("}}", "} }", $loadedData);
        $loadedData = stripslashes($loadedData);
        $loadedData = str_replace('"{"', '{"', $loadedData);
        $loadedData = str_replace('}"', '}', $loadedData);

        echo $loadedData;
    }

    $conn->close();
}

?>