<?php

// to connect wp-load.php on this file in order to use wordpress functions
require( dirname(__FILE__) . '/wp-load.php' );

//$current_user = wp_get_current_user();
//echo 'Username: ' . $current_user->user_login . '<br />';
//echo 'email: ' . $current_user->user_email . '<br />';
//echo 'first name: ' . $current_user->user_firstname . '<br />';
//echo 'last name: ' . $current_user->user_lastname . '<br />';
//echo 'Отображаемое имя: ' . $current_user->display_name . '<br />';
//echo 'ID: ' . $current_user->ID . '<br />';

//$userId = $current_user->ID;

$data = file_get_contents("php://input"); // Read body
$dataJSON = json_decode($data);
$userId = $dataJSON->{'meta'}->{'userID'};
$client_key = $dataJSON->{'meta'}->{'userKey'};

if ($userId > 0) {

    $current_user = get_userdata( $userId );
    $password = $current_user->user_pass;
    $user_key = substr($password, -round(strlen($password) * 0.4));

    if ($user_key == $client_key) {

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

        $oldDataResponse = mysqli_query($conn, "SELECT data FROM json_data WHERE json_id = $userId");

        $oldDataJSON = 0;
        $oldSavedDate = 911;
        if ($oldDataResponse) {
            $oldData = mysqli_fetch_row($oldDataResponse)[0];
            $oldDataJSON = json_decode($oldData);
        }

        $response = 'Empty';
        $responseForChangedData = '';
        $savedDateFromData = $dataJSON->{'meta'}->{'savedDate'};
        $now = microtime(true) * 1000; // at millisecond
        $dataJSON->{'meta'}->{'savedDate'} = $now;
        $DBdata = json_encode($dataJSON, JSON_UNESCAPED_UNICODE);

        if ($dataJSON->{'accounts'}) {
            $oldSavedDate = ($oldDataJSON) ? $oldDataJSON->{'meta'}->{'savedDate'} : 0;

            $sql = "INSERT INTO json_data(json_id, data) VALUES($userId, '$DBdata') ON DUPLICATE KEY UPDATE data='$DBdata'";
            $response = '100"""""Full object was saved ['.$now.']"""""0"""""';

            $deltaTime = intval(($oldSavedDate - $savedDateFromData) / 1000);
            $timeAgo = intval(($now - $oldSavedDate) / 1000);
            if ($deltaTime != 0) $responseForChangedData = '200"""""Object was not saved. Data was changed before ['.$oldSavedDate.'-->'.$timeAgo.' sec. ago]"""""'.$timeAgo.'"""""';

        } else {
            $accountIndex = json_encode($dataJSON->{'meta'}->{'index'});
            $oldSavedDate = ($oldDataJSON) ? $oldDataJSON->{'meta'}->{'savedDate'} : 0;

            $sql = "UPDATE json_data SET data=JSON_SET(data, '$.accounts[$accountIndex]', '$DBdata', '$.meta.savedDate', $now, '$.settings.currentAccount', $accountIndex) where json_id = $userId";
            $response = '010"""""Only current account was saved ['.$now.']"""""0"""""';

            $deltaTime = intval(($oldSavedDate - $savedDateFromData) / 1000);
            $timeAgo = intval(($now - $oldSavedDate) / 1000);
            if ($deltaTime != 0) $responseForChangedData = '200"""""Object was not saved. Data was changed before ['.$oldSavedDate.'-->'.$timeAgo.' sec. ago]"""""'.$timeAgo.'"""""';
        }

        if ($responseForChangedData) {
            echo $responseForChangedData.$oldData;
        } else {
            if ($conn->query($sql) === TRUE) {
                echo $response.$DBdata;
            } else {
                echo "Error: " . $sql . "<br>" . $conn->error;
            }
        }

        $conn->close();

	} else {
	    echo 'The user key is not correct';
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

} else {
	echo 'The user is not registered';
}

?>