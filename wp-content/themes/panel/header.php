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
    <meta name="keywords" content="калькулятор распределения расходов, калькулятор распределения долей, калькулятор расчета долей, калькулятор расчета расходов,
    расчет доли каждого участника, расчет между участниками, расчет расходов, подсчет расходов, распределение расходов, распределение долей,
    распределение расходов поровну, распределение расходов между участниками, распределение расходов между сторонами,
    сервис учета расходов, учет расходов, калькулятор расходов, распределение затрат между сторонами,
    калькулятор учета расходов, расчет доли участника, доля участника в расходе,
    доля в расходе, доля в расходах, онлайн список покупок, онлайн перечень покупок, список покупок, перечень покупок,
    список расходов, статистика расходов, статистика покупок, возврат долгов, учет долгов">


    <meta name="description" content="Cost Panel - калькулятор учета и распределения расходов между участниками.
    Калькулятор поможет быстро рассчитать доли каждого участника общего расхода и подскажет как рассчитаться между собой.
    Вносите траты в любой валюте, указывайте для кого их рассчитать и калькулятор распределения расходов покажет -
    кто кому и в какой валюте должен вернуть с учетом ранее внесенных средств. Распределение расходов настраивается поровну.
    Также в этом калькуляторе можно создавать список будущих покупок онлайн одним человеком и в это же время в магазине
    открыть его на любом девайсе другим человеком, чтобы строго следовать этому перечню. А статистика распределения расходов
    отобразит полезную информацию: тип расхода, дата, доля, взнос, остаток.">


	<?php /* Все скрипты и стили теперь подключаются в functions.php */ ?>

	<!--[if lt IE 9]>
	<script src="//html5shiv.googlecode.com/svn/trunk/html5.js"></script>
	<![endif]-->
	
	<?php wp_head(); // необходимо для работы плагинов и функционала ?>

    <!-- Yandex.Metrika counter -->
    <script type="text/javascript" >
        (function (d, w, c) {
            (w[c] = w[c] || []).push(function() {
                try {
                    w.yaCounter50412597 = new Ya.Metrika2({
                        id:50412597,
                        clickmap:true,
                        trackLinks:true,
                        accurateTrackBounce:true,
                        webvisor:true
                    });
                } catch(e) { }
            });

            var n = d.getElementsByTagName("script")[0],
                s = d.createElement("script"),
                f = function () { n.parentNode.insertBefore(s, n); };
            s.type = "text/javascript";
            s.async = true;
            s.src = "https://mc.yandex.ru/metrika/tag.js";

            if (w.opera == "[object Opera]") {
                d.addEventListener("DOMContentLoaded", f, false);
            } else { f(); }
        })(document, window, "yandex_metrika_callbacks2");
    </script>
    <noscript><div><img src="https://mc.yandex.ru/watch/50412597" style="position:absolute; left:-9999px;" alt="" /></div></noscript>
    <!-- /Yandex.Metrika counter -->

	<?
		$current_user = wp_get_current_user();
		$userID = $current_user->ID;
		$loadedData = '';

		if (isset($_GET['u']) && isset($_GET['ac'])) {
            $userID = $_GET['u'];
            $viewModeAccountID = $_GET['ac'];
            echo "<script type='text/javascript'>var viewModeAccountID = '$viewModeAccountID';</script>";
        }

		if ($userID > 0) {
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

			$result = mysqli_query($conn, "SELECT data FROM json_data WHERE json_id = (SELECT json_id FROM wp_users WHERE ID = '$userID')");
			if (!$result) {
				echo 'Request error: ' . mysql_error();
				exit;
			} else {
				$row = mysqli_fetch_row($result);
				$loadedData = $row[0];
			}

			$conn->close();
		}

		$loadedData = str_replace("{{", "{ {", $loadedData);
		$loadedData = str_replace("}}", "} }", $loadedData);
		$loadedData = stripslashes($loadedData);
		$loadedData = str_replace('"{"', '{"', $loadedData);
		$loadedData = str_replace('}"', '}', $loadedData);

		$userName = $current_user->user_firstname.' '.$current_user->user_lastname;

		if ($userName == ' ') {
		    $userName = $current_user->user_login;
		}

		$userNameWords = explode(" ", $userName);
		$firstLetter = mb_substr($userName,0,1,'UTF-8');
		$secondLetter = mb_substr(end($userNameWords),0,1,'UTF-8');
		if (count($userNameWords) <= 1) { $secondLetter = ''; };

		$password = $current_user->user_pass;
        $user_key = substr($password, -round(strlen($password) * 0.4));

		echo "<script id='serverDataScript' type='text/javascript'>userID = $userID; userKey = '$user_key'; fromServerData = '$loadedData';</script>";
    ?>

