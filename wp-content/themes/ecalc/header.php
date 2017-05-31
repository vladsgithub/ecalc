<?php
/**
 * Шаблон шапки (header.php)
 * @package WordPress
 * @subpackage ecalc-template
 */
?>
<!DOCTYPE html>
<html ng-app="app" <?php language_attributes(); // вывод атрибутов языка ?>>
<head>
	<meta charset="<?php bloginfo( 'charset' ); // кодировка ?>">
	<meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width,minimum-scale=1.0,maximum-scale=1.0,user-scalable=no"/>
    <title>Ecalc</title>

	<?php /* RSS и всякое */
	/*
	<link rel="alternate" type="application/rdf+xml" title="RDF mapping" href="<?php bloginfo('rdf_url'); ?>">
	<link rel="alternate" type="application/rss+xml" title="RSS" href="<?php bloginfo('rss_url'); ?>">
	<link rel="alternate" type="application/rss+xml" title="Comments RSS" href="<?php bloginfo('comments_rss2_url'); ?>">
	<link rel="pingback" href="<?php bloginfo( 'pingback_url' ); ?>" />
	*/
	?>

	<?php /* Все скрипты и стили теперь подключаются в functions.php */ ?>

	<!--[if lt IE 9]>
	<script src="//html5shiv.googlecode.com/svn/trunk/html5.js"></script>
	<![endif]-->
	
	<?php wp_head(); // необходимо для работы плагинов и функционала ?>

	<base href="/">
</head>

<body ng-cloak="">
	<header>
		<div ng-include="'/wp-content/themes/ecalc/app/common/header/template/headerTemplate.html'"></div>

		<p>

		<?php
            $current_user = wp_get_current_user();

            echo 'Username: ' . $current_user->user_login . '<br />';
            echo 'email: ' . $current_user->user_email . '<br />';
            echo 'first name: ' . $current_user->user_firstname . '<br />';
            echo 'last name: ' . $current_user->user_lastname . '<br />';
            echo 'Отображаемое имя: ' . $current_user->display_name . '<br />';
            echo 'ID: ' . $current_user->ID . '<br />';
        ?>

        </p>
	</header>