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

	<?
		$current_user = wp_get_current_user();
		$userID = $current_user->ID;
		$loadedData = '';

		if ($userID > 0) {
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
		if (count($userNameWords) <= 1) { $secondLetter = ''; }

		echo "<script language='JavaScript'>var fromServerData = '$loadedData';</script>";
    ?>

</head>

<body id="body" ng-app="app" ng-controller="calculatorCtrl" ng-cloak="true" class="<? if ($current_user->ID > 0) { echo 'logged-in'; } ?>" 
	ng-class="{'open-menu': layout.isOpenMenu, 'open-aside': layout.isOpenAside, 'remove-mode': layout.isRemoveMode, 'print-mode': layout.isPrintMode}"
	ng-init="expCalc.meta.userID = <? echo $userID; ?>"
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
			    {{expCalc.accounts[expCalc.settings.currentAccount].meta.title}}
			    <b ng-if="expCalc.accounts[expCalc.settings.currentAccount].meta.savedDate > 0">
			        [{{formatDate(expCalc.accounts[expCalc.settings.currentAccount].meta.savedDate)}}]
			    </b>
			</h2>
		</li>
		<li class="separator <? if ($current_user->ID == 0) { echo 'hidden'; } ?>">
			<button id="saveButton" class="btn solid" title="" ng-click="uploadData(true, true)">
				<b class="status-line">
				    <? echo $firstLetter.$secondLetter; ?>
				</b>
				<i class="fas fa-save no-mobile"></i>
			</button>
		</li>
		<li class="separator">
			<button class="btn solid" title="Все расчеты" ng-click="layout.openAside()">
				<i class="fas fa-ellipsis-v"></i>
				<b class="no-mobile">Расчеты</b>
			</button>
		</li>
	</ul>

</header>

<aside class="menu">
    <ul class="nav-head flex">
        <li class="photo">
            <img class="<? if ($current_user->ID == 0) { echo 'hidden'; } ?>" src="<? echo get_avatar_url($current_user->ID) ?>" />
        </li>
        <li class="flex-grow s-p2">
            <div class="text-field name solid capitalize">
                <b>
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
            <button class="btn solid no-shadow" title="Меню" ng-click="layout.isOpenMenu = false">
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

                <ul class="section" data-level="2">
                    <li class="section-title">
                        <button class="btn no-shadow" data-previous title="Авторизация">
                            <i class="fas fa-user-circle"></i>
                        </button>
                        <div class="text-field title"><b>Авторизация</b></div>
                    </li>

                    <li class="section-body">
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

                            <li class="section-body">


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

                                            <li class="flex-grow s-p1">
                                                <div class="multiple-field">
                                                    <label class="text-input flex-grow">
                                                        <input type="text" ng-model="expensesType.name" ng-change="uploadData()">
                                                        <b>{{expensesType.name}}</b>
                                                    </label>

                                                    <label class="text-input flex-grow">
                                                        <input type="text" ng-model="expensesType.icon" ng-change="uploadData()">
                                                        <b>{{expensesType.icon}}</b>
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

                            <li class="section-body">

                                <ul class="settings-list" ng-init="currencies = expCalc.settings.currencies">
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
                                                                <b>Название:</b>
                                                            </div>

                                                            <label class="head">
                                                                <input type="text" ng-model="expCalc.settings.currencies.names[nameIndex]" ng-change="uploadData()">
                                                                <b>{{expCalc.settings.currencies.names[nameIndex]}}</b>
                                                            </label>
                                                        </div>
                                                    </li>

                                                    <li ng-repeat="array in currencies.rates[nameIndex] track by $index" ng-if="expCalc.settings.currencies.names[nameIndex] != currencies.names[$index]">
                                                        <ul class="flex currency-line">
                                                            <li class="flex-shrink flex-hidden">
                                                                <div class="text-field name uppercase">
                                                                    <b>1 {{currencies.names[$index]}}</b>
                                                                </div>
                                                            </li>

                                                            <li class="flex-shrink s-p1">
                                                                <div class="text-field title">
                                                                    <b>=</b>
                                                                </div>
                                                            </li>

                                                            <li class="flex-grow flex-hidden">
                                                                <div class="text-input complex-input">
                                                                    <div class="text-field uppercase">
                                                                        <b>{{expCalc.settings.currencies.names[nameIndex].substring(0, 3)}}</b>
                                                                    </div>

                                                                    <label class="head">
                                                                        <input type="number" ng-model="currencies.rates[nameIndex][$index]" ng-change="uploadData()">
                                                                        <b>{{currencies.rates[nameIndex][$index]}}</b>
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
                                        <script type="text/javascript" src="https://ru.exchange-rates.org/GetCustomContent.aspx?sid=RT000JU97&amp;type=RatesTable&amp;stk=-0L8O3U15SJ" charset="utf-8">
                                        </script>
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

                            <li class="section-body">

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


                                <ul class="settings-list hidden" data-for-android-app>
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
                    <b>Настройки и режимы</b>
                </button>

                <ul class="section" data-level="2">
                    <li class="section-title">
                        <button class="btn no-shadow" data-previous="" title="Настройки и режимы">
                            <i class="fas fa-cog"></i>
                        </button>
                        <div class="text-field title"><b>Настройки и режимы</b></div>
                    </li>

                    <li class="section-body">

                        <ul class="settings-list">
                            <li>
                                <ul class="flex s-p1">
                                    <li class="s-p1">
                                        <label class="text-select currency">
                                            <select ng-model="expCalc.accounts[expCalc.settings.currentAccount].settings.accountCurrency"
                                                    ng-options="key as value for (key, value) in expCalc.settings.currencies.names" ng-change="uploadData()">
                                            </select>
                                            <b>{{expCalc.settings.currencies.names[expCalc.accounts[expCalc.settings.currentAccount].settings.accountCurrency].substring(0, 3)}}</b>
                                        </label>
                                    </li>

                                    <li class="flex-grow s-p1">
                                        <div class="text-field">
                                            <b>Основная валюта в текущем расчете</b>
                                        </div>
                                    </li>
                                </ul>
                            </li>

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
                        </ul>

                    </li>
                </ul>
            </li>
        </ul>

    </div>
</aside>