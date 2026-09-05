/**
 * API Security Notes - Core Interactive JavaScript Engine
 * Handles tabs, dual language toggle (HI/EN), code copying, interactive checklists with counters,
 * and high-fidelity live simulated API testing labs.
 */

document.addEventListener('DOMContentLoaded', () => {
  // Enforce permanent dark theme
  document.documentElement.setAttribute('data-theme', 'dark');
  try { localStorage.removeItem('api_sec_theme'); } catch(e) {}
  initLanguageToggle();
  initTabs();
  initCopyButtons();
  initChecklist();
  initBolaSimulator();
  initInteractiveBackground();
  initHeroInteractiveWidgets();
});

/* ==========================================================================
   Language Toggle Handler (Hindi / English)
   ========================================================================== */
function initLanguageToggle() {
  const langToggle = document.getElementById('langToggle');
  const lblHi = document.getElementById('lbl-hi');
  const lblEn = document.getElementById('lbl-en');
  const html = document.documentElement;

  // Retrieve saved language preference or default to Hindi
  const savedLang = localStorage.getItem('api_sec_lang') || 'hi';
  setLanguage(savedLang);

  if (langToggle) {
    langToggle.checked = (savedLang === 'en');

    langToggle.addEventListener('change', () => {
      const newLang = langToggle.checked ? 'en' : 'hi';
      setLanguage(newLang);
    });
  }

  if (lblHi) {
    lblHi.addEventListener('click', () => {
      if (langToggle) langToggle.checked = false;
      setLanguage('hi');
    });
  }

  if (lblEn) {
    lblEn.addEventListener('click', () => {
      if (langToggle) langToggle.checked = true;
      setLanguage('en');
    });
  }

  function setLanguage(lang) {
    html.setAttribute('data-lang', lang);
    localStorage.setItem('api_sec_lang', lang);

    if (lblHi && lblEn) {
      if (lang === 'hi') {
        lblHi.classList.add('active');
        lblEn.classList.remove('active');
      } else {
        lblHi.classList.remove('active');
        lblEn.classList.add('active');
      }
    }
  }
}

/* ==========================================================================
   Tab Navigation Handler
   ========================================================================== */
function initTabs() {
  const tabButtons = document.querySelectorAll('.tab-btn, .tab-underline-btn');
  const tabPanels = document.querySelectorAll('.tab-content');

  tabButtons.forEach(button => {
    button.addEventListener('click', () => {
      const targetId = button.getAttribute('data-tab');

      tabButtons.forEach(btn => btn.classList.remove('active'));
      tabPanels.forEach(panel => panel.classList.remove('active'));

      // If there are multiple buttons for the same tab, highlight all matching ones
      document.querySelectorAll(`[data-tab="${targetId}"]`).forEach(b => b.classList.add('active'));

      const targetPanel = document.getElementById(targetId);
      if (targetPanel) {
        targetPanel.classList.add('active');
      }

      // Auto-scroll horizontal nav when 4th button or beyond is clicked and more buttons exist
      const nav = button.closest('.tabs-underline-nav, .tabs-nav');
      if (nav && nav.scrollWidth > nav.clientWidth) {
        const siblings = Array.from(nav.querySelectorAll('.tab-underline-btn, .tab-btn'));
        const btnIndex = siblings.indexOf(button);

        if (btnIndex >= 3) {
          // 4th button (index 3) or higher: smoothly scroll to bring upcoming buttons (5, 6, 7...) into view
          const navRect = nav.getBoundingClientRect();
          const btnRect = button.getBoundingClientRect();
          const currentScroll = nav.scrollLeft;
          const buttonOffsetInNav = btnRect.left - navRect.left + currentScroll;
          const targetScroll = Math.max(0, buttonOffsetInNav - 24);

          nav.scrollTo({
            left: targetScroll,
            behavior: 'smooth'
          });
        } else if (btnIndex === 0) {
          // 1st button: smoothly return to start
          nav.scrollTo({
            left: 0,
            behavior: 'smooth'
          });
        } else {
          // 2nd or 3rd button: ensure it is fully visible if previously scrolled past
          const navRect = nav.getBoundingClientRect();
          const btnRect = button.getBoundingClientRect();
          if (btnRect.left < navRect.left + 24) {
            const currentScroll = nav.scrollLeft;
            const buttonOffsetInNav = btnRect.left - navRect.left + currentScroll;
            nav.scrollTo({
              left: Math.max(0, buttonOffsetInNav - 24),
              behavior: 'smooth'
            });
          }
        }
      }
    });
  });
}

/* ==========================================================================
   Copy to Clipboard Handler
   ========================================================================== */
function initCopyButtons() {
  const copyButtons = document.querySelectorAll('.btn-copy');

  copyButtons.forEach(button => {
    button.addEventListener('click', () => {
      const targetSelector = button.getAttribute('data-target');
      const targetElem = document.querySelector(targetSelector);

      if (!targetElem) return;

      const codeLines = targetElem.querySelectorAll('.code-text');
      let textToCopy = '';

      if (codeLines.length > 0) {
        textToCopy = Array.from(codeLines).map(l => l.innerText).join('\n');
      } else {
        textToCopy = targetElem.innerText;
      }

      navigator.clipboard.writeText(textToCopy).then(() => {
        const isEn = document.documentElement.getAttribute('data-lang') === 'en';
        showToast(isEn ? 'Copied to clipboard!' : 'Clipboard me copy ho gaya!');
        const originalText = button.innerHTML;
        button.innerHTML = '<span>✓</span> ' + (isEn ? 'Copied' : 'Copied');
        setTimeout(() => {
          button.innerHTML = originalText;
        }, 1800);
      }).catch(err => {
        console.error('Copy failed:', err);
      });
    });
  });
}

function showToast(message) {
  let toast = document.querySelector('.toast-msg');
  if (!toast) {
    toast = document.createElement('div');
    toast.className = 'toast-msg';
    document.body.appendChild(toast);
  }
  toast.innerText = message;
  toast.classList.add('show');
  setTimeout(() => {
    toast.classList.remove('show');
  }, 2000);
}

/* ==========================================================================
   Universal Interactive Checklist Engine (Pass / Fail Format)
   ========================================================================== */
