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
define('DB_NAME', 'ecalc');

/** Имя пользователя MySQL */
define('DB_USER', 'root');

/** Пароль к базе данных MySQL */
define('DB_PASSWORD', '');

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
define('AUTH_KEY',         'xhdJrFCJ3X2)6ph8ng1sE(y2Hw;VDQ%ebafvVi=1]_2>i_|%j3*>5,s`:}f:FvUb');
define('SECURE_AUTH_KEY',  '[b-j09?Nz,!?:L=3nCc,2E;Yk-}a4?n=h2:Z:r2j}-|XJ{U9-$2>c8QITc_Ozez)');
define('LOGGED_IN_KEY',    'qq_a@B;_S|:Rq=#EqkB4h?,:a(.1}G{mHB*(,nkVW|usrndM?g$~08(,#JK5m&^z');
define('NONCE_KEY',        'Wnj!L/5MD)3DkW)MXUx7#Pz^sO70T <r_W[Ld<$+NhD9MZ6&L2A]@U|<QPI*Dt.h');
define('AUTH_SALT',        'uSwIJJbLy~$O)e !j7M,W*pb&+L8K#AFOJr)[oG{.I S>q^#SEvr*uflNpDq$hw:');
define('SECURE_AUTH_SALT', 'b~#jSS3AL:c|yjVRDHmymw@L(CZ{s^j`=LJ%P:8%)d>pa1HWA-}P}I*{3gH~<F-5');
define('LOGGED_IN_SALT',   'Jiv_9gzqLnRmxtU0tKQx CseiIU+KNb!l.hiy#G:DUrGRA=X yl6S#}b1wq66LT$');
define('NONCE_SALT',       '_XwGMFFA-<?IVPxO7Ytwn<}tObUv s(f3UZ`3Xw!L9=Z]bU0<r1KR7%sj2qyMH&w');

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
