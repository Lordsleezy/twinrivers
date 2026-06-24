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
  const redactedUrl = url.replace(/key=([^&]+)/, 'key=REDACTED');
  const res = await fetch(url, { headers: { Accept: 'application/json' } });
  const text = await res.text();
  let data;
  try { data = JSON.parse(text); } catch (e) {
    const error = new Error('Google API returned non-JSON.');
    error.google_http_status = res.status;
    error.google_response_body = text.slice(0, 1000);
    error.google_request_url = redactedUrl;
    throw error;
  }
  if (!res.ok) {
    const error = new Error('Google HTTP ' + res.status + ': ' + (data && data.error_message || text.slice(0, 120)));
    error.google_http_status = res.status;
    error.google_status = data && data.status;
    error.google_error_message = data && data.error_message;
    error.google_response_body = data;
    error.google_request_url = redactedUrl;
    throw error;
  }
  return { data, google_http_status: res.status, google_request_url: redactedUrl };
}

async function verifyGoogleProfile(apiKey, query, currentPlaceId) {
  const inputs = [
    { input: query, inputtype: 'textquery' },
    { input: 'Twin Rivers Fence Google Reviews', inputtype: 'textquery' },
    { input: 'Twin Rivers Fence Grass Valley CA', inputtype: 'textquery' },
    { input: 'Twin Rivers Fence Sacramento CA', inputtype: 'textquery' },
    { input: 'Twin Rivers Fence 21030 Home Camp Rd Grass Valley CA', inputtype: 'textquery' },
    { input: 'Twin Rivers LLC Grass Valley CA fence', inputtype: 'textquery' },
    { input: 'Twin Rivers Fencing Yuba City CA', inputtype: 'textquery' },
    { input: '+19169062254', inputtype: 'phonenumber' }
  ];
  const byPlaceId = new Map();
  const attempts = [];
  async function detailsForPlace(id) {
    const detailsUrl = new URL('https://maps.googleapis.com/maps/api/place/details/json');
    detailsUrl.searchParams.set('place_id', id);
    detailsUrl.searchParams.set('fields', 'place_id,name,formatted_address,formatted_phone_number,international_phone_number,website,rating,user_ratings_total,url,business_status,types,reviews');
    detailsUrl.searchParams.set('reviews_sort', 'newest');
    detailsUrl.searchParams.set('key', apiKey);
    const details = await googleJson(detailsUrl.toString());
    return details.data.result ? details.data.result : { place_id: id, status: details.data.status, error_message: details.data.error_message || '' };
  }
  if (currentPlaceId) {
    byPlaceId.set(currentPlaceId, await detailsForPlace(currentPlaceId));
  }
  for (const item of inputs) {
    const findUrl = new URL('https://maps.googleapis.com/maps/api/place/findplacefromtext/json');
    findUrl.searchParams.set('input', item.input);
    findUrl.searchParams.set('inputtype', item.inputtype);
    findUrl.searchParams.set('fields', 'place_id,name,formatted_address,rating,user_ratings_total,business_status,types');
    findUrl.searchParams.set('key', apiKey);
    const found = await googleJson(findUrl.toString());
    attempts.push({ method: 'findplacefromtext', input: item.input, inputtype: item.inputtype, status: found.data.status, candidate_count: found.data.candidates ? found.data.candidates.length : 0 });
    if (found.data.candidates) {
      for (const candidate of found.data.candidates) {
        if (candidate.place_id && !byPlaceId.has(candidate.place_id)) {
          byPlaceId.set(candidate.place_id, await detailsForPlace(candidate.place_id));
        }
      }
    }
  }
  const textQueries = [
    'Twin Rivers Fence Google Reviews',
    'Twin Rivers Fence 916-906-2254',
    'Twin Rivers Fence twinriversfence.com',
    'Twin Rivers Fence Grass Valley Sacramento region',
    'Twin Rivers Fence Nevada County CA',
    'Twin Rivers Fence 1089233',
    'Twin Rivers Fence C13 Grass Valley'
  ];
  for (const textQuery of textQueries) {
    const searchUrl = new URL('https://maps.googleapis.com/maps/api/place/textsearch/json');
    searchUrl.searchParams.set('query', textQuery);
    searchUrl.searchParams.set('key', apiKey);
    const searched = await googleJson(searchUrl.toString());
    attempts.push({ method: 'textsearch', query: textQuery, status: searched.data.status, result_count: searched.data.results ? searched.data.results.length : 0 });
    if (searched.data.results) {
      for (const result of searched.data.results.slice(0, 8)) {
        if (result.place_id && !byPlaceId.has(result.place_id)) {
          byPlaceId.set(result.place_id, await detailsForPlace(result.place_id));
        }
      }
    }
  }
  return response(200, {
    ok: true,
    current_place_id: currentPlaceId,
    search_query: query,
    attempts,
    candidates: Array.from(byPlaceId.values()).map(item => ({
      place_id: item.place_id || null,
      name: item.name || null,
      formatted_address: item.formatted_address || null,
      formatted_phone_number: item.formatted_phone_number || null,
      international_phone_number: item.international_phone_number || null,
      website: item.website || null,
      rating: typeof item.rating === 'number' ? item.rating : null,
      user_ratings_total: typeof item.user_ratings_total === 'number' ? item.user_ratings_total : null,
      url: item.url || null,
      business_status: item.business_status || null,
      types: item.types || [],
      recent_review_authors: Array.isArray(item.reviews) ? item.reviews.slice(0, 5).map(review => review.author_name) : []
    }))
  });
}

