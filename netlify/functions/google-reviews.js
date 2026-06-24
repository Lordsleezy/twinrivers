// Twin Rivers Fence — Place ID (Google Maps)
// Obtained from: https://www.google.com/maps/search/Twin+Rivers+Fence+Grass+Valley+CA
// To re-verify: search the business on Google Maps and extract the CID/place_id from the URL
const DEFAULT_PLACE_ID = 'ChIJN_sBpJkMmoAR_sRjCkwUW8E';
const DEFAULT_QUERY = 'Twin Rivers Fence Grass Valley CA';
const CACHE_HEADERS = {
  'Content-Type': 'application/json; charset=utf-8',
  'Cache-Control': 'public, max-age=900, s-maxage=43200, stale-while-revalidate=86400'
};

function response(statusCode, payload) {
  return { statusCode, headers: CACHE_HEADERS, body: JSON.stringify(payload) };
}

function normalizeReview(review) {
  return {
    author_name: review.author_name || 'Google reviewer',
    rating: typeof review.rating === 'number' ? review.rating : null,
    relative_time_description: review.relative_time_description || '',
    text: review.text || '',
    time: review.time || null,
    author_url: review.author_url || '',
    profile_photo_url: review.profile_photo_url || ''
  };
}

async function googleJson(url) {
  const res = await fetch(url, { headers: { Accept: 'application/json' } });
  const text = await res.text();
  let data;
  try { data = JSON.parse(text); } catch (e) {
    throw new Error('Google API returned non-JSON: ' + text.slice(0, 120));
  }
  if (!res.ok) throw new Error('Google HTTP ' + res.status + ': ' + (data && data.error_message || text.slice(0, 120)));
  return data;
}

exports.handler = async function (event) {
  const debug = event && event.queryStringParameters && event.queryStringParameters.debug === '1';

  // Check all possible env var names (trim whitespace in case of UI copy-paste)
  const apiKey = (
    process.env.GOOGLE_PLACES_API_KEY ||
    process.env.GOOGLE_MAPS_API_KEY ||
    process.env.PLACES_API_KEY || ''
  ).trim();

  // Use env var place ID, fall back to hardcoded default so we never need findplacefromtext
  const placeId = (process.env.GOOGLE_PLACE_ID || DEFAULT_PLACE_ID).trim();
  const query = process.env.GOOGLE_REVIEW_SEARCH_QUERY || DEFAULT_QUERY;

  if (debug) {
    return response(200, {
      debug: true,
      has_api_key: !!apiKey,
      api_key_length: apiKey.length,
      api_key_prefix: apiKey ? apiKey.slice(0, 6) + '...' : null,
      place_id_in_use: placeId,
      env_keys_present: Object.keys(process.env).filter(k =>
        /google|places|maps|api_key/i.test(k)
      )
    });
  }

  if (!apiKey) {
    return response(503, {
      ok: false,
      needs_configuration: true,
      message: 'Set GOOGLE_PLACES_API_KEY in Netlify environment variables to load real Google reviews.'
    });
  }

  try {
    // Skip findplacefromtext entirely — use hardcoded/env place_id directly
    const detailsUrl = new URL('https://maps.googleapis.com/maps/api/place/details/json');
    detailsUrl.searchParams.set('place_id', placeId);
    detailsUrl.searchParams.set('fields', 'place_id,name,rating,user_ratings_total,reviews,url');
    detailsUrl.searchParams.set('reviews_sort', 'newest');
    detailsUrl.searchParams.set('key', apiKey);
    const details = await googleJson(detailsUrl.toString());

    if (details.status !== 'OK' || !details.result) {
      throw new Error(
        'Places API status: ' + details.status +
        (details.error_message ? ' — ' + details.error_message : '') +
        '. Place ID used: ' + placeId
      );
    }

    const result = details.result;
    return response(200, {
      ok: true,
      source: 'google',
      cached_at: Math.floor(Date.now() / 1000),
      place_id: result.place_id || placeId,
      name: result.name || 'Twin Rivers Fence',
      rating: typeof result.rating === 'number' ? result.rating : null,
      user_ratings_total: typeof result.user_ratings_total === 'number' ? result.user_ratings_total : null,
      url: result.url || 'https://www.google.com/maps/search/?api=1&query=Twin%20Rivers%20Fence&query_place_id=' + encodeURIComponent(placeId),
      reviews: Array.isArray(result.reviews) ? result.reviews.map(normalizeReview) : []
    });
  } catch (error) {
    return response(502, { ok: false, message: error.message });
  }
};
