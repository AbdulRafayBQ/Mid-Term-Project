/* =========================================================
   KAAM KRWAO — APP.JS
   Premium White 3D Interactive Version (FIXED)
   ========================================================= */

"use strict";

/* =========================================================
   GLOBAL STATE
   ========================================================= */

const state = {

  currentView: "home",

  jobs: [],

  selectedCategory: null,

  online: true,

  aiOpen: false,

  mouseX: 0,

  mouseY: 0

};


/* =========================================================
   HELPERS
   ========================================================= */

const $ = (selector, parent = document) =>
  parent.querySelector(selector);

const $$ = (selector, parent = document) =>
  [...parent.querySelectorAll(selector)];


function escapeHTML(value){

  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

}


/* =========================================================
   LOCAL STORAGE
   ========================================================= */

function saveState(){

  try{

    localStorage.setItem(
      "kaamKrwaoJobs",
      JSON.stringify(state.jobs)
    );

  }catch(error){

    console.warn(
      "Could not save jobs:",
      error
    );

  }

}


function loadState(){

  try{

    const saved =
      localStorage.getItem("kaamKrwaoJobs");

    if(saved){

      const parsed =
        JSON.parse(saved);

      if(Array.isArray(parsed)){

        state.jobs = parsed;

      }

    }

  }catch(error){

    console.warn(
      "Could not load jobs:",
      error
    );

  }

}


/* =========================================================
   TOAST
   ========================================================= */

function toast(message, type = "success"){

  const stack =
    $("#toastStack");

  if(!stack){

    alert(message);
    return;

  }


  const item =
    document.createElement("div");

  item.className =
    `toast toast-${type}`;

  item.textContent =
    message;

  stack.appendChild(item);


  requestAnimationFrame(() => {

    item.classList.add("show");

  });


  setTimeout(() => {

    item.classList.remove("show");

    setTimeout(() => {

      item.remove();

    }, 250);

  }, 3000);

}


/* =========================================================
   NAVIGATION
   ========================================================= */

function navigate(viewName){

  if(!viewName){
    return;
  }


  const views =
    $$(".view");

  views.forEach(view => {

    view.classList.remove("active");

  });


  const target =
    $(`#view-${viewName}`);

  if(!target){

    console.warn(
      `View not found: ${viewName}`
    );

    return;

  }


  target.classList.add("active");

  state.currentView =
    viewName;


  window.scrollTo({
    top:0,
    behavior:"smooth"
  });


  closeMobileMenu();


  if(viewName === "customer-dashboard"){

    renderCustomerDashboard();

  }


  if(viewName === "ustaad-dashboard"){

    renderUstaadDashboard();

  }


  refresh3DScene();

}


/* =========================================================
   NAVIGATION EVENTS
   ========================================================= */

function setupNavigation(){

  $$("[data-nav]").forEach(element => {

    element.addEventListener(
      "click",
      event => {

        event.preventDefault();

        const target =
          element.dataset.nav;

        navigate(target);

      }
    );

  });


  $$(".nav-link[href^='#']").forEach(link => {

    link.addEventListener(
      "click",
      event => {

        const target =
          link.getAttribute("href");

        if(!target){
          return;
        }

        const section =
          $(target);

        if(section){

          event.preventDefault();

          const offset =
            section.getBoundingClientRect().top +
            window.scrollY -
            80;

          window.scrollTo({

            top:offset,

            behavior:"smooth"

          });

        }

      }
    );

  });

}


/* =========================================================
   MOBILE MENU
   ========================================================= */

function setupMobileMenu(){

  const burger =
    $("#navBurger");

  const nav =
    $("#navLinks");

  if(!burger || !nav){
    return;
  }


  burger.addEventListener(
    "click",
    () => {

      const open =
        nav.classList.toggle("mobile-open");

      burger.setAttribute(
        "aria-expanded",
        String(open)
      );

    }
  );

}


function closeMobileMenu(){

  const nav =
    $("#navLinks");

  const burger =
    $("#navBurger");

  if(nav){

    nav.classList.remove(
      "mobile-open"
    );

  }

  if(burger){

    burger.setAttribute(
      "aria-expanded",
      "false"
    );

  }

}


