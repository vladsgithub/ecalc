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
			$username = "root";
			$password = "";
			$dbname = "ecalc";

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

		echo "<script language='JavaScript'>var fromServerData = '$loadedData';</script>";
    ?>

</head>

<body id="body" ng-app="app" ng-controller="calculatorCtrl" ng-cloak="true"
	ng-class="{'open-menu': layout.isOpenMenu, 'open-aside': layout.isOpenAside}" data-upload-status="1">





<header>

	<ul class="head flex">
		<li>
			<button class="btn solid" title="Меню" ng-click="layout.openMenu()">
				<i class="fas fa-bars"></i>
				<b class="no-mobile">Меню</b>
			</button>
		</li>
		<li class="title flex-grow separator">
			<h1>Cost panel</h1>
			<h2>Название расчета</h2>
		</li>
		<li class="separator">
			<button class="btn solid" disabled title="Все изменения сохранены">
				<b class="status-line">ВС</b>
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

<nav>
    <ul class="nav-head flex">
        <li class="photo">

        </li>
        <li class="flex-grow">
            <div class="text-field name solid">
                <b>
                    <?
                        echo $current_user->user_firstname.' '.$current_user->user_lastname;
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

    <div id="navBody" class="nav-body">

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

                    <li>
                        <button class="btn solid no-shadow" data-next>
                            <i class="fas fa-sign-in-alt"></i>
                            <b>Войти / Выйти</b>
                        </button>

                        <ul class="section" data-level="3">
                            <li class="section-title">
                                <button class="btn no-shadow" data-previous title="Войти / Выйти">
                                    <i class="fas fa-sign-in-alt"></i>
                                </button>
                                <div class="text-field title"><b>Войти / Выйти</b></div>
                            </li>

                            <li class="section-body">
                                <div class="section-page">
                                    <?
                // В админке в разделе 'страницы', обязательно необходимо вставить (активировать) шорткод на какой-нибудь странице [clean-login]
                // пусть даже неиспользуемой на сайте (можно просто выделить целую страницу для авторизации - login),
                // после этого в настройках Clean Login можно будет увидеть вверху, что указанный шорткод уже используется и тогда
                // этот плагин будет нормально работать

                                        echo do_shortcode('[clean-login]');
                                    ?>
                                </div>
                            </li>
                        </ul>
                    </li>

                    <li>
                        <button class="btn solid no-shadow" data-next>
                            <i class="fas fa-user-plus"></i>
                            <b>Регистрация</b>
                        </button>

                        <ul class="section" data-level="3">
                            <li class="section-title">
                                <button class="btn no-shadow" data-previous title="Регистрация">
                                    <i class="fas fa-user-plus"></i>
                                </button>
                                <div class="text-field title"><b>Регистрация</b></div>
                            </li>

                            <li class="section-body">
                                <div class="section-page">
                                    <?
                                        echo do_shortcode('[clean-login-register]');
                                    ?>
                                </div>
                            </li>
                        </ul>
                    </li>

                    <li>
                        <button class="btn solid no-shadow" data-next>
                            <i class="fas fa-user-edit"></i>
                            <b>Редактирование</b>
                        </button>

                        <ul class="section" data-level="3">
                            <li class="section-title">
                                <button class="btn no-shadow" data-previous title="Редактирование">
                                    <i class="fas fa-user-edit"></i>
                                </button>
                                <div class="text-field title"><b>Редактирование</b></div>
                            </li>

                            <li class="section-body">
                                <div class="section-page">
                                    <?
                                        echo do_shortcode('[clean-login-edit]');
                                    ?>
                                </div>
                            </li>
                        </ul>
                    </li>

                    <li>
                        <button class="btn solid no-shadow" data-next>
                            <i class="fas fa-user-check"></i>
                            <b>Восстановление</b>
                        </button>

                        <ul class="section" data-level="3">
                            <li class="section-title">
                                <button class="btn no-shadow" data-previous title="Восстановление">
                                    <i class="fas fa-user-check"></i>
                                </button>
                                <div class="text-field title"><b>Восстановление</b></div>
                            </li>

                            <li class="section-body">
                                <div class="section-page">
                                    <?
                                        echo do_shortcode('[clean-login-restore]');
                                    ?>
                                </div>
                            </li>
                        </ul>
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
                                                <label class="text-input">
                                                    <input type="text" ng-model="expensesType.name" onchange="uploadData()">
                                                    <b>{{expensesType.name}}</b>
                                                </label>
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
                                                                <input type="text" ng-model="expCalc.settings.currencies.names[nameIndex]" onchange="uploadData()">
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
                                                                        <input type="number" ng-model="currencies.rates[nameIndex][$index]" onchange="uploadData()">
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
                                </ul>

                            </li>
                        </ul>
                    </li>
                </ul>
            </li>

            <li>
                <button class="btn solid no-shadow" data-next>
                    <i class="fas fa-database"></i>
                    <b>Работа с данными</b>
                </button>

                <ul class="section" data-level="2">
                    <li class="section-title">
                        <button class="btn no-shadow" data-previous="" title="Работа с данными">
                            <i class="fas fa-database"></i>
                        </button>
                        <div class="text-field title"><b>Работа с данными</b></div>
                    </li>

                    <li class="section-body">

                        <ul class="mode-list">
                            <li>
                                <ul class="flex s-p1">
                                    <li class="s-p1">
                                        <label class="toggle">
                                            <input type="checkbox">
                                            <i></i>
                                        </label>
                                    </li>

                                    <li class="flex-grow s-p1">
                                        <div class="text-field line-through">
                                            <b>Режим удаления данных</b>
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
</nav>

