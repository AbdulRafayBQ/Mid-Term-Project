"use strict";

/* =========================================================
   GLOBAL STATE
   ========================================================= */

const state = {
  currentView: "welcome",
  jobs: [],
  selectedCategory: null,
  online: true,
  aiOpen: false,
  mouseX: 0,
  mouseY: 0,
  ustaad: null,
  ustaadStep: 1,
  ustaadPayMethod: "easypaisa"
};

const SERVICE_CATEGORIES = [
  { id:"plumber", label:"Plumber", icon:"🔧" },
  { id:"electrician", label:"Electrician", icon:"⚡" },
  { id:"carpenter", label:"Carpenter", icon:"🪚" },
  { id:"painter", label:"Painter", icon:"🎨" },
  { id:"technician", label:"Tech Expert", icon:"💻" }
];

const MOCK_USTAADS = {
  plumber:["Muhammad Ali", "Rizwan Sheikh", "Imran Baig"],
  electrician:["Ahmed Khan", "Bilal Hussain", "Kashif Iqbal"],
  carpenter:["Usman Raza", "Fahad Malik", "Noman Sheikh"],
  painter:["Zeeshan Ahmed", "Waqas Tariq", "Adnan Yousuf"],
  technician:["Hamza Farooq", "Salman Raza", "Danish Ali"]
};

function mockNamesFor(category){
  return MOCK_USTAADS[category] || MOCK_USTAADS.technician;
}

/* =========================================================
   MODAL HELPERS
   ========================================================= */

function openModal(html){
  const overlay = $("#modalOverlay");
  const box = $("#modalBox");
  if(!overlay || !box) return;
  box.innerHTML = html;
  overlay.classList.add("open");
}

function closeModal(){
  const overlay = $("#modalOverlay");
  if(!overlay) return;
  overlay.classList.remove("open");
}

function setupModal(){
  const overlay = $("#modalOverlay");
  if(!overlay) return;
  overlay.addEventListener("click", event => {
    if(event.target === overlay) closeModal();
  });
}

/* =========================================================
   CALL POPUP
   ========================================================= */

function openCallPopup(name, phone){
  const html = `
    <div class="call-popup-inner">
      <div class="call-avatar-ring">
        <div class="call-avatar">👨‍🔧</div>
      </div>
      <div class="call-status-text">Calling...</div>
      <h2 class="call-name">${escapeHTML(name)}</h2>
      <p class="call-phone">${escapeHTML(phone)}</p>
      <div class="call-waves">
        <span></span><span></span><span></span><span></span><span></span>
      </div>
      <div class="call-actions">
        <button class="call-btn call-mute" onclick="toggleMute(this)" title="Mute">
          <span>🎙️</span>
        </button>
        <button class="call-btn call-end" onclick="endCall()" title="End Call">
          <span>📵</span>
        </button>
        <button class="call-btn call-speaker" onclick="toggleSpeaker(this)" title="Speaker">
          <span>🔊</span>
        </button>
      </div>
      <p class="call-note">Demo simulation — no real call will be made</p>
    </div>
  `;
  openModal(html);

  // simulate call connecting
  setTimeout(() => {
    const st = $(".call-status-text");
    if(st) st.textContent = "Connected ✓";
  }, 1800);
}

window.toggleMute = function(btn){
  btn.classList.toggle("active");
  btn.querySelector("span").textContent = btn.classList.contains("active") ? "🔇" : "🎙️";
  toast(btn.classList.contains("active") ? "Muted" : "Unmuted", "success");
};

window.toggleSpeaker = function(btn){
  btn.classList.toggle("active");
  toast(btn.classList.contains("active") ? "Speaker on" : "Speaker off", "success");
};

window.endCall = function(){
  closeModal();
  toast("Call ended", "success");
};

/* =========================================================
   CHAT POPUP
   ========================================================= */

function openChatPopup(name, phone){
  const convId = `chat_${phone.replace(/\D/g,"")}`;
  const savedMessages = (() => {
    try{ return JSON.parse(localStorage.getItem(convId) || "[]"); }
    catch{ return []; }
  })();

  function renderMessages(msgs){
    if(!msgs.length) return `<div class="chat-empty">Say salam! 👋</div>`;
    return msgs.map(m => `
      <div class="chat-bubble ${m.from === "me" ? "chat-out" : "chat-in"}">
        <span>${escapeHTML(m.text)}</span>
        <time>${m.time}</time>
      </div>
    `).join("");
  }

  const html = `
    <div class="chat-popup-wrap">
      <div class="chat-popup-head">
        <div class="chat-avatar">👨‍🔧</div>
        <div class="chat-head-info">
          <strong>${escapeHTML(name)}</strong>
          <span class="chat-online-dot">● Online</span>
        </div>
        <button class="chat-close-btn" onclick="closeModal()">✕</button>
      </div>
      <div class="chat-messages" id="chatMessages">${renderMessages(savedMessages)}</div>
      <div class="chat-input-row">
        <button class="chat-attach" title="Attach">📎</button>
        <input type="text" id="chatMsgInput" placeholder="Type a message..." autocomplete="off">
        <button class="chat-send-btn" id="chatSendBtn">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
        </button>
      </div>
    </div>
  `;
  openModal(html);

  // scroll to bottom
  setTimeout(() => {
    const msgs = $("#chatMessages");
    if(msgs) msgs.scrollTop = msgs.scrollHeight;
  }, 50);

  const input = $("#chatMsgInput");
  const sendBtn = $("#chatSendBtn");

  function sendMsg(){
    const text = input?.value.trim();
    if(!text) return;
    const now = new Date();
    const time = now.getHours().toString().padStart(2,"0") + ":" + now.getMinutes().toString().padStart(2,"0");
    savedMessages.push({ from:"me", text, time });
    try{ localStorage.setItem(convId, JSON.stringify(savedMessages)); }catch{}
    const msgs = $("#chatMessages");
    if(msgs){
      const bubble = document.createElement("div");
      bubble.className = "chat-bubble chat-out";
      bubble.innerHTML = `<span>${escapeHTML(text)}</span><time>${time}</time>`;
      msgs.appendChild(bubble);
      msgs.scrollTop = msgs.scrollHeight;
    }
    input.value = "";

    // mock reply
    setTimeout(() => {
      const replies = [
        "Ji bilkul, main aa jata hun! 👍",
        "Theek hai, time confirm kar lete hain.",
        "Koi mushkil nahi, kaam ho jayega.",
        "Aap ka address share kar dein please?",
        "Main kal subah 10 baje aa sakta hun."
      ];
      const reply = replies[Math.floor(Math.random() * replies.length)];
      const rtime = new Date().getHours().toString().padStart(2,"0") + ":" + new Date().getMinutes().toString().padStart(2,"0");
      savedMessages.push({ from:"them", text:reply, time:rtime });
      try{ localStorage.setItem(convId, JSON.stringify(savedMessages)); }catch{}
      const msgs2 = $("#chatMessages");
      if(msgs2){
        const bubble2 = document.createElement("div");
        bubble2.className = "chat-bubble chat-in";
        bubble2.innerHTML = `<span>${escapeHTML(reply)}</span><time>${rtime}</time>`;
        msgs2.appendChild(bubble2);
        msgs2.scrollTop = msgs2.scrollHeight;
      }
    }, 1000 + Math.random() * 1000);
  }

  sendBtn?.addEventListener("click", sendMsg);
  input?.addEventListener("keydown", e => { if(e.key === "Enter"){ e.preventDefault(); sendMsg(); } });
  setTimeout(() => input?.focus(), 100);
}

/* =========================================================
   FILE → DATA URL HELPER
   ========================================================= */

function filesToDataURLs(fileList, limit = 3){
  const files = [...(fileList || [])].slice(0, limit);
  return Promise.all(
    files.map(file => new Promise(resolve => {
      const reader = new FileReader();
      reader.onload = () => resolve({ name:file.name, type:file.type, url:reader.result });
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(file);
    }))
  ).then(items => items.filter(Boolean));
}

function renderMediaThumbs(mediaList = [], kind = "photo"){
  if(!mediaList.length) return "";
  return mediaList.map(item =>
    kind === "video"
      ? `<div class="media-thumb"><video src="${item.url}" muted></video></div>`
      : `<div class="media-thumb"><img src="${item.url}" alt="${escapeHTML(item.name)}"></div>`
  ).join("");
}

/* =========================================================
   HELPERS
   ========================================================= */

const $ = (selector, parent = document) => parent.querySelector(selector);
const $$ = (selector, parent = document) => [...parent.querySelectorAll(selector)];

function escapeHTML(value){
  return String(value ?? "")
    .replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;")
    .replaceAll('"',"&quot;").replaceAll("'","&#039;");
}

