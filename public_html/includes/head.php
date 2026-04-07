<?php
$page_title = $page_title ?? 'CoRI';
$page_description = $page_description ?? '';
$page_css = $page_css ?? [];
?>
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title><?php echo htmlspecialchars($page_title, ENT_QUOTES, 'UTF-8'); ?></title>

  <?php if ($page_description !== ''): ?>
  <meta name="description" content="<?php echo htmlspecialchars($page_description, ENT_QUOTES, 'UTF-8'); ?>" />
  <?php endif; ?>

  <?php include __DIR__ . '/analytics.php'; ?>

  <?php foreach ($page_css as $css_file): ?>
  <link rel="stylesheet" href="<?php echo htmlspecialchars($css_file, ENT_QUOTES, 'UTF-8'); ?>" />
  <?php endforeach; ?>
</head>
<body>