<aside ng-class="{'edit-mode': layout.isEditAccountsMode}">
    <ul class="aside-head flex">
        <li class="s-p2">
            <label class="toggle">
                <input type="checkbox" ng-model="layout.isEditAccountsMode">
                <i></i>
            </label>
        </li>

        <li class="flex-grow">
            <div class="text-field bold">
                <b>Режим редактирования</b>
            </div>
        </li>
    </ul>

    <div class="aside-body">

        <ul>
            <li class="account flex active">
                <div>
                    <button class="btn solid edit-mode no-shadow">
                        <i class="fas fa-trash-alt"></i>
                    </button>
                </div>

                <div class="flex-grow">
                    <button class="btn solid view-mode">
                        <b>Название расчета</b>
                    </button>

                    <label class="text-input edit-mode">
                        <input type="text" value="Tекст ДублированныйтекстДублированный текст">
                        <b>Tекст ДублированныйтекстДублированный текст</b>
                    </label>
                </div>
            </li>

            <li class="account flex">
                <div>
                    <button class="btn solid edit-mode no-shadow">
                        <i class="fas fa-trash-alt"></i>
                    </button>
                </div>

                <div class="flex-grow">
                    <button class="btn solid view-mode">
                        <b>Название расчета</b>
                    </button>

                    <label class="text-input edit-mode">
                        <input type="text" value="Tекст ДублированныйтекстДублированный текст">
                        <b>Tекст ДублированныйтекстДублированный текст</b>
                    </label>
                </div>
            </li>

            <li class="account flex">
                <div>
                    <button class="btn solid edit-mode no-shadow">
                        <i class="fas fa-trash-alt"></i>
                    </button>
                </div>

                <div class="flex-grow">
                    <button class="btn solid view-mode">
                        <b>Название расчета</b>
                    </button>

                    <label class="text-input edit-mode">
                        <input type="text" value="Tекст ДублированныйтекстДублированный текст">
                        <b>Tекст ДублированныйтекстДублированный текст</b>
                    </label>
                </div>
            </li>


            <li class="account edit-mode flex">
                <div>
                    <button class="btn no-shadow">
                        <i class="fas fa-plus"></i>
                    </button>
                </div>

                <div class="flex-grow s-p1">
                    <div class="text-field solid">
                        <b>Создать новый расчет</b>
                    </div>
                </div>
            </li>
        </ul>

    </div>
</aside>














<input id="dataHiddenAria" type="checkbox" />
<div head data-hidden-aria>

		<?
//			echo 'Username: ' . $current_user->user_login . '<br />';
//			echo 'email: ' . $current_user->user_email . '<br />';
//			echo 'first name: ' . $current_user->user_firstname . '<br />';
//			echo 'last name: ' . $current_user->user_lastname . '<br />';
//			echo 'Отображаемое имя: ' . $current_user->display_name . '<br />';
//			echo 'ID: ' . $current_user->ID . '<br />';
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

		<button class="btn btn-primary" ng-click="downloadData()">
        		<i class="fa fa-save"></i>
        </button>

        <input type="file" onchange="loadData(event)" />

</div>