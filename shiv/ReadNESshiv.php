<?php

error_reporting(0);
header("Cache-Control: private");

if (!$_FILES) {
    die();
}

$file = $_FILES["files"]["tmp_name"][0];
$handle = fopen($file, "r");

$data = array();
$data["main"] = base64_encode(fread($handle, filesize($file)));
$data["name"] = $_FILES["files"]["name"][0];

echo json_encode($data);

?>