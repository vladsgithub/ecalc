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

	<div class="guide-popup-overlay" ng-click="layout.openGuidePopup(false)">
	    <div class="guide-popup">
	        <div id="guidePopupPlayer">
	            <div style="line-height: 200px; text-align: center;">Видео инструкция появится в ближайшее время</div>
	        </div>

	        <button class="border btn collapse-btn solid" title="Закрыть" ng-click="layout.openGuidePopup(false)">
                <i class="fas fa-times"></i>
            </button>
	    </div>
	</div>

    <script>
        return false;

        var guidePopupPlayer;
        var guidePopupPlayerScript = document.createElement('script');

        guidePopupPlayerScript.src = "https://www.youtube.com/iframe_api";
        document.body.append(guidePopupPlayerScript);

        function onYouTubeIframeAPIReady() {
            guidePopupPlayer = new YT.Player('guidePopupPlayer', {
                videoId: 'dyMV6M5lUFM'
            });
        }
    </script>

<?php wp_footer(); // необходимо для работы плагинов и функционала ?>
</body>
</html>