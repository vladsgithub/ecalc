<?php
/**
 * Шаблон подвала (footer.php)
 * @package WordPress
 * @subpackage ecalc-template
 */
?>
	<footer>
        <p>Курсы валют: <a href="https://ru.exchange-rates.org/" target="_blank" rel="nofollow">ru.exchange-rates.org</a></p>
	</footer>

	<div class="substrate" ng-click="stopEvents($event)"></div>

<?php wp_footer(); // необходимо для работы плагинов и функционала ?>
</body>
</html>