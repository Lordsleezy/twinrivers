(function () {
  "use strict";

  document.querySelectorAll('form[name="lead-chat"]').forEach(function (form) {
    form.remove();
  });

  var toggle = document.getElementById("leadChatToggle");
  if (toggle) {
    var link = document.createElement("a");
    link.className = toggle.className;
    link.href = "tel:+19169062254";
    link.setAttribute("aria-label", "Call Twin Rivers Fence at (916) 906-2254");
    link.innerHTML = toggle.innerHTML;
    toggle.replaceWith(link);
  }

  ["leadChatPanel", "leadChatBackdrop", "leadChatNudge"].forEach(function (id) {
    var el = document.getElementById(id);
    if (el) el.remove();
  });
}());