/* =========================================================
   LOCAL STORAGE
   ========================================================= */

function saveState(){
  try{
    localStorage.setItem("kaamKrwaoJobs", JSON.stringify(state.jobs));
    localStorage.setItem("kaamKrwaoUstaad", JSON.stringify(state.ustaad));
  }catch(error){ console.warn("Could not save app data:", error); }
}

function loadState(){
  try{
    const saved = localStorage.getItem("kaamKrwaoJobs");
    if(saved){ const parsed = JSON.parse(saved); if(Array.isArray(parsed)) state.jobs = parsed; }
    const savedUstaad = localStorage.getItem("kaamKrwaoUstaad");
    if(savedUstaad){ const parsedUstaad = JSON.parse(savedUstaad); if(parsedUstaad && typeof parsedUstaad === "object") state.ustaad = parsedUstaad; }
  }catch(error){ console.warn("Could not load app data:", error); }
}

function resetAppData(){
  try{
    localStorage.removeItem("kaamKrwaoJobs");
    localStorage.removeItem("kaamKrwaoUstaad");
    Object.keys(localStorage).forEach(key => {
      if(key.startsWith("chat_")) localStorage.removeItem(key);
    });
  }catch(error){ console.warn("Could not reset app data:", error); }
  state.jobs = [];
  state.ustaad = null;
}
/* =========================================================
   TOAST
   ========================================================= */

function toast(message, type = "success"){
  const stack = $("#toastStack");
  if(!stack){ alert(message); return; }
  const item = document.createElement("div");
  item.className = `toast toast-${type}`;
  item.textContent = message;
  stack.appendChild(item);
  requestAnimationFrame(() => item.classList.add("show"));
  setTimeout(() => {
    item.classList.remove("show");
    setTimeout(() => item.remove(), 250);
  }, 3000);
}

/* =========================================================
   NAVIGATION
   ========================================================= */

function navigate(viewName){
  if(!viewName) return;
  $$(".view").forEach(view => view.classList.remove("active"));
  const target = $(`#view-${viewName}`);
  if(!target){ console.warn(`View not found: ${viewName}`); return; }
  target.classList.add("active");
  state.currentView = viewName;
  window.scrollTo({ top:0, behavior:"smooth" });
  closeMobileMenu();

  if(viewName === "customer-dashboard") renderCustomerDashboard();
  if(viewName === "ustaad-dashboard"){
    if(!state.ustaad || !state.ustaad.paid){ openUstaadPortal(); return; }
    renderUstaadDashboard();
  }
  if(viewName === "ustaad-apply") renderUstaadForm();
  if(viewName === "ustaad-verification") renderVerificationCard();
  if(viewName === "ustaad-membership") renderMembershipCard();

  refresh3DScene();
}

/* =========================================================
   USTAAD PORTAL ROUTING
   ========================================================= */

function openUstaadPortal(){
  const ustaad = state.ustaad;
  if(!ustaad){ navigate("ustaad-apply"); return; }
  if(ustaad.status === "submitted"){ navigate("ustaad-verification"); return; }
  if(ustaad.status === "verified" && !ustaad.paid){ navigate("ustaad-membership"); return; }
  navigate("ustaad-dashboard");
}

/* =========================================================
   NAVIGATION EVENTS
   ========================================================= */

function setupNavigation(){
  $$("[data-nav]").forEach(element => {
    element.addEventListener("click", event => {
      event.preventDefault();
      navigate(element.dataset.nav);
    });
  });

  $$(".nav-link[href^='#']").forEach(link => {
    link.addEventListener("click", event => {
      const target = link.getAttribute("href");
      if(!target) return;
      const section = $(target);
      if(section){
        event.preventDefault();
        const offset = section.getBoundingClientRect().top + window.scrollY - 80;
        window.scrollTo({ top:offset, behavior:"smooth" });
      }
    });
  });
}

/* =========================================================
   MOBILE MENU
   ========================================================= */

function setupMobileMenu(){
  const burger = $("#navBurger");
  const nav = $("#navLinks");
  if(!burger || !nav) return;
  burger.addEventListener("click", () => {
    const open = nav.classList.toggle("mobile-open");
    burger.setAttribute("aria-expanded", String(open));
  });
}

function closeMobileMenu(){
  const nav = $("#navLinks");
  const burger = $("#navBurger");
  if(nav) nav.classList.remove("mobile-open");
  if(burger) burger.setAttribute("aria-expanded", "false");
}

/* =========================================================
   JOB FORM
   ========================================================= */

function setupJobForm(){
  const form = $("#postJobForm");
  if(!form) return;

form.addEventListener("submit", async event => {
    event.preventDefault();

    if(!$("#jobPhotos")?.files?.length){
      toast("Kam se kam 1 photo lagana zaroori hai.", "error");
      return;
    }
    if(!$("#jobVideos")?.files?.length){
      toast("Kam se kam 1 video lagana zaroori hai.", "error");
      return;
    }

    const formData = new FormData(form);
    const photos = await filesToDataURLs($("#jobPhotos")?.files, 4);
    const videos = await filesToDataURLs($("#jobVideos")?.files, 2);

    const job = {
      id: Date.now(),
      title: formData.get("jobTitle")?.trim() || "Untitled Job",
      category: formData.get("jobCategory") || "other",
      description: formData.get("jobDescription")?.trim() || "",
      location: formData.get("jobLocation")?.trim() || "",
      phone: formData.get("jobPhone")?.trim() || "",
      budget: Number(formData.get("jobBudget") || 0),
      urgency: formData.get("jobUrgency") || "normal",
      status: "posted",
      media:{ photos, videos },
      quotes:[],
      assignedQuoteId:null,
      createdAt: new Date().toISOString()
    };

    state.jobs.unshift(job);
    saveState();
    form.reset();
    if($("#jobPhotosPreview")) $("#jobPhotosPreview").innerHTML = "";
    if($("#jobVideosPreview")) $("#jobVideosPreview").innerHTML = "";
    renderCustomerDashboard();
    showFindingUstaadModal(job);
  });

  const photoInput = $("#jobPhotos");
  photoInput?.addEventListener("change", async () => {
    const items = await filesToDataURLs(photoInput.files, 4);
    const preview = $("#jobPhotosPreview");
    if(preview) preview.innerHTML = renderMediaThumbs(items, "photo");
  });

  const videoInput = $("#jobVideos");
  videoInput?.addEventListener("change", async () => {
    const items = await filesToDataURLs(videoInput.files, 2);
    const preview = $("#jobVideosPreview");
    if(preview) preview.innerHTML = renderMediaThumbs(items, "video");
  });
}

/* =========================================================
   FINDING USTAAD — RADAR ANIMATION
   ========================================================= */

function showFindingUstaadModal(job){
  const template = $("#radarTemplate");
  const html = template ? template.innerHTML : `
    <div style="text-align:center; padding:30px;">
      <div style="font-size:3rem; margin-bottom:16px;">📡</div>
      <h2>Finding Ustaads Near You...</h2>
      <div id="radarNames" style="margin-top:16px; display:flex; flex-direction:column; gap:8px;"></div>
    </div>
  `;
  openModal(html);

  const names = mockNamesFor(job.category).slice(0, 3);
  const namesBox = $("#radarNames");

  names.forEach((name, index) => {
    setTimeout(() => {
      if(!namesBox) return;
      const row = document.createElement("div");
      row.className = "radar-name-item";
      row.innerHTML = `👨‍🔧 ${escapeHTML(name)} — checking availability...`;
      namesBox.appendChild(row);
    }, 350 * (index + 1));
  });

  setTimeout(() => {
    generateMockQuotes(job, names);
    closeModal();
    toast(`${names.length} Ustaads found near you! 🎉`);
    navigate("customer-dashboard");
  }, 350 * (names.length + 1) + 700);
}

function generateMockQuotes(job, names){
  const ratings = ["4.6","4.7","4.8","4.9","5.0"];
  const experiences = [2,3,4,5,6,8];
  names.forEach((name, index) => {
    const useFixedQuote = index !== names.length - 1;
    const material = 500 + Math.round(Math.random() * 2000);
    const labour = 300 + Math.round(Math.random() * 1500);
    job.quotes.push({
      id:`${job.id}-mock-${index}`,
      ustaadId:`mock-${index}`,
      ustaadName:name,
      ustaadCity: job.location?.split(",").pop()?.trim() || "Karachi",
      ustaadExp: experiences[Math.floor(Math.random()*experiences.length)],
      ustaadRating: ratings[Math.floor(Math.random()*ratings.length)],
      ustaadSkill: job.category,
      portfolio: [],
      type: useFixedQuote ? "fixed" : "after",
      material: useFixedQuote ? material : 0,
      labour: useFixedQuote ? labour : 0,
      total: useFixedQuote ? material + labour : 0,
      status:"pending",
      phone:`03${Math.floor(10 + Math.random() * 89)}-${Math.floor(1000000 + Math.random() * 8999999)}`,
      createdAt: new Date().toISOString()
    });
  });
  if(job.status === "posted") job.status = "quoted";
  saveState();
}

