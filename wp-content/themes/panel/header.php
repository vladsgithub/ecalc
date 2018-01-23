<?php
/**
 * Шаблон шапки (header.php)
 * @package WordPress
 * @subpackage ecalc-template
 */
?>
<!DOCTYPE html>
<html <?php language_attributes(); ?>>
<head>
	<meta charset="<?php bloginfo( 'charset' ); // кодировка ?>">
	<meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width,minimum-scale=1.0,maximum-scale=1.0,user-scalable=no"/>
    <title>Cost panel</title>

	<?php /* Все скрипты и стили теперь подключаются в functions.php */ ?>

	<!--[if lt IE 9]>
	<script src="//html5shiv.googlecode.com/svn/trunk/html5.js"></script>
	<![endif]-->
	
	<?php wp_head(); // необходимо для работы плагинов и функционала ?>

</head>

<body id="body" ng-app="app" ng-controller="calculatorCtrl" ng-cloak="true" data-upload-status="1">
	<header>

        <?
        $current_user = wp_get_current_user();
        $userID = $current_user->ID;
        $loadedData = '';

		echo 'Username: ' . $current_user->user_login . '<br />';
		echo 'email: ' . $current_user->user_email . '<br />';
		echo 'first name: ' . $current_user->user_firstname . '<br />';
		echo 'last name: ' . $current_user->user_lastname . '<br />';
		echo 'Отображаемое имя: ' . $current_user->display_name . '<br />';
		echo 'ID: ' . $current_user->ID . '<br />';

		if ($userID > 0) {
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

			$result = mysql_query("SELECT data FROM json_data WHERE json_id = (SELECT json_id FROM wp_users WHERE ID = '$userID')");
            if (!$result) {
                echo 'Request error: ' . mysql_error();
                exit;
            } else {
				$row = mysql_fetch_row($result);
				$loadedData = $row[0];
            }

        	$conn->close();
		}

		$loadedData = str_replace("{{", "{ {", $loadedData);
		$loadedData = str_replace("}}", "} }", $loadedData);
		echo "{{getDataFromServer('$loadedData')}}";
//        echo "<div ng-init=getDataFromServer('$loadedData')>data</div>";
		?>

		<?
		// В админке в разделе 'страницы', обязательно необходимо вставить (активировать) шорткод на какой-нибудь странице [clean-login]
        // пусть даже неиспользуемой на сайте (можно просто выделить целую страницу для авторизации - login),
        // после этого в настройках Clean Login можно будет увидеть вверху, что указанный шорткод уже используется и тогда
        // этот плагин будет нормально работать
        	echo do_shortcode('[clean-login]');
//        echo do_shortcode('[clean-login-edit]');
//        echo do_shortcode('[clean-login-register]');
//        echo do_shortcode('[clean-login-restore]');
		?>


		<button class="btn btn-primary" ng-click="uploadData()">
        		<i class="fa fa-floppy-o"></i>
        </button>


	</header>