/* =========================================================
   JOB FORM
   ========================================================= */

function setupJobForm(){

  const form =
    $("#postJobForm");

  if(!form){
    return;
  }


  form.addEventListener(
    "submit",
    event => {

      event.preventDefault();


      const formData =
        new FormData(form);


      const job = {

        id:
          Date.now(),

        title:
          formData.get("jobTitle")?.trim() ||
          "Untitled Job",

        category:
          formData.get("jobCategory") ||
          "other",

        description:
          formData.get("jobDescription")?.trim() ||
          "",

        location:
          formData.get("jobLocation")?.trim() ||
          "",

        budget:
          Number(
            formData.get("jobBudget") || 0
          ),

        urgency:
          formData.get("jobUrgency") ||
          "normal",

        status:
          "posted",

        createdAt:
          new Date().toISOString()

      };


      state.jobs.unshift(job);

      saveState();

      form.reset();


      toast(
        "Job successfully post ho gaya! 🎉"
      );


      renderCustomerDashboard();


      setTimeout(() => {

        navigate(
          "customer-dashboard"
        );

      }, 350);

    }
  );

}


/* =========================================================
   CUSTOMER DASHBOARD
   ========================================================= */

function renderCustomerDashboard(){

  const active =
    state.jobs.filter(
      job =>
        job.status === "posted" ||
        job.status === "active"
    );

  const completed =
    state.jobs.filter(
      job =>
        job.status === "completed"
    );


  const activeElement =
    $("#cKpiActive");

  const completedElement =
    $("#cKpiCompleted");

  const chosenElement =
    $("#cKpiChosen");

  const reviewsElement =
    $("#cKpiReviews");


  if(activeElement){

    activeElement.textContent =
      active.length;

  }


  if(completedElement){

    completedElement.textContent =
      completed.length;

  }


  if(chosenElement){

    chosenElement.textContent =
      state.jobs.filter(
        job =>
          job.status === "accepted"
      ).length;

  }


  if(reviewsElement){

    reviewsElement.textContent =
      completed.length;

  }


  const container =
    $("#customerJobs");

  if(!container){
    return;
  }


  if(!state.jobs.length){

    container.innerHTML = `

      <p class="empty-note">

        Abhi koi job post nahi ki.

      </p>

    `;

    return;

  }


  container.innerHTML =
    state.jobs
      .map(renderCustomerJob)
      .join("");

}


function renderCustomerJob(job){

  const statusMap = {

    posted:
      "🟠 Posted",

    active:
      "🔵 Active",

    accepted:
      "🟣 Ustaad Selected",

    completed:
      "🟢 Completed"

  };


  return `

    <article
      class="job-card"
      data-job-id="${job.id}"
    >

      <div>

        <span class="badge">
          ${escapeHTML(
            statusMap[job.status] ||
            job.status
          )}
        </span>

        <h3 style="margin-top:10px;">
          ${escapeHTML(job.title)}
        </h3>

        <p style="
          color:#6d727c;
          margin-top:7px;
        ">
          ${escapeHTML(job.description)}
        </p>

        <p style="
          color:#6d727c;
          margin-top:8px;
          font-size:.85rem;
        ">
          📍 ${escapeHTML(job.location)}
        </p>

      </div>

      <div style="
        margin-top:15px;
        display:flex;
        justify-content:space-between;
        gap:10px;
        flex-wrap:wrap;
      ">

        <strong>
          ${
            job.budget
              ? `Rs. ${Number(job.budget).toLocaleString()}`
              : "Budget not specified"
          }
        </strong>

        <span>
          ${escapeHTML(job.category)}
        </span>

      </div>

    </article>

  `;

}


/* =========================================================
   USTAAD DASHBOARD
   ========================================================= */