window.setChecklistStatus = function(event, btn, status) {
  if (event) event.stopPropagation();
  const item = btn.closest('.checklist-item');
  if (!item) return;
  const passBtn = item.querySelector('.pass-btn');
  const failBtn = item.querySelector('.fail-btn');
  const circleIcon = item.querySelector('.check-mark-icon');

  const isCurrent = (status === 'pass' && item.classList.contains('item-passed')) ||
                    (status === 'fail' && item.classList.contains('item-failed'));

  if (isCurrent) {
    // Toggle off
    item.classList.remove('item-passed', 'item-failed');
    if (passBtn) passBtn.classList.remove('active');
    if (failBtn) failBtn.classList.remove('active');
    const itemNum = item.getAttribute('data-item-num') || (item.id ? item.id.replace('check-item-', '') : '');
    if (circleIcon && itemNum) circleIcon.innerText = itemNum;
  } else {
    if (status === 'pass') {
      item.classList.add('item-passed');
      item.classList.remove('item-failed');
      if (passBtn) passBtn.classList.add('active');
      if (failBtn) failBtn.classList.remove('active');
      if (circleIcon) circleIcon.innerText = '✓';
    } else {
      item.classList.add('item-failed');
      item.classList.remove('item-passed');
      if (failBtn) failBtn.classList.add('active');
      if (passBtn) passBtn.classList.remove('active');
      if (circleIcon) circleIcon.innerText = '✕';
    }
  }

  if (typeof window.updateChecklistCounter === 'function') {
    window.updateChecklistCounter();
  }
};

window.toggleCheckCircle = function(event, el) {
  if (event) event.stopPropagation();
  const item = el.closest('.checklist-item');
  if (!item) return;
  const passBtn = item.querySelector('.pass-btn');
  const failBtn = item.querySelector('.fail-btn');
  if (item.classList.contains('item-passed')) {
    window.setChecklistStatus(null, failBtn || item, 'fail');
  } else if (item.classList.contains('item-failed')) {
    window.setChecklistStatus(null, failBtn || item, 'fail'); // toggle off
  } else {
    window.setChecklistStatus(null, passBtn || item, 'pass');
  }
};

window.handleCheckItemClick = function(event, item) {
  if (event.target.closest('.check-actions-bar') || event.target.closest('code') || event.target.closest('.check-how-to-box') || event.target.closest('button')) {
    return;
  }
  window.toggleCheckCircle(event, item);
};

window.updateChecklistCounter = function() {
  const items = document.querySelectorAll('.checklist-container .checklist-item');
  if (items.length === 0) return;
  let passCount = 0;
  let failCount = 0;
  items.forEach(item => {
    if (item.classList.contains('item-passed')) passCount++;
    if (item.classList.contains('item-failed')) failCount++;
  });
  const total = items.length;
  const evaluated = passCount + failCount;
  const counterEl = document.getElementById('checklist-progress-counter');
  if (counterEl) {
    counterEl.innerHTML = `${evaluated} of ${total} Checks Audited (<span style="color:#10b981;">✓ ${passCount} Passed</span> | <span style="color:#ef4444;">✕ ${failCount} Vulnerable</span>)`;
  }
};

function initChecklist() {
  // Clear legacy checklist state from localStorage
  try {
    for (let i = 0; i < 50; i++) {
      localStorage.removeItem(`bola_check_${i}`);
      localStorage.removeItem(`bfla_check_${i}`);
      localStorage.removeItem(`idor_check_${i}`);
      localStorage.removeItem(`jwt_check_${i}`);
    }
  } catch (e) {}

  const items = document.querySelectorAll('.checklist-container .checklist-item');
  items.forEach((item, idx) => {
    if (!item.getAttribute('data-item-num')) {
      item.setAttribute('data-item-num', (idx + 1).toString());
    }
  });

  window.updateChecklistCounter();
}

/* ==========================================================================
   Interactive BOLA Simulation Lab (Enhanced with Verbs, Presets & SQL Logs)
   ========================================================================== */
