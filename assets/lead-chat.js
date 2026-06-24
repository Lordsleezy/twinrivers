(function () {
    "use strict";

    var STORAGE_KEY = "fenceLeadChat_v3_" + (function () {
      var p = window.location.pathname || "/";
      if (p === "/" || p === "/index.html") return "home";
      return p.replace(/[^a-zA-Z0-9]+/g, "_").replace(/^_|_$/g, "") || "home";
    })();
    var IDLE_MS = 10000;

    var els = {
      nudge: document.getElementById("leadChatNudge"),
      nudgeBtn: document.getElementById("leadChatNudgeBtn"),
      toggle: document.getElementById("leadChatToggle"),
      backdrop: document.getElementById("leadChatBackdrop"),
      panel: document.getElementById("leadChatPanel"),
      messages: document.getElementById("leadChatMessages"),
      typing: document.getElementById("leadChatTyping"),
      options: document.getElementById("leadChatOptions"),
      input: document.getElementById("leadChatInput"),
      send: document.getElementById("leadChatSend"),
      close: document.getElementById("leadChatClose"),
      status: document.getElementById("leadChatStatus")
    };

    var defaultState = function () {
      return {
        step: 0,
        lastPromptedStep: 0,
        awaitingInput: false,
        completed: false,
        project_type: "",
        material: "",
        approximate_length: "",
        city: "",
        name: "",
        phone: "",
        email: "",
        notes: "",
        history: []
      };
    };

    var state = defaultState();

    function loadState() {
      try {
        var raw = sessionStorage.getItem(STORAGE_KEY);
        if (!raw) return;
        var p = JSON.parse(raw);
        if (!p || (p.v !== 1 && p.v !== 2 && p.v !== 3)) return;
        state.step = typeof p.step === "number" ? p.step : 0;
        state.lastPromptedStep = typeof p.lastPromptedStep === "number" ? p.lastPromptedStep : 0;
        state.awaitingInput = p.awaitingInput || false;
        state.completed = !!p.completed;
        var d = p.data || {};
        state.project_type = p.project_type != null && p.project_type !== "" ? p.project_type : d.project_type || "";
        state.material = p.material != null && p.material !== "" ? p.material : d.material || "";
        state.approximate_length = p.approximate_length != null && p.approximate_length !== "" ? p.approximate_length : d.approximate_length || "";
        state.city = p.city != null && p.city !== "" ? p.city : d.city || "";
        state.name = p.name != null && p.name !== "" ? p.name : d.name || "";
        state.phone = p.phone != null && p.phone !== "" ? p.phone : d.phone || "";
        state.email = p.email != null && p.email !== "" ? p.email : d.email || "";
        state.notes = p.notes != null && p.notes !== "" ? p.notes : d.notes || "";
        state.history = Array.isArray(p.history) ? p.history : [];
        if (p.v === 1 && state.lastPromptedStep === 0 && state.history.length > 0) {
          if (state.completed) state.lastPromptedStep = 7;
          else if (state.step >= 3) state.lastPromptedStep = state.step;
          else if (state.step === 2) state.lastPromptedStep = 2;
        }
      } catch (e) { /* ignore */ }
    }

    function saveState() {
      try {
        sessionStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({
            v: 3,
            step: state.step,
            lastPromptedStep: state.lastPromptedStep,
            awaitingInput: state.awaitingInput,
            completed: state.completed,
            project_type: state.project_type,
            material: state.material,
            approximate_length: state.approximate_length,
            city: state.city,
            name: state.name,
            phone: state.phone,
            email: state.email,
            notes: state.notes,
            history: state.history
          })
        );
      } catch (e) { /* ignore */ }
    }

    function scrollToBottom() {
      var m = els.messages;
      m.scrollTop = m.scrollHeight;
    }

    function setInputEnabled(on) {
      els.input.disabled = !on;
      els.send.disabled = !on;
    }

    function setOptionsVisible(show) {
      els.options.hidden = !show;
      Array.prototype.forEach.call(els.options.querySelectorAll("button"), function (b) {
        b.disabled = !show;
      });
    }

    function appendMessage(role, text) {
      var div = document.createElement("div");
      div.className = "lead-chat-msg lead-chat-msg--" + role;
      div.textContent = text;
      els.messages.appendChild(div);
      state.history.push({ role: role, text: text });
      saveState();
      scrollToBottom();
    }

    function addBotMessage(text) {
      appendMessage("bot", text);
    }

    function validateLeadFields() {
      var required = ["project_type", "city", "name", "phone"];
      var missing = required.filter(function (k) {
        var v = state[k];
        return v == null || String(v).trim() === "";
      });
      if (missing.length) {
        console.error("lead-chat submit blocked — missing fields:", missing);
        return false;
      }
      return true;
    }

    function renderHistory() {
      els.messages.innerHTML = "";
      state.history.forEach(function (h) {
        var div = document.createElement("div");
        div.className = "lead-chat-msg lead-chat-msg--" + h.role + " lead-chat-msg--static";
        div.textContent = h.text;
        els.messages.appendChild(div);
      });
      scrollToBottom();
    }

    function showTyping() {
      els.typing.classList.add("is-visible");
      els.typing.setAttribute("aria-hidden", "false");
      scrollToBottom();
    }

    function hideTyping() {
      els.typing.classList.remove("is-visible");
      els.typing.setAttribute("aria-hidden", "true");
    }

    function wait(ms) {
      return new Promise(function (resolve) { setTimeout(resolve, ms); });
    }

    function thinkDelay() {
      return 450 + Math.floor(Math.random() * 650);
    }

    function botSay(text, extraDelay) {
      return new Promise(function (resolve) {
        setInputEnabled(false);
        setOptionsVisible(false);
        showTyping();
        var d = (extraDelay != null ? extraDelay : thinkDelay()) + 400;
        setTimeout(function () {
          hideTyping();
          appendMessage("bot", text);
          resolve();
        }, d);
      });
    }

    function normalizePhoneDigits(s) {
      return String(s || "").replace(/\D/g, "");
    }

    function validatePhone(s) {
      return normalizePhoneDigits(s).length >= 10;
    }

    function clearStatus() {
      els.status.textContent = "";
      els.status.className = "lead-chat-status";
    }

    function setStatus(msg, kind) {
      els.status.textContent = msg || "";
      els.status.className = "lead-chat-status" + (kind ? " lead-chat-status--" + kind : "");
    }

    function buildProjectOptions() {
      els.options.innerHTML = "";
      var opts = [
        { value: "Wood fence", label: "Wood fence" },
        { value: "Vinyl fence", label: "Vinyl fence" },
        { value: "Chain link", label: "Chain link" },
        { value: "Fence repair", label: "Fence repair" },
        { value: "Gate", label: "Gate" }
      ];
      opts.forEach(function (o) {
        var b = document.createElement("button");
        b.type = "button";
        b.className = "lead-chat-opt";
        b.textContent = o.label;
        b.setAttribute("data-value", o.value);
        b.addEventListener("click", onOptionPick);
        els.options.appendChild(b);
      });
    }

    function onOptionPick(ev) {
      var val = ev.currentTarget.getAttribute("data-value");
      if (!val || state.step !== 2 || state.completed) return;
      appendMessage("user", val);
      state.project_type = val;
      state.step = 3;
      saveState();
      setOptionsVisible(false);
      runFlow();
    }

    function buildMaterialOptions() {
      els.options.innerHTML = "";
      var opts = [
        { value: "Wood / Cedar", label: "Wood / Cedar" },
        { value: "Vinyl", label: "Vinyl" },
        { value: "Chain link", label: "Chain link" },
        { value: "Wrought iron", label: "Wrought iron" },
        { value: "Not sure yet", label: "Not sure yet" }
      ];
      opts.forEach(function (o) {
        var b = document.createElement("button");
        b.type = "button";
        b.className = "lead-chat-opt";
        b.textContent = o.label;
        b.setAttribute("data-value", o.value);
        b.addEventListener("click", onMaterialPick);
        els.options.appendChild(b);
      });
    }

    function onMaterialPick(ev) {
      var val = ev.currentTarget.getAttribute("data-value");
      if (!val || state.step !== 3 || state.completed) return;
      appendMessage("user", val);
      state.material = val;
      state.step = 4;
      saveState();
      setOptionsVisible(false);
      runFlow();
    }

    const submitLead = async () => {
      try {
        const payload = {
          "form-name": "lead-chat",
          project_type: String(state.project_type || ""),
          material: String(state.material || ""),
          approximate_length: String(state.approximate_length || ""),
          city: String(state.city || ""),
          name: String(state.name || ""),
          phone: String(state.phone || ""),
          email: String(state.email || ""),
          notes: String(state.notes || "")
        };

        /* Netlify: POST to the same URL as <form name="lead-chat" action="..."> (usually site root "/") */
        var formNode = document.querySelector('form[name="lead-chat"]');
        var actionAttr = formNode && formNode.getAttribute("action");
        var postUrl =
          actionAttr != null && String(actionAttr).trim() !== ""
            ? new URL(actionAttr, window.location.origin).href
            : new URL(window.location.pathname || "/", window.location.origin).href;

        var body = new URLSearchParams(payload);

        console.log("lead-chat POST →", postUrl, Object.fromEntries(body));

        const res = await fetch(postUrl, {
          method: "POST",
          body: body
        });

        console.log("lead-chat response:", res.status, res.statusText);

        if (res.ok) {
          addBotMessage("Perfect. We’ll reach out shortly to go over your project.");
          state.completed = true;
          state.lastPromptedStep = 10;
          state.awaitingInput = false;
          saveState();
          setStatus("Thanks! Your request was sent.", "ok");
        } else {
          addBotMessage("Couldn't send just now — please call us or try again.");
          state.step = 7;
          state.awaitingInput = "phone";
          saveState();
          setInputEnabled(true);
          setStatus("Couldn't send just now — please call us or try again.", "err");
          els.input.focus();
        }
      } catch (err) {
        console.error("Submit error:", err);
        addBotMessage("Couldn't send just now — please call us or try again.");
        state.step = 7;
        state.awaitingInput = "phone";
        saveState();
        setInputEnabled(true);
        setStatus("Couldn't send just now — please call us or try again.", "err");
        els.input.focus();
      }
    };

    async function runFlow() {
      clearStatus();

      if (state.completed) {
        renderHistory();
        setInputEnabled(false);
        setOptionsVisible(false);
        setStatus("You’re all set — we have your info.", "ok");
        return;
      }

      if (state.step === 0) {
        if (state.lastPromptedStep < 1) {
          await botSay("Hey — looking for a fence quote? I can get you set up in about a minute.");
          state.lastPromptedStep = 1;
          saveState();
        }
        if (state.lastPromptedStep < 2) {
          await wait(350);
          await botSay("What type of project are you working on?");
          state.lastPromptedStep = 2;
          saveState();
        }
        state.step = 2;
        saveState();
        buildProjectOptions();
        setOptionsVisible(true);
        setInputEnabled(false);
        return;
      }

      if (state.step === 2) {
        renderHistory();
        buildProjectOptions();
        setOptionsVisible(true);
        setInputEnabled(false);
        return;
      }

      if (state.step === 3) {
        renderHistory();
        if (state.lastPromptedStep < 3) {
          await botSay("What material are you thinking?");
          state.lastPromptedStep = 3;
          saveState();
        }
        buildMaterialOptions();
        setOptionsVisible(true);
        setInputEnabled(false);
        return;
      }

      if (state.step === 4) {
        renderHistory();
        if (state.lastPromptedStep < 4) {
          await botSay("Roughly how many linear feet? (Estimate is fine — even just backyard or full perimeter works.)");
          state.lastPromptedStep = 4;
          saveState();
        }
        state.awaitingInput = "approximate_length";
        saveState();
        setInputEnabled(true);
        els.input.placeholder = "e.g. 80 ft, half acre perimeter, 2 gates…";
        els.input.focus();
        return;
      }

      if (state.step === 5) {
        renderHistory();
        if (state.lastPromptedStep < 5) {
          await botSay("What city is the project in?");
          state.lastPromptedStep = 5;
          saveState();
        }
        state.awaitingInput = "city";
        saveState();
        setInputEnabled(true);
        els.input.placeholder = "City name";
        els.input.focus();
        return;
      }

      if (state.step === 6) {
        renderHistory();
        if (state.lastPromptedStep < 6) {
          await botSay("What's your name?");
          state.lastPromptedStep = 6;
          saveState();
        }
        state.awaitingInput = "name";
        saveState();
        setInputEnabled(true);
        els.input.placeholder = "Your name";
        els.input.focus();
        return;
      }

      if (state.step === 7) {
        renderHistory();
        if (state.lastPromptedStep < 7) {
          await botSay("What's the best number to reach you? (Required so we can follow up.)");
          state.lastPromptedStep = 7;
          saveState();
        }
        state.awaitingInput = "phone";
        saveState();
        setInputEnabled(true);
        els.input.placeholder = "(916) 555-1234";
        els.input.focus();
        return;
      }

      if (state.step === 8) {
        renderHistory();
        if (state.lastPromptedStep < 8) {
          await botSay("Email? Totally optional — skip if you prefer.");
          state.lastPromptedStep = 8;
          saveState();
        }
        state.awaitingInput = "email";
        saveState();
        setInputEnabled(true);
        els.input.placeholder = "email@example.com or skip";
        els.input.focus();
        return;
      }

      if (state.step === 9) {
        renderHistory();
        if (state.lastPromptedStep < 9) {
          await botSay("Anything else we should know? (HOA rules, timing, gates — or just press Send.)");
          state.lastPromptedStep = 9;
          saveState();
        }
        state.awaitingInput = "notes";
        saveState();
        setInputEnabled(true);
        els.input.placeholder = "Optional notes, or just press Send";
        els.input.focus();
        return;
      }

      if (state.step === 10) {
        renderHistory();
        setInputEnabled(false);
        console.log("STATE BEFORE SUBMIT:", state);
        if (!validateLeadFields()) {
          setStatus("Couldn't send just now — please call us or try again.", "err");
          state.step = 7;
          state.awaitingInput = "phone";
          saveState();
          setInputEnabled(true);
          els.input.focus();
          return;
        }
        setStatus("Submitting…", "");
        await submitLead();
      }
    }

    function onSend() {
      if (state.completed) return;
      var raw = els.input.value.trim();
      if (!raw || !state.awaitingInput) return;

      if (state.awaitingInput === "phone" && !validatePhone(raw)) {
        setStatus("Please enter a phone number with at least 10 digits.", "err");
        botSay("I need a phone number with at least 10 digits — mind trying again?").then(function () {
          setInputEnabled(true);
          els.input.focus();
        });
        return;
      }
      clearStatus();

      appendMessage("user", raw);
      els.input.value = "";

      if (state.awaitingInput === "approximate_length") {
        state.approximate_length = raw;
        state.step = 5;
      } else if (state.awaitingInput === "city") {
        state.city = raw;
        state.step = 6;
      } else if (state.awaitingInput === "name") {
        state.name = raw;
        state.step = 7;
      } else if (state.awaitingInput === "phone") {
        state.phone = normalizePhoneDigits(raw);
        state.step = 8;
      } else if (state.awaitingInput === "email") {
        state.email = /^skip$/i.test(raw.trim()) ? "" : raw;
        state.step = 9;
      } else if (state.awaitingInput === "notes") {
        state.notes = /^skip$/i.test(raw.trim()) ? "" : raw;
        state.step = 10;
      }
      state.awaitingInput = false;
      saveState();
      runFlow().catch(function () {
        setStatus("Something went wrong — please refresh and try again.", "err");
      });
    }

    var idleTimer = null;
    function resetIdleTimer() {
      if (idleTimer) clearTimeout(idleTimer);
      els.nudge.classList.remove("is-visible");
      idleTimer = setTimeout(function () {
        if (!els.panel.classList.contains("is-open")) {
          els.nudge.classList.add("is-visible");
        }
      }, IDLE_MS);
    }

    function markActivity() {
      resetIdleTimer();
    }

    function openPanel() {
      els.panel.hidden = false;
      els.backdrop.hidden = false;
      requestAnimationFrame(function () {
        els.panel.classList.add("is-open");
        els.backdrop.classList.add("is-open");
      });
      els.toggle.setAttribute("aria-expanded", "true");
      els.nudge.classList.remove("is-visible");
      markActivity();
      runFlow().catch(function () {
        setStatus("Something went wrong — please refresh and try again.", "err");
      });
    }

    function closePanel() {
      els.panel.classList.remove("is-open");
      els.backdrop.classList.remove("is-open");
      els.toggle.setAttribute("aria-expanded", "false");
      setTimeout(function () {
        if (!els.panel.classList.contains("is-open")) {
          els.panel.hidden = true;
          els.backdrop.hidden = true;
        }
      }, 320);
      markActivity();
    }

    function togglePanel() {
      if (els.panel.classList.contains("is-open")) closePanel();
      else openPanel();
    }

    els.toggle.addEventListener("click", togglePanel);
    els.close.addEventListener("click", closePanel);
    els.backdrop.addEventListener("click", closePanel);
    els.send.addEventListener("click", onSend);
    els.input.addEventListener("keydown", function (e) {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        onSend();
      }
    });
    els.nudgeBtn.addEventListener("click", function () {
      openPanel();
    });

    ["mousemove", "keydown", "touchstart", "scroll"].forEach(function (ev) {
      document.addEventListener(ev, markActivity, { passive: true });
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && els.panel.classList.contains("is-open")) {
        closePanel();
      }
    });

    loadState();
    resetIdleTimer();
  })();
