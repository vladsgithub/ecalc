<?php

$userID = $_POST["userID"];

if ($userID > 0) {
    $servername = "localhost";
    $username = "host1638368_1647";
    $password = "vl@d161010";
    $dbname = "host1638368_1647";

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

        echo 'DONE!!! '.$loadedData;
    }

    $conn->close();
}

?>