function initBolaSimulator() {
  const sendBtn = document.getElementById('sim-send-btn');
  const idInput = document.getElementById('sim-id-input');
  const verbSelect = document.getElementById('sim-verb-select');
  const bodyContainer = document.getElementById('sim-body-container');
  const bodyInput = document.getElementById('sim-body-input');
  const statusElem = document.getElementById('sim-status');
  const responseElem = document.getElementById('sim-response-body');
  const alertElem = document.getElementById('sim-alert-banner');
  const sqlLogElem = document.getElementById('sim-sql-log');
  const explanationElem = document.getElementById('sim-explanation-text');
  const presetButtons = document.querySelectorAll('.sim-preset-btn');

  if (!sendBtn || !idInput || !responseElem) return;

  // In-memory mock database that gets mutated during PUT / DELETE
  const mockDatabase = {
    "1001": {
      id: 1001,
      name: "Kaif (You)",
      email: "kaif@mycorp.com",
      role: "standard_user",
      ssn: "XXX-XX-4819",
      credit_balance: 450.00,
      private_notes: "Personal gym schedule & family photos."
    },
    "1002": {
      id: 1002,
      name: "Om (Target)",
      email: "om@example.com",
      role: "standard_user",
      ssn: "XXX-XX-8921",
      credit_balance: 12850.50,
      private_notes: "Confidential financial salary & bank card details."
    },
    "1003": {
      id: 1003,
      name: "Sarah Connor (CTO)",
      email: "sarah.c@company-hq.org",
      role: "executive_admin",
      ssn: "XXX-XX-1104",
      credit_balance: 85200.00,
      private_notes: "AWS Master Keys: AKIA-PRODUCTION-SECRET-ROOT-KEYS"
    }
  };

  // Toggle Request Body visibility for PUT/PATCH
  if (verbSelect && bodyContainer) {
    verbSelect.addEventListener('change', () => {
      const verb = verbSelect.value;
      if (verb === 'PUT' || verb === 'PATCH') {
        bodyContainer.style.display = 'block';
      } else {
        bodyContainer.style.display = 'none';
      }
    });
  }

  // Preset quick buttons
  presetButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = btn.getAttribute('data-id');
      idInput.value = targetId;
      executeRequest();
    });
  });

  function executeRequest() {
    const requestedId = idInput.value.trim();
    const verb = verbSelect ? verbSelect.value : 'GET';
    const isEn = document.documentElement.getAttribute('data-lang') === 'en';

    responseElem.innerHTML = `<span style="color:#94a3b8">// Sending ${verb} /api/users/${requestedId} ...</span>`;
    if (sqlLogElem) {
      sqlLogElem.innerHTML = `<span style="color:#64748b">// Waiting for DB query execution...</span>`;
    }

    setTimeout(() => {
      const isTargetPresent = !!mockDatabase[requestedId];

      if (!isTargetPresent) {
        statusElem.innerHTML = `<span style="color:#f87171">HTTP/1.1 404 Not Found</span>`;
        responseElem.innerHTML = syntaxHighlightJson(JSON.stringify({
          error: "Not Found",
          message: `Resource /api/users/${requestedId} does not exist.`
        }, null, 2));

        if (sqlLogElem) {
          sqlLogElem.innerHTML = `<span style="color:#f87171">SQL &gt; SELECT * FROM users WHERE id = ${requestedId}; -- Returned 0 rows</span>`;
        }
        alertElem.style.display = 'none';
        if (explanationElem) {
          explanationElem.innerHTML = isEn
            ? `<strong>Resource Not Found (404):</strong> The database executed <code>SELECT * FROM users WHERE id = ${requestedId}</code> and found 0 matching rows. The server replied with 404 Not Found.`
            : `<strong>Resource Not Found (404):</strong> Database me ID ${requestedId} ka koi record nahi mila (0 rows). Server ne standard 404 Not Found error return kiya.`;
        }
        return;
      }

      const isOwnAccount = (requestedId === "1001");

      if (verb === 'GET') {
        const data = mockDatabase[requestedId];
        statusElem.innerHTML = `<span style="color:#34d399">HTTP/1.1 200 OK</span> <span style="color:#64748b">(${Math.floor(Math.random() * 20 + 12)}ms)</span>`;
        responseElem.innerHTML = syntaxHighlightJson(JSON.stringify(data, null, 2));

        if (sqlLogElem) {
          sqlLogElem.innerHTML = `<span style="color:#38bdf8">SQL &gt;</span> <span style="color:#fbbf24;">SELECT * FROM users WHERE id = ${requestedId};</span> <br><span style="color:#ef4444; font-size:0.75rem;">⚠️ FLAW: Query lacks "AND owner_id = 1001". Returned unauthorized row!</span>`;
        }

        if (!isOwnAccount) {
          alertElem.style.display = 'block';
          alertElem.style.borderLeftColor = '#ef4444';
          alertElem.style.background = 'rgba(239, 68, 68, 0.12)';
          if (isEn) {
            alertElem.innerHTML = `
              <strong style="color:#f87171">🚨 CRITICAL BOLA DATA EXFILTRATION!</strong><br>
              Logged in as <strong>Kaif (User 1001)</strong>, but the API returned <strong>User #${requestedId} (${data.name})</strong> without checking object permissions!
            `;
          } else {
            alertElem.innerHTML = `
              <strong style="color:#f87171">🚨 CRITICAL BOLA DATA EXFILTRATION HO GAYI!</strong><br>
              Aap <strong>Kaif (User 1001)</strong> hain, par API ne bina permission check kiye <strong>User #${requestedId} (${data.name})</strong> ka secret data leak kar diya!
            `;
          }
          if (explanationElem) {
            explanationElem.innerHTML = isEn
              ? `<strong>BOLA Vulnerability Triggered! (Horizontal Privilege Escalation):</strong> You sent Kaif's valid token, but changed the URL ID to <code>${requestedId}</code> (${data.name}). The server verified your login (AuthN passed), but failed to verify object ownership (AuthZ failed). The SQL query <code>SELECT * FROM users WHERE id = ${requestedId}</code> executed blindly, returning another user's private financial data and confidential notes to an unauthorized person!`
              : `<strong>BOLA Vulnerability Trigger Ho Gayi! (Data Leak):</strong> Aap Kaif (1001) ke token se logged in hain, lekin URL me aapne ID badal kar <code>${requestedId}</code> (${data.name}) kar di. Server ne login toh check kiya, par yeh check nahi kiya ki kya Kaif ko is record ka access hai. Backend ne bina ownership check kiye database se doosre user ka private data Kaif ko leak kar diya!`;
          }
        } else {
          alertElem.style.display = 'block';
          alertElem.style.borderLeftColor = '#10b981';
          alertElem.style.background = 'rgba(16, 185, 129, 0.12)';
          if (isEn) {
            alertElem.innerHTML = `<strong style="color:#34d399">✓ Legitimate Access:</strong> You queried your own profile (1001). Now click "Target 1002" or "Target 1003" to trigger BOLA!`;
          } else {
            alertElem.innerHTML = `<strong style="color:#34d399">✓ Sahi Request:</strong> Yeh aapka apna account (1001) hai. Ab BOLA exploit dekhne ke liye "Target 1002" ya "Target 1003" button dabayein!`;
          }
          if (explanationElem) {
            explanationElem.innerHTML = isEn
              ? `<strong>Legitimate Access (Safe):</strong> You requested your own user profile (1001). The JWT authorization token claims match the requested record identifier, so the backend returned your profile legitimately. Now click "Target 1002" or "Target 1003" to observe what happens during a BOLA exploit!`
              : `<strong>Sahi Request (Legitimate Access):</strong> Aapne apna khud ka account (1001) query kiya. Kyunki token bhi Kaif ka hai aur requested ID bhi 1001 hai, server ne safely data diya. Ab upar "Target 1002" ya "Target 1003" button dabakar dekhiye BOLA attack kaise hota hai!`;
          }
        }
      } else if (verb === 'PUT') {
        let updateData = {};
        try {
          updateData = JSON.parse(bodyInput ? bodyInput.value : '{"email":"attacker@evil.com"}');
        } catch (e) {
          updateData = { email: "attacker@evil.com" };
        }

        Object.assign(mockDatabase[requestedId], updateData);
        statusElem.innerHTML = `<span style="color:#34d399">HTTP/1.1 200 OK</span>`;
        responseElem.innerHTML = syntaxHighlightJson(JSON.stringify({
          status: "success",
          message: `User #${requestedId} modified successfully!`,
          updated_record: mockDatabase[requestedId]
        }, null, 2));

        if (sqlLogElem) {
          sqlLogElem.innerHTML = `<span style="color:#38bdf8">SQL &gt;</span> <span style="color:#fbbf24;">UPDATE users SET email = '${updateData.email || "attacker@evil.com"}' WHERE id = ${requestedId};</span> <br><span style="color:#ef4444; font-size:0.75rem;">🔥 CRITICAL: Unauthorized State-Modification executed! Victim account hijacked!</span>`;
        }

        alertElem.style.display = 'block';
        alertElem.style.borderLeftColor = '#ef4444';
        alertElem.style.background = 'rgba(239, 68, 68, 0.15)';
        if (isEn) {
          alertElem.innerHTML = `<strong style="color:#f87171">🔥 STATE-CHANGING BOLA: FULL ACCOUNT TAKEOVER!</strong><br>You just modified User #${requestedId}'s email to <strong>${updateData.email || "attacker@evil.com"}</strong>! The victim can no longer log in.`;
        } else {
          alertElem.innerHTML = `<strong style="color:#f87171">🔥 STATE-CHANGING BOLA: FULL ACCOUNT TAKEOVER HO GAYA!</strong><br>Aapne User #${requestedId} ka email badal kar <strong>${updateData.email || "attacker@evil.com"}</strong> kar diya! Ab victim ka pura account attacker ke kabze me hai.`;
        }
        if (explanationElem) {
          explanationElem.innerHTML = isEn
            ? `<strong>State-Changing BOLA Exploited (Full Account Takeover):</strong> The attacker dispatched a PUT request against victim User #${requestedId}, modifying their email to <code>${updateData.email || "attacker@evil.com"}</code> in the database. When the victim attempts a password reset, the link will be sent to the attacker, leading to complete account takeover!`
            : `<strong>State-Changing BOLA (Pura Account Hijack):</strong> Attacker ne victim User #${requestedId} ke record par PUT request bhej kar database me email <code>${updateData.email || "attacker@evil.com"}</code> se replace kar diya! Ab victim ka login lock ho jayega aur password reset link attacker ke paas jayega!`;
        }
      } else if (verb === 'DELETE') {
        delete mockDatabase[requestedId];
        statusElem.innerHTML = `<span style="color:#34d399">HTTP/1.1 204 No Content</span>`;
        responseElem.innerHTML = syntaxHighlightJson(JSON.stringify({
          status: "deleted",
          message: `User #${requestedId} was permanently destroyed.`
        }, null, 2));

        if (sqlLogElem) {
          sqlLogElem.innerHTML = `<span style="color:#38bdf8">SQL &gt;</span> <span style="color:#ef4444;">DELETE FROM users WHERE id = ${requestedId};</span> <br><span style="color:#ef4444; font-size:0.75rem;">💣 CRITICAL: Unauthorized deletion! Record deleted permanently.</span>`;
        }

        alertElem.style.display = 'block';
        alertElem.style.borderLeftColor = '#ef4444';
        alertElem.style.background = 'rgba(239, 68, 68, 0.15)';
        if (isEn) {
          alertElem.innerHTML = `<strong style="color:#f87171">💣 DESTRUCTIVE BOLA EXPLOITED!</strong><br>User #${requestedId} record was permanently deleted without verifying if you have deletion privileges.`;
        } else {
          alertElem.innerHTML = `<strong style="color:#f87171">💣 DESTRUCTIVE BOLA EXPLOITED!</strong><br>User #${requestedId} ka account database se permanently delete ho gaya bina kisi authorization check ke!`;
        }
        if (explanationElem) {
          explanationElem.innerHTML = isEn
            ? `<strong>Destructive BOLA Exploited (Unauthorized Destruction):</strong> The attacker sent an unauthorized DELETE request against User #${requestedId}. The database dropped the entire record permanently without asking for owner or admin authorization!`
            : `<strong>Destructive BOLA (Permanently Record Destroy):</strong> Attacker ne bina owner ya admin verification ke User #${requestedId} ko delete karne ki request bheji. Database ne victim ka account hamesha ke liye destroy kar diya!`;
        }
      }
    }, 200);
  }

  sendBtn.addEventListener('click', executeRequest);
  idInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') executeRequest();
  });
  document.getElementById('langToggle')?.addEventListener('change', () => {
    if (idInput.value) executeRequest();
  });
}

