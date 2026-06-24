<?php
declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: public, max-age=900, stale-while-revalidate=43200');

$cacheDir = __DIR__ . '/../assets/cache';
$cacheFile = $cacheDir . '/google-reviews.json';
$cacheTtl = 12 * 60 * 60;

function json_response(array $payload, int $status = 200): void {
    http_response_code($status);
    echo json_encode($payload, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
    exit;
}

function read_cache(string $file): ?array {
    if (!is_file($file)) {
        return null;
    }
    $raw = file_get_contents($file);
    if ($raw === false) {
        return null;
    }
    $data = json_decode($raw, true);
    return is_array($data) ? $data : null;
}

function fetch_json(string $url): array {
    $context = stream_context_create([
        'http' => [
            'timeout' => 8,
            'ignore_errors' => true,
            'header' => "Accept: application/json
",
        ],
    ]);
    $raw = @file_get_contents($url, false, $context);
    if ($raw === false) {
        throw new RuntimeException('Google review request failed.');
    }
    $data = json_decode($raw, true);
    if (!is_array($data)) {
        throw new RuntimeException('Google review response was not valid JSON.');
    }
    return $data;
}

function normalize_review(array $review): array {
    return [
        'author_name' => $review['author_name'] ?? 'Google reviewer',
        'rating' => isset($review['rating']) ? (float) $review['rating'] : null,
        'relative_time_description' => $review['relative_time_description'] ?? '',
        'text' => $review['text'] ?? '',
        'time' => $review['time'] ?? null,
        'author_url' => $review['author_url'] ?? '',
        'profile_photo_url' => $review['profile_photo_url'] ?? '',
    ];
}

$cached = read_cache($cacheFile);
if ($cached && isset($cached['cached_at']) && (time() - (int) $cached['cached_at']) < $cacheTtl) {
    json_response($cached + ['source' => 'cache']);
}

$apiKey = getenv('GOOGLE_PLACES_API_KEY') ?: getenv('GOOGLE_MAPS_API_KEY') ?: getenv('PLACES_API_KEY');
$placeId = getenv('GOOGLE_PLACE_ID') ?: '';
$searchQuery = getenv('GOOGLE_REVIEW_SEARCH_QUERY') ?: 'Twin Rivers Fence Grass Valley CA';

if (!$apiKey) {
    if ($cached) {
        json_response($cached + ['source' => 'stale-cache', 'stale' => true]);
    }
    json_response([
        'ok' => false,
        'needs_configuration' => true,
        'message' => 'Set GOOGLE_PLACES_API_KEY on the hosting environment to load real Google reviews.',
        'cached_at' => time(),
    ], 503);
}

try {
    if ($placeId === '') {
        $findUrl = 'https://maps.googleapis.com/maps/api/place/findplacefromtext/json?' . http_build_query([
            'input' => $searchQuery,
            'inputtype' => 'textquery',
            'fields' => 'place_id,name',
            'key' => $apiKey,
        ]);
        $find = fetch_json($findUrl);
        if (($find['status'] ?? '') !== 'OK' || empty($find['candidates'][0]['place_id'])) {
            throw new RuntimeException('Twin Rivers Fence Google Business Profile could not be found.');
        }
        $placeId = $find['candidates'][0]['place_id'];
    }

    $detailsUrl = 'https://maps.googleapis.com/maps/api/place/details/json?' . http_build_query([
        'place_id' => $placeId,
        'fields' => 'place_id,name,rating,user_ratings_total,reviews,url',
        'reviews_sort' => 'newest',
        'key' => $apiKey,
    ]);
    $details = fetch_json($detailsUrl);
    if (($details['status'] ?? '') !== 'OK' || empty($details['result'])) {
        throw new RuntimeException('Twin Rivers Fence Google review details were unavailable.');
    }

    $result = $details['result'];
    $payload = [
        'ok' => true,
        'cached_at' => time(),
        'place_id' => $result['place_id'] ?? $placeId,
        'name' => $result['name'] ?? 'Twin Rivers Fence',
        'rating' => isset($result['rating']) ? (float) $result['rating'] : null,
        'user_ratings_total' => isset($result['user_ratings_total']) ? (int) $result['user_ratings_total'] : null,
        'url' => $result['url'] ?? ('https://www.google.com/maps/search/?api=1&query=Twin%20Rivers%20Fence&query_place_id=' . rawurlencode($placeId)),
        'reviews' => array_map('normalize_review', $result['reviews'] ?? []),
    ];

    if (!is_dir($cacheDir)) {
        mkdir($cacheDir, 0755, true);
    }
    file_put_contents($cacheFile, json_encode($payload, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE));
    json_response($payload + ['source' => 'google']);
} catch (Throwable $error) {
    if ($cached) {
        json_response($cached + ['source' => 'stale-cache', 'stale' => true]);
    }
    json_response([
        'ok' => false,
        'message' => $error->getMessage(),
        'cached_at' => time(),
    ], 502);
}
