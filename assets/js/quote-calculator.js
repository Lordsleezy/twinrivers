(function () {
  "use strict";

  function field(form, name) {
    return form.querySelector('[name="' + name + '"]');
  }

  function initQuoteCalculator() {
    var calculator = document.querySelector("[data-quote-calculator]");
    var pricing = window.TwinRiversFencePricing;
    if (!calculator || !pricing) return;

    var inputForm = calculator.querySelector("[data-quote-inputs]");
    var rangeEl = calculator.querySelector("[data-estimate-range]");
    if (!inputForm || !rangeEl) return;

    function readInput() {
      return {
        fenceType: field(inputForm, "fence_type").value,
        height: field(inputForm, "height").value,
        footage: field(inputForm, "footage").value,
        gates: field(inputForm, "gates").value,
        removal: field(inputForm, "removal").value,
        city: field(inputForm, "city").value
      };
    }

    function updateEstimate() {
      var input = readInput();
      var estimate = pricing.calculateEstimate(input);
      rangeEl.textContent = pricing.formatMoney(estimate.low) + " - " + pricing.formatMoney(estimate.high);
    }

    inputForm.addEventListener("input", updateEstimate);
    inputForm.addEventListener("change", updateEstimate);
    updateEstimate();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initQuoteCalculator);
  } else {
    initQuoteCalculator();
  }
}());