/* ==========================================================================
   Universal Colorful JSON Syntax Highlighter (Globally Accessible)
   ========================================================================== */
window.syntaxHighlightJson = function(json) {
  if (typeof json !== 'string') {
    try {
      json = JSON.stringify(json, null, 2);
    } catch (e) {
      json = String(json);
    }
  }
  if (!json) return '';
  json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  return json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?|[{}\[\],])/g, function (match) {
    if (/^"/.test(match)) {
      if (/:$/.test(match)) {
        const keyText = match.slice(0, -1);
        const isSensitive = /role|wallet|balance|verified|plan|tier|total|paid|admin|is_admin|secret|password|token|privilege|amount|invoice_id|document_id|tax|ssn|credit_card/i.test(keyText);
        const cls = isSensitive ? 'json-key sensitive' : 'json-key';
        return `<span class="${cls}">${keyText}</span><span class="json-op">:</span>`;
      } else {
        const isExploit = /admin|enterprise|COMPROMISED|EXPLOIT|hacked|root|superadmin|BREACH|LEAK|ELEVATED/i.test(match);
        const isSuccess = /ACTIVE|PAID|SUCCESS|OK|Verified|AUTHORIZED/i.test(match);
        let cls = 'json-str';
        if (isExploit) cls = 'json-str exploit';
        else if (isSuccess) cls = 'json-str success';
        return `<span class="${cls}">${match}</span>`;
      }
    } else if (/true|false/.test(match)) {
      const cls = match === 'true' ? 'json-bool exploit' : 'json-bool';
      return `<span class="${cls}">${match}</span>`;
    } else if (/null/.test(match)) {
      return `<span class="json-null">${match}</span>`;
    } else if (/[{}\[\],]/.test(match)) {
      return `<span class="json-op">${match}</span>`;
    }
    const num = parseFloat(match);
    const cls = (!isNaN(num) && num > 1000) ? 'json-num highlight' : 'json-num';
    return `<span class="${cls}">${match}</span>`;
  });
};
window.syntaxHighlightJSON = window.syntaxHighlightJson;

function syntaxHighlightJson(json) {
  return window.syntaxHighlightJson(json);
}

/* ==========================================================================
   Interactive Cyber Background Engine
   Constellation Network + Interactive Mouse Gravity & Laser Threads + Cursor Glow
   ========================================================================== */