/* =========================================================
   CUSTOMER DASHBOARD
   ========================================================= */

function renderCustomerDashboard(){
  const active = state.jobs.filter(job => job.status === "posted" || job.status === "active");
  const completed = state.jobs.filter(job => job.status === "completed");

  const activeEl = $("#cKpiActive");
  const completedEl = $("#cKpiCompleted");
  const chosenEl = $("#cKpiChosen");
  const reviewsEl = $("#cKpiReviews");

  if(activeEl) activeEl.textContent = active.length;
  if(completedEl) completedEl.textContent = completed.length;
  if(chosenEl) chosenEl.textContent = state.jobs.filter(job => job.status === "accepted").length;
  if(reviewsEl) reviewsEl.textContent = completed.length;

  const container = $("#customerJobs");
  if(!container) return;

  if(!state.jobs.length){
    container.innerHTML = `<p class="empty-note">You haven't posted a job yet.</p>`;
    return;
  }
  container.innerHTML = state.jobs.map(renderCustomerJob).join("");
}

function renderCustomerJob(job){
  const statusMap = {
    posted:"🟠 Finding Ustaads",
    quoted:"🟡 Quotes Received",
    active:"🔵 Active",
    accepted:"🟣 Ustaad Selected",
    completed:"🟢 Completed"
  };

  const assignedQuote = job.quotes?.find(q => q.id === job.assignedQuoteId);
  const pendingQuotes = (job.quotes || []).filter(q => q.status === "pending");

  return `
    <article class="job-card" data-job-id="${job.id}">
      <div>
        <span class="badge">${escapeHTML(statusMap[job.status] || job.status)}</span>
        <h3 style="margin-top:10px;">${escapeHTML(job.title)}</h3>
        <p style="color:#6d727c; margin-top:7px;">${escapeHTML(job.description)}</p>
        <p style="color:#6d727c; margin-top:8px; font-size:.85rem;">📍 ${escapeHTML(job.location)}</p>
        <div class="job-media-row">
          ${renderMediaThumbs(job.media?.photos, "photo")}
          ${renderMediaThumbs(job.media?.videos, "video")}
        </div>
      </div>
      <div style="margin-top:15px; display:flex; justify-content:space-between; gap:10px; flex-wrap:wrap;">
        <strong>${job.budget ? `Rs. ${Number(job.budget).toLocaleString()}` : "Budget not specified"}</strong>
        <span>${escapeHTML(job.category)}</span>
      </div>
      ${
        assignedQuote
          ? `
            <div class="contact-reveal">
              <span>✅ <strong>${escapeHTML(assignedQuote.ustaadName)}</strong> is assigned to this job.</span>
              <div style="display:flex; gap:10px; margin-top:10px; flex-wrap:wrap;">
                <button class="btn btn-primary" data-call-name="${escapeHTML(assignedQuote.ustaadName)}" data-call-phone="${escapeHTML(assignedQuote.phone || "0300-0000000")}" type="button">📞 Call</button>
                <button class="btn btn-ghost" data-chat-name="${escapeHTML(assignedQuote.ustaadName)}" data-chat-phone="${escapeHTML(assignedQuote.phone || "0300-0000000")}" type="button">💬 Message</button>
              </div>
            </div>
          `
          : pendingQuotes.length
            ? `<div class="quotes-block">${pendingQuotes.map(q => renderQuoteCard(job, q)).join("")}</div>`
            : `<p class="empty-note" style="padding:10px 0 0;">Waiting for Ustaads to respond with a quote...</p>`
      }
    </article>
  `;
}

function renderQuoteCard(job, quote){
  const portfolioHTML = quote.portfolio?.length
    ? `<div class="job-media-row">${renderMediaThumbs(quote.portfolio,"photo")}</div>`
    : "";
  const cityPart = quote.ustaadCity ? `<span>📍 ${escapeHTML(quote.ustaadCity)}</span>` : "";
  const expPart = quote.ustaadExp ? `<span>🧰 ${escapeHTML(String(quote.ustaadExp))} yrs exp</span>` : "";
  const ratingPart = quote.ustaadRating ? `<span>⭐ ${escapeHTML(quote.ustaadRating)}</span>` : "";
  const metaHTML = cityPart + expPart + ratingPart;
  return `
    <div class="quote-card" data-quote-id="${quote.id}">
      <div class="quote-head">
        <strong>👨‍🔧 ${escapeHTML(quote.ustaadName)}</strong>
        <span class="badge ${quote.type === "fixed" ? "badge-verified" : "badge-pending"}">
          ${quote.type === "fixed" ? "Fixed Price" : "Will Quote After Visit"}
        </span>
      </div>
     <div style="display:flex; gap:10px; flex-wrap:wrap; font-size:.8rem; color:var(--muted); margin-bottom:10px;">
        ${metaHTML}
      </div>
      ${portfolioHTML}
        ${
        quote.type === "fixed"
          ? `
            <div class="quote-price-grid">
              <span>Material: <strong>Rs. ${Number(quote.material).toLocaleString()}</strong></span>
              <span>Labour: <strong>Rs. ${Number(quote.labour).toLocaleString()}</strong></span>
              <span>Total: <strong>Rs. ${Number(quote.total).toLocaleString()}</strong></span>
            </div>
          `
          : `<p style="color:var(--muted); font-size:.85rem; margin:8px 0;">This Ustaad will visit and see the job first, then share a price.</p>`
      }
      <button class="btn btn-ghost" data-view-quote="${job.id}:${quote.id}" type="button">See Ustaad Profile</button>
    </div>
  `;
}

function openUstaadProfileModal(jobId, quoteId){
  const job = state.jobs.find(item => item.id === jobId);
  const quote = job?.quotes.find(item => item.id === quoteId);
  if(!job || !quote) return;

  const priceLine = quote.type === "fixed"
    ? `Total Price: <strong>Rs. ${Number(quote.total).toLocaleString()}</strong> (Material Rs. ${Number(quote.material).toLocaleString()} + Labour Rs. ${Number(quote.labour).toLocaleString()})`
    : "This Ustaad will visit and quote the price after seeing the work.";

  const portfolioHTML = quote.portfolio?.length
    ? `<div class="job-media-row" style="margin-top:14px;">${renderMediaThumbs(quote.portfolio, "photo")}</div>`
    : `<p class="empty-note" style="padding:10px 0;">No portfolio media uploaded by this Ustaad.</p>`;

 const cityPart = quote.ustaadCity ? `<span>📍 ${escapeHTML(quote.ustaadCity)}</span>` : "";
  const expPart = quote.ustaadExp ? `<span>🧰 ${escapeHTML(String(quote.ustaadExp))} yrs exp</span>` : "";
  const ratingPart = quote.ustaadRating ? `<span>⭐ ${escapeHTML(quote.ustaadRating)}</span>` : "";

  const html = `
    <h2>👨‍🔧 ${escapeHTML(quote.ustaadName)}</h2>
    <div style="display:flex; gap:10px; flex-wrap:wrap; font-size:.85rem; color:var(--muted); margin-top:8px;">
      ${cityPart}${expPart}${ratingPart}
    </div>
    <p style="margin-top:14px;">${priceLine}</p>
    <h3 style="margin-top:18px; font-family:Poppins,sans-serif;">Portfolio</h3>
    ${portfolioHTML}
    <div class="quote-option-btns">
      <button class="btn btn-primary" data-select-quote="${job.id}:${quote.id}" type="button">Select This Ustaad</button>
      <button class="btn btn-ghost" type="button" onclick="closeModal()">Close</button>
    </div>
  `;
  openModal(html);
}
/* =========================================================
   USTAAD DASHBOARD
   ========================================================= */