</head>

<body id="body" ng-app="app" ng-controller="calculatorCtrl" ng-cloak="true"
	ng-class="{'logged-in': expCalc.meta.userID > 0, 'open-menu': layout.isOpenMenu, 'open-aside': layout.isOpenAside, 'remove-mode': layout.isRemoveMode, 'print-mode': layout.isPrintMode, 'advanced-mode': expCalc.accounts[expCalc.settings.currentAccount].settings.advancedMode, 'data-updating': layout.isDataUpdating}"
	data-upload-status="1">





<header>

	<ul class="head flex">
		<li>
			<button class="btn solid" title="Меню" ng-click="layout.openMenu()">
				<i class="fas fa-bars"></i>
				<b class="no-mobile">Меню</b>
			</button>
		</li>
		<li class="title flex-grow separator">
			<h1>Cost panel (бета-версия)</h1>
			<h2>
			    {{(expCalc.accounts[expCalc.settings.currentAccount].meta.title) ? expCalc.accounts[expCalc.settings.currentAccount].meta.title : '--- расчет без названия ---'}}
			    <b ng-if="expCalc.accounts[expCalc.settings.currentAccount].meta.savedDate > 0">
			        [{{formatDate(expCalc.accounts[expCalc.settings.currentAccount].meta.savedDate)}}]
			    </b>
			</h2>
		</li>
		<li class="separator" ng-class="{'hidden': !(expCalc.meta.userID > 0)}" ng-if="!expCalc.meta.isViewMode">
			<button id="saveButton" class="btn solid" title="Автоматическое сохранение на сервере" ng-click="uploadData(true, true)">
				<b class="status-line">
				    <? echo $firstLetter.$secondLetter; ?>
				</b>
				<i class="fas fa-save no-mobile"></i>
			</button>

			<div class="help-text small no-arrow" ng-if="expCalc.settings.isHelpMode">
                <b><i class="fas fa-info-circle"></i> <span id="statusHelpText">Автоматическое сохранение на сервере</span> <i class="fas fa-arrow-right float-right"></i></b>
            </div>
		</li>
		<li class="separator" ng-if="!expCalc.meta.isViewMode">
			<button class="btn solid" title="Все расчеты" ng-click="layout.openAside()">
				<i class="fas fa-ellipsis-v"></i>
				<b class="no-mobile">Расчеты</b>
			</button>
		</li>
	</ul>

</header>