function initInteractiveBackground() {
  if (document.getElementById('cyber-bg-canvas')) return;

  const canvas = document.createElement('canvas');
  canvas.id = 'cyber-bg-canvas';

  const glowDiv = document.createElement('div');
  glowDiv.className = 'interactive-cursor-glow';

  document.body.prepend(glowDiv);
  document.body.prepend(canvas);

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  let width = 0;
  let height = 0;
  let dpr = Math.min(window.devicePixelRatio || 1, 2);
  let particles = [];
  let isRunning = true;
  let mouse = { x: null, y: null, targetX: null, targetY: null, isHovering: false };
  let animFrameId = null;

  function resize() {
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(dpr, dpr);
    createParticles();
  }

  function createParticles() {
    particles = [];
    const count = width < 768 ? 26 : (width < 1200 ? 46 : 64);

    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.45,
        vy: (Math.random() - 0.5) * 0.45,
        radius: Math.random() * 1.5 + 1.2,
        baseAlpha: Math.random() * 0.4 + 0.35,
        pulsePhase: Math.random() * Math.PI * 2,
        colorType: i % 4 // 0, 1: Cyan, 2: Indigo, 3: Emerald
      });
    }
  }

  function onPointerMove(e) {
    mouse.targetX = e.clientX;
    mouse.targetY = e.clientY;
    mouse.isHovering = true;
    document.documentElement.style.setProperty('--mouse-x', `${e.clientX}px`);
    document.documentElement.style.setProperty('--mouse-y', `${e.clientY}px`);
  }

  function onPointerLeave() {
    mouse.isHovering = false;
    mouse.targetX = null;
    mouse.targetY = null;
  }

  window.addEventListener('pointermove', onPointerMove, { passive: true });
  document.addEventListener('mouseleave', onPointerLeave);

  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      cancelAnimationFrame(animFrameId);
      resize();
      render();
    }, 150);
  }, { passive: true });

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      isRunning = false;
    } else {
      isRunning = true;
      render();
    }
  });

  function render() {
    if (!isRunning) return;

    ctx.clearRect(0, 0, width, height);
    const isDark = document.documentElement.getAttribute('data-theme') !== 'light';

    // Smooth mouse coordinate interpolation
    if (mouse.targetX !== null && mouse.targetY !== null) {
      if (mouse.x === null) {
        mouse.x = mouse.targetX;
        mouse.y = mouse.targetY;
      } else {
        mouse.x += (mouse.targetX - mouse.x) * 0.18;
        mouse.y += (mouse.targetY - mouse.y) * 0.18;
      }
    } else {
      mouse.x = null;
      mouse.y = null;
    }

    const mouseDistMax = 160;
    const connectDistMax = 115;

    // Update & draw particles
    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];

      p.x += p.vx;
      p.y += p.vy;

      // Soft boundary reflection
      if (p.x < 0) { p.x = 0; p.vx *= -1; }
      else if (p.x > width) { p.x = width; p.vx *= -1; }
      if (p.y < 0) { p.y = 0; p.vy *= -1; }
      else if (p.y > height) { p.y = height; p.vy *= -1; }

      // Mouse interaction: fluid repulsion + glowing laser thread
      let mouseConnected = false;
      if (mouse.x !== null && mouse.y !== null) {
        const dx = p.x - mouse.x;
        const dy = p.y - mouse.y;
        const dist = Math.hypot(dx, dy);

        if (dist < mouseDistMax) {
          mouseConnected = true;
          // Smooth repulsion force
          const force = (1 - dist / mouseDistMax) * 0.85;
          p.x += (dx / dist) * force;
          p.y += (dy / dist) * force;

          // Glowing laser connector to cursor
          const lineAlpha = (1 - dist / mouseDistMax) * (isDark ? 0.45 : 0.35);
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(mouse.x, mouse.y);
          ctx.strokeStyle = isDark 
            ? `rgba(56, 189, 248, ${lineAlpha})` 
            : `rgba(2, 132, 199, ${lineAlpha})`;
          ctx.lineWidth = (1 - dist / mouseDistMax) * 1.6 + 0.4;
          ctx.stroke();
        }
      }

      // Constellation inter-particle lines
      for (let j = i + 1; j < particles.length; j++) {
        const p2 = particles[j];
        const dx = p.x - p2.x;
        const dy = p.y - p2.y;
        const dist = Math.hypot(dx, dy);

        if (dist < connectDistMax) {
          const alpha = (1 - dist / connectDistMax) * (isDark ? 0.22 : 0.16);
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.strokeStyle = isDark
            ? (p.colorType === 2 ? `rgba(129, 140, 248, ${alpha})` : `rgba(56, 189, 248, ${alpha})`)
            : `rgba(2, 132, 199, ${alpha})`;
          ctx.lineWidth = 0.85;
          ctx.stroke();
        }
      }

      // Draw particle circle with gentle breathing pulse
      p.pulsePhase += 0.025;
      const pulseAlpha = p.baseAlpha + Math.sin(p.pulsePhase) * 0.15;
      const effectiveAlpha = mouseConnected ? Math.min(1, pulseAlpha + 0.4) : pulseAlpha;

      ctx.beginPath();
      ctx.arc(p.x, p.y, mouseConnected ? p.radius * 1.35 : p.radius, 0, Math.PI * 2);

      if (isDark) {
        if (p.colorType === 2) {
          ctx.fillStyle = `rgba(129, 140, 248, ${effectiveAlpha})`; // Electric Indigo
        } else if (p.colorType === 3) {
          ctx.fillStyle = `rgba(52, 211, 153, ${effectiveAlpha})`; // Emerald Accent
        } else {
          ctx.fillStyle = `rgba(56, 189, 248, ${effectiveAlpha})`; // Cyber Cyan
        }
      } else {
        ctx.fillStyle = `rgba(2, 132, 199, ${effectiveAlpha})`; // Sky Blue
      }
      ctx.fill();
    }

    animFrameId = requestAnimationFrame(render);
  }

  resize();
  render();
}

/* ==========================================================================
   Interactive Hero Attack Flow Widgets (BOLA & BFLA)
   Dynamic State Toggle (Normal vs Exploit) + 3D Holographic Tilt & Beam Travel
   ========================================================================== */