function renderUstaadDashboard(){
  // Update name on dashboard
  const nameEl = $("#ustaadDashName");
  if(nameEl && state.ustaad?.fullName) nameEl.textContent = state.ustaad.fullName;

  const skillEl = $("#ustaadDashSkills");
  if(skillEl && state.ustaad?.skills){
    const labels = state.ustaad.skills
      .map(id => SERVICE_CATEGORIES.find(c => c.id === id)?.label || id)
      .join(", ");
    skillEl.textContent = labels || "—";
  }

  const expEl = $("#ustaadDashExp");
  if(expEl) expEl.textContent = state.ustaad?.experience ? `${state.ustaad.experience} yrs exp` : "";

  const cityEl = $("#ustaadDashCity");
  if(cityEl) cityEl.textContent = state.ustaad?.city || "Karachi";

  const badge = $("#ustaadBadge");
  if(badge){
    badge.textContent = state.ustaad?.paid ? "✓ Verified" : "Pending";
    badge.classList.toggle("badge-verified", !!state.ustaad?.paid);
    badge.classList.toggle("badge-pending", !state.ustaad?.paid);
  }

  const mySkills = state.ustaad?.skills?.length ? state.ustaad.skills : null;
  const newJobs = state.jobs.filter(job =>
    (job.status === "posted" || job.status === "quoted") &&
    (!mySkills || mySkills.includes(job.category)) &&
    !(job.quotes || []).some(q => q.ustaadId === "me")
  );
  const activeJobs = state.jobs.filter(job =>
    job.status === "accepted" &&
    (job.quotes || []).find(q => q.id === job.assignedQuoteId && q.ustaadId === "me")
  );
  const completedJobs = state.jobs.filter(job =>
    job.status === "completed" &&
    (job.quotes || []).find(q => q.id === job.assignedQuoteId && q.ustaadId === "me")
  );

  if($("#uKpiNew")) $("#uKpiNew").textContent = newJobs.length;
  if($("#uKpiActive")) $("#uKpiActive").textContent = activeJobs.length;
  if($("#uKpiCompleted")) $("#uKpiCompleted").textContent = completedJobs.length;

  const total = state.jobs.reduce((sum, job) => sum + Number(job.budget || 0), 0);
  if($("#uKpiTotal")) $("#uKpiTotal").textContent = `Rs. ${total.toLocaleString()}`;
  if($("#uKpiMonthly")) $("#uKpiMonthly").textContent = `Rs. ${total.toLocaleString()}`;
  if($("#uKpiRating")) $("#uKpiRating").textContent = state.jobs.length ? "4.9 ⭐" : "—";

  renderUstaadJobs("#ustaadNewJobs", newJobs, "new");
  renderUstaadJobs("#ustaadActiveJobs", activeJobs, "active");
  renderUstaadJobs("#ustaadHistoryJobs", completedJobs, "completed");
}

function renderUstaadJobs(selector, jobs, mode){
  const container = $(selector);
  if(!container) return;
  if(!jobs.length){
    container.innerHTML = `<p class="empty-note">No jobs available right now.</p>`;
    return;
  }
  container.innerHTML = jobs.map(job => renderUstaadJob(job, mode)).join("");
}

function renderUstaadJob(job, mode){
  const assignedQuote = job.quotes?.find(q => q.id === job.assignedQuoteId);
  return `
    <article class="job-card" data-ustaad-job="${job.id}">
      <div>
        <span class="badge badge-verified">${escapeHTML(job.category)}</span>
        <h3 style="margin-top:10px;">${escapeHTML(job.title)}</h3>
        <p style="color:#6d727c; margin-top:8px;">${escapeHTML(job.description)}</p>
        <p style="color:#6d727c; margin-top:8px;">📍 ${escapeHTML(job.location)}</p>
        <div class="job-media-row">
          ${renderMediaThumbs(job.media?.photos, "photo")}
          ${renderMediaThumbs(job.media?.videos, "video")}
        </div>
      </div>
      <div style="margin-top:16px; display:flex; gap:10px; align-items:center; flex-wrap:wrap;">
        <strong>${job.budget ? `Rs. ${Number(job.budget).toLocaleString()}` : "Budget not specified"}</strong>
        ${mode === "new" ? `<button class="btn btn-primary" data-view-job="${job.id}" type="button">View Job</button>` : ""}
      </div>
      ${
        mode === "active" && assignedQuote
          ? `
            <div class="contact-reveal">
              <span>📌 Job at ${escapeHTML(job.location)}</span>
              <div style="display:flex; gap:10px; margin-top:10px; flex-wrap:wrap;">
                <button class="btn btn-primary" data-call-name="${escapeHTML(job.title + " - Customer")}" data-call-phone="${escapeHTML(job.phone || "0300-0000000")}" type="button">📞 Call Customer</button>
                <button class="btn btn-ghost" data-chat-name="${escapeHTML("Customer")}" data-chat-phone="${escapeHTML(job.phone || "0300-0000000")}" type="button">💬 Message</button>
              </div>
            </div>
          `
          : ""
      }
    </article>
  `;
}

/* =========================================================
   ACCEPT JOB / JOB ACTIONS
   ========================================================= */

function setupJobActions(){
  document.addEventListener("click", event => {
    const viewBtn = event.target.closest("[data-view-job]");
    if(viewBtn){ openJobDetailModal(Number(viewBtn.dataset.viewJob)); return; }

    const selectBtn = event.target.closest("[data-select-quote]");
    if(selectBtn){
      const [jobId, quoteId] = selectBtn.dataset.selectQuote.split(":");
      openSelectQuoteModal(Number(jobId), quoteId);
      return;
    }

    const viewQuoteBtn = event.target.closest("[data-view-quote]");
    if(viewQuoteBtn){
      const [jobId, quoteId] = viewQuoteBtn.dataset.viewQuote.split(":");
      openUstaadProfileModal(Number(jobId), quoteId);
      return;
    }

    const quoteFixedBtn = event.target.closest("[data-open-fixed-form]");
    if(quoteFixedBtn){ $(".quote-fixed-form")?.classList.toggle("open"); return; }

    const afterBtn = event.target.closest("[data-quote-after]");
    if(afterBtn){ submitUstaadQuote(Number(afterBtn.dataset.quoteAfter), "after"); return; }

    const confirmSelectBtn = event.target.closest("[data-confirm-select]");
    if(confirmSelectBtn){
      const [jobId, quoteId] = confirmSelectBtn.dataset.confirmSelect.split(":");
      confirmQuoteSelection(Number(jobId), quoteId);
      return;
    }

    // Call button
    const callBtn = event.target.closest("[data-call-name]");
    if(callBtn){
      openCallPopup(callBtn.dataset.callName, callBtn.dataset.callPhone);
      return;
    }

    // Chat button
    const chatBtn = event.target.closest("[data-chat-name]");
    if(chatBtn){
      openChatPopup(chatBtn.dataset.chatName, chatBtn.dataset.chatPhone);
      return;
    }
  });

  document.addEventListener("submit", event => {
    const form = event.target.closest("#quoteFixedForm");
    if(!form) return;
    event.preventDefault();
    const jobId = Number(form.dataset.jobId);
    const material = Number($("#quoteMaterial")?.value || 0);
    const labour = Number($("#quoteLabour")?.value || 0);
    if(!material && !labour){ toast("Please enter material and/or labour cost.", "error"); return; }
    submitUstaadQuote(jobId, "fixed", { material, labour });
  });
}

/* =========================================================
   JOB DETAIL MODAL
   ========================================================= */

