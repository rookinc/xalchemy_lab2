<?php
declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');

function json_out(array $payload, int $status = 200): void {
  http_response_code($status);
  echo json_encode($payload, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);
  exit;
}

function petersen_payload(string $lensKey = 'identity'): array {
  $nodes = [];
  $edges = [];
  $view_nodes = [];

  for ($i = 0; $i < 5; $i++) {
    $nodes[] = [
      'id' => $i + 1,
      'node_key' => "u{$i}",
      'label' => "u{$i}",
    ];
  }

  for ($i = 0; $i < 5; $i++) {
    $nodes[] = [
      'id' => $i + 6,
      'node_key' => "v{$i}",
      'label' => "v{$i}",
    ];
  }

  $edgeId = 1;
  $addEdge = function (int $source, int $target, string $key, string $class = 'edge') use (&$edges, &$edgeId): void {
    $edges[] = [
      'id' => $edgeId++,
      'edge_key' => $key,
      'edge_class' => $class,
      'source_node_id' => $source,
      'target_node_id' => $target,
    ];
  };

  // outer pentagon
  for ($i = 0; $i < 5; $i++) {
    $a = $i + 1;
    $b = (($i + 1) % 5) + 1;
    $addEdge($a, $b, "outer_{$i}", 'outer');
  }

  // spokes
  for ($i = 0; $i < 5; $i++) {
    $addEdge($i + 1, $i + 6, "spoke_{$i}", 'spoke');
  }

  // inner star
  for ($i = 0; $i < 5; $i++) {
    $a = $i + 6;
    $b = (($i + 2) % 5) + 6;
    $addEdge($a, $b, "inner_{$i}", 'inner');
  }

  // local coordinates, centered by JS later
  for ($i = 0; $i < 5; $i++) {
    $theta = -M_PI / 2 + (2 * M_PI * $i / 5);
    $view_nodes[] = [
      'graph_node_id' => $i + 1,
      'x' => cos($theta) * 230,
      'y' => sin($theta) * 230,
      'pinned' => false,
      'style_json' => null,
    ];
  }

  for ($i = 0; $i < 5; $i++) {
    $theta = -M_PI / 2 + (2 * M_PI * $i / 5);
    $view_nodes[] = [
      'graph_node_id' => $i + 6,
      'x' => cos($theta) * 105,
      'y' => sin($theta) * 105,
      'pinned' => false,
      'style_json' => null,
    ];
  }

  return [
    'graph' => [
      'id' => 1,
      'graph_key' => 'petersen',
      'label' => 'Petersen Graph',
    ],
    'source_graph' => [
      'id' => 1,
      'graph_key' => 'petersen',
      'label' => 'Petersen Graph',
    ],
    'view' => [
      'view_key' => $lensKey,
      'label' => $lensKey === 'identity' ? 'Identity Lens' : ucfirst($lensKey) . ' Lens',
      'params_json' => [
        'nodeRadius' => 10,
        'springLength' => 110,
        'springK' => 0.035,
        'chargeK' => 3200,
        'damping' => 0.78,
      ],
    ],
    'nodes' => $nodes,
    'edges' => $edges,
    'view_nodes' => $view_nodes,
    'view_edges' => [],
  ];
}

$rawPath = $_GET['path'] ?? '/api/graphs';
$path = parse_url($rawPath, PHP_URL_PATH) ?: '/api/graphs';
$segments = array_values(array_filter(explode('/', trim($path, '/'))));

if ($segments === ['api', 'graphs']) {
  json_out([
    'items' => [
      [
        'id' => 1,
        'graph_key' => 'petersen',
        'label' => 'Petersen Graph',
      ],
    ],
  ]);
}

if (count($segments) >= 3 && $segments[0] === 'api' && $segments[1] === 'graphs') {
  $graphKey = $segments[2];

  if ($graphKey !== 'petersen') {
    json_out(['error' => "Unknown local graph '{$graphKey}'"], 404);
  }

  if (count($segments) === 3) {
    json_out(petersen_payload());
  }

  if (($segments[3] ?? '') === 'lenses' && count($segments) === 4) {
    json_out([
      'items' => [
        [
          'lens_key' => 'identity',
          'label' => 'Identity Lens',
        ],
      ],
    ]);
  }

  if (($segments[3] ?? '') === 'lenses' && count($segments) === 6 && ($segments[5] ?? '') === 'derive') {
    $lensKey = $segments[4] ?: 'identity';
    json_out(petersen_payload($lensKey));
  }

  if (($segments[3] ?? '') === 'walkers' && count($segments) === 4) {
    json_out(['items' => []]);
  }

  if (($segments[3] ?? '') === 'walkers' && count($segments) >= 6 && ($segments[5] ?? '') === 'realize') {
    json_out(petersen_payload('walker'));
  }
}

json_out([
  'error' => 'No local API shim route matched.',
  'path' => $path,
  'segments' => $segments,
], 404);