function initHeroInteractiveWidgets() {
  // 1. Setup BOLA Hero Widget
  const bolaWidget = document.getElementById('bolaHeroWidget');
  if (bolaWidget) {
    const btnNormal = document.getElementById('btnHeroNormal');
    const btnExploit = document.getElementById('btnHeroExploit');
    const avatar = document.getElementById('heroAttackerAvatar');
    const label = document.getElementById('heroAttackerLabel');
    const sub = document.getElementById('heroAttackerSub');
    const path = document.getElementById('heroPath');
    const badgeFrom = document.getElementById('heroBadgeFrom');
    const badgeTo = document.getElementById('heroBadgeTo');
    const beam = document.getElementById('heroBeamParticle');
    const flowText = document.getElementById('heroFlowStateText');
    const targetCard = document.getElementById('heroTargetCard');
    const targetName = document.getElementById('heroTargetName');
    const targetStatus = document.getElementById('heroTargetStatus');
    const targetId = document.getElementById('heroTargetId');
    const targetEmail = document.getElementById('heroTargetEmail');
    const targetRole = document.getElementById('heroTargetRole');
    const targetNote = document.getElementById('heroTargetNote');

    function setBolaState(isExploit) {
      if (isExploit) {
        btnExploit?.classList.add('active', 'exploit');
        btnNormal?.classList.remove('active', 'normal');

        if (avatar) {
          avatar.textContent = '🥷';
          avatar.style.borderColor = '#ef4444';
          avatar.style.background = 'rgba(239, 68, 68, 0.15)';
          avatar.style.boxShadow = '0 0 15px rgba(239, 68, 68, 0.35)';
        }
        if (label) { label.textContent = 'Kaif (Attacker)'; label.style.color = '#f87171'; }
        if (sub) sub.textContent = 'Role: user (ID: 1001)';

        if (path) path.textContent = '/api/users/1002';
        if (badgeFrom) { badgeFrom.textContent = '1001'; }
        if (badgeTo) {
          badgeTo.textContent = '1002';
          badgeTo.className = 'swap-id-badge to';
        }

        if (beam) { beam.classList.add('exploit'); }
        if (flowText) { flowText.textContent = 'Tampered Object ID'; flowText.style.color = '#f87171'; }

        if (targetCard) {
          targetCard.classList.remove('normal');
          targetCard.classList.add('exploit');
        }
        if (targetName) targetName.textContent = 'Om';
        if (targetStatus) {
          targetStatus.textContent = 'HTTP 200';
          targetStatus.className = 'target-pill-status breach';
        }
        if (targetId) targetId.innerHTML = 'ID: <code>1002</code>';
        if (targetEmail) targetEmail.innerHTML = 'Email: <code>om@example.com</code>';
        if (targetRole) targetRole.innerHTML = 'Role: <code>user</code>';
        if (targetNote) {
          targetNote.innerHTML = '🚨 Accesses another user\'s data (unauthorized)';
          targetNote.style.color = '#f87171';
        }
      } else {
        btnNormal?.classList.add('active', 'normal');
        btnExploit?.classList.remove('active', 'exploit');

        if (avatar) {
          avatar.textContent = '👤';
          avatar.style.borderColor = '#10b981';
          avatar.style.background = 'rgba(16, 185, 129, 0.15)';
          avatar.style.boxShadow = '0 0 15px rgba(16, 185, 129, 0.35)';
        }
        if (label) { label.textContent = 'Kaif (User)'; label.style.color = '#34d399'; }
        if (sub) sub.textContent = 'Role: user (ID: 1001)';

        if (path) path.textContent = '/api/users/1001';
        if (badgeFrom) { badgeFrom.textContent = '1001'; }
        if (badgeTo) {
          badgeTo.textContent = '1001';
          badgeTo.className = 'swap-id-badge from';
        }

        if (beam) { beam.classList.remove('exploit'); }
        if (flowText) { flowText.textContent = 'Legitimate Own Object'; flowText.style.color = '#34d399'; }

        if (targetCard) {
          targetCard.classList.remove('exploit');
          targetCard.classList.add('normal');
        }
        if (targetName) targetName.textContent = 'Kaif (Self)';
        if (targetStatus) {
          targetStatus.textContent = 'HTTP 200';
          targetStatus.className = 'target-pill-status safe';
        }
        if (targetId) targetId.innerHTML = 'ID: <code>1001</code>';
        if (targetEmail) targetEmail.innerHTML = 'Email: <code>kaif@mycorp.com</code>';
        if (targetRole) targetRole.innerHTML = 'Role: <code>user</code>';
        if (targetNote) {
          targetNote.innerHTML = '<span style="color:#34d399;">✓ Legitimate: Authorized access to own data</span>';
        }
      }
    }

    btnNormal?.addEventListener('click', (e) => {
      e.stopPropagation();
      setBolaState(false);
    });

    btnExploit?.addEventListener('click', (e) => {
      e.stopPropagation();
      setBolaState(true);
    });
  }

  // 2. Setup BFLA Hero Widget
  const bflaWidget = document.getElementById('bflaHeroWidget');
  if (bflaWidget) {
    const btnNormal = document.getElementById('btnBflaNormal');
    const btnExploit = document.getElementById('btnBflaExploit');
    const avatar = document.getElementById('bflaAttackerAvatar');
    const label = document.getElementById('bflaAttackerLabel');
    const sub = document.getElementById('bflaAttackerSub');
    const verb = document.getElementById('bflaVerb');
    const path = document.getElementById('bflaPath');
    const badgeFrom = document.getElementById('bflaBadgeFrom');
    const badgeTo = document.getElementById('bflaBadgeTo');
    const beam = document.getElementById('bflaBeamParticle');
    const flowText = document.getElementById('bflaFlowStateText');
    const targetCard = document.getElementById('bflaTargetCard');
    const targetName = document.getElementById('bflaTargetName');
    const targetStatus = document.getElementById('bflaTargetStatus');
    const targetAllowed = document.getElementById('bflaTargetAllowed');
    const targetAction = document.getElementById('bflaTargetAction');
    const targetAuth = document.getElementById('bflaTargetAuth');
    const targetNote = document.getElementById('bflaTargetNote');

    function setBflaState(isExploit) {
      if (isExploit) {
        btnExploit?.classList.add('active', 'exploit');
        btnNormal?.classList.remove('active', 'normal');

        if (avatar) {
          avatar.textContent = '🥷';
          avatar.style.borderColor = '#ef4444';
          avatar.style.background = 'rgba(239, 68, 68, 0.15)';
          avatar.style.boxShadow = '0 0 15px rgba(239, 68, 68, 0.35)';
        }
        if (label) { label.textContent = 'Kaif (Attacker)'; label.style.color = '#f87171'; }
        if (sub) sub.textContent = 'Role: user (ID: 1001)';

        if (verb) { verb.textContent = 'DELETE'; verb.style.color = '#ef4444'; }
        if (path) path.textContent = '/api/users/1002';
        if (badgeFrom) { badgeFrom.textContent = 'user'; }
        if (badgeTo) {
          badgeTo.textContent = 'admin';
          badgeTo.className = 'swap-id-badge to';
        }

        if (beam) { beam.classList.add('exploit'); }
        if (flowText) { flowText.textContent = 'Role Escalation'; flowText.style.color = '#f87171'; }

        if (targetCard) {
          targetCard.classList.remove('normal');
          targetCard.classList.add('exploit');
        }
        if (targetName) targetName.textContent = 'Om';
        if (targetStatus) {
          targetStatus.textContent = 'HTTP 200';
          targetStatus.className = 'target-pill-status breach';
        }
        if (targetAllowed) targetAllowed.innerHTML = 'Allowed: <code>admin</code>';
        if (targetAction) targetAction.innerHTML = 'Action: <code>DELETE</code>';
        if (targetAuth) targetAuth.innerHTML = 'AuthZ: <code style="color:#ef4444; font-weight:700;">missing</code>';
        if (targetNote) {
          targetNote.innerHTML = '🚨 Unauthorized admin call';
          targetNote.style.color = '#f87171';
        }
      } else {
        btnNormal?.classList.add('active', 'normal');
        btnExploit?.classList.remove('active', 'exploit');

        if (avatar) {
          avatar.textContent = '👤';
          avatar.style.borderColor = '#10b981';
          avatar.style.background = 'rgba(16, 185, 129, 0.15)';
          avatar.style.boxShadow = '0 0 15px rgba(16, 185, 129, 0.35)';
        }
        if (label) { label.textContent = 'Kaif (User)'; label.style.color = '#34d399'; }
        if (sub) sub.textContent = 'Role: user (ID: 1001)';

        if (verb) { verb.textContent = 'GET'; verb.style.color = '#34d399'; }
        if (path) path.textContent = '/api/users/1001';
        if (badgeFrom) { badgeFrom.textContent = 'user'; }
        if (badgeTo) {
          badgeTo.textContent = 'user';
          badgeTo.className = 'swap-id-badge from';
        }

        if (beam) { beam.classList.remove('exploit'); }
        if (flowText) { flowText.textContent = 'Authorized Function'; flowText.style.color = '#34d399'; }

        if (targetCard) {
          targetCard.classList.remove('exploit');
          targetCard.classList.add('normal');
        }
        if (targetName) targetName.textContent = 'Kaif (Self)';
        if (targetStatus) {
          targetStatus.textContent = 'HTTP 200';
          targetStatus.className = 'target-pill-status safe';
        }
        if (targetAllowed) targetAllowed.innerHTML = 'Allowed: <code>user</code>';
        if (targetAction) targetAction.innerHTML = 'Action: <code>GET</code>';
        if (targetAuth) targetAuth.innerHTML = 'AuthZ: <code style="color:#10b981; font-weight:700;">passed</code>';
        if (targetNote) {
          targetNote.innerHTML = '<span style="color:#34d399;">✓ Legitimate: Normal user call</span>';
        }
      }
    }

    btnNormal?.addEventListener('click', (e) => {
      e.stopPropagation();
      setBflaState(false);
    });

    btnExploit?.addEventListener('click', (e) => {
      e.stopPropagation();
      setBflaState(true);
    });
  }

  // 3. Setup IDOR Hero Widget
  const idorWidget = document.getElementById('idorHeroWidget');
  if (idorWidget) {
    const btnNormal = document.getElementById('btnIdorNormal');
    const btnExploit = document.getElementById('btnIdorExploit');
    const avatar = document.getElementById('idorAttackerAvatar');
    const label = document.getElementById('idorAttackerLabel');
    const sub = document.getElementById('idorAttackerSub');
    const verb = document.getElementById('idorVerb');
    const path = document.getElementById('idorPath');
    const badgeFrom = document.getElementById('idorBadgeFrom');
    const badgeTo = document.getElementById('idorBadgeTo');
    const beam = document.getElementById('idorBeamParticle');
    const flowText = document.getElementById('idorFlowStateText');
    const targetCard = document.getElementById('idorTargetCard');
    const targetName = document.getElementById('idorTargetName');
    const targetStatus = document.getElementById('idorTargetStatus');
    const targetOwner = document.getElementById('idorTargetOwner');
    const targetDoc = document.getElementById('idorTargetDoc');
    const targetCheck = document.getElementById('idorTargetCheck');
    const targetNote = document.getElementById('idorTargetNote');

    function setIdorState(isExploit) {
      if (isExploit) {
        btnExploit?.classList.add('active', 'exploit');
        btnNormal?.classList.remove('active', 'normal');

        if (avatar) {
          avatar.textContent = '🥷';
          avatar.style.borderColor = '#ef4444';
          avatar.style.background = 'rgba(239, 68, 68, 0.15)';
          avatar.style.boxShadow = '0 0 15px rgba(239, 68, 68, 0.35)';
        }
        if (label) { label.textContent = 'Kaif (Attacker)'; label.style.color = '#f87171'; }
        if (sub) sub.textContent = 'Role: user (ID: 1001)';

        if (verb) { verb.textContent = 'GET'; verb.style.color = '#ef4444'; }
        if (path) path.textContent = '/api/docs/1002';
        if (badgeFrom) { badgeFrom.textContent = '1001'; }
        if (badgeTo) {
          badgeTo.textContent = '1002';
          badgeTo.className = 'swap-id-badge to';
        }

        if (beam) { beam.classList.add('exploit'); }
        if (flowText) { flowText.textContent = 'Tampered Object ID'; flowText.style.color = '#f87171'; }

        if (targetCard) {
          targetCard.classList.remove('normal');
          targetCard.classList.add('exploit');
        }
        if (targetName) targetName.textContent = "Om";
        if (targetStatus) {
          targetStatus.textContent = 'HTTP 200';
          targetStatus.className = 'target-pill-status breach';
        }
        if (targetOwner) targetOwner.innerHTML = 'Owner: <code>1002 (Om)</code>';
        if (targetDoc) targetDoc.innerHTML = 'File: <code>1002.pdf</code>';
        if (targetCheck) targetCheck.innerHTML = 'AuthZ: <code style="color:#ef4444; font-weight:700;">missing</code>';
        if (targetNote) {
          targetNote.innerHTML = '🚨 Leaked victim document';
          targetNote.style.color = '#f87171';
        }
      } else {
        btnNormal?.classList.add('active', 'normal');
        btnExploit?.classList.remove('active', 'exploit');

        if (avatar) {
          avatar.textContent = '👤';
          avatar.style.borderColor = '#10b981';
          avatar.style.background = 'rgba(16, 185, 129, 0.15)';
          avatar.style.boxShadow = '0 0 15px rgba(16, 185, 129, 0.35)';
        }
        if (label) { label.textContent = 'Kaif (User)'; label.style.color = '#34d399'; }
        if (sub) sub.textContent = 'Role: user (ID: 1001)';

        if (verb) { verb.textContent = 'GET'; verb.style.color = '#34d399'; }
        if (path) path.textContent = '/api/docs/1001';
        if (badgeFrom) { badgeFrom.textContent = '1001'; }
        if (badgeTo) {
          badgeTo.textContent = '1001';
          badgeTo.className = 'swap-id-badge from';
        }

        if (beam) { beam.classList.remove('exploit'); }
        if (flowText) { flowText.textContent = 'Authorized Document Access'; flowText.style.color = '#34d399'; }

        if (targetCard) {
          targetCard.classList.remove('exploit');
          targetCard.classList.add('normal');
        }
        if (targetName) targetName.textContent = "Kaif (Self)";
        if (targetStatus) {
          targetStatus.textContent = 'HTTP 200';
          targetStatus.className = 'target-pill-status safe';
        }
        if (targetOwner) targetOwner.innerHTML = 'Owner: <code>1001 (Kaif)</code>';
        if (targetDoc) targetDoc.innerHTML = 'File: <code>1001.pdf</code>';
        if (targetCheck) targetCheck.innerHTML = 'AuthZ: <code style="color:#10b981; font-weight:700;">passed</code>';
        if (targetNote) {
          targetNote.innerHTML = '<span style="color:#34d399;">✓ Legitimate: Own user file</span>';
        }
      }
    }

    btnNormal?.addEventListener('click', (e) => {
      e.stopPropagation();
      setIdorState(false);
    });

    btnExploit?.addEventListener('click', (e) => {
      e.stopPropagation();
      setIdorState(true);
    });
  }

  // 4. Setup JWT Hero Widget
  const jwtWidget = document.getElementById('jwtHeroWidget');
  if (jwtWidget) {
    const btnNormal = document.getElementById('btnJwtNormal');
    const btnExploit = document.getElementById('btnJwtExploit');
    const avatar = document.getElementById('jwtAttackerAvatar');
    const label = document.getElementById('jwtAttackerLabel');
    const sub = document.getElementById('jwtAttackerSub');
    const verb = document.getElementById('jwtVerb');
    const path = document.getElementById('jwtPath');
    const badgeFrom = document.getElementById('jwtBadgeFrom');
    const badgeTo = document.getElementById('jwtBadgeTo');
    const beam = document.getElementById('jwtBeamParticle');
    const flowText = document.getElementById('jwtFlowStateText');
    const targetCard = document.getElementById('jwtTargetCard');
    const targetName = document.getElementById('jwtTargetName');
    const targetStatus = document.getElementById('jwtTargetStatus');
    const targetAlg = document.getElementById('jwtTargetAlg');
    const targetRole = document.getElementById('jwtTargetRole');
    const targetAuth = document.getElementById('jwtTargetAuth');
    const targetNote = document.getElementById('jwtTargetNote');

    function setJwtState(isExploit) {
      if (isExploit) {
        btnExploit?.classList.add('active', 'exploit');
        btnNormal?.classList.remove('active', 'normal');

        if (avatar) {
          avatar.textContent = '🥷';
          avatar.style.borderColor = '#ef4444';
          avatar.style.background = 'rgba(239, 68, 68, 0.15)';
          avatar.style.boxShadow = '0 0 15px rgba(239, 68, 68, 0.35)';
        }
        if (label) { label.textContent = 'Kaif (Attacker)'; label.style.color = '#f87171'; }
        if (sub) sub.textContent = 'Role: user (ID: 1001)';

        if (verb) { verb.textContent = 'GET'; verb.style.color = '#ef4444'; }
        if (path) path.textContent = '/api/v1/admin/dashboard';
        if (badgeFrom) { badgeFrom.textContent = 'HS256'; }
        if (badgeTo) {
          badgeTo.textContent = 'none';
          badgeTo.className = 'swap-id-badge to';
        }

        if (beam) { beam.classList.add('exploit'); }
        if (flowText) { flowText.textContent = 'Signature Stripping'; flowText.style.color = '#f87171'; }

        if (targetCard) {
          targetCard.classList.remove('normal');
          targetCard.classList.add('exploit');
        }
        if (targetName) targetName.textContent = 'Admin API';
        if (targetStatus) {
          targetStatus.textContent = 'HTTP 200';
          targetStatus.className = 'target-pill-status breach';
        }
        if (targetAlg) targetAlg.innerHTML = 'Alg: <code>none</code>';
        if (targetRole) targetRole.innerHTML = 'Role: <code>admin (Kaif)</code>';
        if (targetAuth) targetAuth.innerHTML = 'AuthZ: <code style="color:#ef4444; font-weight:700;">bypassed</code>';
        if (targetNote) {
          targetNote.innerHTML = '🚨 Full administrative takeover';
          targetNote.style.color = '#f87171';
        }
      } else {
        btnNormal?.classList.add('active', 'normal');
        btnExploit?.classList.remove('active', 'exploit');

        if (avatar) {
          avatar.textContent = '👤';
          avatar.style.borderColor = '#10b981';
          avatar.style.background = 'rgba(16, 185, 129, 0.15)';
          avatar.style.boxShadow = '0 0 15px rgba(16, 185, 129, 0.35)';
        }
        if (label) { label.textContent = 'Kaif (User)'; label.style.color = '#34d399'; }
        if (sub) sub.textContent = 'Role: user (ID: 1001)';

        if (verb) { verb.textContent = 'GET'; verb.style.color = '#34d399'; }
        if (path) path.textContent = '/api/v1/admin/dashboard';
        if (badgeFrom) { badgeFrom.textContent = 'HS256'; }
        if (badgeTo) {
          badgeTo.textContent = 'HS256';
          badgeTo.className = 'swap-id-badge from';
        }

        if (beam) { beam.classList.remove('exploit'); }
        if (flowText) { flowText.textContent = 'Valid Signature Check'; flowText.style.color = '#34d399'; }

        if (targetCard) {
          targetCard.classList.remove('exploit');
          targetCard.classList.add('normal');
        }
        if (targetName) targetName.textContent = 'Admin API';
        if (targetStatus) {
          targetStatus.textContent = 'HTTP 403';
          targetStatus.className = 'target-pill-status safe';
        }
        if (targetAlg) targetAlg.innerHTML = 'Alg: <code>HS256</code>';
        if (targetRole) targetRole.innerHTML = 'Role: <code>user (Kaif)</code>';
        if (targetAuth) targetAuth.innerHTML = 'AuthZ: <code style="color:#10b981; font-weight:700;">enforced</code>';
        if (targetNote) {
          targetNote.innerHTML = '<span style="color:#34d399;">✓ Access denied: insufficient permissions</span>';
        }
      }
    }

    btnNormal?.addEventListener('click', (e) => {
      e.stopPropagation();
      setJwtState(false);
    });

    btnExploit?.addEventListener('click', (e) => {
      e.stopPropagation();
      setJwtState(true);
    });
  }

  // 4. 3D Holographic Tilt & Sheen on Hover
  const heroWidgets = document.querySelectorAll('.hero-glass-graphic');
  heroWidgets.forEach(widget => {
    widget.addEventListener('pointermove', (e) => {
      const rect = widget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const rotateX = ((y - centerY) / centerY) * -6; // max 6deg
      const rotateY = ((x - centerX) / centerX) * 6;  // max 6deg

      widget.style.transform = `perspective(900px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) translateY(-2px)`;
      widget.style.setProperty('--sheen-x', `${x}px`);
      widget.style.setProperty('--sheen-y', `${y}px`);
    });

    widget.addEventListener('pointerleave', () => {
      widget.style.transform = 'perspective(900px) rotateX(0deg) rotateY(0deg) translateY(0px)';
    });
  });
}


