<?php
/**
 * Функции шаблона (function.php)
 * @package WordPress
 * @subpackage ecalc-template
 */

add_theme_support('title-tag'); // теперь тайтл управляется самим вп

register_nav_menus(array( // Регистрируем 2 меню
	'top' => 'Верхнее', // Верхнее
	'bottom' => 'Внизу' // Внизу
));

add_theme_support('post-thumbnails'); // включаем поддержку миниатюр
set_post_thumbnail_size(250, 150); // задаем размер миниатюрам 250x150
add_image_size('big-thumb', 400, 400, true); // добавляем еще один размер картинкам 400x400 с обрезкой

register_sidebar(array( // регистрируем левую колонку, этот кусок можно повторять для добавления новых областей для виджитов
	'name' => 'Сайдбар', // Название в админке
	'id' => "sidebar", // идентификатор для вызова в шаблонах
	'description' => 'Обычная колонка в сайдбаре', // Описалово в админке
	'before_widget' => '<div id="%1$s" class="widget %2$s">', // разметка до вывода каждого виджета
	'after_widget' => "</div>\n", // разметка после вывода каждого виджета
	'before_title' => '<span class="widgettitle">', //  разметка до вывода заголовка виджета
	'after_title' => "</span>\n", //  разметка после вывода заголовка виджета
));

if (!class_exists('clean_comments_constructor')) { // если класс уже есть в дочерней теме - нам не надо его определять
	class clean_comments_constructor extends Walker_Comment { // класс, который собирает всю структуру комментов
		public function start_lvl( &$output, $depth = 0, $args = array()) { // что выводим перед дочерними комментариями
			$output .= '<ul class="children">' . "\n";
		}
		public function end_lvl( &$output, $depth = 0, $args = array()) { // что выводим после дочерних комментариев
			$output .= "</ul><!-- .children -->\n";
		}
	    protected function comment( $comment, $depth, $args ) { // разметка каждого комментария, без закрывающего </li>!
	    	$classes = implode(' ', get_comment_class()).($comment->comment_author_email == get_the_author_meta('email') ? ' author-comment' : ''); // берем стандартные классы комментария и если коммент пренадлежит автору поста добавляем класс author-comment
	        echo '<li id="comment-'.get_comment_ID().'" class="'.$classes.' media">'."\n"; // родительский тэг комментария с классами выше и уникальным якорным id
	    	echo '<div class="media-left">'.get_avatar($comment, 64, '', get_comment_author(), array('class' => 'media-object'))."</div>\n"; // покажем аватар с размером 64х64
	    	echo '<div class="media-body">';
	    	echo '<span class="meta media-heading">Автор: '.get_comment_author()."\n"; // имя автора коммента
	    	//echo ' '.get_comment_author_email(); // email автора коммента, плохой тон выводить почту
	    	echo ' '.get_comment_author_url(); // url автора коммента
	    	echo ' Добавлено '.get_comment_date('F j, Y в H:i')."\n"; // дата и время комментирования
	    	if ( '0' == $comment->comment_approved ) echo '<br><em class="comment-awaiting-moderation">Ваш комментарий будет опубликован после проверки модератором.</em>'."\n"; // если комментарий должен пройти проверку
	    	echo "</span>";
	        comment_text()."\n"; // текст коммента
	        $reply_link_args = array( // опции ссылки "ответить"
	        	'depth' => $depth, // текущая вложенность
	        	'reply_text' => 'Ответить', // текст
				'login_text' => 'Вы должны быть залогинены' // текст если юзер должен залогинеться
	        );
	        echo get_comment_reply_link(array_merge($args, $reply_link_args)); // выводим ссылку ответить
	        echo '</div>'."\n"; // закрываем див
	    }
	    public function end_el( &$output, $comment, $depth = 0, $args = array() ) { // конец каждого коммента
			$output .= "</li><!-- #comment-## -->\n";
		}
	}
}

