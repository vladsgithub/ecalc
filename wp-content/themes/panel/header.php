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

<body ng-app="app" ng-controller="calculatorCtrl" ng-cloak="true">
	<header>

        <?
        $current_user = wp_get_current_user();

		echo 'Username: ' . $current_user->user_login . '<br />';
		echo 'email: ' . $current_user->user_email . '<br />';
		echo 'first name: ' . $current_user->user_firstname . '<br />';
		echo 'last name: ' . $current_user->user_lastname . '<br />';
		echo 'Отображаемое имя: ' . $current_user->display_name . '<br />';
		echo 'ID: ' . $current_user->ID . '<br />';

// В админке в разделе страницы, обязательно необходимо вставить (активировать) шорткод на какой-нибудь странице [clean-login]
// после этого в настройках Clean Login можно будет увидеть вверху, что указанный шорткод уже используется и тогда
// этот плагин будет нормально работать
		echo do_shortcode('[clean-login]');
		?>

		<?
//        echo do_shortcode('[clean-login]');
//        echo do_shortcode('[clean-login-edit]');
//        echo do_shortcode('[clean-login-register]');
//        echo do_shortcode('[clean-login-restore]');
		?>


		<button class="btn btn-primary" ng-click="saveInServer()">
        		<i class="fa fa-floppy-o"></i>
        </button>


	</header>