function renderUstaadDashboard(){

  const newJobs =
    state.jobs.filter(
      job =>
        job.status === "posted"
    );

  const activeJobs =
    state.jobs.filter(
      job =>
        job.status === "active" ||
        job.status === "accepted"
    );

  const completedJobs =
    state.jobs.filter(
      job =>
        job.status === "completed"
    );


  const newElement =
    $("#uKpiNew");

  const activeElement =
    $("#uKpiActive");

  const completedElement =
    $("#uKpiCompleted");

  const monthlyElement =
    $("#uKpiMonthly");

  const totalElement =
    $("#uKpiTotal");

  const ratingElement =
    $("#uKpiRating");


  if(newElement){

    newElement.textContent =
      newJobs.length;

  }


  if(activeElement){

    activeElement.textContent =
      activeJobs.length;

  }


  if(completedElement){

    completedElement.textContent =
      completedJobs.length;

  }


  const total =
    state.jobs.reduce(
      (sum, job) =>
        sum + Number(job.budget || 0),
      0
    );


  if(totalElement){

    totalElement.textContent =
      `Rs. ${total.toLocaleString()}`;

  }


  if(monthlyElement){

    monthlyElement.textContent =
      `Rs. ${total.toLocaleString()}`;

  }


  if(ratingElement){

    ratingElement.textContent =
      state.jobs.length
        ? "4.9 ⭐"
        : "—";

  }


  renderUstaadJobs(
    "#ustaadNewJobs",
    newJobs,
    true
  );


  renderUstaadJobs(
    "#ustaadActiveJobs",
    activeJobs,
    false
  );


  renderUstaadJobs(
    "#ustaadHistoryJobs",
    completedJobs,
    false
  );

}


function renderUstaadJobs(
  selector,
  jobs,
  allowAccept
){

  const container =
    $(selector);

  if(!container){
    return;
  }


  if(!jobs.length){

    container.innerHTML = `

      <p class="empty-note">
        Abhi koi job available nahi.
      </p>

    `;

    return;

  }


  container.innerHTML =
    jobs
      .map(
        job =>
          renderUstaadJob(
            job,
            allowAccept
          )
      )
      .join("");

}


function renderUstaadJob(
  job,
  allowAccept
){

  return `

    <article
      class="job-card"
      data-ustaad-job="${job.id}"
    >

      <div>

        <span class="badge badge-verified">
          ${escapeHTML(job.category)}
        </span>

        <h3 style="margin-top:10px;">
          ${escapeHTML(job.title)}
        </h3>

        <p style="
          color:#6d727c;
          margin-top:8px;
        ">
          ${escapeHTML(job.description)}
        </p>

        <p style="
          color:#6d727c;
          margin-top:8px;
        ">
          📍 ${escapeHTML(job.location)}
        </p>

      </div>

      <div style="
        margin-top:16px;
        display:flex;
        gap:10px;
        align-items:center;
        flex-wrap:wrap;
      ">

        <strong>
          ${
            job.budget
              ? `Rs. ${Number(job.budget).toLocaleString()}`
              : "Budget not specified"
          }
        </strong>

        ${
          allowAccept
            ? `
              <button
                class="btn btn-primary"
                data-accept-job="${job.id}"
              >
                Accept Job
              </button>
            `
            : ""
        }

      </div>

    </article>

  `;

}


/* =========================================================
   ACCEPT JOB
   ========================================================= */

function setupJobActions(){

  document.addEventListener(
    "click",
    event => {

      const button =
        event.target.closest(
          "[data-accept-job]"
        );

      if(!button){
        return;
      }


      const id =
        Number(
          button.dataset.acceptJob
        );


      const job =
        state.jobs.find(
          item =>
            item.id === id
        );


      if(!job){
        return;
      }


      job.status =
        "accepted";


      saveState();

      renderUstaadDashboard();

      toast(
        "Job accept ho gaya! 🔥"
      );

    }
  );

}


/* =========================================================
   ONLINE TOGGLE
   ========================================================= */

function setupOnlineToggle(){

  const toggle =
    $("#onlineToggle");

  const label =
    $("#onlineLabel");

  if(!toggle){
    return;
  }


  toggle.classList.add(
    "active"
  );


  toggle.addEventListener(
    "click",
    () => {

      state.online =
        !state.online;


      toggle.classList.toggle(
        "active",
        state.online
      );


      if(label){

        label.textContent =
          state.online
            ? "online"
            : "offline";

      }


      toast(
        state.online
          ? "Aap online hain 🟢"
          : "Aap offline hain ⚪"
      );

    }
  );

}


