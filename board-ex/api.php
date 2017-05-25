<?php

$method = $_SERVER['REQUEST_METHOD'];
$path = 'json/adverts.json';
$json = json_decode(file_get_contents($path), true);
$uriArray = explode("/", $_SERVER['REQUEST_URI']);
$id = $uriArray[2];
$isOneItem = (is_numeric($id) && $id >= 0) ? true : false;


switch ($method) {
  case 'PUT':
	foreach($json as $key => $struct) {
		if ($struct['id'] == $id) {
			$json[$key] = json_decode(file_get_contents("php://input"));
			break;
		}
	}

	$fp = fopen($path, 'w');
	fwrite($fp, json_encode($json));
	fclose($fp);

    break;

  case 'POST':
	$newItem = json_decode(file_get_contents("php://input"), true);
	$lastElement = end($json);
	$newItem['id'] = $lastElement['id'] + 1;
	array_push($json, $newItem);

	$fp = fopen($path, 'w');
	fwrite($fp, json_encode($json));
	fclose($fp);

 	echo json_encode($newItem);

    break;

  case 'GET':
	$result = new stdClass();

	if ($isOneItem) {
		foreach($json as $struct) {
			if ($struct['id'] == $id) {
				$result = $struct;
				break;
			}
		}
	} else {
		if ($id == "") $result = $json;
	}

	echo json_encode($result);

    break;

  case 'DELETE':
	foreach($json as $key => $struct) {
		if ($struct['id'] == $id) {
			array_splice($json, $key, 1);
			break;
		}
	}

	$fp = fopen($path, 'w');
	fwrite($fp, json_encode($json));
	fclose($fp);

	break;

  default:
    echo 'default: '.$_SERVER['REQUEST_URI'];
    break;
}

?>