function openJobDetailModal(jobId){
  const job = state.jobs.find(item => item.id === jobId);
  if(!job) return;

  const html = `
    <h2>${escapeHTML(job.title)}</h2>
    <span class="badge badge-verified">${escapeHTML(job.category)}</span>
    <p style="color:var(--muted); margin-top:12px; line-height:1.7;">${escapeHTML(job.description)}</p>
    <p style="color:var(--muted); margin-top:8px;">📍 ${escapeHTML(job.location)}</p>
    <p style="margin-top:8px;"><strong>${job.budget ? `Customer's Budget: Rs. ${Number(job.budget).toLocaleString()}` : "Budget not specified"}</strong></p>
    <div class="job-media-row">
      ${renderMediaThumbs(job.media?.photos, "photo")}
      ${renderMediaThumbs(job.media?.videos, "video")}
    </div>
    <div class="quote-option-btns">
      <button class="btn btn-primary" data-open-fixed-form type="button">Give Cost Of Work</button>
      <button class="btn btn-ghost" data-quote-after="${job.id}" type="button">See Work First, Then Quote</button>
    </div>
    <form id="quoteFixedForm" class="quote-fixed-form" data-job-id="${job.id}">
      <div class="form-row" style="margin-top:16px;">
        <label class="field"><span>Material Cost (Rs.)</span><input type="number" min="0" id="quoteMaterial" placeholder="e.g. 1500"></label>
        <label class="field"><span>Labour / Mazdoori Cost (Rs.)</span><input type="number" min="0" id="quoteLabour" placeholder="e.g. 800"></label>
      </div>
      <div class="note-warning">
        <strong>⚠️ Zaroori Note:</strong> Jo price aap yahan quote karein ge, ussi price mein kaam karna hoga.
      </div>
      <button type="submit" class="btn btn-primary btn-lg full" style="margin-top:14px;">Send Quote To Customer</button>
    </form>
  `;
  openModal(html);
}

function submitUstaadQuote(jobId, type, priceInfo = {}){
  const job = state.jobs.find(item => item.id === jobId);
  if(!job) return;

  const ustaadName = state.ustaad?.fullName || "You";
  const material = Number(priceInfo.material || 0);
  const labour = Number(priceInfo.labour || 0);

  const existing = job.quotes.find(q => q.ustaadId === "me");
  const quote = existing || {
    id:`${job.id}-me`, ustaadId:"me",
    phone:state.ustaad?.phone || "", createdAt:new Date().toISOString()
  };

  quote.ustaadName = ustaadName;
  quote.ustaadCity = state.ustaad?.city || "";
  quote.ustaadExp = state.ustaad?.experience || "";
  quote.ustaadRating = "4.9";
  quote.portfolio = state.ustaad?.portfolio || [];
  quote.type = type;
  quote.material = type === "fixed" ? material : 0;
  quote.labour = type === "fixed" ? labour : 0;
  quote.total = type === "fixed" ? material + labour : 0;
  quote.status = "pending";

  if(!existing) job.quotes.push(quote);
  if(job.status === "posted") job.status = "quoted";

  saveState();
  closeModal();
  renderUstaadDashboard();
  toast(type === "fixed" ? "Quote sent to customer! 🎉" : "Customer notified! 🎉");
}

/* =========================================================
   QUOTE SELECTION (CUSTOMER SIDE)
   ========================================================= */

function openSelectQuoteModal(jobId, quoteId){
  const job = state.jobs.find(item => item.id === jobId);
  const quote = job?.quotes.find(item => item.id === quoteId);
  if(!job || !quote) return;

  const priceLine = quote.type === "fixed"
    ? `Total Price: <strong>Rs. ${Number(quote.total).toLocaleString()}</strong> (Material Rs. ${Number(quote.material).toLocaleString()} + Labour Rs. ${Number(quote.labour).toLocaleString()})`
    : "This Ustaad will visit and quote the price after seeing the work.";

  const html = `
    <h2>Confirm Your Ustaad</h2>
    <p style="color:var(--muted); margin-top:8px; line-height:1.7;">
      You are about to select <strong>${escapeHTML(quote.ustaadName)}</strong> for "${escapeHTML(job.title)}".
    </p>
    <p style="margin-top:10px;">${priceLine}</p>
    <div class="note-warning">
      By approving, you agree to let this Ustaad take up the job. Contact details will be shared after approval.
    </div>
    <div class="quote-option-btns">
      <button class="btn btn-primary" data-confirm-select="${job.id}:${quote.id}" type="button">Approve &amp; Select</button>
      <button class="btn btn-ghost" type="button" onclick="closeModal()">Cancel</button>
    </div>
  `;
  openModal(html);
}

function confirmQuoteSelection(jobId, quoteId){
  const job = state.jobs.find(item => item.id === jobId);
  if(!job) return;
  job.quotes.forEach(q => { q.status = q.id === quoteId ? "approved" : "rejected"; });
  job.assignedQuoteId = quoteId;
  job.status = "accepted";
  saveState();
  closeModal();
  renderCustomerDashboard();
  renderUstaadDashboard();
  toast("Ustaad approved! Contact details are now visible. 🎉");
}

/* =========================================================
   ONLINE TOGGLE
   ========================================================= */

function setupOnlineToggle(){
  const toggle = $("#onlineToggle");
  const label = $("#onlineLabel");
  if(!toggle) return;
  toggle.classList.add("active");
  toggle.addEventListener("click", () => {
    state.online = !state.online;
    toggle.classList.toggle("active", state.online);
    if(label) label.textContent = state.online ? "online" : "offline";
    toast(state.online ? "You are online 🟢" : "You are offline ⚪");
  });
}

/* =========================================================
   CATEGORY SYSTEM
   ========================================================= */

function setupCategories(){
  $$(".cat-card").forEach(card => {
    card.addEventListener("click", () => {
      const category = card.dataset.category;
      state.selectedCategory = category;
      const select = $("#jobCategory");
      if(select) select.value = category;
      navigate("post-job");
      setTimeout(() => { const title = $("#jobTitle"); if(title) title.focus(); }, 300);
    });
  });
}

/* =========================================================
   USTAAD REGISTRATION FLOW
   ========================================================= */

function blankUstaad(){
  return {
    fullName:"", phone:"", cnic:"", experience:"", city:"Karachi",
    areas:"", skills:[], visitingFee:"", guarantee:"7 days",
    photo:null, cnicFront:null, cnicBack:null, police:null,
    portfolio:[],
    status:"draft", paid:false
  };
}

function ensureUstaadDraft(){
  if(!state.ustaad) state.ustaad = blankUstaad();
  return state.ustaad;
}

function renderUstaadForm(){
  ensureUstaadDraft();
  state.ustaadStep = 1;

  const grid = $("#uSkillGrid");
  if(grid && !grid.dataset.built){
    grid.innerHTML = SERVICE_CATEGORIES.map(category => `
      <div class="cat-select-chip" data-skill="${category.id}">
        <span class="chip-icon">${category.icon}</span>${escapeHTML(category.label)}
      </div>
    `).join("");
    grid.dataset.built = "1";

    $$(".cat-select-chip", grid).forEach(chip => {
      chip.addEventListener("click", () => {
        chip.classList.toggle("selected");
        const draft = ensureUstaadDraft();
        const skill = chip.dataset.skill;
        if(chip.classList.contains("selected")){
          if(!draft.skills.includes(skill)) draft.skills.push(skill);
        }else{
          draft.skills = draft.skills.filter(item => item !== skill);
        }
      });
    });
  }
  goToUstaadStep(1);
}

function goToUstaadStep(step){
  state.ustaadStep = step;
  $$(".form-step").forEach(section => {
    section.classList.toggle("active", Number(section.dataset.step) === step);
  });
  $$(".step", $("#ustaadStepper")).forEach(pill => {
    const pillStep = Number(pill.dataset.step);
    pill.classList.toggle("active", pillStep === step);
    pill.classList.toggle("done", pillStep < step);
  });

  const prevBtn = $("#uPrev");
  const nextBtn = $("#uNext");
  const submitBtn = $("#uSubmit");
  if(prevBtn) prevBtn.style.visibility = step === 1 ? "hidden" : "visible";
  if(nextBtn) nextBtn.classList.toggle("hidden", step === 4);
  if(submitBtn) submitBtn.classList.toggle("hidden", step !== 4);
  if(step === 4) renderUstaadReview();
}

function validateUstaadStep(step){
  const draft = ensureUstaadDraft();
  if(step === 1){
    draft.fullName = $("#uFullName")?.value.trim() || "";
    draft.phone = $("#uPhone")?.value.trim() || "";
    draft.cnic = $("#uCnic")?.value.trim() || "";
    draft.experience = $("#uExp")?.value.trim() || "";
    draft.city = $("#uCity")?.value || "Karachi";
    draft.areas = $("#uAreas")?.value.trim() || "";
    if(!draft.fullName || !draft.phone || !draft.cnic){
      toast("Please fill in your name, phone and CNIC.", "error"); return false;
    }
  }
  if(step === 2){
    draft.visitingFee = $("#uVisitingFee")?.value.trim() || "";
    draft.guarantee = $("#uGuarantee")?.value || "7 days";
    if(!draft.skills.length){ toast("Please select at least one skill.", "error"); return false; }
  }
  if(step === 3){
    if(!draft.photo || !draft.cnicFront){ toast("Please upload your profile photo and CNIC front.", "error"); return false; }
  }
  return true;
}

function renderUstaadReview(){
  const draft = ensureUstaadDraft();
  const box = $("#ustaadReviewBox");
  if(!box) return;

  const skillLabels = draft.skills
    .map(id => SERVICE_CATEGORIES.find(item => item.id === id)?.label || id)
    .join(", ") || "Not selected";

  const rows = [
    ["Full Name", draft.fullName || "—"],
    ["Phone", draft.phone || "—"],
    ["CNIC", draft.cnic || "—"],
    ["Experience", draft.experience ? `${draft.experience} years` : "—"],
    ["City", draft.city || "—"],
    ["Operating Areas", draft.areas || "—"],
    ["Skills", skillLabels],
    ["Visiting Fee", draft.visitingFee ? `Rs. ${draft.visitingFee}` : "—"],
    ["Service Guarantee", draft.guarantee || "—"],
    ["Documents", [draft.photo, draft.cnicFront, draft.cnicBack, draft.police].filter(Boolean).length + " of 4 uploaded"]
  ];

  box.innerHTML = rows.map(([label, value]) => `
    <div class="review-row">
      <strong>${escapeHTML(label)}</strong>
      <span>${escapeHTML(value)}</span>
    </div>
  `).join("");
}

function updateUstaadNavUI(){
  const ustaad = state.ustaad;
  const navLink = $("#navUstaadLink");
  const heroBtn = $("#heroUstaadBtn");
  const vendorCard = $("#welcomeVendorCard");

  const isFullUstaad = ustaad && ustaad.paid;
  const inProgress = ustaad && !ustaad.paid;

  let navLabel = "Become an Ustaad";
  let heroLabel = "I Am an Ustaad";
  let vendorTitle = "Become a Vendor";
  let vendorDesc = "Register as an Ustaad, get verified, and start receiving jobs.";
  let vendorArrow = "Continue as an Ustaad →";
  let vendorIcon = "👨‍🔧";

  if(isFullUstaad){
    navLabel = "My Ustaad Dashboard";
    heroLabel = "Go to My Dashboard";
    vendorTitle = `Welcome back, ${ustaad.fullName || "Ustaad"}! 👋`;
    vendorDesc = "Aapka account active hai. Naye jobs check karein aur kamana jari rakhein.";
    vendorArrow = "Open Dashboard →";
    vendorIcon = "✅";
  }else if(inProgress){
    navLabel = "Continue Registration";
    heroLabel = "Continue Registration";
    vendorTitle = "Finish Your Registration";
    vendorDesc = "Aapki application adhoori hai — bas kuch steps aur baqi hain.";
    vendorArrow = "Continue →";
    vendorIcon = "📝";
  }

  if(navLink) navLink.textContent = navLabel;
  if(heroBtn) heroBtn.textContent = heroLabel;
  if(vendorCard){
    const t = $("#welcomeVendorTitle", vendorCard);
    const d = $("#welcomeVendorDesc", vendorCard);
    const a = $("#welcomeVendorArrow", vendorCard);
    const i = $("#welcomeVendorIcon", vendorCard);
    if(t) t.textContent = vendorTitle;
    if(d) d.textContent = vendorDesc;
    if(a) a.textContent = vendorArrow;
    if(i) i.textContent = vendorIcon;
  }

  [navLink, heroBtn, vendorCard].forEach(el => {
    if(!el) return;
    if(ustaad){
      el.dataset.nav = "";
      el.onclick = (e) => { e.preventDefault(); openUstaadPortal(); };
    }else{
      el.dataset.nav = "ustaad-landing";
      el.onclick = null;
    }
  });
}

function setupUstaadRegistration(){
  const portalBtn = $("#ustaadPortalBtn");
  portalBtn?.addEventListener("click", openUstaadPortal);

  const form = $("#ustaadForm");
  if(!form) return;

  $("#uNext")?.addEventListener("click", () => {
    if(!validateUstaadStep(state.ustaadStep)) return;
    goToUstaadStep(Math.min(4, state.ustaadStep + 1));
  });

  $("#uPrev")?.addEventListener("click", () => {
    goToUstaadStep(Math.max(1, state.ustaadStep - 1));
  });

  const fileFields = [
    ["uPhoto","photo","uPhotoPreview"],
    ["uCnicFront","cnicFront","uCnicFrontPreview"],
    ["uCnicBack","cnicBack","uCnicBackPreview"],
    ["uPolice","police","uPolicePreview"]
  ];

  fileFields.forEach(([inputId, key, previewId]) => {
    const input = $(`#${inputId}`);
    input?.addEventListener("change", () => {
      const file = input.files?.[0];
      if(!file) return;
      const draft = ensureUstaadDraft();
      const reader = new FileReader();
      reader.onload = () => {
        draft[key] = reader.result;
        const preview = $(`#${previewId}`);
        if(preview){
          if(String(reader.result).startsWith("data:image")){
            preview.innerHTML = `<img src="${reader.result}" alt="${key} preview">`;
          }else{
            preview.textContent = file.name;
          }
        }
      };
      if(file.type.startsWith("image/")){
        reader.readAsDataURL(file);
      }else{
        draft[key] = file.name;
        const preview = $(`#${previewId}`);
        if(preview) preview.textContent = file.name;
      }
    });
  });

  $("#uPortfolioPhotos")?.addEventListener("change", async () => {
    const items = await filesToDataURLs($("#uPortfolioPhotos").files, 6);
    ensureUstaadDraft().portfolio = [...ensureUstaadDraft().portfolio.filter(p=>p.kind!=="photo"), ...items.map(i=>({...i, kind:"photo"}))];
    const preview = $("#uPortfolioPhotosPreview");
    if(preview) preview.innerHTML = renderMediaThumbs(items, "photo");
  });

  $("#uPortfolioVideo")?.addEventListener("change", async () => {
    const items = await filesToDataURLs($("#uPortfolioVideo").files, 2);
    ensureUstaadDraft().portfolio = [...ensureUstaadDraft().portfolio.filter(p=>p.kind!=="video"), ...items.map(i=>({...i, kind:"video"}))];
    const preview = $("#uPortfolioVideoPreview");
    if(preview) preview.innerHTML = renderMediaThumbs(items, "video");
  });