/* =========================================================
   CATEGORY SYSTEM
   ========================================================= */

function setupCategories(){

  $$(".cat-card").forEach(card => {

    card.addEventListener(
      "click",
      () => {

        const category =
          card.dataset.category;

        state.selectedCategory =
          category;


        const select =
          $("#jobCategory");

        if(select){

          select.value =
            category;

        }


        navigate(
          "post-job"
        );


        setTimeout(() => {

          const title =
            $("#jobTitle");

          if(title){

            title.focus();

          }

        }, 300);

      }
    );

  });

}


/* =========================================================
   AI ASSISTANT
   ========================================================= */

const aiKnowledge = [

  {
    keys:[
      "plumber",
      "pipe",
      "tap",
      "water",
      "leak"
    ],

    reply:
      "Aap ko plumber ki zaroorat lag rahi hai. Main aap ke liye plumber category select kar deta hoon. 🔧"

  },

  {
    keys:[
      "electric",
      "wiring",
      "light",
      "switch",
      "fan"
    ],

    reply:
      "Electrical problem ke liye verified electrician best rahega. ⚡"

  },

  {
    keys:[
      "ac",
      "air conditioner",
      "cooling",
      "thanda"
    ],

    reply:
      "AC problem ke liye AC Technician select karein. ❄️"

  },

  {
    keys:[
      "car",
      "bike",
      "engine",
      "mechanic"
    ],

    reply:
      "Vehicle problem ke liye mechanic category suitable hai. 🚗"

  },

  {
    keys:[
      "computer",
      "laptop",
      "pc",
      "software"
    ],

    reply:
      "Computer ya laptop ke liye Tech Expert category try karein. 💻"

  }

];


function setupAI(){

  const fab =
    $("#aiFab");

  const panel =
    $("#aiPanel");

  const close =
    $("#aiClose");

  const input =
    $("#aiInput");

  const send =
    $("#aiSend");


  if(!fab || !panel){
    return;
  }


  fab.addEventListener(
    "click",
    () => {

      state.aiOpen =
        !state.aiOpen;

      panel.classList.toggle(
        "open",
        state.aiOpen
      );


      if(state.aiOpen){

        if(!$("#aiMessages").children.length){

          addAIMessage(
            "assistant",
            "Assalam-o-alaikum! 👋 Main Kaam Krwao AI hoon. Apna masla batayein."
          );

        }

        setTimeout(
          () => input?.focus(),
          150
        );

      }

    }
  );


  close?.addEventListener(
    "click",
    () => {

      state.aiOpen = false;

      panel.classList.remove(
        "open"
      );

    }
  );


  send?.addEventListener(
    "click",
    sendAIMessage
  );


  input?.addEventListener(
    "keydown",
    event => {

      if(event.key === "Enter"){

        event.preventDefault();

        sendAIMessage();

      }

    }
  );

}


function addAIMessage(
  role,
  text
){

  const container =
    $("#aiMessages");

  if(!container){
    return;
  }


  const message =
    document.createElement("div");


  message.className =
    `ai-message ai-${role}`;


  message.textContent =
    text;


  message.style.cssText = `

    max-width:85%;
    padding:11px 14px;
    margin-bottom:10px;
    border-radius:15px;
    line-height:1.5;
    font-size:.85rem;

    ${
      role === "user"
        ? `
          margin-left:auto;
          color:white;
          background:#ff6b00;
        `
        : `
          color:#222;
          background:#f0f1f3;
        `
    }

  `;


  container.appendChild(
    message
  );


  container.scrollTop =
    container.scrollHeight;

}


function sendAIMessage(){

  const input =
    $("#aiInput");

  if(!input){
    return;
  }


  const text =
    input.value.trim();


  if(!text){
    return;
  }


  addAIMessage(
    "user",
    text
  );


  input.value = "";


  setTimeout(
    () => {

      const answer =
        getAIReply(text);

      addAIMessage(
        "assistant",
        answer
      );

    },
    500
  );

}


