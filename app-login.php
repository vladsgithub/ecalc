<?php

require( dirname(__FILE__) . '/wp-load.php' );

$username = $_POST["username"];
$pass = $_POST["pass"];

$user = get_user_by( 'login', $username );
$userID = $user->ID;
$current_user = get_userdata( $userID );
$password = $current_user->user_pass;
$user_key = substr($password, -round(strlen($password) * 0.4));

//$current_user->
//[ID]                  => 80
//[user_login]          => kogian
//[user_pass]           => $P$BJFHKJfUKyWv1TwЛОВАЕnYU0JGNsq.
//[user_firstname]      => first name
//[user_lastname]       => last name
//[user_nicename]       => kogian
//[user_email]          => kogian@yandex.ru
//[user_url]            => http://site.com/
//[user_registered]     => 2016-09-01 00:34:42
//[user_activation_key] =>
//[user_status]         =>
//[display_name]        => kogian

if ( $user && wp_check_password( $pass, $user->data->user_pass, $userID) ) {

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

       echo $current_user->user_firstname.'"""""'.$current_user->user_lastname.'"""""'.$userID.'"""""'.$user_key.'"""""'.$loadedData;
   }

   $conn->close();

} else {
   echo "Login failed";
}
?>