exports.handler = async function (event) {
  const debug = event && event.queryStringParameters && event.queryStringParameters.debug === '1';
  const verifyProfile = event && event.queryStringParameters && event.queryStringParameters.verify_profile === '1';

  // Check all possible env var names (trim whitespace in case of UI copy-paste)
  const apiKey = (
    process.env.GOOGLE_PLACES_API_KEY ||
    process.env.GOOGLE_MAPS_API_KEY ||
    process.env.PLACES_API_KEY || ''
  ).trim();

  let placeId = (process.env.GOOGLE_PLACE_ID || DEFAULT_PLACE_ID).trim();
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

  if (verifyProfile) {
    if (!apiKey) {
      return response(503, {
        ok: false,
        needs_configuration: true,
        message: 'Set GOOGLE_PLACES_API_KEY in Netlify environment variables to verify Google profiles.'
      });
    }
    return verifyGoogleProfile(apiKey, query, placeId);
  }

  if (!apiKey) {
    return response(503, {
      ok: false,
      needs_configuration: true,
      message: 'Set GOOGLE_PLACES_API_KEY in Netlify environment variables to load real Google reviews.'
    });
  }

  try {
    async function fetchDetails(id) {
      const detailsUrl = new URL('https://maps.googleapis.com/maps/api/place/details/json');
      detailsUrl.searchParams.set('place_id', id);
      detailsUrl.searchParams.set('fields', 'place_id,name,rating,user_ratings_total,reviews,url');
      detailsUrl.searchParams.set('reviews_sort', 'newest');
      detailsUrl.searchParams.set('key', apiKey);
      return googleJson(detailsUrl.toString());
    }

    async function findFreshPlaceId() {
      const inputs = [
        { input: query, inputtype: 'textquery' },
        { input: '+19169062254', inputtype: 'phonenumber' },
        { input: 'Twin Rivers Fence 21030 Home Camp Rd Grass Valley CA', inputtype: 'textquery' },
        { input: 'Twin Rivers LLC 21030 Home Camp Rd Grass Valley CA', inputtype: 'textquery' },
        { input: 'Twin Rivers Fence Sacramento CA', inputtype: 'textquery' },
        { input: 'Twin Rivers Fence Northern California', inputtype: 'textquery' }
      ];
      const attempts = [];
      for (const item of inputs) {
        const findUrl = new URL('https://maps.googleapis.com/maps/api/place/findplacefromtext/json');
        findUrl.searchParams.set('input', item.input);
        findUrl.searchParams.set('inputtype', item.inputtype);
        findUrl.searchParams.set('fields', 'place_id,name,formatted_address,rating,user_ratings_total');
        findUrl.searchParams.set('key', apiKey);
        const found = await googleJson(findUrl.toString());
        attempts.push({ input: item.input, inputtype: item.inputtype, status: found.data.status, candidates: found.data.candidates || [] });
        if (found.data.status === 'OK' && found.data.candidates) {
          for (const candidate of found.data.candidates) {
            if (!candidate.place_id) continue;
            const candidateDetails = await fetchDetails(candidate.place_id);
            const result = candidateDetails.data && candidateDetails.data.result;
            const name = (result && result.name || candidate.name || '').toLowerCase();
            const hasReviews = result && (typeof result.rating === 'number' || typeof result.user_ratings_total === 'number' || (Array.isArray(result.reviews) && result.reviews.length));
            const looksLikeBusiness = /twin\s*rivers|fence/.test(name);
            attempts.push({ input: item.input, inputtype: item.inputtype, details_status: candidateDetails.data.status, details_name: result && result.name, details_rating: result && result.rating, details_review_count: result && result.user_ratings_total });
            if (candidateDetails.data.status === 'OK' && hasReviews && looksLikeBusiness) {
              return candidate.place_id;
            }
          }
        }
      }
      const error = new Error('Find Place failed for all Twin Rivers search inputs.');
      error.google_http_status = 200;
      error.google_status = 'ZERO_RESULTS';
      error.google_error_message = '';
      error.google_response_body = { attempts };
      error.google_request_url = 'multiple findplacefromtext requests; keys redacted';
      throw error;
    }

    let googleResult = await fetchDetails(placeId);
    let details = googleResult.data;

    if (details.status === 'NOT_FOUND') {
      placeId = await findFreshPlaceId();
      googleResult = await fetchDetails(placeId);
      details = googleResult.data;
    }

    if (details.status !== 'OK' || !details.result) {
      const error = new Error(
        'Places API status: ' + details.status +
        (details.error_message ? ' — ' + details.error_message : '') +
        '. Place ID used: ' + placeId
      );
      error.google_http_status = googleResult.google_http_status;
      error.google_status = details.status;
      error.google_error_message = details.error_message || '';
      error.google_response_body = details;
      error.google_request_url = googleResult.google_request_url;
      throw error;
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
    const diagnostics = {
      ok: false,
      source: 'google',
      message: error.message,
      google_http_status: error.google_http_status || null,
      google_status: error.google_status || null,
      google_error_message: error.google_error_message || null,
      google_response_body: error.google_response_body || null,
      google_request_url: error.google_request_url || null,
      place_id: placeId
    };
    console.error('google-reviews-error', JSON.stringify(diagnostics));
    return response(200, diagnostics);
  }
};
