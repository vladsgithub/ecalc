<?php
/**
 * Шаблон шапки (header.php)
 * @package WordPress
 * @subpackage your-clean-template-3
 */
?>
<!DOCTYPE html>
<html <?php language_attributes(); // вывод атрибутов языка ?>>
<head>
	<meta charset="<?php bloginfo( 'charset' ); // кодировка ?>">
	<meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1">

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
</head>

<body>
	<header>
		<h1>Header</h1>
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