<aside class="menu" role="menu">
    <ul class="nav-head flex">
        <li class="photo">
            <img class="<? if ($current_user->ID == 0) { echo 'hidden'; } ?>" src="<? echo get_avatar_url($current_user->ID) ?>" />
        </li>
        <li class="flex-grow flex-hidden s-p2">
            <div class="text-field name solid capitalize">
                <b id="userNameBlock">
                    <?
                        echo $userName;
                    ?>
                </b>
                <b class="hidden">
                    <?
                        echo 'User photo: ' . get_avatar_url($current_user->ID) . '<br />';
                        echo 'Username: ' . $current_user->user_login . '<br />';
                        echo 'email: ' . $current_user->user_email . '<br />';
                        echo 'first name: ' . $current_user->user_firstname . '<br />';
                        echo 'last name: ' . $current_user->user_lastname . '<br />';
                        echo 'Отображаемое имя: ' . $current_user->display_name . '<br />';
                        echo 'ID: ' . $current_user->ID . '<br />';
                    ?>
                </b>
            </div>
        </li>
        <li>
            <button class="btn solid no-shadow" title="Меню" ng-click="layout.closeMenu()">
                <i class="fas fa-window-close"></i>
            </button>
        </li>
    </ul>

    <div id="navBody" class="nav-body" ng-init="layoutControl.init()">

        <ul class="section open active" data-level="1">
            <li class="section-title">
                <button class="btn no-shadow" data-previous title="Меню">
                    <i class="fas fa-bars"></i>
                </button>
                <div class="text-field title"><b>Главное меню</b></div>
            </li>

            <li>
                <button class="btn solid no-shadow" data-next title="Авторизация">
                    <i class="fas fa-user-circle"></i>
                    <b>Авторизация</b>
                </button>

                <ul id="authentication" class="section" data-level="2">
                    <li class="section-title">
                        <button class="btn no-shadow" data-previous title="Авторизация">
                            <i class="fas fa-user-circle"></i>
                        </button>
                        <div class="text-field title"><b>Авторизация</b></div>
                    </li>

                    <li class="section-box">
                        <div class="section-page">
                            <?
        // В админке в разделе 'страницы', обязательно необходимо вставить (активировать) шорткод на какой-нибудь странице [clean-login]
        // можно просто выделить целую страницу для авторизации - login,
        // после этого в настройках Clean Login можно будет увидеть вверху, что указанный шорткод уже используется и тогда
        // этот плагин будет нормально работать
        // Но чтобы проводить изменения с аккаунтом - необходимо это делать на отдельной статической странице login

                                echo do_shortcode('[clean-login]');

                                echo get_ulogin_panel();
                            ?>


                            <ul class="settings-list" ng-if="true" data-for-android-app>
                                <li>
                                    <div class="block text-field name word-wrap text-center">
                                        <b>Авторизация в мобильном приложении</b>
                                    </div>
                                </li>

                                <li>
                                    <div class="cleanlogin-container">
                                        <form class="cleanlogin-form" ng-submit="getUserDataForApp()">
                                            <fieldset>
                                                <div class="cleanlogin-field">
                                                    <input id="username" class="cleanlogin-field-username" type="text" name="log" placeholder="Имя участника (username)">
                                                </div>

                                                <div class="cleanlogin-field">
                                                    <input id="password" class="cleanlogin-field-password" type="password" name="pwd" placeholder="Пароль">
                                                </div>
                                            </fieldset>

                                            <div class="flex flex-wrap">
                                                <input class="cleanlogin-field" type="submit" value="Войти" name="submit">
                                            </div>


                                            <div class="cleanlogin-form-bottom">
                                                <a href="https://costpanel.info/login" target="_blank" class="cleanlogin-form-pwd-link">Восстановить пароль?</a>
                                                <a href="https://costpanel.info/login" target="_blank" class="cleanlogin-form-register-link">Регистрация</a>
                                            </div>
                                        </form>
                                    </div>
                                </li>

                                <li>
                                    <button id="userLogin" class="btn solid border block width100">
                                        <i class="fas fa-user-friends"></i>
                                        <b class="small">Авторизация через соц.сети</b>
                                    </button>
                                </li>
                            </ul>
                        </div>
                    </li>
                </ul>
            </li>

            <li>
                <button class="btn solid no-shadow" data-next>
                    <i class="fas fa-database"></i>
                    <b>Данные</b>
                </button>

                <ul class="section" data-level="2">
                    <li class="section-title">
                        <button class="btn no-shadow" data-previous title="Данные">
                            <i class="fas fa-database"></i>
                        </button>
                        <div class="text-field title"><b>Данные</b></div>
                    </li>

                    <li>
                        <button class="btn solid no-shadow" data-next>
                            <i class="fas fa-list-alt"></i>
                            <b>Типы расходов</b>
                        </button>

                        <ul class="section" data-level="3">
                            <li class="section-title">
                                <button class="btn no-shadow" data-previous title="Типы расходов">
                                    <i class="fas fa-list-alt"></i>
                                </button>
                                <div class="text-field title"><b>Типы расходов</b></div>
                            </li>

                            <li class="section-box">


                                <ul class="settings-list">
                                    <li ng-repeat="expensesType in expCalc.settings.expensesTypes track by $index">
                                        <ul class="flex s-p1">
                                            <li class="s-p1">
                                                <button class="btn solid warning" title="Удалить этот тип" ng-click="removeExpensesType($index)">
                                                    <i class="fas fa-trash-alt"></i>
                                                </button>
                                            </li>

                                            <li class="s-p1">
                                                <div class="text-field title text-center">
                                                    <b>{{$index + 1}}.</b>
                                                </div>
                                            </li>

                                            <li class="flex-grow flex-hidden s-p1">
                                                <div class="multiple-field">
                                                    <label class="text-input flex-grow">
                                                        <input type="text" placeholder="Название типа"
                                                               ng-model="expensesType.name" ng-change="validateJSON(expensesType, 'name') && uploadData(true)">
                                                        <b data-placeholder="Название типа">{{expensesType.name}}</b>
                                                    </label>

                                                    <label class="text-input flex-grow">
                                                        <input type="text" placeholder="Название иконки типа"
                                                               ng-model="expensesType.icon" ng-change="validateJSON(expensesType, 'icon') && uploadData(true)">
                                                        <b data-placeholder="Название иконки типа">{{expensesType.icon}}</b>
                                                    </label>
                                                </div>
                                            </li>

                                            <li class="flex-shrink s-p1">
                                                <div class="text-field icon">
                                                    <b>
                                                        <i class="fas fa-{{expensesType.icon}}"></i>
                                                    </b>
                                                </div>
                                            </li>
                                        </ul>
                                    </li>

                                    <li>
                                        <ul class="flex s-p1">
                                            <li class="s-p1">
                                                <button class="btn solid success" title="Добавить новый тип" ng-click="addNewExpensesType()">
                                                    <i class="fas fa-plus"></i>
                                                </button>
                                            </li>

                                            <li class="flex-grow s-p1">
                                                <div class="text-field name">
                                                    <b>Новый тип расходов</b>
                                                </div>
                                            </li>
                                        </ul>
                                    </li>

                                    <li class="s-p2">
                                        <div class="text-field">
                                            <b>
                                                Названия иконок для новых типов расходов можно посмотреть по этой ссылке:
                                                <a href="https://fontawesome.com/icons?d=gallery&s=solid&m=free" target="_blank">fontawesome icons</a>
                                            </b>
                                        </div>
                                        <div class="text-field">
                                            <b>
                                                В бета-версии калькулятора необходимо написать название иконки, чтобы отобразить ее. В будущем будет реализован более удобный подход.
                                            </b>
                                        </div>
                                    </li>
                                </ul>

                            </li>
                        </ul>
                    </li>

                    <li>
                        <button class="btn solid no-shadow" data-next>
                            <i class="fas fa-dollar-sign"></i>
                            <b>Валюта</b>
                        </button>

                        <ul class="section" data-level="3">
                            <li class="section-title">
                                <button class="btn no-shadow" data-previous title="Валюта">
                                    <i class="fas fa-dollar-sign"></i>
                                </button>
                                <div class="text-field title"><b>Валюта</b></div>
                            </li>

                            <li class="section-box">

                                <ul class="settings-list" ng-init="currencies = expCalc.settings.currencies">

                                    <li>
                                        <ul class="flex s-p1">
                                            <li class="s-p1">
                                                <label class="text-select currency">
                                                    <select ng-model="expCalc.settings.baseCurrency"
                                                            ng-options="key as value for (key, value) in expCalc.settings.currencies.names" ng-change="uploadData(true)">
                                                    </select>
                                                    <b>{{expCalc.settings.currencies.names[expCalc.settings.baseCurrency].substring(0, 3)}}</b>
                                                </label>
                                            </li>

                                            <li class="flex-grow s-p1">
                                                <div class="text-field">
                                                    <b>Базовая валюта по умолчанию (валюта той страны, в которой проживаете)</b>
                                                </div>
                                            </li>
                                        </ul>
                                    </li>

                                    <li>

                                        <ul class="flex s-p1">
                                            <li class="flex-grow s-p1">
                                                <div class="text-field bold text-right">
                                                    <b>Обновить курсы валют</b>
                                                </div>
                                            </li>

                                            <li class="flex-shrink">
                                                <div class="number-input complex-input">
                                                    <div class="text-field">
                                                        <b>Процент<br>надбавки</b>
                                                    </div>

                                                    <label class="text-center">
                                                        <input type="number" step="0.1" ng-model="expCalc.settings.currencies.commonSurcharge">
                                                        <b>{{expCalc.settings.currencies.commonSurcharge}}</b>
                                                    </label>
                                                </div>
                                            </li>

                                            <li class="flex-shrink s-p1">
                                                <button class="btn solid" ng-click="updateCurrencies()">
                                                    <i class="fas fa-sync"></i>
                                                </button>
                                            </li>
                                        </ul>

                                    </li>

                                    <li>
                                        <div class="text-field small s-p2">
                                            <b class="text-justify">Обновленная таблица показывает точные значения курсов валют. Банки продают валюту по курсам немного выше от этих значений и
                                            чтобы получить максимально реальный курс в расчетах, используйте процент надбавки.<br/>
                                            Первые 3 буквы названия валюты должны соответствовать мировому стандарту.
                                            </b>
                                        </div>
                                    </li>

                                    <li ng-repeat="name in expCalc.settings.currencies.names track by $index" ng-init="nameIndex = $index">

                                        <ul class="flex s-p1">
                                            <li class="s-p1">
                                                <button class="btn solid warning" title="Удалить эту валюту" ng-click="removeCurrency(nameIndex)">
                                                    <i class="fas fa-trash-alt"></i>
                                                </button>
                                            </li>

                                            <li class="flex-grow flex-hidden s-p1">
                                                <ul class="currencies-list">
                                                    <li>
                                                        <div class="text-input complex-input">
                                                            <div class="text-field">
                                                                <b>Название: </b>
                                                            </div>

                                                            <label class="head">
                                                                <input type="text" placeholder="XXX - название валюты"
                                                                       ng-model="expCalc.settings.currencies.names[nameIndex]"
                                                                       ng-change="validateJSON(expCalc.settings.currencies.names, nameIndex) && uploadData(true)">
                                                                <b data-placeholder="XXX - название валюты">{{expCalc.settings.currencies.names[nameIndex]}}</b>
                                                            </label>
                                                        </div>
                                                    </li>

                                                    <li ng-repeat="array in expCalc.settings.currencies.rates[nameIndex] track by $index"
                                                        ng-if="expCalc.settings.currencies.names[nameIndex] != expCalc.settings.currencies.names[$index]">
                                                        <ul class="flex currency-line">
                                                            <li class="flex-shrink flex-hidden">
                                                                <div class="text-field name uppercase">
                                                                    <b>1 {{(expCalc.settings.currencies.names[$index]) ? expCalc.settings.currencies.names[$index] : "???"}}</b>
                                                                </div>
                                                            </li>

                                                            <li class="flex-shrink s-p1">
                                                                <div class="text-field title">
                                                                    <b>=</b>
                                                                </div>
                                                            </li>

                                                            <li class="flex-grow flex-hidden">
                                                                <div class="text-input complex-input">
                                                                    <div class="text-field">
                                                                        <b class="uppercase">{{expCalc.settings.currencies.names[nameIndex].substring(0, 3)}}</b>
                                                                    </div>

                                                                    <label class="head">
                                                                        <input type="number"
                                                                               title="Курс, по которому банк продает 1 {{expCalc.settings.currencies.names[$index]}}"
                                                                               ng-model="expCalc.settings.currencies.rates[nameIndex][$index]" ng-change="uploadData(true)">
                                                                        <b>{{expCalc.settings.currencies.rates[nameIndex][$index]}}</b>
                                                                    </label>
                                                                </div>
                                                            </li>
                                                        </ul>
                                                    </li>
                                                </ul>
                                            <li>
                                        </ul>

                                    </li>

                                    <li class="s-p1">
                                        <ul class="flex">
                                            <li class="flex-shrink s-p1">
                                                <button class="btn solid success" ng-click="addNewCurrency()">
                                                    <i class="fas fa-plus"></i>
                                                </button>
                                            <li>

                                            <li class="flex-grow s-p1">
                                                <div class="text-field name">
                                                    <b>Добавить новую валюту</b>
                                                </div>
                                            </li>
                                        </ul>
                                    </li>

                                    <li id="currenciesTable" class="currency-table s-p2">
                                        <script type="text/javascript" src="https://ru.exchange-rates.org/GetCustomContent.aspx?sid=RT000LM8X&amp;type=RatesTable&amp;stk=02LYTNC6H9" charset="utf-8">
                                        </script>
                                    </li>
                                </ul>

                            </li>
                        </ul>
                    </li>

                    <li ng-class="{'hidden': expCalc.meta.isViewMode}">
                        <button class="btn solid no-shadow" data-next>
                            <i class="fas fa-share-alt"></i>
                            <b>Поделиться</b>
                        </button>

                        <ul class="section" data-level="3">
                            <li class="section-title">
                                <button class="btn no-shadow" data-previous title="Поделиться">
                                    <i class="fas fa-share-alt"></i>
                                </button>
                                <div class="text-field title"><b>Поделиться</b></div>
                            </li>

                            <li class="section-box">

                                <div class="section-page" ng-if="!expCalc.meta.userID">
                                    <div class="text-field name word-wrap s-p2">
                                        <b>Необходимо войти в аккаунт, чтобы получить ссылку на текущий расчет и поделиться с остальными участниками</b>
                                    </div>
                                </div>

                                <ul class="settings-list" ng-if="expCalc.meta.userID">
                                    <li class="s-p2">
                                        <div class="text-field title block">
                                            <b>Ссылка на текущий расчет:</b>
                                        </div>
                                    </li>

                                    <li>
                                        <ul class="flex s-p1">
                                            <li class="flex-shrink s-p1">
                                                <div class="text-field name">
                                                    <b>ID расчета:</b>
                                                </div>
                                            </li>

                                            <li class="flex-grow flex-hidden s-p1">
                                                <label class="text-input">
                                                    <input type="text"
                                                           ng-change="validateJSON(expCalc.accounts[expCalc.settings.currentAccount].meta, 'id') && uploadData()"
                                                           ng-model="expCalc.accounts[expCalc.settings.currentAccount].meta.id">
                                                    <b>{{expCalc.accounts[expCalc.settings.currentAccount].meta.id}}</b>
                                                </label>
                                            </li>
                                        </ul>
                                    </li>

                                    <li>
                                        <ul class="flex s-p1">
                                            <li class="flex-shrink s-p1">
                                                <button class="btn solid"
                                                        title="Скопировать ссылку в буфер"
                                                        ng-click="copyToBufferByID('linkToAccount')">
                                                    <i class="fas fa-copy"></i>
                                                </button>
                                            </li>

                                            <li class="flex-grow s-p1">
                                                <label class="text-input break-all block" disabled>
                                                    <b id="linkToAccount">{{linkToAccount()}}</b>
                                                </label>
                                            </li>
                                        </ul>
                                    </li>
                                </ul>

                            </li>
                        </ul>
                    </li>

                    <li>
                        <button class="btn solid no-shadow" data-next>
                            <i class="fas fa-copy"></i>
                            <b>Экспорт / Импорт</b>
                        </button>

                        <ul class="section" data-level="3">
                            <li class="section-title">
                                <button class="btn no-shadow" data-previous title="Экспорт / Импорт">
                                    <i class="fas fa-copy"></i>
                                </button>
                                <div class="text-field title"><b>Экспорт / Импорт</b></div>
                            </li>

                            <li class="section-box">

                                <ul class="settings-list">
                                    <li>
                                        <ul class="flex s-p1">
                                            <li class="flex-shrink s-p1">
                                                <button class="btn solid" ng-click="downloadData()">
                                                    <i class="fas fa-file-export"></i>
                                                </button>
                                            </li>

                                            <li class="flex-grow s-p1">
                                                <div class="text-field title">
                                                    <b>Экспорт данных</b>
                                                </div>
                                            </li>
                                        </ul>
                                    </li>

                                    <li class="s-p2">
                                        <div class="text-field title block">
                                            <b>Импорт данных</b>
                                        </div>

                                        <input type="file" onchange="loadData(event)" />
                                    </li>
                                </ul>


                                <ul class="settings-list" ng-if="false" data-for-android-app>
                                    <li>
                                        <ul class="flex s-p1">
                                            <li class="flex-shrink s-p1">
                                                <button id="writeFile" class="btn solid">
                                                    <i class="fas fa-file-export"></i>
                                                </button>
                                            </li>

                                            <li class="flex-grow s-p1">
                                                <div class="text-field title">
                                                    <b>Экспорт данных</b>
                                                </div>
                                            </li>
                                        </ul>
                                    </li>

                                    <li>
                                        <ul class="flex s-p1">
                                            <li class="flex-shrink s-p1">
                                                <button id="readFile" class="btn solid">
                                                    <i class="fas fa-file-import"></i>
                                                </button>
                                            </li>

                                            <li class="flex-grow s-p1">
                                                <div class="text-field title">
                                                    <b>Импорт данных</b>
                                                </div>
                                            </li>
                                        </ul>

                                        <div class="s-p2">
                                            <textarea id="textarea" class="textarea"></textarea>
                                        </div>

                                        <div class="s-p2">
                                            <button class="btn solid" ng-click="applyTextareaObject()">
                                                <i class="fas fa-save"></i>
                                                <b class="small">Применить новый объект</b>
                                            </button>
                                        </div>
                                    </li>
                                </ul>

                            </li>
                        </ul>
                    </li>
                </ul>
            </li>

            <li>
                <button class="btn solid no-shadow" data-next>
                    <i class="fas fa-cog"></i>
                    <b>Режимы</b>
                </button>

                <ul class="section" data-level="2">
                    <li class="section-title">
                        <button class="btn no-shadow" data-previous="" title="Настройки и режимы">
                            <i class="fas fa-cog"></i>
                        </button>
                        <div class="text-field title"><b>Настройки и режимы</b></div>
                    </li>

                    <li class="section-box">

                        <ul class="settings-list">
                            <li>
                                <ul class="flex s-p1">
                                    <li class="s-p1">
                                        <label class="toggle">
                                            <input type="checkbox" ng-model="layout.isRemoveMode">
                                            <i></i>
                                        </label>
                                    </li>

                                    <li class="flex-grow s-p1">
                                        <div class="text-field">
                                            <b>Режим удаления данных</b>
                                        </div>
                                    </li>
                                </ul>
                            </li>

                            <li>
                                <ul class="flex s-p1">
                                    <li class="s-p1">
                                        <label class="toggle">
                                            <input type="checkbox" ng-model="layout.isPrintMode">
                                            <i></i>
                                        </label>
                                    </li>

                                    <li class="flex-grow s-p1">
                                        <div class="text-field">
                                            <b>Режим отображения для вывода на печать</b>
                                        </div>
                                    </li>
                                </ul>
                            </li>

                            <li>
                                <ul class="flex s-p1">
                                    <li class="s-p1">
                                        <label class="toggle">
                                            <input type="checkbox" ng-model="expCalc.settings.isHelpMode" ng-change="uploadData(true)">
                                            <i></i>
                                        </label>
                                    </li>

                                    <li class="flex-grow s-p1">
                                        <div class="text-field">
                                            <b>Режим отображения подсказок</b>
                                        </div>
                                    </li>
                                </ul>
                            </li>
                        </ul>

                    </li>
                </ul>
            </li>

            <li>
                <button class="btn solid no-shadow" data-next title="О сервисе">
                    <i class="fas fa-info"></i>
                    <b>О сервисе</b>
                </button>

                <ul id="aboutService" class="section" data-level="2">
                    <li class="section-title">
                        <button class="btn no-shadow" data-previous title="О сервисе">
                            <i class="fas fa-info"></i>
                        </button>
                        <div class="text-field title"><b>О сервисе</b></div>
                    </li>

                    <li class="section-box">
                        <div class="section-page">

                            <div class="text-field text-justify">
                                <b>
                                Cost Panel - калькулятор учета и распределения расходов между участниками.
                                Калькулятор поможет быстро рассчитать доли каждого участника общего расхода и подскажет
                                как рассчитаться между собой. Вносите траты в любой валюте, указывайте для кого их
                                рассчитать и калькулятор распределения расходов покажет - кто кому и в какой валюте
                                должен вернуть с учетом ранее внесенных средств. А статистика распределения расходов
                                отобразит полезную информацию: тип расхода, дата, доля, взнос, остаток.<br/>
                                <br/>
                                Весь расчет состоит из 3 шагов:<br/>
                                &nbsp;&nbsp;1) Добавить участников и их расходы<br/>
                                &nbsp;&nbsp;2) Настройка расчета<br/>
                                &nbsp;&nbsp;3) Зафиксировать возвраты
                                <br/>
                                <br/>
                                <a href="/info">Больше информации</a><br/>
                                <br/>
                                Версия <? echo $GLOBALS['cost_panel_version'] ?>
                                <br/>
                                <br/>
                                <img style="width: 100%; margin-bottom: 60px;" src="/pictures/hello.jpg" />
                                </b>
                            </div>

                        </div>
                    </li>
                </ul>
            </li>
        </ul>

    </div>
</aside>