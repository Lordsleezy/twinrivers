// Twin Rivers Fence — Place ID (Google Maps)
// Obtained from: https://www.google.com/maps/search/Twin+Rivers+Fence+Grass+Valley+CA
// To re-verify: search the business on Google Maps and extract the CID/place_id from the URL
const DEFAULT_PLACE_ID = 'ChIJN_sBpJkMmoAR_sRjCkwUW8E';
const DEFAULT_QUERY = 'Twin Rivers Fence Grass Valley CA';
const EXPECTED_PHONE_DIGITS = '9169062254';
const EXPECTED_WEBSITE_HOST = 'twinriversfence.com';
const CACHE_HEADERS = {
  'Content-Type': 'application/json; charset=utf-8',
  'Cache-Control': 'public, max-age=900, s-maxage=43200, stale-while-revalidate=86400'
};

function response(statusCode, payload) {
  return { statusCode, headers: CACHE_HEADERS, body: JSON.stringify(payload) };
}

function normalizePhone(value) {
  return (value || '').replace(/\D/g, '');
}

function normalizeHost(value) {
  try { return new URL(value).hostname.replace(/^www\./, '').toLowerCase(); } catch (e) { return ''; }
}

function isExpectedBusiness(result) {
  if (!result) return false;
  const phoneMatch = normalizePhone(result.formatted_phone_number) === EXPECTED_PHONE_DIGITS || normalizePhone(result.international_phone_number).endsWith(EXPECTED_PHONE_DIGITS);
  const websiteMatch = normalizeHost(result.website) === EXPECTED_WEBSITE_HOST;
  return phoneMatch || websiteMatch;
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

async function googlePlacesV1Details(apiKey, placeName) {
  const url = 'https://places.googleapis.com/v1/' + placeName.replace(/^\//, '');
  const res = await fetch(url, {
    headers: {
      Accept: 'application/json',
      'X-Goog-Api-Key': apiKey,
      'X-Goog-FieldMask': 'id,name,displayName,formattedAddress,nationalPhoneNumber,internationalPhoneNumber,websiteUri,rating,userRatingCount,googleMapsUri,businessStatus,types,location,reviews'
    }
  });
  const text = await res.text();
  let data;
  try { data = JSON.parse(text); } catch (e) { data = { raw: text.slice(0, 1000) }; }
  if (!res.ok) {
    const error = new Error('Google Places v1 details HTTP ' + res.status);
    error.google_http_status = res.status;
    error.google_response_body = data;
    error.google_request_url = url;
    throw error;
  }
  return { data, google_http_status: res.status, google_request_url: url };
}

async function googlePlacesV1Search(apiKey, payload) {
  const url = 'https://places.googleapis.com/v1/places:searchText';
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': apiKey,
      'X-Goog-FieldMask': 'places.id,places.name,places.displayName,places.formattedAddress,places.nationalPhoneNumber,places.internationalPhoneNumber,places.websiteUri,places.rating,places.userRatingCount,places.googleMapsUri,places.businessStatus,places.types,places.location'
    },
    body: JSON.stringify(payload)
  });
  const text = await res.text();
  let data;
  try { data = JSON.parse(text); } catch (e) { data = { raw: text.slice(0, 1000) }; }
  if (!res.ok) {
    const error = new Error('Google Places v1 HTTP ' + res.status);
    error.google_http_status = res.status;
    error.google_response_body = data;
    error.google_request_url = url;
    throw error;
  }
  return { data, google_http_status: res.status, google_request_url: url };
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
    'Twin Rivers Fence',
    'Twin Rivers Fence Google Reviews',
    'Twin Rivers Fence 916-906-2254',
    'Twin Rivers Fence twinriversfence.com',
    'Twin Rivers Fence Grass Valley Sacramento region',
    'Twin Rivers Fence Nevada County CA',
    'Twin Rivers Fence 1089233',
    'Twin Rivers Fence C13 Grass Valley'
  ];
  const searchBiases = [
    null,
    { label: 'grass-valley', location: '39.2191,-121.0611', radius: '50000' },
    { label: 'sacramento', location: '38.5816,-121.4944', radius: '80000' },
    { label: 'roseville-rocklin', location: '38.7521,-121.2880', radius: '60000' }
  ];
  for (const textQuery of textQueries) {
    for (const bias of searchBiases) {
      const searchUrl = new URL('https://maps.googleapis.com/maps/api/place/textsearch/json');
      searchUrl.searchParams.set('query', textQuery);
      if (bias) {
        searchUrl.searchParams.set('location', bias.location);
        searchUrl.searchParams.set('radius', bias.radius);
      }
      searchUrl.searchParams.set('key', apiKey);
      const searched = await googleJson(searchUrl.toString());
      attempts.push({ method: 'textsearch', query: textQuery, bias: bias && bias.label, status: searched.data.status, result_count: searched.data.results ? searched.data.results.length : 0 });
      if (searched.data.results) {
        for (const result of searched.data.results.slice(0, 10)) {
          if (result.place_id && !byPlaceId.has(result.place_id)) {
            byPlaceId.set(result.place_id, await detailsForPlace(result.place_id));
          }
        }
      }
    }
  }
  const v1DirectPlaceNames = [
    'places/0x85bce80757fb6d95:0x564a545566e5e531',
    'places/6217874961313686833',
    'places/g/11z2g5p6z2',
    'places/ChFUd2luIFJpdmVycyBGZW5jZVoTIhF0d2luIHJpdmVycyBmZW5jZZIBEGZlbmNlX2NvbnRyYWN0b3LgAQA'
  ];
  for (const placeName of v1DirectPlaceNames) {
    try {
      const direct = await googlePlacesV1Details(apiKey, placeName);
      attempts.push({
        method: 'places-v1-details',
        place_name: placeName,
        status: 'OK',
        place: {
          id: direct.data.id || null,
          name: direct.data.name || null,
          display_name: direct.data.displayName && direct.data.displayName.text || null,
          formatted_address: direct.data.formattedAddress || null,
          phone: direct.data.nationalPhoneNumber || null,
          website: direct.data.websiteUri || null,
          rating: direct.data.rating || null,
          review_count: direct.data.userRatingCount || null,
          google_maps_uri: direct.data.googleMapsUri || null,
          location: direct.data.location || null
        }
      });
    } catch (error) {
      attempts.push({ method: 'places-v1-details', place_name: placeName, status: 'ERROR', error: error.message, google_http_status: error.google_http_status || null, google_response_body: error.google_response_body || null });
    }
  }
  const v1Searches = [
    { textQuery: 'Twin Rivers Fence', locationBias: { circle: { center: { latitude: 38.255235, longitude: -121.0614744 }, radius: 5000 } } },
    { textQuery: 'Twin Rivers Fence Grass Valley CA', locationBias: { circle: { center: { latitude: 38.255235, longitude: -121.0614744 }, radius: 50000 } } },
    { textQuery: 'Twin Rivers Fence 916-906-2254' },
    { textQuery: 'Twin Rivers Fence twinriversfence.com' }
  ];
  for (const payload of v1Searches) {
    try {
      const searched = await googlePlacesV1Search(apiKey, payload);
      const places = searched.data.places || [];
      attempts.push({
        method: 'places-v1-searchText',
        query: payload.textQuery,
        status: 'OK',
        result_count: places.length,
        places: places.slice(0, 10).map(place => ({
          id: place.id || null,
          name: place.name || null,
          display_name: place.displayName && place.displayName.text || null,
          formatted_address: place.formattedAddress || null,
          phone: place.nationalPhoneNumber || null,
          website: place.websiteUri || null,
          rating: place.rating || null,
          review_count: place.userRatingCount || null,
          google_maps_uri: place.googleMapsUri || null,
          location: place.location || null
        }))
      });
      for (const place of places.slice(0, 10)) {
        const placeId = place.id || (place.name && place.name.replace(/^places\//, ''));
        if (placeId && !byPlaceId.has(placeId)) {
          byPlaceId.set(placeId, {
            place_id: placeId,
            name: place.displayName && place.displayName.text || null,
            formatted_address: place.formattedAddress || null,
            formatted_phone_number: place.nationalPhoneNumber || null,
            international_phone_number: place.internationalPhoneNumber || null,
            website: place.websiteUri || null,
            rating: place.rating || null,
            user_ratings_total: place.userRatingCount || null,
            url: place.googleMapsUri || null,
            business_status: place.businessStatus || null,
            types: place.types || [],
            location: place.location || null
          });
        }
      }
    } catch (error) {
      attempts.push({ method: 'places-v1-searchText', query: payload.textQuery, status: 'ERROR', error: error.message, google_http_status: error.google_http_status || null, google_response_body: error.google_response_body || null });
    }
  }
  const nearbySearches = [
    { label: 'grass-valley', location: '39.2191,-121.0611', radius: '50000', keyword: 'Twin Rivers Fence' },
    { label: 'sacramento', location: '38.5816,-121.4944', radius: '80000', keyword: 'Twin Rivers Fence' },
    { label: 'roseville-rocklin', location: '38.7521,-121.2880', radius: '60000', keyword: 'Twin Rivers Fence' }
  ];
  for (const nearby of nearbySearches) {
    const nearbyUrl = new URL('https://maps.googleapis.com/maps/api/place/nearbysearch/json');
    nearbyUrl.searchParams.set('location', nearby.location);
    nearbyUrl.searchParams.set('radius', nearby.radius);
    nearbyUrl.searchParams.set('keyword', nearby.keyword);
    nearbyUrl.searchParams.set('key', apiKey);
    const searched = await googleJson(nearbyUrl.toString());
    attempts.push({ method: 'nearbysearch', keyword: nearby.keyword, bias: nearby.label, status: searched.data.status, result_count: searched.data.results ? searched.data.results.length : 0 });
    if (searched.data.results) {
      for (const result of searched.data.results.slice(0, 10)) {
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

  let placeId = (event && event.queryStringParameters && event.queryStringParameters.place_id || process.env.GOOGLE_PLACE_ID || DEFAULT_PLACE_ID).trim();
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
      detailsUrl.searchParams.set('fields', 'place_id,name,formatted_address,formatted_phone_number,international_phone_number,website,rating,user_ratings_total,reviews,url');
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
            const hasReviews = result && (typeof result.rating === 'number' || typeof result.user_ratings_total === 'number' || (Array.isArray(result.reviews) && result.reviews.length));
            attempts.push({ input: item.input, inputtype: item.inputtype, details_status: candidateDetails.data.status, details_name: result && result.name, details_address: result && result.formatted_address, details_phone: result && result.formatted_phone_number, details_website: result && result.website, details_rating: result && result.rating, details_review_count: result && result.user_ratings_total });
            if (candidateDetails.data.status === 'OK' && hasReviews && isExpectedBusiness(result)) {
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

    if (details.status === 'OK' && details.result && !isExpectedBusiness(details.result)) {
      const error = new Error('Google profile identity mismatch. Refusing to display reviews from a profile that does not match Twin Rivers Fence website or phone.');
      error.google_http_status = googleResult.google_http_status;
      error.google_status = 'IDENTITY_MISMATCH';
      error.google_error_message = 'Expected phone ending ' + EXPECTED_PHONE_DIGITS + ' or website ' + EXPECTED_WEBSITE_HOST;
      error.google_response_body = {
        place_id: details.result.place_id || placeId,
        name: details.result.name || null,
        formatted_address: details.result.formatted_address || null,
        formatted_phone_number: details.result.formatted_phone_number || null,
        website: details.result.website || null,
        rating: details.result.rating || null,
        user_ratings_total: details.result.user_ratings_total || null
      };
      error.google_request_url = googleResult.google_request_url;
      throw error;
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
      formatted_address: result.formatted_address || null,
      formatted_phone_number: result.formatted_phone_number || null,
      website: result.website || null,
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