function getAIReply(text){

  const lower =
    text.toLowerCase();


  for(const item of aiKnowledge){

    if(
      item.keys.some(
        key =>
          lower.includes(key)
      )
    ){

      return item.reply;

    }

  }


  if(
    lower.includes("hello") ||
    lower.includes("hi") ||
    lower.includes("salam")
  ){

    return "Wa Alaikum Assalam! 👋 Aap ko kis kaam ke liye Ustaad chahiye?";

  }


  if(
    lower.includes("help") ||
    lower.includes("madad")
  ){

    return "Bilkul! Apni problem simple words mein bata dein, main suitable service suggest karunga. 🤖";

  }


  return "Aap apni problem thori detail mein batayein. Main aap ko suitable Ustaad category suggest karne ki koshish karta hoon. 🔎";

}


/* =========================================================
   3D THREE.JS ENGINE
   ========================================================= */

let three = {

  scene:null,

  camera:null,

  renderer:null,

  group:null,

  objects:[],

  clock:null,

  initialized:false

};


/* =========================================================
   THREE.JS INIT
   ========================================================= */

function initThree(){

  const container =
    $("#threeScene");


  if(
    !container ||
    typeof THREE === "undefined"
  ){

    console.warn(
      "Three.js unavailable."
    );

    hideThreeLoader();

    return;

  }


  try{

    three.scene =
      new THREE.Scene();


    three.clock =
      new THREE.Clock();


    three.camera =
      new THREE.PerspectiveCamera(
        45,
        window.innerWidth /
        window.innerHeight,
        .1,
        100
      );


    three.camera.position.set(
      0,
      0,
      13
    );


    three.renderer =
      new THREE.WebGLRenderer({

        alpha:true,

        antialias:true,

        powerPreference:
          "high-performance"

      });


    three.renderer.setPixelRatio(
      Math.min(
        window.devicePixelRatio || 1,
        2
      )
    );


    three.renderer.setSize(
      window.innerWidth,
      window.innerHeight
    );


    three.renderer.outputEncoding =
      THREE.sRGBEncoding;


    container.appendChild(
      three.renderer.domElement
    );


    setupThreeLights();


    three.group =
      new THREE.Group();


    three.scene.add(
      three.group
    );


    createThreeObjects();


    three.initialized =
      true;


    window.addEventListener(
      "resize",
      resizeThree
    );


    animateThree();


    hideThreeLoader();

  }catch(error){

    console.error(
      "3D initialization failed:",
      error
    );

    hideThreeLoader();

  }

}


/* =========================================================
   THREE LIGHTS
   ========================================================= */

function setupThreeLights(){

  const ambient =
    new THREE.AmbientLight(
      0xffffff,
      2
    );


  three.scene.add(
    ambient
  );


  const key =
    new THREE.DirectionalLight(
      0xffffff,
      3
    );


  key.position.set(
    5,
    8,
    10
  );


  three.scene.add(
    key
  );


  const orange =
    new THREE.PointLight(
      0xff6b00,
      5,
      30
    );


  orange.position.set(
    3,
    2,
    7
  );


  three.scene.add(
    orange
  );

}


/* =========================================================
   MATERIAL HELPERS
   ========================================================= */

function orangeMaterial(){

  return new THREE.MeshStandardMaterial({

    color:0xff6b00,

    metalness:.35,

    roughness:.28

  });

}


function whiteMaterial(){

  return new THREE.MeshStandardMaterial({

    color:0xf7f7f7,

    metalness:.15,

    roughness:.35

  });

}


function darkMaterial(){

  return new THREE.MeshStandardMaterial({

    color:0x1d2024,

    metalness:.55,

    roughness:.25

  });

}


/* =========================================================
   3D TOOLBOX
   ========================================================= */

