<?php
if (!isset($page_title)) {
    $page_title = 'CoRI Lab';
}
if (!isset($page_description)) {
    $page_description = 'Public surface for current CoRI developments.';
}
?>
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title><?= htmlspecialchars($page_title, ENT_QUOTES, 'UTF-8') ?></title>
  <meta
    name="description"
    content="<?= htmlspecialchars($page_description, ENT_QUOTES, 'UTF-8') ?>"
  />