form.addEventListener("submit", event => {
    event.preventDefault();
    if(!validateUstaadStep(3)) return;
    const draft = ensureUstaadDraft();
    draft.status = "submitted";
    saveState();
    updateUstaadNavUI();
    toast("Application submitted! Verifying now... 🎉");
    navigate("ustaad-verification");
  });
}

/* =========================================================
   VERIFICATION CARD — FIX: auto-advance to membership
   ========================================================= */

function renderVerificationCard(){
  const draft = ensureUstaadDraft();
  const card = $("#verifyCard");
  if(!card) return;

  if(draft.status === "submitted"){
    card.innerHTML = `
      <div class="verify-icon">⏳</div>
      <h2>Verifying Your Documents</h2>
      <p>Our team usually takes 24-48 hours. For this demo, we'll approve you automatically in a few seconds.</p>
      <div class="verify-progress">
        <div class="verify-progress-bar" id="verifyProgressBar"></div>
      </div>
      <span class="badge badge-pending" style="margin-top:12px;">Under Review</span>
    `;

    // Animate progress bar
    setTimeout(() => {
      const bar = $("#verifyProgressBar");
      if(bar) bar.style.width = "100%";
    }, 100);

    // Auto advance after 2.5 seconds
    setTimeout(() => {
      draft.status = "verified";
      saveState();
      // Show verified state first, then auto go to membership
      renderVerificationCardVerified();
    }, 2500);

    return;
  }

  if(draft.status === "verified" && !draft.paid){
    renderVerificationCardVerified();
    return;
  }

  // Already paid
  card.innerHTML = `
    <div class="verify-icon">✅</div>
    <h2>You're Active!</h2>
    <p>Your account is verified and membership is active.</p>
    <button class="btn btn-primary btn-lg" id="goToDash" type="button">Go to Dashboard →</button>
  `;
  $("#goToDash")?.addEventListener("click", () => navigate("ustaad-dashboard"));
}

function renderVerificationCardVerified(){
  const draft = ensureUstaadDraft();
  updateUstaadNavUI();
  const card = $("#verifyCard");
  if(!card) return;

  card.innerHTML = `
    <div class="verify-icon">✅</div>
    <h2>You're Verified!</h2>
    <p>Great news, <strong>${escapeHTML(draft.fullName || "Ustaad")}</strong>! One last step — activate your monthly membership to start receiving jobs.</p>
    <button class="btn btn-primary btn-lg" id="goToMembership" type="button">Continue to Membership →</button>
  `;

  // Auto redirect after 1.5 seconds
  const redirectTimer = setTimeout(() => {
    navigate("ustaad-membership");
  }, 1500);

  // Or manual click
  $("#goToMembership")?.addEventListener("click", () => {
    clearTimeout(redirectTimer);
    navigate("ustaad-membership");
  });
}

/* =========================================================
   MEMBERSHIP
   ========================================================= */

function renderMembershipCard(){
  $$(".pay-method").forEach(button => {
    button.classList.toggle("active", button.dataset.method === state.ustaadPayMethod);
  });
  renderPayForm();
}

