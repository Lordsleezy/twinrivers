(function () {
  "use strict";

  var ENDPOINTS = ["/.netlify/functions/google-reviews", "/api/google-reviews.php"];
  var CACHE_KEY = "twinRiversGoogleReviews:v1";
  var CACHE_TTL = 6 * 60 * 60 * 1000;

  function qsAll(selector) {
    return Array.prototype.slice.call(document.querySelectorAll(selector));
  }

  function setText(selector, value) {
    qsAll(selector).forEach(function (node) { node.textContent = value; });
  }

  function formatRating(rating) {
    var numeric = Number(rating);
    return Number.isFinite(numeric) ? numeric.toFixed(1) + " Rating" : "Google Rating";
  }

  function formatCount(count) {
    var numeric = Number(count);
    return Number.isFinite(numeric) ? numeric.toLocaleString() + " Google Reviews" : "Google Reviews";
  }

  function starMarkup(rating) {
    var score = Math.round(Number(rating) || 0);
    var stars = "";
    for (var i = 1; i <= 5; i += 1) {
      stars += i <= score ? "&#9733;" : "&#9734;";
    }
    return stars;
  }

  function safeText(value) {
    return String(value || "").replace(/[&<>"]/g, function (char) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;" }[char] || char;
    });
  }

  function readCache() {
    try {
      var cached = JSON.parse(localStorage.getItem(CACHE_KEY) || "null");
      if (cached && cached.storedAt && Date.now() - cached.storedAt < CACHE_TTL) return cached.data;
    } catch (error) {}
    return null;
  }

  function writeCache(data) {
    try { localStorage.setItem(CACHE_KEY, JSON.stringify({ storedAt: Date.now(), data: data })); } catch (error) {}
  }

  function render(data) {
    if (!data || data.ok === false) {
      qsAll("[data-google-reviews-status]").forEach(function (node) {
        node.textContent = data && data.needs_configuration ? "Google review feed is ready for API configuration." : "Google review data is temporarily unavailable.";
      });
      return;
    }

    var ratingLabel = formatRating(data.rating);
    var countLabel = formatCount(data.user_ratings_total);
    var googleUrl = data.url || "https://www.google.com/search?q=Twin+Rivers+Fence+Google+reviews";

    setText(".google-review-rating", ratingLabel);
    setText(".google-review-count", countLabel);
    qsAll(".google-star-row").forEach(function (node) { node.innerHTML = starMarkup(data.rating); });
    qsAll(".google-review-link").forEach(function (node) { node.setAttribute("href", googleUrl); });
    qsAll("[data-google-reviews-status]").forEach(function (node) { node.textContent = ""; });

    qsAll("[data-google-review-cards]").forEach(function (container) {
      var reviews = Array.isArray(data.reviews) ? data.reviews.filter(function (review) { return review && review.text; }).slice(0, 3) : [];
      if (!reviews.length) {
        container.innerHTML = '<article class="google-review-card"><p>Recent Google review text is not available from the live feed right now.</p></article>';
        return;
      }
      container.innerHTML = reviews.map(function (review) {
        return '<article class="google-review-card">' +
          '<div class="google-review-card-head"><div><strong>' + safeText(review.author_name) + '</strong><span>' + safeText(review.relative_time_description) + '</span></div><div class="google-review-stars" aria-label="' + safeText(review.rating) + ' star Google review">' + starMarkup(review.rating) + '</div></div>' +
          '<p>' + safeText(review.text) + '</p>' +
          '</article>';
      }).join("");
    });

    injectSchema(data, googleUrl);
  }

  function injectSchema(data, googleUrl) {
    if (!data.rating || !data.user_ratings_total) return;
    var existing = document.getElementById("google-review-jsonld");
    if (existing) existing.remove();
    var reviews = Array.isArray(data.reviews) ? data.reviews.filter(function (review) { return review && review.text && review.rating; }).slice(0, 3) : [];
    var schema = {
      "@context": "https://schema.org",
      "@type": "LocalBusiness",
      "@id": location.origin + "/#google-business-profile",
      "name": data.name || "Twin Rivers Fence",
      "url": location.origin + location.pathname,
      "sameAs": [googleUrl],
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": String(data.rating),
        "reviewCount": String(data.user_ratings_total),
        "bestRating": "5",
        "worstRating": "1"
      },
      "review": reviews.map(function (review) {
        return {
          "@type": "Review",
          "author": { "@type": "Person", "name": review.author_name || "Google reviewer" },
          "datePublished": review.time ? new Date(Number(review.time) * 1000).toISOString().slice(0, 10) : undefined,
          "reviewBody": review.text,
          "reviewRating": { "@type": "Rating", "ratingValue": String(review.rating), "bestRating": "5", "worstRating": "1" }
        };
      })
    };
    var script = document.createElement("script");
    script.type = "application/ld+json";
    script.id = "google-review-jsonld";
    script.textContent = JSON.stringify(schema);
    document.head.appendChild(script);
  }

  function fetchFirstEndpoint() {
    var index = 0;
    function next() {
      var endpoint = ENDPOINTS[index];
      index += 1;
      return fetch(endpoint, { headers: { "Accept": "application/json" } }).then(function (response) {
        if (!response.ok && index < ENDPOINTS.length) return next();
        return response;
      }).catch(function (error) {
        if (index < ENDPOINTS.length) return next();
        throw error;
      });
    }
    return next();
  }

  function loadReviews() {
    var cached = readCache();
    if (cached) render(cached);
    fetchFirstEndpoint()
      .then(function (response) { return response.json(); })
      .then(function (data) { if (data && data.ok !== false) writeCache(data); render(data); })
      .catch(function () { if (!cached) render({ ok: false }); });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", loadReviews);
  } else {
    loadReviews();
  }
}());
