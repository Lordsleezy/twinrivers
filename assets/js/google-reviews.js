(function () {
  "use strict";

  var ENDPOINT = "/.netlify/functions/google-reviews";
  var VERIFIED_GOOGLE_MAPS_URL = "https://maps.app.goo.gl/rXBxsJXV2E6Z3Luu6";
  var FALLBACK_PROFILE = {
    ok: true,
    source: "verified-google-maps-link",
    name: "Twin Rivers Fence",
    rating: 5.0,
    user_ratings_total: null,
    url: VERIFIED_GOOGLE_MAPS_URL,
    reviews: []
  };

  function qsAll(selector) {
    return Array.prototype.slice.call(document.querySelectorAll(selector));
  }

  function setText(selector, value) {
    qsAll(selector).forEach(function (node) {
      node.textContent = value;
    });
  }

  function starMarkup(rating) {
    var score = Math.round(Number(rating) || 0);
    var stars = "";
    for (var i = 1; i <= 5; i += 1) {
      stars += i <= score ? "&#9733;" : "&#9734;";
    }
    return stars;
  }

  function formatRating(rating) {
    var numeric = Number(rating);
    return Number.isFinite(numeric) ? numeric.toFixed(1) + " on Google" : "Rated on Google";
  }

  function formatCount(count) {
    var numeric = Number(count);
    return Number.isFinite(numeric) && numeric > 0
      ? numeric.toLocaleString() + " Google reviews"
      : "Verified Google Business Profile";
  }

  function googleBrandMarkup() {
    return '<span class="google-brand-mark" aria-hidden="true">' +
      '<svg viewBox="0 0 74 24" width="74" height="24" focusable="false">' +
      '<path fill="#4285F4" d="M9.24 8.19v2.46h5.88c-.18 1.38-.64 2.39-1.34 3.1-.86.86-2.2 1.8-4.54 1.8-3.62 0-6.45-2.92-6.45-6.54S5.62 2.47 9.24 2.47c2.05 0 3.47.8 4.26 1.49l2.26-2.26C14.03 1.08 11.83 0 9.24 0 4.28 0 .11 4.04.11 9s4.17 9 9.13 9c2.68 0 4.7-.88 6.28-2.52 1.62-1.62 2.14-3.9 2.14-5.71 0-.57-.04-1.1-.13-1.58H9.24z"/>' +
      '<path fill="#EA4335" d="M25 6.19c-3.21 0-5.83 2.44-5.83 5.81 0 3.34 2.62 5.81 5.83 5.81 3.21 0 5.83-2.46 5.83-5.81 0-3.37-2.62-5.81-5.83-5.81zm0 9.33c-1.76 0-3.28-1.45-3.28-3.52 0-2.09 1.52-3.52 3.28-3.52 1.77 0 3.27 1.43 3.27 3.52 0 2.07-1.5 3.52-3.27 3.52z"/>' +
      '<path fill="#FBBC05" d="M53.58 7.49h-.09c-.57-.68-1.67-1.3-3.06-1.3-2.91 0-5.01 2.45-5.01 5.81 0 3.34 2.1 5.81 5.01 5.81 1.39 0 2.49-.62 3.06-1.31h.09v.81c0 2.22-1.19 3.41-3.1 3.41-1.56 0-2.52-.78-2.96-1.43l-2.05 1.9c.98 1.45 2.81 2.55 5.01 2.55 2.91 0 5.38-1.71 5.38-5.88V6.49h-2.24v1zm-2.93 8.03c-1.76 0-3.28-1.45-3.28-3.52 0-2.09 1.52-3.52 3.28-3.52 1.77 0 3.27 1.43 3.27 3.52 0 2.07-1.5 3.52-3.27 3.52z"/>' +
      '<path fill="#34A853" d="M38 15.59c-3.21 0-5.83-2.44-5.83-5.81 0-3.34 2.62-5.81 5.83-5.81 3.21 0 5.83 2.46 5.83 5.81 0 3.37-2.62 5.81-5.83 5.81zm0-9.33c-1.76 0-3.28 1.45-3.28 3.52 0 2.09 1.52 3.52 3.28 3.52 1.77 0 3.27-1.43 3.27-3.52 0-2.07-1.5-3.52-3.27-3.52z"/>' +
      '<path fill="#EA4335" d="M58 .24h2.51v17.57H58z"/>' +
      '<path fill="#4285F4" d="M68.26 15.59c-2.13 0-3.57-1.77-3.57-3.75 0-2.31 1.79-3.89 4.12-3.89 1.72 0 2.96.98 3.63 1.83l-1.91 1.22c-.35-.52-.98-.88-1.72-.88-1.18 0-2.1.99-2.1 2.72 0 1.69.92 2.72 2.1 2.72.74 0 1.38-.36 1.72-.88l1.91 1.22c-.67.85-1.91 1.83-3.63 1.83z"/>' +
      "</svg></span>";
  }

  function renderFallbackCards(data) {
    var mapsUrl = data.url || VERIFIED_GOOGLE_MAPS_URL;
    return '<article class="google-review-card">' +
      '<div class="google-review-card-head"><div><strong>' + googleBrandMarkup() + ' Twin Rivers Fence</strong><span>Verified Google Business Profile</span></div>' +
      '<div class="google-review-stars" aria-label="' + (data.rating || 5) + ' star Google rating">' + starMarkup(data.rating || 5) + '</div></div>' +
      '<p>Read customer reviews, photos, directions, and business details on the verified Twin Rivers Fence Google Maps listing.</p>' +
      '<a class="google-review-inline-link" href="' + mapsUrl + '" target="_blank" rel="noopener noreferrer">Open Google Maps</a></article>' +
      '<article class="google-review-card"><div class="google-review-card-head"><div><strong>' + formatRating(data.rating || 5) + '</strong><span>Customer rating</span></div>' +
      '<div class="google-review-stars" aria-label="Google reviews">' + starMarkup(data.rating || 5) + '</div></div>' +
      '<p>Our team stands behind decades of Northern California fence work. See what homeowners and property owners are saying on Google.</p></article>' +
      '<article class="google-review-card"><div class="google-review-card-head"><div><strong>View All Reviews On Google</strong><span>Grass Valley, CA</span></div>' +
      '<div class="google-review-stars" aria-label="Google reviews">' + starMarkup(data.rating || 5) + '</div></div>' +
      '<p>Live review text is shown on Google to protect against unrelated business listings with similar names.</p>' +
      '<a class="google-review-inline-link" href="' + mapsUrl + '" target="_blank" rel="noopener noreferrer">Read reviews on Google</a></article>';
  }

  function render(data) {
    var profile = data && data.ok !== false ? data : FALLBACK_PROFILE;
    var mapsUrl = profile.url || profile.google_maps_url || VERIFIED_GOOGLE_MAPS_URL;
    var rating = profile.rating != null ? profile.rating : FALLBACK_PROFILE.rating;
    var count = profile.user_ratings_total != null ? profile.user_ratings_total : profile.review_count;

    setText(".google-review-rating", formatRating(rating));
    setText(".google-review-count", formatCount(count));
    qsAll(".google-star-row").forEach(function (node) {
      node.innerHTML = starMarkup(rating);
    });
    qsAll(".google-review-link").forEach(function (node) {
      node.setAttribute("href", mapsUrl);
      node.setAttribute("target", "_blank");
      node.setAttribute("rel", "noopener noreferrer");
    });
    qsAll("[data-google-reviews-status]").forEach(function (node) {
      node.textContent = profile.live_reviews_available === false
        ? "Customer reviews are hosted on our verified Google Business Profile."
        : "Recent Google reviews from Twin Rivers Fence customers.";
    });

    var liveReviews = Array.isArray(profile.reviews)
      ? profile.reviews.filter(function (review) { return review && review.text; }).slice(0, 3)
      : [];

    qsAll("[data-google-review-cards]").forEach(function (container) {
      if (liveReviews.length) {
        container.innerHTML = liveReviews.map(function (review) {
          return '<article class="google-review-card"><div class="google-review-card-head"><div><strong>' +
            (review.author_name || "Google reviewer") + "</strong><span>" +
            (review.relative_time_description || "Google review") + '</span></div><div class="google-review-stars" aria-label="' +
            (review.rating || rating) + ' star Google review">' + starMarkup(review.rating || rating) + "</div></div><p>" +
            (review.text || "") + "</p></article>";
        }).join("");
      } else {
        container.innerHTML = renderFallbackCards(profile);
      }
    });
  }

  function loadReviews() {
    render(FALLBACK_PROFILE);

    fetch(ENDPOINT, { headers: { Accept: "application/json" } })
      .then(function (response) {
        if (!response.ok) throw new Error("Review feed unavailable");
        return response.json();
      })
      .then(function (data) {
        if (!data || data.ok === false) {
          render(FALLBACK_PROFILE);
          return;
        }
        if (data.rating == null) {
          data.rating = FALLBACK_PROFILE.rating;
        }
        if (!data.url) {
          data.url = VERIFIED_GOOGLE_MAPS_URL;
        }
        render(data);
      })
      .catch(function () {
        render(FALLBACK_PROFILE);
      });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", loadReviews);
  } else {
    loadReviews();
  }
}());