if (!function_exists('pagination')) { // если ф-я уже есть в дочерней теме - нам не надо её определять
	function pagination() { // функция вывода пагинации
		global $wp_query; // текущая выборка должна быть глобальной
		$big = 999999999; // число для замены
		$links = paginate_links(array( // вывод пагинации с опциями ниже
			'base' => str_replace($big,'%#%',esc_url(get_pagenum_link($big))), // что заменяем в формате ниже
			'format' => '?paged=%#%', // формат, %#% будет заменено
			'current' => max(1, get_query_var('paged')), // текущая страница, 1, если $_GET['page'] не определено
			'type' => 'array', // нам надо получить массив
			'prev_text'    => 'Назад', // текст назад
	    	'next_text'    => 'Вперед', // текст вперед
			'total' => $wp_query->max_num_pages, // общие кол-во страниц в пагинации
			'show_all'     => false, // не показывать ссылки на все страницы, иначе end_size и mid_size будут проигнорированны
			'end_size'     => 15, //  сколько страниц показать в начале и конце списка (12 ... 4 ... 89)
			'mid_size'     => 15, // сколько страниц показать вокруг текущей страницы (... 123 5 678 ...).
			'add_args'     => false, // массив GET параметров для добавления в ссылку страницы
			'add_fragment' => '',	// строка для добавления в конец ссылки на страницу
			'before_page_number' => '', // строка перед цифрой
			'after_page_number' => '' // строка после цифры
		));
	 	if( is_array( $links ) ) { // если пагинация есть
		    echo '<ul class="pagination">';
		    foreach ( $links as $link ) {
		    	if ( strpos( $link, 'current' ) !== false ) echo "<li class='active'>$link</li>"; // если это активная страница
		        else echo "<li>$link</li>"; 
		    }
		   	echo '</ul>';
		 }
	}
}

// область виджета на страницах
if (function_exists('register_sidebar')){
   register_sidebar( array(
        'name'          => 'Область на страницах', //название виджета в админ-панели
        'id'            => 'wsidebar-2', //идентификатор виджета
        'description'   => 'контент для страниц', //описание виджета в админ-панели
        'before_widget' => '<div id="%1$s" class="widget %2$s">', //открывающий тег виджета с динамичным идентификатором
        'after_widget'  => '<div class="clear"></div></div>', //закрывающий тег виджета с очищающим блоком
        'before_title'  => '<span class="widget-title">', //открывающий тег заголовка виджета
        'after_title'   => '</span>',//закрывающий тег заголовка виджета
        ) );
}

add_action( 'wp_enqueue_scripts', 'add_scripts_to_head' );
if (!function_exists('add_scripts_to_head')) {
    function add_scripts_to_head() {
        wp_enqueue_script('production', get_template_directory_uri().'/assets/js/production.js?ver=2','','',false);
//        wp_enqueue_script('production', get_template_directory_uri().'/assets/js/production.min.js?ver=2','','',false);
    }
}

add_action('wp_footer', 'add_scripts'); // приклеем ф-ю на добавление скриптов в футер
if (!function_exists('add_scripts')) { // если ф-я уже есть в дочерней теме - нам не надо её определять
	function add_scripts() { // добавление скриптов
	    if(is_admin()) return false; // если мы в админке - ничего не делаем
	    wp_deregister_script('jquery'); // выключаем стандартный jquery
	    wp_deregister_script( 'wp-embed' ); // отключено: позволяет пользователям вставлять содержимое из других сайтов
//	    wp_enqueue_script('jquery','//ajax.googleapis.com/ajax/libs/jquery/1.11.3/jquery.min.js','','',true); // добавляем свой
//	    wp_enqueue_script('bootstrap', get_template_directory_uri().'/js/bootstrap.min.js','','',true); // бутстрап
//	    wp_enqueue_script('main', get_template_directory_uri().'/js/main.js','','',true); // и скрипты шаблона
	}
}

// Без этого условия не выводится контент на страницах, созданные из админки WordPress
if (!function_exists('content_class_by_sidebar')) { // если ф-я уже есть в дочерней теме - нам не надо её определять
	function content_class_by_sidebar() { // функция для вывода класса в зависимости от существования виджетов в сайдбаре
		if (is_active_sidebar( 'sidebar' )) { // если есть
			echo 'col-sm-9'; // пишем класс на 80% ширины
		} else { // если нет
			echo 'col-sm-12'; // контент на всю ширину
		}
	}
}