function renderPayForm(){
  const form = $("#payForm");
  if(!form) return;
  if(state.ustaadPayMethod === "bank"){
    form.innerHTML = `
      <label class="field"><span>Bank Account Title</span><input type="text" placeholder="Account holder name"></label>
      <label class="field"><span>Account / IBAN Number</span><input type="text" placeholder="PKxx xxxx xxxx xxxx xxxx"></label>
    `;
  }else{
    form.innerHTML = `
      <label class="field"><span>Mobile Number</span><input type="tel" placeholder="03XX-XXXXXXX"></label>
    `;
  }
}

function setupMembershipPayment(){
  $$(".pay-method").forEach(button => {
    button.addEventListener("click", () => {
      state.ustaadPayMethod = button.dataset.method;
      renderMembershipCard();
    });
  });

  $("#payNowBtn")?.addEventListener("click", () => {
    const draft = ensureUstaadDraft();
    draft.paid = true;
    saveState();
    updateUstaadNavUI();
    toast("Membership activated! Welcome aboard 🎉");
    renderUstaadDashboard();
    navigate("ustaad-dashboard");
  });
}

/* =========================================================
   AI ASSISTANT — IMPROVED
   ========================================================= */

const aiKnowledge = [
  { keys:["plumber","pipe","tap","water","leak"], reply:"Lagta hai aapko plumber chahiye. Plumber category select kar lete hain! 🔧", category:"plumber" },
  { keys:["electric","wiring","light","switch","fan"], reply:"Electrical masla hai? Verified Electrician best option hai. ⚡", category:"electrician" },
  { keys:["wood","furniture","carpenter","door","cabinet"], reply:"Furniture ya wood ka kaam — Carpenter category try karein. 🪚", category:"carpenter" },
  { keys:["paint","wall","colour","color"], reply:"Painting ka kaam hai? Painter category mein bohot aache ustaad hain! 🎨", category:"painter" },
  { keys:["computer","laptop","pc","software","tech"], reply:"Computer/laptop issue? Tech Expert category bilkul sahi hai. 💻", category:"technician" }
];

const aiConversation = [];

function setupAI(){
  const fab = $("#aiFab");
  const panel = $("#aiPanel");
  const close = $("#aiClose");
  const input = $("#aiInput");
  const send = $("#aiSend");

  if(!fab || !panel) return;

  fab.addEventListener("click", () => {
    state.aiOpen = !state.aiOpen;
    panel.classList.toggle("open", state.aiOpen);
    if(state.aiOpen){
      if(!$("#aiMessages").children.length){
        addAIMessage("assistant", "Assalam-o-Alaikum! 👋 Main Kaam Krwao AI hun. Aap ka kya masla hai? Mujhe batayein, main sahi service suggest karunga.");
      }
      setTimeout(() => input?.focus(), 150);
    }
  });

  close?.addEventListener("click", () => {
    state.aiOpen = false;
    panel.classList.remove("open");
  });

 send?.addEventListener("click", sendAIMessage);
  input?.addEventListener("keydown", event => {
    if(event.key === "Enter"){ event.preventDefault(); sendAIMessage(); }
  });

  $("#aiMessages")?.addEventListener("click", event => {
    const btn = event.target.closest(".ai-action-btn");
    if(!btn) return;
    const navTarget = btn.dataset.nav;
    if(navTarget){
      state.aiOpen = false;
      panel.classList.remove("open");
      navigate(navTarget);
    }
  });
}

function addAIMessage(role, text, withActions){
  const container = $("#aiMessages");
  if(!container) return;

  const wrapper = document.createElement("div");
  wrapper.className = `ai-msg-wrapper ${role === "user" ? "ai-out" : "ai-in"}`;

  const bubble = document.createElement("div");
  bubble.className = `ai-bubble ${role === "user" ? "ai-bubble-user" : "ai-bubble-bot"}`;
  bubble.textContent = text;
  wrapper.appendChild(bubble);

  if(withActions){
    const actions = document.createElement("div");
    actions.className = "ai-quick-actions";
    actions.innerHTML = withActions.map(a =>
      `<button class="ai-action-btn" data-nav="${a.nav}" type="button">${a.label}</button>`
    ).join("");
    wrapper.appendChild(actions);
  }

  container.appendChild(wrapper);
  container.scrollTop = container.scrollHeight;
}

function sendAIMessage(){
  const input = $("#aiInput");
  if(!input) return;
  const text = input.value.trim();
  if(!text) return;

  addAIMessage("user", text);
  input.value = "";

  setTimeout(() => {
    const { reply, actions } = getAIReply(text);
    addAIMessage("assistant", reply, actions);
  }, 600);
}

function getAIReply(text){
  const lower = text.toLowerCase();

  for(const item of aiKnowledge){
    if(item.keys.some(key => lower.includes(key))){
      return {
        reply: item.reply,
        actions:[
          { label:`🔍 Post a ${item.category} job`, nav:"post-job" },
          { label:"📊 My Dashboard", nav:"customer-dashboard" }
        ]
      };
    }
  }

  if(lower.includes("hello") || lower.includes("hi") || lower.includes("salam")){
    return {
      reply:"Wa Alaikum Assalam! 😊 Kya aapko koi ghar ka kaam karwana hai? Batayein, main help karunga!",
      actions:[
        { label:"🛠️ Post a Job", nav:"post-job" },
        { label:"📋 See Categories", nav:"home" }
      ]
    };
  }

  if(lower.includes("help") || lower.includes("madad")){
    return {
      reply:"Zaroor! Ghar ka koi bhi kaam batayein — plumber, electrician, carpenter, painter ya tech expert — sahi ustaad dhund deta hun. 🤝",
      actions:SERVICE_CATEGORIES.map(c => ({ label:`${c.icon} ${c.label}`, nav:"post-job" }))
    };
  }

  if(lower.includes("ustaad") || lower.includes("vendor") || lower.includes("register")){
    return {
      reply:"Aap Ustaad ban ke bohot earning kar sakte hain! Registration sirf kuch minutes ka kaam hai. 💪",
      actions:[{ label:"👨‍🔧 Register as Ustaad", nav:"ustaad-landing" }]
    };
  }

  if(lower.includes("price") || lower.includes("cost") || lower.includes("kitna")){
    return {
      reply:"Price job pe depend karta hai. Aap apna kaam post karein, Ustaad aapko quote denge — compare kar ke best choose karein! 💰",
      actions:[{ label:"📝 Post Your Job", nav:"post-job" }]
    };
  }

  return {
    reply:"Thoda detail mein batayein — kya kaam hai? Jaise 'pipe leak hai', 'fan kaam nahi kar raha' wagera. Main sahi Ustaad suggest karunga! 🔎",
    actions:[]
  };
}

/* =========================================================
   3D THREE.JS ENGINE
   ========================================================= */

let three = {
  scene:null, camera:null, renderer:null, group:null,
  objects:[], clock:null, initialized:false
};

function initThree(){
  const container = $("#threeScene");
  if(!container || typeof THREE === "undefined"){
    console.warn("Three.js unavailable.");
    hideThreeLoader();
    return;
  }
  try{
    three.scene = new THREE.Scene();
    three.clock = new THREE.Clock();
    three.camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, .1, 100);
    three.camera.position.set(0, 0, 13);
    three.renderer = new THREE.WebGLRenderer({ alpha:true, antialias:true, powerPreference:"high-performance" });
    three.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    three.renderer.setSize(window.innerWidth, window.innerHeight);
    three.renderer.outputEncoding = THREE.sRGBEncoding;
    container.appendChild(three.renderer.domElement);
    setupThreeLights();
    three.group = new THREE.Group();
    three.scene.add(three.group);
    createThreeObjects();
    three.initialized = true;
    window.addEventListener("resize", resizeThree);
    animateThree();
    hideThreeLoader();
  }catch(error){
    console.error("3D initialization failed:", error);
    hideThreeLoader();
  }
}

function setupThreeLights(){
  three.scene.add(new THREE.AmbientLight(0xffffff, 2));
  const key = new THREE.DirectionalLight(0xffffff, 3);
  key.position.set(5, 8, 10);
  three.scene.add(key);
  const orange = new THREE.PointLight(0xff6b00, 5, 30);
  orange.position.set(3, 2, 7);
  three.scene.add(orange);
}

function orangeMaterial(){ return new THREE.MeshStandardMaterial({ color:0xff6b00, metalness:.35, roughness:.28 }); }
function whiteMaterial(){ return new THREE.MeshStandardMaterial({ color:0xf7f7f7, metalness:.15, roughness:.35 }); }
function darkMaterial(){ return new THREE.MeshStandardMaterial({ color:0x1d2024, metalness:.55, roughness:.25 }); }