function createToolbox(){

  const group =
    new THREE.Group();


  const body =
    new THREE.Mesh(
      new THREE.BoxGeometry(
        2.2,
        1.35,
        1.2
      ),
      orangeMaterial()
    );


  body.position.y =
    -.1;


  group.add(
    body
  );


  const top =
    new THREE.Mesh(
      new THREE.BoxGeometry(
        1.85,
        .18,
        1.05
      ),
      whiteMaterial()
    );


  top.position.y =
    .63;


  group.add(
    top
  );


  const handle =
    new THREE.Mesh(
      new THREE.TorusGeometry(
        .55,
        .09,
        12,
        32,
        Math.PI
      ),
      darkMaterial()
    );


  handle.rotation.x =
    Math.PI / 2;


  handle.position.y =
    .82;


  group.add(
    handle
  );


  group.position.set(
    4,
    1.8,
    -1
  );


  group.rotation.set(
    -.2,
    .4,
    -.12
  );


  group.scale.setScalar(
    .9
  );


  three.group.add(
    group
  );


  three.objects.push({

    object:group,

    speed:.45,

    offset:0,

    baseY:1.8

  });

}


/* =========================================================
   3D WRENCH
   ========================================================= */

function createWrench(){

  const group =
    new THREE.Group();


  const handle =
    new THREE.Mesh(
      new THREE.BoxGeometry(
        .35,
        2.2,
        .18
      ),
      darkMaterial()
    );


  handle.position.y =
    -.5;


  handle.rotation.z =
    -.15;


  group.add(
    handle
  );


  const head =
    new THREE.Mesh(
      new THREE.TorusGeometry(
        .48,
        .14,
        12,
        32
      ),
      darkMaterial()
    );


  head.position.y =
    .65;


  group.add(
    head
  );


  const center =
    new THREE.Mesh(
      new THREE.CylinderGeometry(
        .27,
        .27,
        .25,
        16
      ),
      orangeMaterial()
    );


  center.rotation.x =
    Math.PI / 2;


  center.position.y =
    .65;


  group.add(
    center
  );


  group.position.set(
    -4,
    1.1,
    -2
  );


  group.rotation.z =
    -.4;


  group.scale.setScalar(
    .8
  );


  three.group.add(
    group
  );


  three.objects.push({

    object:group,

    speed:.65,

    offset:1.5,

    baseY:1.1

  });

}


/* =========================================================
   3D HOUSE
   ========================================================= */

function createHouse(){

  const group =
    new THREE.Group();


  const base =
    new THREE.Mesh(
      new THREE.BoxGeometry(
        2.4,
        1.8,
        2
      ),
      whiteMaterial()
    );


  base.position.y =
    -.3;


  group.add(
    base
  );


  const roof =
    new THREE.Mesh(
      new THREE.ConeGeometry(
        1.8,
        1.5,
        4
      ),
      orangeMaterial()
    );


  roof.rotation.y =
    Math.PI / 4;


  roof.position.y =
    1.35;


  group.add(
    roof
  );


  const door =
    new THREE.Mesh(
      new THREE.BoxGeometry(
        .45,
        .8,
        .08
      ),
      darkMaterial()
    );


  door.position.set(
    0,
    -.75,
    1.04
  );


  group.add(
    door
  );


  group.position.set(
    3.7,
    -2.1,
    -1
  );


  group.rotation.y =
    -.35;


  group.scale.setScalar(
    .85
  );


  three.group.add(
    group
  );


  three.objects.push({

    object:group,

    speed:.35,

    offset:2,

    baseY:-2.1

  });

}


/* =========================================================
   3D AI ORB
   ========================================================= */

function createAIOrb(){

  const group =
    new THREE.Group();


  const sphere =
    new THREE.Mesh(
      new THREE.SphereGeometry(
        1.05,
        32,
        32
      ),
      new THREE.MeshStandardMaterial({

        color:0xff6b00,

        emissive:0x7d2600,

        emissiveIntensity:.35,

        metalness:.5,

        roughness:.18

      })
    );


  group.add(
    sphere
  );


  const ring =
    new THREE.Mesh(
      new THREE.TorusGeometry(
        1.4,
        .035,
        10,
        64
      ),
      new THREE.MeshBasicMaterial({

        color:0xff6b00,

        transparent:true,

        opacity:.7

      })
    );


  ring.rotation.x =
    Math.PI / 2;


  group.add(
    ring
  );


  const ring2 =
    ring.clone();


  ring2.rotation.x =
    Math.PI / 3;


  ring2.rotation.y =
    Math.PI / 4;


  group.add(
    ring2
  );


  group.position.set(
    -3.5,
    -2.2,
    -2
  );


  three.group.add(
    group
  );


  three.objects.push({

    object:group,

    speed:.8,

    offset:.8,

    baseY:-2.2,

    orb:true

  });

}


