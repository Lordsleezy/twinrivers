(function () {
  "use strict";

  function field(form, name) {
    return form.querySelector('[name="' + name + '"]');
  }

  function digits(value) {
    return (value || "").replace(/\D/g, "");
  }

  function initQuoteCalculator() {
    var calculator = document.querySelector("[data-quote-calculator]");
    var pricing = window.TwinRiversFencePricing;
    if (!calculator || !pricing) return;

    var inputForm = calculator.querySelector("[data-quote-inputs]");
    var leadForm = calculator.querySelector("[data-quote-lead-form]");
    var rangeEl = calculator.querySelector("[data-estimate-range]");
    var status = calculator.querySelector("[data-quote-status]");
    if (!inputForm || !leadForm || !rangeEl) return;

    function readInput() {
      return {
        fenceType: field(inputForm, "fence_type").value,
        height: field(inputForm, "height").value,
        footage: field(inputForm, "footage").value,
        gates: field(inputForm, "gates").value,
        removal: field(inputForm, "removal").value,
        projectType: field(inputForm, "project_type").value,
        city: field(inputForm, "city").value
      };
    }

    function updateHiddenFields(input, estimateText) {
      var values = {
        estimated_range: estimateText,
        fence_type: input.fenceType,
        height: input.height + " Foot",
        footage: input.footage,
        gates: input.gates === "3" ? "3+" : input.gates,
        removal: input.removal,
        project_type: input.projectType,
        city: input.city
      };
      Object.keys(values).forEach(function (name) {
        var el = field(leadForm, name);
        if (el) el.value = values[name];
      });
    }

    function updateEstimate() {
      var input = readInput();
      var estimate = pricing.calculateEstimate(input);
      var estimateText = pricing.formatMoney(estimate.low) + " - " + pricing.formatMoney(estimate.high);
      rangeEl.textContent = estimateText;
      updateHiddenFields(input, estimateText);
      return estimateText;
    }

    inputForm.addEventListener("input", updateEstimate);
    inputForm.addEventListener("change", updateEstimate);

    leadForm.addEventListener("submit", function (event) {
      var phone = field(leadForm, "phone");
      if (!phone || digits(phone.value).length < 10) {
        event.preventDefault();
        status.textContent = "Please enter a phone number so we can follow up with an exact quote.";
        phone.focus();
        return;
      }
      status.textContent = "Sending your estimate request...";
      updateEstimate();
    });

    updateEstimate();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initQuoteCalculator);
  } else {
    initQuoteCalculator();
  }
}());