function createToolbox(){
  const group = new THREE.Group();
  const body = new THREE.Mesh(new THREE.BoxGeometry(2.2, 1.35, 1.2), orangeMaterial());
  body.position.y = -.1;
  group.add(body);
  const top = new THREE.Mesh(new THREE.BoxGeometry(1.85, .18, 1.05), whiteMaterial());
  top.position.y = .63;
  group.add(top);
  const handle = new THREE.Mesh(new THREE.TorusGeometry(.55, .09, 12, 32, Math.PI), darkMaterial());
  handle.rotation.x = Math.PI / 2;
  handle.position.y = .82;
  group.add(handle);
  group.position.set(4, 1.8, -1);
  group.rotation.set(-.2, .4, -.12);
  group.scale.setScalar(.9);
  three.group.add(group);
  three.objects.push({ object:group, speed:.45, offset:0, baseY:1.8 });
}

function createWrench(){
  const group = new THREE.Group();
  const handle = new THREE.Mesh(new THREE.BoxGeometry(.35, 2.2, .18), darkMaterial());
  handle.position.y = -.5;
  handle.rotation.z = -.15;
  group.add(handle);
  const head = new THREE.Mesh(new THREE.TorusGeometry(.48, .14, 12, 32), darkMaterial());
  head.position.y = .65;
  group.add(head);
  const center = new THREE.Mesh(new THREE.CylinderGeometry(.27, .27, .25, 16), orangeMaterial());
  center.rotation.x = Math.PI / 2;
  center.position.y = .65;
  group.add(center);
  group.position.set(-4, 1.1, -2);
  group.rotation.z = -.4;
  group.scale.setScalar(.8);
  three.group.add(group);
  three.objects.push({ object:group, speed:.65, offset:1.5, baseY:1.1 });
}

function createHouse(){
  const group = new THREE.Group();
  const base = new THREE.Mesh(new THREE.BoxGeometry(2.4, 1.8, 2), whiteMaterial());
  base.position.y = -.3;
  group.add(base);
  const roof = new THREE.Mesh(new THREE.ConeGeometry(1.8, 1.5, 4), orangeMaterial());
  roof.rotation.y = Math.PI / 4;
  roof.position.y = 1.35;
  group.add(roof);
  const door = new THREE.Mesh(new THREE.BoxGeometry(.45, .8, .08), darkMaterial());
  door.position.set(0, -.75, 1.04);
  group.add(door);
  group.position.set(3.7, -2.1, -1);
  group.rotation.y = -.35;
  group.scale.setScalar(.85);
  three.group.add(group);
  three.objects.push({ object:group, speed:.35, offset:2, baseY:-2.1 });
}

function createAIOrb(){
  const group = new THREE.Group();
  const sphere = new THREE.Mesh(new THREE.SphereGeometry(1.05, 32, 32), new THREE.MeshStandardMaterial({ color:0xff6b00, emissive:0x7d2600, emissiveIntensity:.35, metalness:.5, roughness:.18 }));
  group.add(sphere);
  const ring = new THREE.Mesh(new THREE.TorusGeometry(1.4, .035, 10, 64), new THREE.MeshBasicMaterial({ color:0xff6b00, transparent:true, opacity:.7 }));
  ring.rotation.x = Math.PI / 2;
  group.add(ring);
  const ring2 = ring.clone();
  ring2.rotation.x = Math.PI / 3;
  ring2.rotation.y = Math.PI / 4;
  group.add(ring2);
  group.position.set(-3.5, -2.2, -2);
  three.group.add(group);
  three.objects.push({ object:group, speed:.8, offset:.8, baseY:-2.2, orb:true });
}

function createVehicle(){
  const group = new THREE.Group();
  const body = new THREE.Mesh(new THREE.BoxGeometry(2.2, .7, 1), orangeMaterial());
  group.add(body);
  const cabin = new THREE.Mesh(new THREE.BoxGeometry(1.15, .55, .9), whiteMaterial());
  cabin.position.set(.25, .55, 0);
  group.add(cabin);
  const wheelGeometry = new THREE.CylinderGeometry(.3, .3, .2, 20);
  const wheelMaterial = darkMaterial();
  [-.7,.7].forEach(x => {
    const wheel = new THREE.Mesh(wheelGeometry, wheelMaterial);
    wheel.rotation.z = Math.PI / 2;
    wheel.position.set(x, -.5, .55);
    group.add(wheel);
    const wheel2 = wheel.clone();
    wheel2.position.z = -.55;
    group.add(wheel2);
  });
  group.position.set(0, -3.2, -1);
  group.scale.setScalar(.7);
  three.group.add(group);
  three.objects.push({ object:group, speed:.25, offset:3, baseY:-3.2 });
}

function createThreeObjects(){
  createToolbox(); createWrench(); createHouse(); createAIOrb(); createVehicle();
}

function animateThree(){
  if(!three.initialized) return;
  requestAnimationFrame(animateThree);
  const time = three.clock.getElapsedTime();
  three.objects.forEach(item => {
    item.object.rotation.y += 0.0025 * item.speed;
    item.object.rotation.x += 0.001 * item.speed;
    item.object.position.y = item.baseY + Math.sin(time * item.speed + item.offset) * .18;
    if(item.orb) item.object.rotation.z = time * .3;
  });
  three.group.rotation.y += (state.mouseX * .08 - three.group.rotation.y) * .01;
  three.group.rotation.x += (state.mouseY * .04 - three.group.rotation.x) * .01;
  three.renderer.render(three.scene, three.camera);
}

function resizeThree(){
  if(!three.camera || !three.renderer) return;
  three.camera.aspect = window.innerWidth / window.innerHeight;
  three.camera.updateProjectionMatrix();
  three.renderer.setSize(window.innerWidth, window.innerHeight);
}

function setup3DMouse(){
  const panel = $("#hero3DPanel");
  document.addEventListener("mousemove", event => {
    state.mouseX = (event.clientX / window.innerWidth) * 2 - 1;
    state.mouseY = -(event.clientY / window.innerHeight) * 2 + 1;
    if(panel){
      const rotateY = state.mouseX * 7;
      const rotateX = state.mouseY * -7;
      panel.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    }
  });
  const hero = $("#hero");
  if(hero){
    hero.addEventListener("mouseleave", () => { if(panel) panel.style.transform = ""; });
  }
}

function setupCardTilt(){
  const cards = $$(".cat-card, .how-card, .ustaad-card, .dash-card, .job-card");
  cards.forEach(card => {
    card.addEventListener("mousemove", event => {
      if(window.innerWidth < 700) return;
      const rect = card.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      const rotateY = (x - rect.width/2) / (rect.width/2) * 5;
      const rotateX = -(y - rect.height/2) / (rect.height/2) * 5;
      card.style.transform = `perspective(900px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-5px)`;
    });
    card.addEventListener("mouseleave", () => { card.style.transform = ""; });
  });
}

function setupCursorLight(){
  if(window.matchMedia("(pointer: coarse)").matches) return;
  const light = document.createElement("div");
  light.className = "kk-cursor-light";
  document.body.appendChild(light);
  document.addEventListener("mousemove", event => {
    light.style.left = `${event.clientX}px`;
    light.style.top = `${event.clientY}px`;
  });
}

function setupReveal(){
  const elements = $$(".reveal");
  if(!("IntersectionObserver" in window)){ elements.forEach(el => el.style.opacity = "1"); return; }
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if(entry.isIntersecting){ entry.target.style.opacity = "1"; observer.unobserve(entry.target); }
    });
  }, { threshold:.08 });
  elements.forEach(el => observer.observe(el));
}

function hideThreeLoader(){
  const loader = $("#threeLoading");
  if(!loader) return;
  setTimeout(() => loader.classList.add("hidden"), 350);
}

function refresh3DScene(){
  if(!three.initialized) return;
  three.objects.forEach(item => { item.object.visible = true; });
}

function setupNavbarScroll(){
  const navbar = $("#navbar");
  if(!navbar) return;
  window.addEventListener("scroll", () => {
    if(window.scrollY > 20) navbar.classList.add("scrolled");
    else navbar.classList.remove("scrolled");
  }, { passive:true });
}

/* =========================================================
   INITIALIZATION
   ========================================================= */

function init(){
  resetAppData();
  setupModal();
  setupNavigation();
  setupMobileMenu();
  setupJobForm();
  setupJobActions();
  setupOnlineToggle();
  setupCategories();
  setupUstaadRegistration();
  setupMembershipPayment();
  setupAI();
  setup3DMouse();
  setupCardTilt();
  setupCursorLight();
  setupReveal();
  setupNavbarScroll();
  renderCustomerDashboard();
  if(state.ustaad?.paid) renderUstaadDashboard();
  initThree();
  updateUstaadNavUI();
}

if(document.readyState === "loading"){
  document.addEventListener("DOMContentLoaded", init);
}else{
  init();
}