/* =========================================================
   3D SERVICE VEHICLE
   ========================================================= */

function createVehicle(){

  const group =
    new THREE.Group();


  const body =
    new THREE.Mesh(
      new THREE.BoxGeometry(
        2.2,
        .7,
        1
      ),
      orangeMaterial()
    );


  group.add(
    body
  );


  const cabin =
    new THREE.Mesh(
      new THREE.BoxGeometry(
        1.15,
        .55,
        .9
      ),
      whiteMaterial()
    );


  cabin.position.set(
    .25,
    .55,
    0
  );


  group.add(
    cabin
  );


  const wheelGeometry =
    new THREE.CylinderGeometry(
      .3,
      .3,
      .2,
      20
    );


  const wheelMaterial =
    darkMaterial();


  [-.7,.7].forEach(x => {

    const wheel =
      new THREE.Mesh(
        wheelGeometry,
        wheelMaterial
      );


    wheel.rotation.z =
      Math.PI / 2;


    wheel.position.set(
      x,
      -.5,
      .55
    );


    group.add(
      wheel
    );


    const wheel2 =
      wheel.clone();


    wheel2.position.z =
      -.55;


    group.add(
      wheel2
    );

  });


  group.position.set(
    0,
    -3.2,
    -1
  );


  group.scale.setScalar(
    .7
  );


  three.group.add(
    group
  );


  three.objects.push({

    object:group,

    speed:.25,

    offset:3,

    baseY:-3.2

  });

}


/* =========================================================
   CREATE ALL OBJECTS
   ========================================================= */

function createThreeObjects(){

  createToolbox();

  createWrench();

  createHouse();

  createAIOrb();

  createVehicle();

}


/* =========================================================
   THREE ANIMATION
   ========================================================= */

function animateThree(){

  if(!three.initialized){
    return;
  }


  requestAnimationFrame(
    animateThree
  );


  const time =
    three.clock.getElapsedTime();


  three.objects.forEach(
    item => {

      const object =
        item.object;


      object.rotation.y +=
        0.0025 *
        item.speed;


      object.rotation.x +=
        0.001 *
        item.speed;


      object.position.y =
        item.baseY +
        Math.sin(
          time * item.speed +
          item.offset
        ) *
        .18;


      if(item.orb){

        object.rotation.z =
          time * .3;

      }

    }
  );


  three.group.rotation.y +=
    (
      state.mouseX * .08 -
      three.group.rotation.y
    ) * .01;


  three.group.rotation.x +=
    (
      state.mouseY * .04 -
      three.group.rotation.x
    ) * .01;


  three.renderer.render(
    three.scene,
    three.camera
  );

}


/* =========================================================
   RESIZE
   ========================================================= */

function resizeThree(){

  if(
    !three.camera ||
    !three.renderer
  ){
    return;
  }


  three.camera.aspect =
    window.innerWidth /
    window.innerHeight;


  three.camera.updateProjectionMatrix();


  three.renderer.setSize(
    window.innerWidth,
    window.innerHeight
  );

}


/* =========================================================
   3D MOUSE INTERACTION
   ========================================================= */

function setup3DMouse(){

  const hero =
    $("#hero");


  const panel =
    $("#hero3DPanel");


  document.addEventListener(
    "mousemove",
    event => {

      state.mouseX =
        (
          event.clientX /
          window.innerWidth
        ) * 2 - 1;


      state.mouseY =
        -(
          event.clientY /
          window.innerHeight
        ) * 2 + 1;


      if(panel){

        const rotateY =
          state.mouseX * 7;

        const rotateX =
          state.mouseY * -7;


        panel.style.transform = `

          perspective(1000px)
          rotateX(${rotateX}deg)
          rotateY(${rotateY}deg)

        `;

      }

    }
  );


  if(hero){

    hero.addEventListener(
      "mouseleave",
      () => {

        if(panel){

          panel.style.transform =
            "";

        }

      }
    );

  }

}


