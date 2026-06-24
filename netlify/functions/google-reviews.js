const VERIFIED_GOOGLE_MAPS_URL = 'https://maps.app.goo.gl/rXBxsJXV2E6Z3Luu6';
const VERIFIED_KG_MID = '/g/11z2g5p6z2';
const VERIFIED_CID = '6217874961313686833';
const VERIFIED_COORDINATES = { latitude: 38.255235, longitude: -121.0614744 };
const CACHE_HEADERS = {
  'Content-Type': 'application/json; charset=utf-8',
  'Cache-Control': 'public, max-age=900, s-maxage=43200, stale-while-revalidate=86400'
};

function response(statusCode, payload) {
  return { statusCode, headers: CACHE_HEADERS, body: JSON.stringify(payload) };
}

exports.handler = async function () {
  return response(200, {
    ok: true,
    source: 'verified-google-maps-link',
    live_reviews_available: false,
    message: 'Google reviews are available on the verified Twin Rivers Fence Google Maps profile. Review text is not displayed here because Google Places API does not expose this verified Maps entity as a usable Place ID.',
    name: 'Twin Rivers Fence',
    url: VERIFIED_GOOGLE_MAPS_URL,
    google_maps_url: VERIFIED_GOOGLE_MAPS_URL,
    kg_mid: VERIFIED_KG_MID,
    cid: VERIFIED_CID,
    coordinates: VERIFIED_COORDINATES,
    rating: null,
    user_ratings_total: null,
    review_count: null,
    reviews: []
  });
};
