<?php
/**
 * Основные параметры WordPress.
 *
 * Скрипт для создания wp-config.php использует этот файл в процессе
 * установки. Необязательно использовать веб-интерфейс, можно
 * скопировать файл в "wp-config.php" и заполнить значения вручную.
 *
 * Этот файл содержит следующие параметры:
 *
 * * Настройки MySQL
 * * Секретные ключи
 * * Префикс таблиц базы данных
 * * ABSPATH
 *
 * @link https://codex.wordpress.org/Editing_wp-config.php
 *
 * @package WordPress
 */

// ** Параметры MySQL: Эту информацию можно получить у вашего хостинг-провайдера ** //
/** Имя базы данных для WordPress */
define('DB_NAME', 'host1638368_1647');

/** Имя пользователя MySQL */
define('DB_USER', 'host1638368_1647');

/** Пароль к базе данных MySQL */
define('DB_PASSWORD', 'vl@d161010');

/** Имя сервера MySQL */
define('DB_HOST', 'localhost');

/** Кодировка базы данных для создания таблиц. */
define('DB_CHARSET', 'utf8');

/** Схема сопоставления. Не меняйте, если не уверены. */
define('DB_COLLATE', '');

/**#@+
 * Уникальные ключи и соли для аутентификации.
 *
 * Смените значение каждой константы на уникальную фразу.
 * Можно сгенерировать их с помощью {@link https://api.wordpress.org/secret-key/1.1/salt/ сервиса ключей на WordPress.org}
 * Можно изменить их, чтобы сделать существующие файлы cookies недействительными. Пользователям потребуется авторизоваться снова.
 *
 * @since 2.6.0
 */
define('AUTH_KEY',         '0?Ty>fL(.j,|R16Ow+u,6U%X/6DgAeP$}LaXsn/(V#[4qsb*yRzo]kD9|&{/j=kF');
define('SECURE_AUTH_KEY',  'UE}J|Qhc/*Y0qQ[I-zu%`(hF?A}bf}_*#Bp_8O AuZXDi;QIDhA0[!D?bh0K5N.Z');
define('LOGGED_IN_KEY',    'F*%6w1dgC,Ep<=UFML~SSref$0<oe8UM$/={u8,4N0%,h~4eeP32!D. 5H&rg*M=');
define('NONCE_KEY',        '0~b)7&5 zZ+HU8r)i(J)UD?!B![=C;24`@OER}&.BpQrn)6v(^IOvz;Ze^ eX e~');
define('AUTH_SALT',        'rD]N:dO)g|35uaI>:9%I%wzS|m ?~ac^$ ih.XU.&Wr7K6}H-$4 b<ExjTtkY-`W');
define('SECURE_AUTH_SALT', 'q^@bB`mXGD1,h|(3pj8)%!M0wfC3jpGkUSwl3$CCqE;,-T|0m~A957Qu-VOrP,ma');
define('LOGGED_IN_SALT',   'u[Z0IV|Z}LUtG6%3i#g/PBXmbx+e@S-[K;>e2OT_+bqZWTXnwc:8&f7$JaIu*|9.');
define('NONCE_SALT',       '!v_?q1`oo!f!Sk{7YV8_<$m(e}6Yi; m{6*Y>B$-&^ gAx:H}<A/t8DMi~Vrzs#5');

/**#@-*/

/**
 * Префикс таблиц в базе данных WordPress.
 *
 * Можно установить несколько сайтов в одну базу данных, если использовать
 * разные префиксы. Пожалуйста, указывайте только цифры, буквы и знак подчеркивания.
 */
$table_prefix  = 'wp_';

/**
 * Для разработчиков: Режим отладки WordPress.
 *
 * Измените это значение на true, чтобы включить отображение уведомлений при разработке.
 * Разработчикам плагинов и тем настоятельно рекомендуется использовать WP_DEBUG
 * в своём рабочем окружении.
 * 
 * Информацию о других отладочных константах можно найти в Кодексе.
 *
 * @link https://codex.wordpress.org/Debugging_in_WordPress
 */
define('WP_DEBUG', false);

/* Это всё, дальше не редактируем. Успехов! */

/** Абсолютный путь к директории WordPress. */
if ( !defined('ABSPATH') )
	define('ABSPATH', dirname(__FILE__) . '/');

/** Инициализирует переменные WordPress и подключает файлы. */
require_once(ABSPATH . 'wp-settings.php');