/* =========================================================
   3D CARD TILT
   ========================================================= */

function setupCardTilt(){

  const cards =
    $$(".cat-card, .how-card, .ustaad-card, .dash-card, .job-card");


  cards.forEach(card => {

    card.addEventListener(
      "mousemove",
      event => {

        if(
          window.innerWidth < 700
        ){
          return;
        }


        const rect =
          card.getBoundingClientRect();


        const x =
          event.clientX -
          rect.left;


        const y =
          event.clientY -
          rect.top;


        const centerX =
          rect.width / 2;


        const centerY =
          rect.height / 2;


        const rotateY =
          (
            x - centerX
          ) / centerX * 5;


        const rotateX =
          -(
            y - centerY
          ) / centerY * 5;


        card.style.transform = `

          perspective(900px)
          rotateX(${rotateX}deg)
          rotateY(${rotateY}deg)
          translateY(-5px)

        `;

      }
    );


    card.addEventListener(
      "mouseleave",
      () => {

        card.style.transform =
          "";

      }
    );

  });

}


/* =========================================================
   CURSOR LIGHT
   ========================================================= */

function setupCursorLight(){

  if(
    window.matchMedia(
      "(pointer: coarse)"
    ).matches
  ){
    return;
  }


  const light =
    document.createElement("div");


  light.className =
    "kk-cursor-light";


  document.body.appendChild(
    light
  );


  document.addEventListener(
    "mousemove",
    event => {

      light.style.left =
        `${event.clientX}px`;

      light.style.top =
        `${event.clientY}px`;

    }
  );

}


/* =========================================================
   SCROLL REVEAL
   ========================================================= */

function setupReveal(){

  const elements =
    $$(".reveal");


  if(
    !("IntersectionObserver" in window)
  ){

    elements.forEach(
      element =>
        element.style.opacity = "1"
    );

    return;

  }


  const observer =
    new IntersectionObserver(
      entries => {

        entries.forEach(
          entry => {

            if(
              entry.isIntersecting
            ){

              entry.target.style.opacity =
                "1";

              observer.unobserve(
                entry.target
              );

            }

          }
        );

      },
      {
        threshold:.08
      }
    );


  elements.forEach(
    element =>
      observer.observe(element)
  );

}


/* =========================================================
   HIDE 3D LOADER
   ========================================================= */

function hideThreeLoader(){

  const loader =
    $("#threeLoading");

  if(!loader){
    return;
  }


  setTimeout(
    () => {

      loader.classList.add(
        "hidden"
      );

    },
    350
  );

}


/* =========================================================
   REFRESH 3D
   ========================================================= */

function refresh3DScene(){

  if(!three.initialized){
    return;
  }


  three.objects.forEach(
    item => {

      item.object.visible =
        true;

    }
  );

}


/* =========================================================
   SMOOTH HEADER
   ========================================================= */

function setupNavbarScroll(){

  const navbar =
    $("#navbar");

  if(!navbar){
    return;
  }


  window.addEventListener(
    "scroll",
    () => {

      if(window.scrollY > 20){

        navbar.classList.add(
          "scrolled"
        );

      }else{

        navbar.classList.remove(
          "scrolled"
        );

      }

    },
    {
      passive:true
    }
  );

}


/* =========================================================
   INITIALIZATION
   ========================================================= */

function init(){

  loadState();

  setupNavigation();

  setupMobileMenu();

  setupJobForm();

  setupJobActions();

  setupOnlineToggle();

  setupCategories();

  setupAI();

  setup3DMouse();

  setupCardTilt();

  setupCursorLight();

  setupReveal();

  setupNavbarScroll();

  renderCustomerDashboard();

  renderUstaadDashboard();

  initThree();

}


/* =========================================================
   START APP
   ========================================================= */

if(
  document.readyState === "loading"
){

  document.addEventListener(
    "DOMContentLoaded",
    init
  );

}else{

  init();

}