<?php

$db_con = mysql_connect("127.0.0.1", "root", "");
mysql_select_db("symfony", $db_con);
$courses_result = mysql_query("SELECT * FROM courses");

header('Content-Type: application/json');

echo "[";

$first = true;
while ($row = mysql_fetch_array($courses_result)) {
  $json = json_encode($row);

  if($first)
    $first = false;
  else if($json)
    echo ",";

  echo $json;
}

echo "]"

?>
