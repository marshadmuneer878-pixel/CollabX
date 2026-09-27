// ---------- MOCK DATA (API-ready shape) ----------
const DEFAULT_SKILLS = [
  {
    id: 1,
    title: "React Frontend Development",
    category: "Development",
    desc: "Build responsive, component-based UIs with React and modern hooks.",
    owner: "Aisha K.",
    type: "text"
  },
  {
    id: 2,
    title: "UI/UX Wireframing",
    category: "Design",
    desc: "Turning rough ideas into clean, user-tested wireframes and prototypes.",
    owner: "Devon R.",
    type: "link"
  },
  {
    id: 3,
    title: "Python Data Scripts",
    category: "Development",
    desc: "Automation scripts, data cleaning, and quick API integrations.",
    owner: "Marco T.",
    type: "code"
  },
  {
    id: 4,
    title: "Social Media Growth",
    category: "Marketing",
    desc: "Content strategy and growth tactics for early-stage projects.",
    owner: "Priya S.",
    type: "text"
  },
  {
    id: 5,
    title: "Technical Copywriting",
    category: "Writing",
    desc: "Clear, concise docs and landing page copy for tech products.",
    owner: "Leo M.",
    type: "text"
  },
  {
    id: 6,
    title: "Node.js Backend APIs",
    category: "Development",
    desc: "REST API design, auth, and database schema for small projects.",
    owner: "Zoe P.",
    type: "code"
  }
];

function loadSkillsData() {
  const stored = localStorage.getItem("collabxSkills");
  if (stored) return JSON.parse(stored);
  localStorage.setItem("collabxSkills", JSON.stringify(DEFAULT_SKILLS));
  return DEFAULT_SKILLS;
}

function persistSkillsData() {
  localStorage.setItem("collabxSkills", JSON.stringify(skillsData));
}

let skillsData = loadSkillsData();

let activeFilter = "all";
let hasAccount = false; // mock account state, no backend yet

const skillsGrid = document.getElementById("skillsGrid");
const skillSearch = document.getElementById("skillSearch");
const filterChips = document.getElementById("filterChips");

// ---------- RENDER ----------
function initials(name) {
  return name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
}

function renderSkills() {
  const query = skillSearch.value.trim().toLowerCase();
  const filtered = skillsData.filter(s => {
    const matchFilter = activeFilter === "all" || s.category === activeFilter;
    const matchSearch = s.title.toLowerCase().includes(query) || s.desc.toLowerCase().includes(query);
    return matchFilter && matchSearch;
  });

  skillsGrid.innerHTML = filtered.map(s => `
    <div class="skill-card" data-id="${s.id}">
      <div class="skill-card-top">
        <h3>${s.title}</h3>
        <span class="skill-tag">${s.category}</span>
      </div>
      <p class="desc">${s.desc}</p>
      <div class="skill-owner">
        <div class="avatar">${initials(s.owner)}</div>
        <span>${s.owner}</span>
      </div>
      <div class="card-actions">
        <button class="btn-collab" data-action="collab" data-id="${s.id}">Collab</button>
        <button class="btn-hire" data-action="hire" data-id="${s.id}">Hire</button>
      </div>
    </div>
  `).join("") || `<p style="color:#9ea3d6;">No skills match your search.</p>`;
}

// ---------- FILTER + SEARCH ----------
filterChips.addEventListener("click", (e) => {
  if (!e.target.classList.contains("chip")) return;
  document.querySelectorAll(".chip").forEach(c => c.classList.remove("active"));
  e.target.classList.add("active");
  activeFilter = e.target.dataset.filter;
  renderSkills();
});

skillSearch.addEventListener("input", renderSkills);

// ---------- COLLAB / HIRE ----------
skillsGrid.addEventListener("click", (e) => {
  const btn = e.target.closest("button[data-action]");
  if (!btn) return;
  const skill = skillsData.find(s => s.id == btn.dataset.id);
  if (btn.dataset.action === "collab") {
    alert(`Collab request sent to ${skill.owner} for "${skill.title}".`);
  } else {
    alert(`Hire request sent to ${skill.owner} for "${skill.title}".`);
  }
});

// ---------- MODAL HELPERS ----------
function openModal(id) { document.getElementById(id).classList.add("show"); }
function closeModal(id) { document.getElementById(id).classList.remove("show"); }

document.querySelectorAll(".modal-close").forEach(btn => {
  btn.addEventListener("click", () => closeModal(btn.dataset.close));
});

// ---------- POST MY SKILL FLOW ----------
document.getElementById("postSkillBtn").addEventListener("click", () => {
  openModal("accountCheckModal");
});

document.getElementById("accCheckYes").addEventListener("click", () => {
  hasAccount = true;
  closeModal("accountCheckModal");
  openModal("postSkillModal");
});

document.getElementById("accCheckNo").addEventListener("click", () => {
  closeModal("accountCheckModal");
  openModal("createAccountModal");
});

document.getElementById("createAccountForm").addEventListener("submit", (e) => {
  e.preventDefault();

  const inputs = e.target.querySelectorAll("input");
  const name = inputs[0].value.trim();
  const email = inputs[1].value.trim();
  const password = inputs[2].value;

  // Same schema and localStorage keys as home.js, so this account
  // works for login.html and everywhere else on the site too.
  const accounts = JSON.parse(localStorage.getItem("collabxAccounts") || "[]");

  const existing = accounts.find(a => a.email === email);
  if (existing) {
    alert("An account with this email already exists. Please log in instead.");
    return;
  }

  const account = { name, email, password, skills: "", lookingFor: "" };
  accounts.push(account);
  localStorage.setItem("collabxAccounts", JSON.stringify(accounts));
  localStorage.setItem("collabxCurrentUser", JSON.stringify({ name, email }));

  hasAccount = true;
  closeModal("createAccountModal");
  openModal("postSkillModal");
  e.target.reset();
});

// ---------- POST SKILL TABS (code / text / link) ----------
const postTabs = document.querySelectorAll(".post-tab");
postTabs.forEach(tab => {
  tab.addEventListener("click", () => {
    postTabs.forEach(t => t.classList.remove("active"));
    tab.classList.add("active");
    document.querySelectorAll(".post-section").forEach(sec => sec.style.display = "none");
    document.getElementById(`section-${tab.dataset.tab}`).style.display = "block";
  });
});

function activeTab() {
  return document.querySelector(".post-tab.active").dataset.tab;
}

// ---------- POST SKILL SUBMIT ----------
document.getElementById("postSkillForm").addEventListener("submit", (e) => {
  e.preventDefault();
  const title = document.getElementById("skillTitle").value.trim();
  const category = document.getElementById("skillCategory").value;
  const type = activeTab();

  let desc = "";
  if (type === "code") {
    const lang = document.getElementById("codeLang").value;
    desc = `${lang} snippet shared.`;
  } else if (type === "text") {
    desc = document.getElementById("textInput").value.trim().slice(0, 100) || "Text skill posted.";
  } else if (type === "link") {
    desc = document.getElementById("linkInput").value.trim() || "External link shared.";
  }

  const newSkill = {
    id: skillsData.length + 1,
    title: title || "Untitled Skill",
    category,
    desc,
    owner: "You",
    type
  };

  skillsData.unshift(newSkill);
  persistSkillsData();
  renderSkills();
  closeModal("postSkillModal");
  e.target.reset();
  document.querySelectorAll(".post-section").forEach(sec => sec.style.display = "none");
  document.getElementById("section-code").style.display = "block";
  postTabs.forEach(t => t.classList.remove("active"));
  postTabs[0].classList.add("active");
});

// ---------- INIT ----------
renderSkills();