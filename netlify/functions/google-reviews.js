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
  const data = await res.json();
  if (!res.ok) throw new Error('Google review request failed.');
  return data;
}

exports.handler = async function () {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY || process.env.GOOGLE_MAPS_API_KEY || process.env.PLACES_API_KEY;
  let placeId = process.env.GOOGLE_PLACE_ID || '';
  const query = process.env.GOOGLE_REVIEW_SEARCH_QUERY || DEFAULT_QUERY;

  if (!apiKey) {
    return response(503, {
      ok: false,
      needs_configuration: true,
      message: 'Set GOOGLE_PLACES_API_KEY in Netlify environment variables to load real Google reviews.'
    });
  }

  try {
    if (!placeId) {
      const findUrl = new URL('https://maps.googleapis.com/maps/api/place/findplacefromtext/json');
      findUrl.searchParams.set('input', query);
      findUrl.searchParams.set('inputtype', 'textquery');
      findUrl.searchParams.set('fields', 'place_id,name');
      findUrl.searchParams.set('key', apiKey);
      const found = await googleJson(findUrl.toString());
      if (found.status !== 'OK' || !found.candidates || !found.candidates[0] || !found.candidates[0].place_id) {
        throw new Error('Twin Rivers Fence Google Business Profile could not be found.');
      }
      placeId = found.candidates[0].place_id;
    }

    const detailsUrl = new URL('https://maps.googleapis.com/maps/api/place/details/json');
    detailsUrl.searchParams.set('place_id', placeId);
    detailsUrl.searchParams.set('fields', 'place_id,name,rating,user_ratings_total,reviews,url');
    detailsUrl.searchParams.set('reviews_sort', 'newest');
    detailsUrl.searchParams.set('key', apiKey);
    const details = await googleJson(detailsUrl.toString());
    if (details.status !== 'OK' || !details.result) {
      throw new Error('Twin Rivers Fence Google review details were unavailable.');
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
