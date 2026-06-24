(function () {
  "use strict";

  var VERIFIED_GOOGLE_MAPS_URL = "https://maps.app.goo.gl/rXBxsJXV2E6Z3Luu6";

  function qsAll(selector) {
    return Array.prototype.slice.call(document.querySelectorAll(selector));
  }

  function renderVerifiedGoogleCta() {
    qsAll(".google-review-link").forEach(function (node) {
      node.setAttribute("href", VERIFIED_GOOGLE_MAPS_URL);
      node.setAttribute("target", "_blank");
      node.setAttribute("rel", "noopener noreferrer");
    });
    qsAll(".google-star-row").forEach(function (node) {
      node.innerHTML = "&#9733;&#9733;&#9733;&#9733;&#9733;";
    });
    qsAll(".google-review-rating").forEach(function (node) {
      node.textContent = "Google Reviews";
    });
    qsAll(".google-review-count").forEach(function (node) {
      node.textContent = "Read Our Customer Reviews";
    });
    qsAll("[data-google-reviews-status]").forEach(function (node) {
      node.textContent = "Reviews open on the verified Twin Rivers Fence Google Maps profile.";
    });
    qsAll("[data-google-review-cards]").forEach(function (container) {
      container.innerHTML = '<article class="google-review-card"><div class="google-review-card-head"><div><strong>Verified Google Maps Profile</strong><span>Twin Rivers Fence</span></div><div class="google-review-stars" aria-label="Google reviews">&#9733;&#9733;&#9733;&#9733;&#9733;</div></div><p>We are not displaying unverified review text from third-party listings. Use the button below to read customer reviews directly on Google.</p></article>' +
        '<article class="google-review-card"><div class="google-review-card-head"><div><strong>Read Our Customer Reviews</strong><span>Opens Google Maps</span></div><div class="google-review-stars" aria-label="Google reviews">&#9733;&#9733;&#9733;&#9733;&#9733;</div></div><p>View the correct Twin Rivers Fence profile, customer feedback, directions, and business information on Google.</p></article>' +
        '<article class="google-review-card"><div class="google-review-card-head"><div><strong>No Wrong-Profile Reviews</strong><span>Quality control</span></div><div class="google-review-stars" aria-label="Google reviews">&#9733;&#9733;&#9733;&#9733;&#9733;</div></div><p>Reviews from unrelated Yuba City, Oregon, or similarly named businesses are intentionally blocked.</p></article>';
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", renderVerifiedGoogleCta);
  } else {
    renderVerifiedGoogleCta();
  }
}());
