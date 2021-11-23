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
	    <div class="guide-popup" ng-click="stopEvents($event)">
	        <div id="guidePopupTabs" class="guide-popup-tabs">
	            <button class="border btn">
                    <b>Краткий обзор</b>
                </button>
                <button class="border btn solid">
                    <b>Пример 1</b>
                </button>
	        </div>

            <div id="guidePopupPlayer">
                <div style="line-height: 200px; text-align: center;">Видео инструкция появится в ближайшее время</div>
            </div>

	        <button class="border btn close-btn solid" title="Закрыть" ng-click="layout.openGuidePopup(false)">
                <i class="fas fa-times"></i>
            </button>
	    </div>
	</div>

    <script>
        var guidePopupTabs = document.getElementById('guidePopupTabs').querySelectorAll('button');
        var guidePopupVideoIds = [
            'JtWglH5JMmA',
            'KV3ebH92gPY'
        ]

        guidePopupTabs.forEach(function(tab,i){
            tab.onclick = function() {
                if (!tab.classList.contains('solid')) return false;

                guidePopupTabs.forEach(function(btn,i){
                    btn.classList.add('solid');
                })
                tab.classList.remove('solid');
                guidePopupPlayer.loadVideoById(guidePopupVideoIds[i]);
            }
        })

        var guidePopupPlayer;
        var guidePopupPlayerScript = document.createElement('script');

        guidePopupPlayerScript.src = "https://www.youtube.com/iframe_api";
        document.body.append(guidePopupPlayerScript);

        function onYouTubeIframeAPIReady() {
            guidePopupPlayer = new YT.Player('guidePopupPlayer', {
                width: '324',
                height: '720',
                videoId: guidePopupVideoIds[0],
                playerVars: {
                    rel: 0,
                    cc_load_policy: 1
                }
            });
        }
    </script>

<?php wp_footer(); // необходимо для работы плагинов и функционала ?>
</body>
</html>