<?php
/**
 * Главная страница (index.php)
 * @package WordPress
 * @subpackage ecalc-template
 */
get_header(); // подключаем header.php ?>

<nav>
	<a ui-sref="home" ui-sref-active="active">
		<i class="icon-home"></i><span class="no-mobile">Home</span>
	</a>
    <a ui-sref="expenses" ui-sref-active="active">
		<i class="icon-th-list"></i><span class="no-mobile">Calculator</span>
	</a>
	<a ui-sref="404" ui-sref-active="active">
    		<i class="icon-th-list"></i><span class="no-mobile">404</span>
    	</a>
</nav>

<main ui-view></main>

<p class="old-ie">Please, use a modern browser</p>

<?php get_footer(); // подключаем footer.php ?>