add_action('wp_print_styles', 'add_styles'); // приклеем ф-ю на добавление стилей в хедер
if (!function_exists('add_styles')) { // если ф-я уже есть в дочерней теме - нам не надо её определять
	function add_styles() { // добавление стилей
	    if(is_admin()) return false; // если мы в админке - ничего не делаем
//	    wp_enqueue_style( 'bs', get_template_directory_uri().'/ui/css/app-old.css' );
		wp_enqueue_style( 'style', get_template_directory_uri().'/assets/css/app.css?ver=2' ); // основные стили шаблона
//		wp_enqueue_style( 'style', get_template_directory_uri().'/assets/css/app.pref.css?ver=2' ); // основные стили шаблона
	}
}

/*-----------------------------------------------------------------------------------*/
/* Убираем мусор: feed, shortlink
/*-----------------------------------------------------------------------------------*/
function mw_clear_wp_head()
{
  add_filter('xmlrpc_enabled', '__return_false');
  remove_action( 'wp_head', 'feed_links', 2 ); // Удаляет ссылки RSS-лент записи и комментариев
  remove_action( 'wp_head', 'feed_links_extra', 3 ); // Удаляет ссылки RSS-лент категорий и архивов

  remove_action( 'wp_head', 'rsd_link' ); // Удаляет RSD ссылку для удаленной публикации
  remove_action( 'wp_head', 'wlwmanifest_link' ); // Удаляет ссылку Windows для Live Writer
  remove_action( 'wp_head', 'wp_generator' ); // Удаляет версию WordPress

  remove_action( 'wp_head', 'wp_shortlink_wp_head', 10, 0); // Удаляет короткую ссылку
  remove_action( 'wp_head', 'adjacent_posts_rel_link_wp_head', 10, 0 ); // Удаляет ссылки на предыдущую и следующую статьи
}
add_action( 'wp_head', 'mw_clear_wp_head', 1 );


/*-----------------------------------------------------------------------------------*/
/* Боримся с wp-json
/*-----------------------------------------------------------------------------------*/

// Отключаем сам REST API
 add_filter('rest_enabled', '__return_false');

// Отключаем события REST API
 remove_action( 'init', 'rest_api_init' );
 remove_action( 'rest_api_init', 'rest_api_default_filters', 10, 1 );
 remove_action( 'parse_request', 'rest_api_loaded' );

// Отключаем Embeds связанные с REST API
 remove_action( 'rest_api_init', 'wp_oembed_register_route' );
 remove_filter( 'rest_pre_serve_request', '_oembed_rest_pre_serve_request', 10, 4 );

// Отключаем фильтры REST API
 remove_action( 'xmlrpc_rsd_apis', 'rest_output_rsd' );
 remove_action( 'wp_head', 'rest_output_link_wp_head', 10, 0 );
 remove_action( 'template_redirect', 'rest_output_link_header', 11, 0 );
 remove_action( 'auth_cookie_malformed', 'rest_cookie_collect_status' );
 remove_action( 'auth_cookie_expired', 'rest_cookie_collect_status' );
 remove_action( 'auth_cookie_bad_username', 'rest_cookie_collect_status' );
 remove_action( 'auth_cookie_bad_hash', 'rest_cookie_collect_status' );
 remove_action( 'auth_cookie_valid', 'rest_cookie_collect_status' );
 remove_filter( 'rest_authentication_errors', 'rest_cookie_check_errors', 100 );

//Отключаем type="application/json+oembed"
 remove_action( 'wp_head', 'wp_oembed_add_discovery_links' );
 remove_action( 'wp_head', 'rest_output_link_wp_head' );
 remove_action( 'template_redirect', 'rest_output_link_header', 11, 0 );


/*-----------------------------------------------------------------------------------*/
/* При регистрации нового пользователя в таблице wp_users подставляем json_id
/* для связки с новым json-объектом
/*-----------------------------------------------------------------------------------*/

add_action( 'user_register', 'add_user_json_id' );
function add_user_json_id( $user_id ) {
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

	$sql = "UPDATE wp_users SET json_id = $user_id WHERE ID = $user_id;";

	if ($conn->query($sql) === TRUE) {
//		echo "New record created successfully";
	} else {
		echo "Error: " . $sql . "<br>" . $conn->error;
	}

	$conn->close();
}

?>
