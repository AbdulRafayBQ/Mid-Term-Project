/* ==========================================================
   KAAM KRWAO — prototype app logic (vanilla JS, localStorage)
   ========================================================== */
(function(){
"use strict";

/* ---------- DATA ---------- */
const CATEGORIES = [
  {id:"electrician",name:"Electrician",icon:"⚡",desc:"bijli ka kaam"},
  {id:"plumber",name:"Plumber",icon:"🚿",desc:"paani ka kaam"},
  {id:"ac",name:"AC Technician",icon:"❄️",desc:"AC service/repair"},
  {id:"painter",name:"Painter",icon:"🎨",desc:"paint ka kaam"},
  {id:"mechanic",name:"Mechanic",icon:"🔧",desc:"gaari/bike"},
  {id:"appliance",name:"Appliance Repair",icon:"🧺",desc:"washing machine, fridge"},
];

const DEMO_NAMES = ["Muhammad Irfan","Bilal Ahmed","Shahid Hussain","Asif Raza","Kashif Iqbal","Zubair Khan","Rizwan Ali","Nasir Mehmood","Junaid Sheikh","Waqar Abbas","Imran Farooq","Adnan Malik"];
const AREAS_BY_CITY = {Karachi:["DHA","Clifton","Gulshan-e-Iqbal","North Nazimabad","Malir","Korangi"],Lahore:["DHA","Gulberg","Johar Town","Model Town","Bahria Town"],Islamabad:["F-7","G-9","F-10","Bahria Town","DHA"],Rawalpindi:["Saddar","Bahria Town","Satellite Town"],Faisalabad:["Peoples Colony","Madina Town","Susan Road"]};

function rand(arr){return arr[Math.floor(Math.random()*arr.length)];}
function randInt(a,b){return Math.floor(Math.random()*(b-a+1))+a;}
function uid(prefix){return prefix+"_"+Date.now().toString(36)+Math.random().toString(36).slice(2,7);}
function avatarUrl(seed){return `https://i.pravatar.cc/150?img=${seed}`;}
function money(n){return "Rs. "+Number(n).toLocaleString("en-PK");}

function genDemoUstaad(catId, seedNum){
  const cat = CATEGORIES.find(c=>c.id===catId) || rand(CATEGORIES);
  const city = "Karachi";
  return {
    id: uid("ust"),
    name: rand(DEMO_NAMES),
    skill: cat.id,
    skillName: cat.name,
    photo: avatarUrl(seedNum),
    experience: randInt(2,14),
    rating: (Math.random()*1.3+3.6).toFixed(1),
    completedJobs: randInt(40,540),
    responseRate: randInt(85,99),
    visitingFee: rand([200,250,300,350,400,500]),
    guarantee: rand(["7 days","30 days","3 months","1 year"]),
    city, areas:[rand(AREAS_BY_CITY[city]),rand(AREAS_BY_CITY[city])],
    verified:true,
  };
}

/* seed a pool of demo ustaads once */
function seedUstaadPool(){
  let pool = DB.get("ustaadPool");
  if(pool && pool.length) return pool;
  pool = [];
  let seed=1;
  CATEGORIES.forEach(cat=>{
    for(let i=0;i<4;i++){ pool.push(genDemoUstaad(cat.id, (seed++ % 70)+1)); }
  });
  DB.set("ustaadPool", pool);
  return pool;
}

/* ---------- SIMPLE DB (localStorage wrapper) ---------- */
const DB = {
  get(key, fallback){ try{ const v=localStorage.getItem("kk_"+key); return v?JSON.parse(v):(fallback!==undefined?fallback:null);}catch(e){return fallback;} },
  set(key, val){ try{ localStorage.setItem("kk_"+key, JSON.stringify(val)); }catch(e){} },
};

/* ---------- STATE INIT ---------- */
function initState(){
  if(!DB.get("customer")) DB.set("customer",{id:uid("cus"),name:"Ahmed Raza",phone:"0300-1234567"});
  if(!DB.get("jobs")) DB.set("jobs",[]);
  if(!DB.get("ustaadProfile")) DB.set("ustaadProfile",null);
  if(!DB.get("ustaadJobsAssigned")) DB.set("ustaadJobsAssigned",[]);
  seedUstaadPool();
}
initState();

/* ---------- TOASTS ---------- */
function toast(title, body, type="default", icon="🔔"){
  const stack = document.getElementById("toastStack");
  const el = document.createElement("div");
  el.className = "toast "+(type==="success"?"success":type==="error"?"error":"");
  el.innerHTML = `<span class="toast-icon">${icon}</span><div><div class="toast-title">${title}</div><div class="toast-body">${body||""}</div></div>`;
  stack.appendChild(el);
  setTimeout(()=>{ el.classList.add("out"); setTimeout(()=>el.remove(),300); }, 4200);
}

/* ---------- NAVIGATION (SPA views) ---------- */
const VIEWS = ["home","post-job","finding","compare","tracker","customer-dashboard",
  "ustaad-landing","ustaad-apply","ustaad-verification","ustaad-membership","ustaad-dashboard"];

let navContext = {}; // holds jobId etc between views

function showView(name, ctx){
  ctx = ctx || {};
  navContext = Object.assign(navContext, ctx);
  VIEWS.forEach(v=>{
    const el = document.getElementById("view-"+v);
    if(el) el.classList.toggle("active", v===name);
  });
  window.scrollTo({top:0,behavior:"smooth"});
  document.getElementById("navLinks").classList.remove("open");

  // view-specific renderers
  if(name==="home") renderHome();
  if(name==="post-job") renderPostJob();
  if(name==="compare") renderCompare(ctx.jobId || navContext.jobId);
  if(name==="tracker") renderTracker(ctx.jobId || navContext.jobId);
  if(name==="customer-dashboard") renderCustomerDashboard();
  if(name==="ustaad-apply") renderUstaadApply();
  if(name==="ustaad-verification") renderUstaadVerification();
  if(name==="ustaad-membership") renderUstaadMembership();
  if(name==="ustaad-dashboard") renderUstaadDashboard();

  triggerReveal();
}

document.addEventListener("click", (e)=>{
  const navEl = e.target.closest("[data-nav]");
  if(navEl){
    e.preventDefault();
    const target = navEl.getAttribute("data-nav");
    if(target==="ustaad-landing" || target==="ustaad-apply" || target==="ustaad-membership" || target==="ustaad-dashboard" || target==="ustaad-verification"){
      routeUstaad(target);
    } else if(target==="customer-dashboard"){
      showView("customer-dashboard");
    } else {
      showView(target);
    }
  }
});

function routeUstaad(requested){
  const profile = DB.get("ustaadProfile");
  if(requested==="ustaad-landing"){ showView("ustaad-landing"); return; }
  if(requested==="ustaad-apply"){ showView("ustaad-apply"); return; }
  if(requested==="ustaad-dashboard"){
    if(!profile){ showView("ustaad-landing"); return; }
    if(profile.status==="pending"){ showView("ustaad-verification"); return; }
    if(profile.status==="verified" && !profile.membershipActive){ showView("ustaad-membership"); return; }
    showView("ustaad-dashboard");
    return;
  }
  showView(requested);
}

document.getElementById("navBurger").addEventListener("click", ()=>{
  document.getElementById("navLinks").classList.toggle("open");
});

/* ---------- SCROLL REVEAL ---------- */
let revealObserver;
function triggerReveal(){
  if(revealObserver) revealObserver.disconnect();
  const els = document.querySelectorAll(".view.active .reveal");
  revealObserver = new IntersectionObserver((entries)=>{
    entries.forEach(en=>{ if(en.isIntersecting){ en.target.classList.add("in"); revealObserver.unobserve(en.target); } });
  },{threshold:.12});
  els.forEach(el=>revealObserver.observe(el));
}

/* ==========================================================
   HOME VIEW RENDER
   ========================================================== */
function renderHome(){
  const catGrid = document.getElementById("catGrid");
  if(!catGrid.dataset.built){
    catGrid.innerHTML = CATEGORIES.map(c=>`
      <div class="cat-card" data-nav="post-job" data-precat="${c.id}">
        <div class="cat-icon">${c.icon}</div>
        <h4>${c.name}</h4>
        <span>${c.desc}</span>
      </div>`).join("");
    catGrid.dataset.built="1";
    catGrid.addEventListener("click",(e)=>{
      const card = e.target.closest("[data-precat]");
      if(card){ preselectCategory = card.getAttribute("data-precat"); }
    });
  }
  const feat = document.getElementById("featuredUstaads");
  if(!feat.dataset.built){
    const pool = seedUstaadPool().slice(0,8);
    feat.innerHTML = pool.map(u=>ustaadCardHTML(u)).join("");
    feat.dataset.built="1";
  }
}

function ustaadCardHTML(u){
  return `<div class="ustaad-card">
    <div class="ustaad-top">
      <img class="ustaad-avatar" src="${u.photo}" alt="${u.name}">
      <div>
        <div class="ustaad-name">${u.name} <span class="badge badge-verified">verified</span></div>
        <div class="ustaad-skill">${u.skillName}</div>
      </div>
    </div>
    <div class="ustaad-rating">★ ${u.rating} <span style="color:var(--slate-dim)">(${u.completedJobs} jobs)</span></div>
    <div class="ustaad-meta">
      <span class="chip">${u.experience} saal tajurba</span>
      <span class="chip chip-green">${u.guarantee} guarantee</span>
      <span class="chip">visit ${money(u.visitingFee)}</span>
    </div>
  </div>`;
}

/* ==========================================================
   CUSTOMER: POST JOB FLOW
   ========================================================== */
let preselectCategory = null;
let jobDraft = {photos:[],video:null};
let jobStep = 1;

function renderPostJob(){
  jobStep = 1;
  jobDraft = {photos:[],video:null};
  document.getElementById("jobForm").reset();
  document.getElementById("jobPhotoPreview").innerHTML="";
  document.getElementById("jobVideoPreview").innerHTML="";
  updateJobStepper();

  const grid = document.getElementById("jobCatGrid");
  grid.innerHTML = CATEGORIES.map(c=>`
    <div class="cat-select" data-cat="${c.id}">
      <div class="cat-icon">${c.icon}</div><h4>${c.name}</h4>
    </div>`).join("");
  grid.querySelectorAll(".cat-select").forEach(el=>{
    el.addEventListener("click", ()=>{
      grid.querySelectorAll(".cat-select").forEach(x=>x.classList.remove("selected"));
      el.classList.add("selected");
      jobDraft.category = el.getAttribute("data-cat");
    });
  });
  if(preselectCategory){
    const match = grid.querySelector(`[data-cat="${preselectCategory}"]`);
    if(match) match.click();
    preselectCategory = null;
  }
}

document.getElementById("jobPhotos").addEventListener("change", (e)=>{
  const preview = document.getElementById("jobPhotoPreview");
  preview.innerHTML="";
  jobDraft.photos = [];
  Array.from(e.target.files).slice(0,4).forEach(f=>{
    const url = URL.createObjectURL(f);
    jobDraft.photos.push(url);
    const img = document.createElement("img"); img.src=url; preview.appendChild(img);
  });
});
document.getElementById("jobVideo").addEventListener("change",(e)=>{
  const preview = document.getElementById("jobVideoPreview");
  preview.innerHTML="";
  if(e.target.files[0]){
    jobDraft.video = e.target.files[0].name;
    const chip = document.createElement("div"); chip.className="file-chip"; chip.textContent="🎬 "+jobDraft.video;
    preview.appendChild(chip);
  }
});

function updateJobStepper(){
  document.querySelectorAll("#jobStepper .step").forEach(s=>{
    const n = +s.getAttribute("data-step");
    s.classList.toggle("active", n===jobStep);
    s.classList.toggle("done", n<jobStep);
  });
  document.querySelectorAll("#jobForm .form-step").forEach(s=>{
    s.classList.toggle("active", +s.getAttribute("data-step")===jobStep);
  });
  document.getElementById("jobPrev").style.visibility = jobStep===1 ? "hidden":"visible";
  document.getElementById("jobNext").classList.toggle("hidden", jobStep===4);
  document.getElementById("jobSubmit").classList.toggle("hidden", jobStep!==4);
  if(jobStep===4) buildJobReview();
}

function buildJobReview(){
  jobDraft.description = document.getElementById("jobDesc").value.trim();
  jobDraft.location = document.getElementById("jobLocation").value.trim();
  jobDraft.time = document.getElementById("jobTime").value;
  jobDraft.pricingPref = document.getElementById("jobPricingPref").value;
  const cat = CATEGORIES.find(c=>c.id===jobDraft.category);
  const box = document.getElementById("jobReviewBox");
  box.innerHTML = `
    <div class="review-row"><span>Category</span><span>${cat? cat.icon+" "+cat.name : "—"}</span></div>
    <div class="review-row"><span>Description</span><span>${jobDraft.description || "—"}</span></div>
    <div class="review-row"><span>Photos</span><span>${jobDraft.photos.length} attached</span></div>
    <div class="review-row"><span>Video</span><span>${jobDraft.video || "koi nahi"}</span></div>
    <div class="review-row"><span>Location</span><span>${jobDraft.location || "—"}</span></div>
    <div class="review-row"><span>Waqt</span><span>${jobDraft.time}</span></div>
  `;
}

document.getElementById("jobNext").addEventListener("click", ()=>{
  if(jobStep===1 && !jobDraft.category){ toast("Category chunain","Aage badhne se pehle ek category select karein.","error","⚠️"); return; }
  if(jobStep===2 && !document.getElementById("jobDesc").value.trim()){ toast("Description likhein","Apne masle ki thodi tafseel den.","error","⚠️"); return; }
  if(jobStep===3 && !document.getElementById("jobLocation").value.trim()){ toast("Location darj karein","Ustaad tak pohanchne ke liye area/address zaroori hai.","error","⚠️"); return; }
  jobStep = Math.min(4, jobStep+1);
  updateJobStepper();
});
document.getElementById("jobPrev").addEventListener("click", ()=>{
  jobStep = Math.max(1, jobStep-1);
  updateJobStepper();
});

document.getElementById("jobForm").addEventListener("submit",(e)=>{
  e.preventDefault();
  buildJobReview();
  const job = {
    id: uid("job"),
    ...jobDraft,
    status:"finding", // finding -> open -> selected -> accepted -> on_the_way -> reached -> in_progress -> completed / cancelled
    createdAt: Date.now(),
    applicants: [],
    selectedUstaadId: null,
    pricing: null,
    chat: [],
  };
  const jobs = DB.get("jobs",[]);
  jobs.unshift(job);
  DB.set("jobs", jobs);
  showView("finding", {jobId: job.id});
  runFindingSimulation(job.id);
});

/* ==========================================================
   FINDING USTAADS SIMULATION
   ========================================================== */
function runFindingSimulation(jobId){
  const jobs = DB.get("jobs",[]);
  const job = jobs.find(j=>j.id===jobId);
  if(!job) return;
  const pool = seedUstaadPool().filter(u=>u.skill===job.category);
  const chosen = [];
  const shuffled = [...pool].sort(()=>Math.random()-.5);
  const count = Math.min(4, Math.max(3, shuffled.length));
  for(let i=0;i<count && i<shuffled.length;i++) chosen.push(shuffled[i]);

  const log = document.getElementById("findingLog");
  log.innerHTML = "";
  document.getElementById("findingTitle").textContent = "Finding available ustaads...";
  document.getElementById("findingSub").textContent = "Aapke qareeb verified ustaads ko notify kiya ja raha hai";

  const steps = [
    {t:600, msg:`📡 ${chosen.length} verified ustaads ko job bheja gaya`},
  ];
  chosen.forEach((u,i)=> steps.push({t:1200+i*900, msg:`🔔 ${u.name} ne notification dekha aur job dekh rahe hain...`}));
  steps.push({t:1400+chosen.length*900, msg:`✅ ${chosen.length} ustaads ne apply kar diya hai`});

  steps.forEach(s=>{
    setTimeout(()=>{
      const item = document.createElement("div");
      item.className="finding-log-item";
      item.textContent = s.msg;
      log.appendChild(item);
    }, s.t);
  });

  setTimeout(()=>{
    const jobsNow = DB.get("jobs",[]);
    const j = jobsNow.find(x=>x.id===jobId);
    if(j){
      j.status = "open";
      j.applicants = chosen.map(u=>({
        ustaadId:u.id, ustaad:u,
        message: rand([
          "Main abhi 20 min mein pahunch sakta hoon, kaam achi tarah dekh loonga.",
          "Aapka masla common hai, main isay jald theek kar dunga.",
          "Mera experience is field mein kaafi hai, guarantee ke sath kaam karta hoon.",
          "Available hoon, visit karke sahi price bataunga.",
        ]),
      }));
      DB.set("jobs", jobsNow);

      // also register these jobs as "assigned" for ustaad-side simulation
      const assigned = DB.get("ustaadJobsAssigned",[]);
      chosen.forEach(u=> assigned.push({jobId, ustaadId:u.id}) );
      DB.set("ustaadJobsAssigned", assigned);
    }
    toast("Ustaads mil gaye!", `${chosen.length} ustaads ne aapke kaam par apply kiya hai.`, "success", "🎉");
    showView("compare", {jobId});
  }, 1500+chosen.length*900+700);
}

/* ==========================================================
   COMPARE APPLICANTS
   ========================================================== */
function renderCompare(jobId){
  const jobs = DB.get("jobs",[]);
  const job = jobs.find(j=>j.id===jobId);
  const grid = document.getElementById("applicantGrid");
  if(!job){ grid.innerHTML = `<p class="empty-note">Job nahi mila.</p>`; return; }

  if(job.status==="finding"){
    grid.innerHTML = `<p class="empty-note">Ustaads dhoonde ja rahe hain, thodi der intezaar karein...</p>`;
    return;
  }
  if(!job.applicants.length){
    grid.innerHTML = `<p class="empty-note">Is waqt koi ustaad available nahi. Baad mein try karein.</p>`;
    return;
  }
  document.getElementById("compareSub").textContent = job.selectedUstaadId
    ? "Aapne pehle hi ek ustaad select kar liya hai."
    : "In ustaads ne aapke kaam par apply kiya hai — best select karein";

  grid.innerHTML = job.applicants.map(a=>{
    const u = a.ustaad;
    const isSelected = job.selectedUstaadId===u.id;
    return `<div class="applicant-card">
      <div class="applicant-top">
        <img class="applicant-avatar" src="${u.photo}">
        <div>
          <div class="ustaad-name">${u.name} <span class="badge badge-verified">verified</span></div>
          <div class="ustaad-skill">${u.skillName}</div>
        </div>
      </div>
      <div class="applicant-msg">"${a.message}"</div>
      <div class="applicant-stats">
        <div class="astat"><strong>★ ${u.rating}</strong><span>${u.completedJobs} jobs</span></div>
        <div class="astat"><strong>${u.experience} saal</strong><span>experience</span></div>
        <div class="astat"><strong>${u.guarantee}</strong><span>guarantee</span></div>
        <div class="astat"><strong>${money(u.visitingFee)}</strong><span>visiting fee</span></div>
      </div>
      <button class="btn btn-primary full" ${job.selectedUstaadId?"disabled":""} data-select-ustaad="${u.id}" data-job="${job.id}">
        ${isSelected ? "selected ✓" : (job.selectedUstaadId? "kisi aur ko select kiya" : "select karein")}
      </button>
    </div>`;
  }).join("");

  grid.querySelectorAll("[data-select-ustaad]").forEach(btn=>{
    btn.addEventListener("click", ()=> selectUstaad(btn.getAttribute("data-job"), btn.getAttribute("data-select-ustaad")));
  });
}

function selectUstaad(jobId, ustaadId){
  const jobs = DB.get("jobs",[]);
  const job = jobs.find(j=>j.id===jobId);
  if(!job || job.selectedUstaadId) return;
  job.selectedUstaadId = ustaadId;
  job.status = "selected";
  const u = job.applicants.find(a=>a.ustaadId===ustaadId).ustaad;
  job.chat.push({from:"ustaad", text:`Assalam-o-Alaikum! Main ${u.name} bol raha hoon, aapka job accept kar liya hai. Jald hi pricing confirm karta hoon.`, ts:Date.now()});
  DB.set("jobs", jobs);
  toast("Ustaad select ho gaya", `${u.name} ko aapke kaam ke liye select kar liya gaya hai.`, "success", "✅");
  renderCompare(jobId);
  setTimeout(()=> openChatModal(jobId), 500);
}

/* ==========================================================
   CHAT MODAL
   ========================================================== */
function openChatModal(jobId){
  const jobs = DB.get("jobs",[]);
  const job = jobs.find(j=>j.id===jobId);
  if(!job) return;
  const u = job.applicants.find(a=>a.ustaadId===job.selectedUstaadId).ustaad;

  openModal(`
    <span class="modal-close" data-close-modal>✕</span>
    <div class="chat-window">
      <div class="chat-header"><img src="${u.photo}"><div><div style="font-weight:600">${u.name}</div><div style="font-size:.75rem;color:var(--slate)">${u.skillName} · online</div></div></div>
      <div class="chat-body" id="chatBody"></div>
      <div class="chat-input-row">
        <input type="text" id="chatInput" placeholder="Message likhein...">
        <button id="chatSend">➤</button>
      </div>
    </div>
  `);
  renderChatBody(jobId);
  document.getElementById("chatSend").onclick = ()=> sendChat(jobId);
  document.getElementById("chatInput").addEventListener("keydown",(e)=>{ if(e.key==="Enter") sendChat(jobId); });
}

function renderChatBody(jobId){
  const jobs = DB.get("jobs",[]);
  const job = jobs.find(j=>j.id===jobId);
  const body = document.getElementById("chatBody");
  if(!body) return;
  body.innerHTML = job.chat.map(m=>`<div class="chat-bubble ${m.from==='customer'?'me':'them'}">${m.text}</div>`).join("");
  body.scrollTop = body.scrollHeight;
}

function sendChat(jobId){
  const input = document.getElementById("chatInput");
  const text = input.value.trim();
  if(!text) return;
  const jobs = DB.get("jobs",[]);
  const job = jobs.find(j=>j.id===jobId);
  job.chat.push({from:"customer", text, ts:Date.now()});
  DB.set("jobs", jobs);
  input.value="";
  renderChatBody(jobId);
  setTimeout(()=>{
    const jobs2 = DB.get("jobs",[]);
    const job2 = jobs2.find(j=>j.id===jobId);
    job2.chat.push({from:"ustaad", text: rand(["Theek hai ji.","Main jald pahunch raha hoon.","Bilkul, koi masla nahi.","Aap fikar na karein, kaam sahi ho jayega."]), ts:Date.now()});
    DB.set("jobs", jobs2);
    renderChatBody(jobId);
  }, 1100);
}

/* ---------- generic modal ---------- */
function openModal(html){
  document.getElementById("modalBox").innerHTML = html;
  document.getElementById("modalOverlay").classList.add("active");
}
function closeModal(){ document.getElementById("modalOverlay").classList.remove("active"); }
document.addEventListener("click",(e)=>{
  if(e.target.id==="modalOverlay" || e.target.closest("[data-close-modal]")) closeModal();
});

/* ==========================================================
   JOB TRACKER (customer + ustaad shared render, mode-aware)
   ========================================================== */
const STAGES = [
  {k:"selected", label:"selected", icon:"1"},
  {k:"accepted", label:"accepted", icon:"2"},
  {k:"on_the_way", label:"on the way", icon:"3"},
  {k:"reached", label:"reached", icon:"4"},
  {k:"in_progress", label:"in progress", icon:"5"},
  {k:"completed", label:"completed", icon:"✓"},
];

function stageIndex(status){
  if(status==="cancelled") return -1;
  const i = STAGES.findIndex(s=>s.k===status);
  return i===-1?0:i;
}

function renderTracker(jobId){
  const jobs = DB.get("jobs",[]);
  const job = jobs.find(j=>j.id===jobId);
  const wrap = document.getElementById("trackerWrap");
  if(!job){ wrap.innerHTML="<p class='empty-note'>Job nahi mila.</p>"; return; }
  const u = job.applicants.find(a=>a.ustaadId===job.selectedUstaadId)?.ustaad;
  const cat = CATEGORIES.find(c=>c.id===job.category);
  const idx = stageIndex(job.status);
  const isUstaadView = navContext.mode === "ustaad";

  let progressHTML = `<div class="progress-track">` + STAGES.map((s,i)=>`
    <div class="progress-step ${job.status==='cancelled'?'':(i<idx?'done':i===idx?'current':'')}">
      <div class="dot">${i<idx?'✓':s.icon}</div><span>${s.label}</span>
    </div>`).join("") + `</div>`;

  if(job.status==="cancelled"){
    progressHTML = `<div class="chip" style="background:rgba(255,84,112,.15);color:var(--red);padding:10px 16px;">❌ Yeh job cancel/unable-to-complete ke tor par band ho chuki hai</div>`;
  }

  let pricingHTML = "";
  if(job.pricing){
    const p = job.pricing;
    if(p.type==="before"){
      pricingHTML = `<div class="pricing-box">
        <h4 style="margin-bottom:10px;font-size:.92rem;">Price before visit</h4>
        <div class="price-line"><span>Material cost</span><span>${money(p.material)}</span></div>
        <div class="price-line"><span>Labor cost</span><span>${money(p.labor)}</span></div>
        <div class="price-line total"><span>Total estimate</span><span>${money(p.total)}</span></div>
        ${p.accepted===undefined ? (isUstaadView? `<p style="margin-top:10px;font-size:.8rem;">Customer ki response ka intezaar hai...</p>` :
          `<div class="tracker-actions"><button class="btn btn-primary" data-accept-price="1">estimate accept karein</button><button class="btn btn-outline" data-decline-price="1">decline karein</button></div>`) :
          p.accepted ? `<div class="chip chip-green">✅ Customer ne estimate accept kar liya</div>` : `<div class="chip" style="background:rgba(255,84,112,.15);color:var(--red);">❌ Customer ne estimate decline kar diya</div>`}
      </div>`;
    } else if(p.type==="after"){
      pricingHTML = `<div class="pricing-box"><h4 style="margin-bottom:6px;font-size:.92rem;">Price after inspection</h4><p style="font-size:.82rem;">Ustaad location par pahunch kar final price discuss karega.</p></div>`;
    }
    if(p.final){
      pricingHTML += `<div class="pricing-box">
        <h4 style="margin-bottom:10px;font-size:.92rem;">Final bill</h4>
        <div class="price-line"><span>Material cost</span><span>${money(p.final.material)}</span></div>
        <div class="price-line"><span>Labor cost</span><span>${money(p.final.labor)}</span></div>
        <div class="price-line total"><span>Final amount</span><span>${money(p.final.total)}</span></div>
        <p style="margin-top:10px;font-size:.78rem;color:var(--slate-dim)">💳 Payment direct customer aur ustaad ke darmiyan hoti hai (cash / EasyPaisa / JazzCash / bank). Kaam Krwao payment collect ya transfer nahi karta — yeh amount sirf record ke liye hai.</p>
      </div>`;
    }
  }

  let actionsHTML = buildTrackerActions(job, isUstaadView);

  wrap.innerHTML = `
    <div class="tracker-head">
      <div>
        <span class="eyebrow">${cat?cat.icon+" "+cat.name:""} job</span>
        <h2 style="margin-top:4px;">${job.description ? job.description.slice(0,60) : "Service request"}</h2>
        <p style="margin-top:6px;">${job.location}</p>
      </div>
      ${u? `<div style="display:flex;align-items:center;gap:10px;">
        <img src="${u.photo}" style="width:46px;height:46px;border-radius:12px;object-fit:cover;">
        <div><div style="font-weight:600">${u.name}</div><div style="font-size:.78rem;color:var(--slate-dim)">${u.skillName}</div></div>
      </div>`:""}
    </div>
    ${progressHTML}
    ${job.photos && job.photos.length ? `<div class="job-photo-row">${job.photos.map(p=>`<img src="${p}">`).join("")}</div>` : ""}
    ${pricingHTML}
    ${actionsHTML}
    <div class="tracker-actions" style="margin-top:18px;">
      ${u? `<button class="btn btn-outline" id="openChatBtn">💬 chat karein</button>`:""}
    </div>
  `;

  const chatBtn = document.getElementById("openChatBtn");
  if(chatBtn) chatBtn.addEventListener("click", ()=>openChatModal(job.id));

  wireTrackerActions(job, isUstaadView);
}

function buildTrackerActions(job, isUstaadView){
  if(job.status==="cancelled" || job.status==="completed") return "";
  if(!isUstaadView){
    // customer-side: waiting mostly, except pricing accept/decline handled above
    if(job.status==="selected") return `<p class="empty-note">Ustaad pricing set kar raha hai, thodi der intezaar karein...</p>`;
    return "";
  }
  // ustaad-side actionable buttons
  const html = [];
  if(job.status==="selected" && !job.pricing){
    html.push(`<div class="tracker-actions" style="flex-direction:column;align-items:stretch;gap:14px;">
      <p style="font-size:.85rem;">Pricing method chunein:</p>
      <div style="display:flex;gap:10px;">
        <button class="btn btn-outline" style="flex:1" data-set-pricing="before">Price before visit</button>
        <button class="btn btn-outline" style="flex:1" data-set-pricing="after">Price after inspection</button>
      </div>
    </div>`);
  }
  if(job.status==="selected" && job.pricing && job.pricing.type==="before" && job.pricing.accepted===undefined){
    html.push(`<p class="empty-note">Customer ki response ka intezaar hai...</p>`);
  }
  if(job.status==="selected" && job.pricing && (job.pricing.type==="after" || job.pricing.accepted===true)){
    html.push(`<div class="tracker-actions"><button class="btn btn-primary" data-set-arrival="1">arrival time set karein aur travel start karein</button></div>`);
  }
  if(job.status==="accepted"){
    html.push(`<div class="tracker-actions"><button class="btn btn-primary" data-advance="on_the_way">on the way — travel start</button></div>`);
  }
  if(job.status==="on_the_way"){
    html.push(`<div class="tracker-actions"><button class="btn btn-primary" data-advance="reached">reached destination</button></div>`);
  }
  if(job.status==="reached"){
    html.push(`<div class="tracker-actions">
      <button class="btn btn-primary" data-advance="in_progress">work start karein</button>
      <button class="btn btn-outline" data-cannot-complete="1">customer agree nahi / kaam nahi ho saka</button>
    </div>`);
  }
  if(job.status==="in_progress"){
    html.push(`<div class="tracker-actions">
      <button class="btn btn-primary" data-work-complete="1">work completed</button>
      <button class="btn btn-outline" data-cannot-complete="1">customer agree nahi / kaam nahi ho saka</button>
    </div>`);
  }
  return html.join("");
}

function wireTrackerActions(job, isUstaadView){
  const wrap = document.getElementById("trackerWrap");

  wrap.querySelectorAll("[data-accept-price]").forEach(b=>b.addEventListener("click",()=>{
    updateJob(job.id, j=>{ j.pricing.accepted = true; j.status="accepted"; });
    toast("Estimate accept ho gaya","Ustaad ab arrival time set karega.","success","✅");
    renderTracker(job.id);
  }));
  wrap.querySelectorAll("[data-decline-price]").forEach(b=>b.addEventListener("click",()=>{
    updateJob(job.id, j=>{ j.pricing.accepted = false; j.status="cancelled"; });
    toast("Estimate decline kar diya","Job cancel ho gayi hai.","error","❌");
    renderTracker(job.id);
  }));
  wrap.querySelectorAll("[data-set-pricing]").forEach(b=>b.addEventListener("click",()=>{
    const type = b.getAttribute("data-set-pricing");
    if(type==="before"){ openPricingBeforeModal(job.id); }
    else{
      updateJob(job.id, j=>{ j.pricing = {type:"after"}; });
      toast("Pricing set ho gayi","Price after inspection decide hogi.","success","📝");
      renderTracker(job.id);
    }
  }));
  wrap.querySelectorAll("[data-set-arrival]").forEach(b=>b.addEventListener("click",()=>{
    openArrivalModal(job.id);
  }));
  wrap.querySelectorAll("[data-advance]").forEach(b=>b.addEventListener("click",()=>{
    const next = b.getAttribute("data-advance");
    updateJob(job.id, j=> j.status = next);
    toast("Status update", "Job status: "+next.replace("_"," "), "success","🚚");
    renderTracker(job.id);
    refreshAllDashboards();
  }));
  wrap.querySelectorAll("[data-work-complete]").forEach(b=>b.addEventListener("click",()=>{
    openCompleteJobModal(job.id);
  }));
  wrap.querySelectorAll("[data-cannot-complete]").forEach(b=>b.addEventListener("click",()=>{
    openCannotCompleteModal(job.id);
  }));
}

function updateJob(jobId, mutator){
  const jobs = DB.get("jobs",[]);
  const job = jobs.find(j=>j.id===jobId);
  if(job) mutator(job);
  DB.set("jobs", jobs);
}

function openPricingBeforeModal(jobId){
  openModal(`
    <span class="modal-close" data-close-modal>✕</span>
    <h3>Price before visit</h3>
    <label class="field"><span>Material cost (Rs.)</span><input type="number" id="pbMaterial" min="0" placeholder="e.g. 800"></label>
    <label class="field"><span>Labor cost (Rs.)</span><input type="number" id="pbLabor" min="0" placeholder="e.g. 500"></label>
    <button class="btn btn-primary full" id="pbSubmit">estimate customer ko bhejein</button>
  `);
  document.getElementById("pbSubmit").addEventListener("click", ()=>{
    const material = +document.getElementById("pbMaterial").value || 0;
    const labor = +document.getElementById("pbLabor").value || 0;
    if(material+labor<=0){ toast("Amount darj karein","Material ya labor cost zaroori hai.","error","⚠️"); return; }
    updateJob(jobId, j=>{ j.pricing = {type:"before", material, labor, total:material+labor}; });
    closeModal();
    toast("Estimate bhej diya","Customer ke response ka intezaar karein.","success","📤");
    renderTracker(jobId);
  });
}

function openArrivalModal(jobId){
  openModal(`
    <span class="modal-close" data-close-modal>✕</span>
    <h3>Arrival time set karein</h3>
    <label class="field"><span>Aap kab pahunchenge?</span>
      <select id="arrivalTime">
        <option>15 minutes mein</option><option>30 minutes mein</option><option>1 ghantay mein</option><option>Aaj shaam</option>
      </select>
    </label>
    <button class="btn btn-primary full" id="arrivalSubmit">confirm karein aur travel start karein</button>
  `);
  document.getElementById("arrivalSubmit").addEventListener("click", ()=>{
    const time = document.getElementById("arrivalTime").value;
    updateJob(jobId, j=>{ j.status="accepted"; j.arrivalTime=time; });
    closeModal();
    toast("Arrival confirm","Aap "+time+" pahunch rahe hain.","success","🚗");
    renderTracker(jobId);
    refreshAllDashboards();
  });
}

function openCompleteJobModal(jobId){
  openModal(`
    <span class="modal-close" data-close-modal>✕</span>
    <h3>Work completed — final bill</h3>
    <label class="field"><span>Material cost (Rs.)</span><input type="number" id="fMaterial" min="0"></label>
    <label class="field"><span>Labor cost (Rs.)</span><input type="number" id="fLabor" min="0"></label>
    <p style="font-size:.78rem;color:var(--slate-dim);margin:6px 0 14px;">Payment customer se direct li jayegi (cash/EasyPaisa/JazzCash/bank). Yeh sirf record hoga.</p>
    <button class="btn btn-primary full" id="fSubmit">kaam mukammal karein</button>
  `);
  document.getElementById("fSubmit").addEventListener("click", ()=>{
    const material = +document.getElementById("fMaterial").value || 0;
    const labor = +document.getElementById("fLabor").value || 0;
    updateJob(jobId, j=>{
      j.pricing = j.pricing || {};
      j.pricing.final = {material,labor,total:material+labor};
      j.status = "completed";
      j.completedAt = Date.now();
    });
    // bump ustaad earnings
    bumpUstaadEarnings(jobId, material+labor);
    closeModal();
    toast("Kaam mukammal!","Customer ko review ke liye notify kar diya gaya hai.","success","🎉");
    renderTracker(jobId);
    refreshAllDashboards();
    setTimeout(()=> maybeShowRatingModal(jobId), 900);
  });
}

function openCannotCompleteModal(jobId){
  const jobs = DB.get("jobs",[]);
  const job = jobs.find(j=>j.id===jobId);
  const fee = job.applicants.find(a=>a.ustaadId===job.selectedUstaadId)?.ustaad.visitingFee || 0;
  openModal(`
    <span class="modal-close" data-close-modal>✕</span>
    <h3>Customer agree nahi / kaam nahi ho saka</h3>
    <p style="margin-bottom:14px;">Is case mein sirf visiting fee applicable hogi, jo customer se direct li jayegi.</p>
    <div class="pricing-box"><div class="price-line total"><span>Visiting fee</span><span>${money(fee)}</span></div></div>
    <label class="field" style="margin-top:14px;"><span>Reason (optional)</span><textarea id="ccReason" rows="3" placeholder="e.g. customer ne price par agree nahi kiya"></textarea></label>
    <button class="btn btn-primary full" id="ccSubmit">confirm karein</button>
  `);
  document.getElementById("ccSubmit").addEventListener("click", ()=>{
    updateJob(jobId, j=>{ j.status="cancelled"; j.cancelReason = document.getElementById("ccReason").value.trim(); j.visitingFeeCharged = fee; });
    closeModal();
    toast("Job band kar di gayi","Sirf visiting fee record ki gayi hai.","default","🔕");
    renderTracker(jobId);
    refreshAllDashboards();
  });
}

function bumpUstaadEarnings(jobId, amount){
  const profile = DB.get("ustaadProfile");
  const jobs = DB.get("jobs",[]);
  const job = jobs.find(j=>j.id===jobId);
  if(profile && job && job.selectedUstaadId===profile.id){
    profile.monthlyEarnings = (profile.monthlyEarnings||0)+amount;
    profile.totalEarnings = (profile.totalEarnings||0)+amount;
    profile.completedJobs = (profile.completedJobs||0)+1;
    DB.set("ustaadProfile", profile);
  }
}

function maybeShowRatingModal(jobId){
  const jobs = DB.get("jobs",[]);
  const job = jobs.find(j=>j.id===jobId);
  if(!job || job.status!=="completed" || job.rated) return;
  const u = job.applicants.find(a=>a.ustaadId===job.selectedUstaadId).ustaad;
  let rating = 0;
  openModal(`
    <span class="modal-close" data-close-modal>✕</span>
    <h3 style="text-align:center;">Service kaisi rahi?</h3>
    <p style="text-align:center;">${u.name} ne aapka kaam mukammal kar diya hai</p>
    <div class="star-rate" id="starRate">${[1,2,3,4,5].map(n=>`<span data-star="${n}">★</span>`).join("")}</div>
    <label class="field"><span>Review (optional)</span><textarea id="reviewText" rows="3" placeholder="Apna tajurba likhein..."></textarea></label>
    <div style="display:flex;gap:10px;margin:12px 0;">
      <button class="btn btn-outline full" id="problemNo">masla solve nahi hua</button>
      <button class="btn btn-outline full" id="problemYes">✅ masla solve ho gaya</button>
    </div>
    <button class="btn btn-primary full" id="reviewSubmit">review submit karein</button>
  `);
  let solved = true;
  document.getElementById("problemYes").onclick=()=>{solved=true;toast("Great!","Shukriya feedback ke liye.","success","😊");};
  document.getElementById("problemNo").onclick=()=>{solved=false;toast("Noted","Hume afsos hai, feedback save ho gaya.","default","😕");};
  document.querySelectorAll("#starRate span").forEach(s=>{
    s.addEventListener("click", ()=>{
      rating = +s.getAttribute("data-star");
      document.querySelectorAll("#starRate span").forEach(x=> x.classList.toggle("active", +x.getAttribute("data-star")<=rating));
    });
  });
  document.getElementById("reviewSubmit").addEventListener("click", ()=>{
    if(!rating){ toast("Rating den","Kam az kam ek star select karein.","error","⚠️"); return; }
    updateJob(jobId, j=>{ j.rated=true; j.rating=rating; j.review=document.getElementById("reviewText").value.trim(); j.problemSolved=solved; });
    closeModal();
    toast("Shukriya!","Aapki review save ho gayi hai.","success","🌟");
    refreshAllDashboards();
  });
}

/* ==========================================================
   CUSTOMER DASHBOARD
   ========================================================== */
function renderCustomerDashboard(){
  const customer = DB.get("customer");
  document.getElementById("custName").textContent = customer.name.split(" ")[0];
  const jobs = DB.get("jobs",[]);
  const active = jobs.filter(j=> !["completed","cancelled"].includes(j.status));
  const done = jobs.filter(j=> ["completed","cancelled"].includes(j.status));

  document.getElementById("kpiActive").textContent = active.length;
  document.getElementById("kpiSelected").textContent = jobs.filter(j=>j.selectedUstaadId).length;
  document.getElementById("kpiCompleted").textContent = jobs.filter(j=>j.status==="completed").length;
  document.getElementById("kpiReviews").textContent = jobs.filter(j=>j.rated).length;

  const activeBox = document.getElementById("custActiveJobs");
  activeBox.innerHTML = active.length ? active.map(j=>jobCardHTML(j,"customer")).join("") : `<p class="empty-note">Koi active request nahi hai.</p>`;
  const histBox = document.getElementById("custHistoryJobs");
  histBox.innerHTML = done.length ? done.map(j=>jobCardHTML(j,"customer")).join("") : `<p class="empty-note">Abhi tak koi completed job nahi.</p>`;

  wireJobCardClicks("customer");
}

function jobCardHTML(job, mode){
  const cat = CATEGORIES.find(c=>c.id===job.category);
  const u = job.selectedUstaadId ? job.applicants.find(a=>a.ustaadId===job.selectedUstaadId)?.ustaad : null;
  let statusClass="status-new", statusLabel=job.status.replace("_"," ");
  if(["accepted","on_the_way","reached","in_progress"].includes(job.status)) statusClass="status-progress";
  if(job.status==="completed") statusClass="status-done";
  if(job.status==="cancelled") statusClass="status-cancelled";
  if(job.status==="open") statusLabel="applicants dekhein";
  if(job.status==="finding") statusLabel="finding ustaads";

  return `<div class="job-card" data-job-click="${job.id}" data-mode="${mode}">
    <div class="job-card-left">
      <h4>${cat?cat.icon+" "+cat.name:"Service"} ${u? "— "+u.name:""}</h4>
      <p>${job.location || ""} ${job.description ? " · "+job.description.slice(0,40) : ""}</p>
    </div>
    <span class="job-card-status ${statusClass}">${statusLabel}</span>
  </div>`;
}

function wireJobCardClicks(mode){
  document.querySelectorAll("[data-job-click]").forEach(card=>{
    card.addEventListener("click", ()=>{
      const jobId = card.getAttribute("data-job-click");
      const jobs = DB.get("jobs",[]);
      const job = jobs.find(j=>j.id===jobId);
      if(!job) return;
      if(job.status==="finding"){ showView("finding",{jobId}); runFindingSimulation.paused=true; return; }
      if(job.status==="open"){ showView("compare",{jobId}); return; }
      showView("tracker", {jobId, mode});
      navContext.mode = mode;
    });
  });
}

/* ==========================================================
   USTAAD: APPLICATION FLOW
   ========================================================== */
let uStep = 1;
let uDraft = {photos:{}};

function renderUstaadApply(){
  uStep=1; uDraft={photos:{}};
  document.getElementById("ustaadForm").reset();
  ["uPhotoPreview","uCnicFrontPreview","uCnicBackPreview","uPolicePreview"].forEach(id=>document.getElementById(id).innerHTML="");
  updateUStepper();
  const grid = document.getElementById("uSkillGrid");
  grid.innerHTML = CATEGORIES.map(c=>`<div class="cat-select" data-cat="${c.id}"><div class="cat-icon">${c.icon}</div><h4>${c.name}</h4></div>`).join("");
  grid.querySelectorAll(".cat-select").forEach(el=>{
    el.addEventListener("click", ()=>{
      grid.querySelectorAll(".cat-select").forEach(x=>x.classList.remove("selected"));
      el.classList.add("selected");
      uDraft.skill = el.getAttribute("data-cat");
    });
  });
}

function wireFileField(inputId, previewId, key){
  document.getElementById(inputId).addEventListener("change",(e)=>{
    const preview = document.getElementById(previewId);
    preview.innerHTML="";
    const f = e.target.files[0];
    if(!f) return;
    uDraft.photos[key] = f.name;
    if(f.type.startsWith("image/")){
      const img = document.createElement("img"); img.src=URL.createObjectURL(f); preview.appendChild(img);
    } else {
      const chip = document.createElement("div"); chip.className="file-chip"; chip.textContent="📄 "+f.name; preview.appendChild(chip);
    }
  });
}
wireFileField("uPhoto","uPhotoPreview","profilePhoto");
wireFileField("uCnicFront","uCnicFrontPreview","cnicFront");
wireFileField("uCnicBack","uCnicBackPreview","cnicBack");
wireFileField("uPolice","uPolicePreview","police");

function updateUStepper(){
  document.querySelectorAll("#ustaadStepper .step").forEach(s=>{
    const n = +s.getAttribute("data-step");
    s.classList.toggle("active", n===uStep);
    s.classList.toggle("done", n<uStep);
  });
  document.querySelectorAll("#ustaadForm .form-step").forEach(s=>{
    s.classList.toggle("active", +s.getAttribute("data-step")===uStep);
  });
  document.getElementById("uPrev").style.visibility = uStep===1?"hidden":"visible";
  document.getElementById("uNext").classList.toggle("hidden", uStep===4);
  document.getElementById("uSubmit").classList.toggle("hidden", uStep!==4);
  if(uStep===4) buildUstaadReview();
}

function buildUstaadReview(){
  uDraft.fullName = document.getElementById("uFullName").value.trim();
  uDraft.phone = document.getElementById("uPhone").value.trim();
  uDraft.cnic = document.getElementById("uCnic").value.trim();
  uDraft.experience = document.getElementById("uExp").value;
  uDraft.city = document.getElementById("uCity").value;
  uDraft.areas = document.getElementById("uAreas").value.trim();
  uDraft.visitingFee = document.getElementById("uVisitingFee").value;
  uDraft.guarantee = document.getElementById("uGuarantee").value;
  const cat = CATEGORIES.find(c=>c.id===uDraft.skill);
  const box = document.getElementById("ustaadReviewBox");
  box.innerHTML = `
    <div class="review-row"><span>Full name</span><span>${uDraft.fullName||"—"}</span></div>
    <div class="review-row"><span>Phone</span><span>${uDraft.phone||"—"}</span></div>
    <div class="review-row"><span>CNIC</span><span>${uDraft.cnic||"—"}</span></div>
    <div class="review-row"><span>Skill</span><span>${cat?cat.icon+" "+cat.name:"—"}</span></div>
    <div class="review-row"><span>Experience</span><span>${uDraft.experience||0} saal</span></div>
    <div class="review-row"><span>City / Areas</span><span>${uDraft.city}, ${uDraft.areas||"—"}</span></div>
    <div class="review-row"><span>Visiting fee</span><span>${uDraft.visitingFee?money(uDraft.visitingFee):"—"}</span></div>
    <div class="review-row"><span>Guarantee</span><span>${uDraft.guarantee}</span></div>
    <div class="review-row"><span>Documents</span><span>${Object.keys(uDraft.photos).length}/4 uploaded</span></div>
  `;
}

document.getElementById("uNext").addEventListener("click",()=>{
  if(uStep===1){
    const name=document.getElementById("uFullName").value.trim(), phone=document.getElementById("uPhone").value.trim(), cnic=document.getElementById("uCnic").value.trim();
    if(!name||!phone||!cnic){ toast("Fields mukammal karein","Naam, phone aur CNIC zaroori hain.","error","⚠️"); return; }
  }
  if(uStep===2 && !uDraft.skill){ toast("Skill chunain","Apni skill select karein.","error","⚠️"); return; }
  uStep = Math.min(4, uStep+1);
  updateUStepper();
});
document.getElementById("uPrev").addEventListener("click",()=>{ uStep=Math.max(1,uStep-1); updateUStepper(); });

document.getElementById("ustaadForm").addEventListener("submit",(e)=>{
  e.preventDefault();
  buildUstaadReview();
  if(Object.keys(uDraft.photos).length<4){ toast("Documents zaroori hain","Sab 4 documents upload karein (profile photo, CNIC front/back, police verification).","error","⚠️"); return; }
  const profile = {
    id: uid("ustself"),
    name: uDraft.fullName, phone: uDraft.phone, cnic: uDraft.cnic,
    skill: uDraft.skill, skillName: (CATEGORIES.find(c=>c.id===uDraft.skill)||{}).name,
    experience: +uDraft.experience||0, city: uDraft.city, areas: uDraft.areas,
    visitingFee: +uDraft.visitingFee||0, guarantee: uDraft.guarantee,
    photo: avatarUrl(randInt(1,70)),
    status:"pending", // pending -> verified -> rejected
    membershipActive:false,
    online:false,
    rating:0, completedJobs:0, responseRate:randInt(85,98),
    monthlyEarnings:0, totalEarnings:0,
    createdAt: Date.now(),
  };
  DB.set("ustaadProfile", profile);
  toast("Application submit ho gayi","Verification process shuru ho rahi hai.","success","📨");
  showView("ustaad-verification");
});

/* ---------- VERIFICATION SIMULATION ---------- */
function renderUstaadVerification(){
  const profile = DB.get("ustaadProfile");
  const card = document.getElementById("verifyCard");
  if(!profile){ card.innerHTML = `<p>Koi application nahi mili.</p>`; return; }

  if(profile.status==="pending"){
    card.innerHTML = `
      <div class="verify-icon">🕒</div>
      <h2>Verification in progress...</h2>
      <p>Aapki documents ka review ho raha hai. Ismein CNIC match, police verification aur profile check shamil hai.</p>
      <div class="verify-progress"><div class="verify-progress-bar" id="verifyBar"></div></div>
      <p id="verifyStatusText" style="font-size:.82rem;">Documents scan ho rahe hain...</p>
    `;
    let pct = 0;
    const bar = document.getElementById("verifyBar");
    const text = document.getElementById("verifyStatusText");
    const msgs = ["Documents scan ho rahe hain...","CNIC verify ki ja rahi hai...","Police verification check ho raha hai...","Profile ko finalize kiya ja raha hai..."];
    let mi=0;
    const iv = setInterval(()=>{
      pct += randInt(12,22);
      if(pct>=100){ pct=100; clearInterval(iv); }
      bar.style.width = pct+"%";
      if(mi<msgs.length-1 && pct> (mi+1)*22) mi++;
      text.textContent = msgs[mi];
      if(pct===100){
        setTimeout(()=>{
          const p = DB.get("ustaadProfile");
          // 90% approval simulation
          p.status = Math.random()<0.9 ? "verified" : "rejected";
          DB.set("ustaadProfile", p);
          renderUstaadVerification();
        }, 700);
      }
    }, 500);
  } else if(profile.status==="verified"){
    card.innerHTML = `
      <div class="verify-icon">✅</div>
      <h2>Mubarak ho, aap verified hain!</h2>
      <p>Aapki documents successfully verify ho gayi hain. Ab membership activate karke apna profile live karein.</p>
      <button class="btn btn-primary btn-lg" id="goMembership">membership activate karein →</button>
    `;
    document.getElementById("goMembership").addEventListener("click", ()=> showView("ustaad-membership"));
  } else {
    card.innerHTML = `
      <div class="verify-icon">❌</div>
      <h2>Application reject ho gayi</h2>
      <p>Bad-qismati se aapki documents verify nahi ho sakin. Dobara sahi documents ke sath apply karein.</p>
      <button class="btn btn-primary btn-lg" id="reapply">dobara apply karein</button>
    `;
    document.getElementById("reapply").addEventListener("click", ()=>{ DB.set("ustaadProfile", null); showView("ustaad-apply"); });
  }
}

/* ---------- MEMBERSHIP PAYMENT ---------- */
let selectedPayMethod = "easypaisa";
function renderUstaadMembership(){
  selectedPayMethod="easypaisa";
  document.querySelectorAll(".pay-method").forEach(b=>b.classList.toggle("active", b.getAttribute("data-method")===selectedPayMethod));
  renderPayForm();
}
document.getElementById("payMethods").addEventListener("click",(e)=>{
  const btn = e.target.closest(".pay-method");
  if(!btn) return;
  selectedPayMethod = btn.getAttribute("data-method");
  document.querySelectorAll(".pay-method").forEach(b=>b.classList.toggle("active", b===btn));
  renderPayForm();
});
function renderPayForm(){
  const form = document.getElementById("payForm");
  if(selectedPayMethod==="bank"){
    form.innerHTML = `<label class="field"><span>Account title</span><input type="text" placeholder="Your full name"></label>
    <label class="field"><span>Bank</span><input type="text" placeholder="e.g. Meezan Bank"></label>`;
  } else {
    form.innerHTML = `<label class="field"><span>${selectedPayMethod==='easypaisa'?'EasyPaisa':'JazzCash'} number</span><input type="tel" placeholder="03XX-XXXXXXX"></label>
    <label class="field"><span>PIN (demo — koi bhi 4 digit)</span><input type="password" maxlength="4" placeholder="••••"></label>`;
  }
}
document.getElementById("payNowBtn").addEventListener("click",()=>{
  const btn = document.getElementById("payNowBtn");
  btn.disabled = true; btn.textContent = "processing payment...";
  setTimeout(()=>{
    const profile = DB.get("ustaadProfile");
    profile.membershipActive = true;
    profile.membershipMethod = selectedPayMethod;
    profile.membershipDate = Date.now();
    profile.online = true;
    DB.set("ustaadProfile", profile);
    btn.disabled=false; btn.textContent="Rs. 2,500 pay karein";
    toast("Membership activate ho gayi!","Aapka profile ab customers ko dikh raha hai.","success","🎉");
    showView("ustaad-dashboard");
  }, 1600);
});

/* ==========================================================
   USTAAD DASHBOARD
   ========================================================== */
function renderUstaadDashboard(){
  const profile = DB.get("ustaadProfile");
  if(!profile) return;
  document.getElementById("ustaadName").textContent = profile.name.split(" ")[0];
  const badge = document.getElementById("ustaadBadge");
  badge.textContent = profile.status==="verified" ? "verified" : profile.status;
  badge.className = "badge "+(profile.status==="verified"?"badge-verified":profile.status==="pending"?"badge-pending":"badge-rejected");

  const toggle = document.getElementById("onlineToggle");
  toggle.classList.toggle("on", !!profile.online);
  document.getElementById("onlineLabel").textContent = profile.online?"online":"offline";
  toggle.onclick = ()=>{
    profile.online = !profile.online;
    DB.set("ustaadProfile", profile);
    renderUstaadDashboard();
  };

  // gather jobs relevant to this ustaad (matched by skill, simulate as if this is one of the pool ustaads assigned)
  const jobs = DB.get("jobs",[]);
  const skillJobs = jobs.filter(j=>j.category===profile.skill);
  const newReq = skillJobs.filter(j=> j.status==="open" && !j.selectedUstaadId);
  const active = skillJobs.filter(j=> j.selectedUstaadId && !["completed","cancelled"].includes(j.status) && isThisUstaadInvolved(j, profile));
  const completed = skillJobs.filter(j=> j.status==="completed" && isThisUstaadInvolved(j, profile));

  document.getElementById("uKpiNew").textContent = newReq.length;
  document.getElementById("uKpiActive").textContent = active.length;
  document.getElementById("uKpiCompleted").textContent = profile.completedJobs || completed.length;
  document.getElementById("uKpiMonthly").textContent = money(profile.monthlyEarnings||0);
  document.getElementById("uKpiTotal").textContent = money(profile.totalEarnings||0);
  document.getElementById("uKpiRating").textContent = (completed.length? "4.8":"—")+" / "+profile.responseRate+"%";

  const newBox = document.getElementById("ustaadNewJobs");
  newBox.innerHTML = newReq.length ? newReq.map(j=>ustaadJobRequestHTML(j, profile)).join("") : `<p class="empty-note">Abhi koi naya job nahi hai — online rahein taake requests aayein.</p>`;
  newBox.querySelectorAll("[data-simapply]").forEach(btn=> btn.addEventListener("click", ()=>{
    toast("Apply ho gaya (demo)","Yeh feature customer-side applicant list mein already simulate ho chuka hai. Customer dashboard se poora flow dekhein.","default","ℹ️");
  }));

  const activeBox = document.getElementById("ustaadActiveJobs");
  activeBox.innerHTML = active.length ? active.map(j=>jobCardHTML(j,"ustaad")).join("") : `<p class="empty-note">Koi active job nahi.</p>`;

  const histBox = document.getElementById("ustaadHistoryJobs");
  histBox.innerHTML = completed.length ? completed.map(j=>jobCardHTML(j,"ustaad")).join("") : `<p class="empty-note">Abhi tak koi completed job nahi.</p>`;

  wireJobCardClicks("ustaad");
}

function isThisUstaadInvolved(job, profile){
  // In this prototype, the logged-in ustaad "adopts" the identity of the selected applicant of matching skill so the flow is demoable end-to-end.
  return job.selectedUstaadId && job.applicants.some(a=>a.ustaadId===job.selectedUstaadId && a.ustaad.skill===profile.skill);
}

function ustaadJobRequestHTML(job, profile){
  const cat = CATEGORIES.find(c=>c.id===job.category);
  return `<div class="job-card">
    <div class="job-card-left">
      <h4>${cat?cat.icon+" "+cat.name:"Service"}</h4>
      <p>${job.location} · ${job.description ? job.description.slice(0,50):""}</p>
    </div>
    <button class="btn btn-primary" data-simapply="${job.id}">apply karein</button>
  </div>`;
}

function refreshAllDashboards(){
  if(document.getElementById("view-customer-dashboard").classList.contains("active")) renderCustomerDashboard();
  if(document.getElementById("view-ustaad-dashboard").classList.contains("active")) renderUstaadDashboard();
}

/* ==========================================================
   AI ASSISTANT (rule based)
   ========================================================== */
const AI_RULES = [
  {kw:["pipe","leak","tap","paani","plumbing","pani","nal","toilet","flush"],cat:"plumber",reply:"Yeh plumbing ka masla lagta hai — main aapko Plumber category recommend karta hoon."},
  {kw:["ac","thanda","cooling","gas","split unit"],cat:"ac",reply:"AC cooling issue? AC Technician category behtar rahegi."},
  {kw:["bijli","light","switch","wiring","short circuit","fuse","electric"],cat:"electrician",reply:"Yeh electrical masla hai — Electrician category select karein."},
  {kw:["bike","car","gaari","engine","battery"],cat:"mechanic",reply:"Vehicle ka masla hai — Mechanic category try karein."},
  {kw:["paint","rang","deewar"],cat:"painter",reply:"Painting ka kaam hai — Painter category select karein."},
  {kw:["washing machine","fridge","freezer","microwave","appliance"],cat:"appliance",reply:"Yeh appliance repair ka case hai — Appliance Repair category behtar rahegi."},
];

function aiRespond(text){
  const lower = text.toLowerCase();
  const match = AI_RULES.find(r=> r.kw.some(k=> lower.includes(k)));
  if(match) return {reply: match.reply, cat: match.cat};
  return {reply:"Mujhe pura yaqeen nahi, lekin aap 'i need a service' par ja kar sahi category khud bhi select kar sakte hain. Thodi aur detail den?", cat:null};
}

const aiFab = document.getElementById("aiFab");
const aiPanel = document.getElementById("aiPanel");
const aiMessages = document.getElementById("aiMessages");
aiFab.addEventListener("click", ()=>{
  aiPanel.classList.toggle("open");
  if(aiPanel.classList.contains("open") && !aiMessages.dataset.greeted){
    addAiMsg("bot","Assalam-o-Alaikum! Main Kaam Krwao AI hoon 🤖. Apna masla batayein, main sahi ustaad category suggest kar dunga — e.g. 'AC thanda nahi kar raha' ya 'tap se paani leak ho raha hai'.");
    aiMessages.dataset.greeted="1";
  }
});
document.getElementById("aiClose").addEventListener("click", ()=> aiPanel.classList.remove("open"));

function addAiMsg(who, text){
  const div = document.createElement("div");
  div.className = "ai-msg "+(who==="bot"?"bot":"user");
  div.textContent = text;
  aiMessages.appendChild(div);
  aiMessages.scrollTop = aiMessages.scrollHeight;
}

function aiSendHandler(){
  const input = document.getElementById("aiInput");
  const text = input.value.trim();
  if(!text) return;
  addAiMsg("user", text);
  input.value="";
  setTimeout(()=>{
    const res = aiRespond(text);
    addAiMsg("bot", res.reply);
    if(res.cat){
      const btnWrap = document.createElement("div");
      btnWrap.style.alignSelf="flex-start";
      const btn = document.createElement("button");
      btn.className="btn btn-primary"; btn.style.fontSize=".78rem"; btn.style.padding="8px 14px";
      btn.textContent="problem post karein →";
      btn.addEventListener("click", ()=>{ preselectCategory=res.cat; showView("post-job"); aiPanel.classList.remove("open"); });
      btnWrap.appendChild(btn);
      aiMessages.appendChild(btnWrap);
      aiMessages.scrollTop = aiMessages.scrollHeight;
    }
  }, 650);
}
document.getElementById("aiSend").addEventListener("click", aiSendHandler);
document.getElementById("aiInput").addEventListener("keydown",(e)=>{ if(e.key==="Enter") aiSendHandler(); });

/* ==========================================================
   NAVBAR SCROLL SHADOW + INIT
   ========================================================== */
window.addEventListener("scroll", ()=>{
  document.getElementById("navbar").style.boxShadow = window.scrollY>10 ? "0 8px 30px -12px rgba(0,0,0,.5)" : "none";
});

/* boot */
showView("home");
toast("Welcome to Kaam Krwao 👋","Har kaam ka ustaad, aapke qareeb. Demo prototype explore karein.","default","🛠️");

})();
