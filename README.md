<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Kaam Krwao | README</title>

  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: Arial, Helvetica, sans-serif;
      background:
        radial-gradient(circle at top right, rgba(255, 0, 0, 0.20), transparent 35%),
        radial-gradient(circle at bottom left, rgba(180, 0, 0, 0.18), transparent 35%),
        #090909;
      color: #f5f5f5;
      line-height: 1.7;
    }

    a {
      color: #ff3b3b;
      text-decoration: none;
    }

    a:hover {
      color: #ff8080;
      text-decoration: underline;
    }

    .container {
      width: min(1100px, 92%);
      margin: 40px auto;
    }

    .hero {
      text-align: center;
      padding: 55px 25px;
      border: 1px solid rgba(255, 50, 50, 0.35);
      border-radius: 25px;
      background: rgba(20, 20, 20, 0.80);
      box-shadow:
        0 0 40px rgba(255, 0, 0, 0.12),
        inset 0 0 25px rgba(255, 0, 0, 0.04);
    }

    .logo {
      width: 90px;
      height: 90px;
      margin: 0 auto 20px;
      border-radius: 25px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 38px;
      font-weight: 900;
      color: white;
      background: linear-gradient(135deg, #ff0000, #8b0000);
      box-shadow: 0 0 35px rgba(255, 0, 0, 0.45);
    }

    h1 {
      font-size: clamp(38px, 7vw, 70px);
      color: #ff2b2b;
      text-shadow: 0 0 25px rgba(255, 0, 0, 0.35);
      margin-bottom: 8px;
    }

    .tagline {
      font-size: 20px;
      color: #ddd;
      margin-bottom: 22px;
    }

    .live-btn {
      display: inline-block;
      padding: 13px 24px;
      border-radius: 12px;
      background: #e50909;
      color: white;
      font-weight: bold;
      transition: 0.25s;
      box-shadow: 0 8px 25px rgba(255, 0, 0, 0.18);
    }

    .live-btn:hover {
      transform: translateY(-2px);
      background: #ff1f1f;
      text-decoration: none;
    }

    section {
      margin-top: 25px;
      padding: 30px;
      border-radius: 20px;
      background: rgba(17, 17, 17, 0.90);
      border: 1px solid rgba(255, 55, 55, 0.22);
    }

    h2 {
      color: #ff3737;
      font-size: 29px;
      margin-bottom: 15px;
      border-left: 5px solid #ff1e1e;
      padding-left: 12px;
    }

    h3 {
      color: #ff5757;
      margin: 15px 0 8px;
    }

    p {
      color: #d8d8d8;
      margin-bottom: 12px;
    }

    ul, ol {
      padding-left: 25px;
      color: #d8d8d8;
    }

    li {
      margin: 7px 0;
    }

    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 15px;
      margin-top: 15px;
    }

    .card {
      background: linear-gradient(145deg, #151515, #0e0e0e);
      border: 1px solid rgba(255, 55, 55, 0.25);
      border-radius: 16px;
      padding: 20px;
      transition: 0.25s;
    }

    .card:hover {
      transform: translateY(-4px);
      border-color: rgba(255, 55, 55, 0.65);
      box-shadow: 0 12px 30px rgba(255, 0, 0, 0.12);
    }

    .card strong {
      display: block;
      color: #ff4545;
      font-size: 18px;
      margin-bottom: 5px;
    }

    .code {
      margin-top: 15px;
      padding: 18px;
      background: #050505;
      border: 1px solid #2c2c2c;
      border-radius: 12px;
      overflow-x: auto;
      color: #ffb2b2;
      font-family: Consolas, monospace;
      white-space: pre-wrap;
    }

    .founder {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 15px;
      padding: 18px;
      margin-top: 12px;
      border-radius: 14px;
      background: #101010;
      border: 1px solid rgba(255, 50, 50, 0.22);
      flex-wrap: wrap;
    }

    .founder-name {
      font-size: 19px;
      font-weight: bold;
      color: white;
    }

    .badge {
      padding: 6px 11px;
      border-radius: 20px;
      background: rgba(255, 0, 0, 0.12);
      color: #ff5151;
      font-size: 13px;
      border: 1px solid rgba(255, 0, 0, 0.2);
    }

    footer {
      text-align: center;
      color: #888;
      padding: 30px 10px 50px;
    }

    .red {
      color: #ff3636;
      font-weight: bold;
    }

    @media (max-width: 600px) {
      .container {
        width: 94%;
        margin: 20px auto;
      }

      section {
        padding: 21px;
      }

      .hero {
        padding: 40px 18px;
      }

      h2 {
        font-size: 24px;
      }
    }
  </style>
</head>

<body>

  <div class="container">

    <header class="hero">
      <div class="logo">KK</div>
      <h1>Kaam Krwao</h1>
      <p class="tagline">Har Kaam Ka Ustaad, Aapke Qareeb.</p>

      <a
        class="live-btn"
        href="https://kaamkrwaopk.vercel.app/"
        target="_blank"
        rel="noopener noreferrer"
      >
        🌐 Live Website Dekhein
      </a>
    </header>

    <section>
      <h2>🔧 Project Ke Bare Mein</h2>
      <p>
        <span class="red">Kaam Krwao</span> aik modern service marketplace web
        application hai jahan customers apni rozmarrah ki zaroorat ke liye
        suitable <strong>Ustaad / Service Professional</strong> dhoond sakte hain.
      </p>

      <p>
        Customer apna kaam post kar sakta hai, job ki details de sakta hai,
        location aur urgency select kar sakta hai, photos/videos upload kar
        sakta hai aur suitable Ustaad select kar sakta hai.
      </p>
    </section>

    <section>
      <h2>✨ Main Features</h2>

      <div class="grid">
        <div class="card"><strong>🛠️ Job Posting</strong>Customer apni service ki requirement post kar sakta hai.</div>
        <div class="card"><strong>👨‍🔧 Ustaad Profile</strong>Professional apni skills aur experience show kar sakta hai.</div>
        <div class="card"><strong>✅ Verification</strong>Ustaad ke liye verification flow.</div>
        <div class="card"><strong>📋 Categories</strong>Multiple service categories available.</div>
        <div class="card"><strong>⭐ Ratings</strong>Customer ratings aur reviews ka concept.</div>
        <div class="card"><strong>📍 Location</strong>Job location aur urgency select karne ka option.</div>
        <div class="card"><strong>📸 Photos</strong>Job ke mutaliq photos upload ki ja sakti hain.</div>
        <div class="card"><strong>🎥 Videos</strong>Job ki video details bhi share ki ja sakti hain.</div>
        <div class="card"><strong>💬 Chat</strong>Customer aur Ustaad communication interface.</div>
        <div class="card"><strong>📊 Dashboard</strong>Customer aur Ustaad ke liye dashboard experience.</div>
        <div class="card"><strong>🔔 Notifications</strong>Interactive notification / toast system.</div>
        <div class="card"><strong>📱 Responsive</strong>Mobile, tablet aur desktop friendly UI.</div>
      </div>
    </section>

    <section>
      <h2>🧰 Technologies</h2>
      <div class="grid">
        <div class="card"><strong>HTML5</strong>Website structure ke liye.</div>
        <div class="card"><strong>CSS3</strong>Modern responsive styling ke liye.</div>
        <div class="card"><strong>JavaScript</strong>Interactive functionality ke liye.</div>
        <div class="card"><strong>Three.js</strong>3D visual effects ke liye.</div>
        <div class="card"><strong>LocalStorage</strong>Demo data save karne ke liye.</div>
        <div class="card"><strong>Vercel</strong>Live deployment ke liye.</div>
      </div>
    </section>

    <section>
      <h2>📁 Project Structure</h2>

      <div class="code">Mid-Term-Project-main/
├── index.html
├── styles.css
├── app.js
├── files.zip
└── README.md</div>

      <p>
        Agar aap single-file version use karna chahte hain to HTML, CSS aur
        JavaScript ko aik hi <strong>index.html</strong> file mein rakha ja sakta hai.
      </p>
    </section>

    <section>
      <h2>🚀 Local Run Ka Tarika</h2>

      <ol>
        <li>Project ko download ya clone karein.</li>
        <li>Project folder ko VS Code mein open karein.</li>
        <li><strong>index.html</strong> file open karein.</li>
        <li>VS Code mein Live Server use karein.</li>
        <li>Browser mein website open ho jayegi.</li>
      </ol>

      <div class="code">git clone &lt;YOUR_GITHUB_REPOSITORY_URL&gt;
cd Mid-Term-Project-main</div>
    </section>

    <section>
      <h2>🌐 Live Demo</h2>

      <p>
        Website yahan available hai:
      </p>

      <p>
        🔗
        <a href="https://kaamkrwaopk.vercel.app/" target="_blank" rel="noopener noreferrer">
          https://kaamkrwaopk.vercel.app/
        </a>
      </p>
    </section>

    <section>
      <h2>👥 Founders</h2>

      <div class="founder">
        <div>
          <div class="founder-name">Atisamul</div>
          <a href="https://github.com/Atisamul" target="_blank" rel="noopener noreferrer">
            github.com/Atisamul
          </a>
        </div>
        <span class="badge">Founder / Developer</span>
      </div>

      <div class="founder">
        <div>
          <div class="founder-name">Abdul Rafay</div>
          <a href="https://github.com/abdulrafay364p-artor" target="_blank" rel="noopener noreferrer">
            github.com/abdulrafay364p-artor
          </a>
        </div>
        <span class="badge">Co-Founder / Developer</span>
      </div>
    </section>

    <section>
      <h2>🎯 Project Ka Maqsad</h2>

      <p>
        Kaam Krwao ka basic maqsad customers aur skilled service professionals
        ke darmiyan aik simple aur modern digital connection banana hai.
      </p>

      <p>
        Customer apni zaroorat ka kaam post karta hai aur relevant Ustaad ko
        select kar sakta hai. Is se ghar, shop ya office ke kaam ke liye
        suitable professional dhoondna asaan ho jata hai.
      </p>
    </section>

    <section>
      <h2>🛠️ Main Service Categories</h2>

      <div class="grid">
        <div class="card">🔧 Plumber</div>
        <div class="card">⚡ Electrician</div>
        <div class="card">🪚 Carpenter</div>
        <div class="card">🎨 Painter</div>
        <div class="card">💻 Tech Expert</div>
      </div>
    </section>

    <section>
      <h2>🔄 Kaise Kaam Karta Hai?</h2>

      <h3>Customer</h3>
      <ol>
        <li>Service ki zaroorat batayein.</li>
        <li>Job details aur location submit karein.</li>
        <li>Photos ya videos attach karein.</li>
        <li>Available Ustaads ko dekhein.</li>
        <li>Suitable Ustaad select karein.</li>
        <li>Job ka status track karein.</li>
      </ol>

      <h3>Ustaad</h3>
      <ol>
        <li>Ustaad ke taur par register karein.</li>
        <li>Apni skills aur experience add karein.</li>
        <li>Verification complete karein.</li>
        <li>Available jobs dekhein.</li>
        <li>Customer ke saath communicate karein.</li>
        <li>Job complete karein.</li>
      </ol>
    </section>

    <section>
      <h2>🎨 UI & Design</h2>

      <p>
        Kaam Krwao ko modern marketplace experience ko madde nazar rakh kar
        design kiya gaya hai.
      </p>

      <ul>
        <li>Modern dark background</li>
        <li>Premium red accent theme</li>
        <li>Glassmorphism style</li>
        <li>3D effects</li>
        <li>Smooth animations</li>
        <li>Responsive cards</li>
        <li>Modern typography</li>
        <li>Mobile responsive layout</li>
      </ul>
    </section>

    <section>
      <h2>💾 Data Storage</h2>

      <p>
        Demo version mein browser ka <strong>LocalStorage</strong> use kiya ja
        sakta hai. Production version mein proper backend, database aur API
        connect ki ja sakti hai.
      </p>
    </section>

    <section>
      <h2>🔮 Future Improvements</h2>

      <div class="grid">
        <div class="card">🔐 Real Authentication</div>
        <div class="card">🗄️ Backend Database</div>
        <div class="card">💳 Online Payments</div>
        <div class="card">📍 Live GPS Location</div>
        <div class="card">🗺️ Google Maps</div>
        <div class="card">🔔 Real-Time Notifications</div>
        <div class="card">💬 Real-Time Chat</div>
        <div class="card">📱 Android / iOS App</div>
        <div class="card">🤖 AI Service Matching</div>
        <div class="card">⭐ Advanced Reviews</div>
        <div class="card">💰 Secure Escrow System</div>
        <div class="card">☁️ Cloud Media Storage</div>
      </div>
    </section>

    <section>
      <h2>❤️ Credits</h2>

      <p>
        Ye project <strong>Kaam Krwao Team</strong> ne web development project
        ke taur par banaya hai.
      </p>

      <p>
        <span class="red">Atisamul</span> — Founder / Developer<br />
        <span class="red">Abdul Rafay</span> — Co-Founder / Developer
      </p>

      <p>
        🌐 Live Website:
        <a href="https://kaamkrwaopk.vercel.app/" target="_blank" rel="noopener noreferrer">
          Kaam Krwao
        </a>
      </p>
    </section>

    <footer>
      © 2026 Kaam Krwao — All Rights Reserved.
    </footer>

  </div>

</body>
</html>
