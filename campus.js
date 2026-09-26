// ============================================
// MOCK DATA — structured to be swapped for real
// API calls later (e.g. fetch('/api/students'))
// ============================================

const mockStudents = [
  { id: 1, name: "Aarav Shetty", university: "NITK Surathkal", year: "3rd Year", skills: ["React", "UI/UX"], available: true },
  { id: 2, name: "Priya Nair", university: "IIT Bombay", year: "4th Year", skills: ["Python", "ML"], available: true },
  { id: 3, name: "Rohan Fernandes", university: "St Aloysius College", year: "2nd Year", skills: ["Figma", "Branding"], available: false },
  { id: 4, name: "Sneha Kamath", university: "NITK Surathkal", year: "1st Year", skills: ["JavaScript", "Node.js"], available: true },
  { id: 5, name: "Karthik Rao", university: "IIT Bombay", year: "3rd Year", skills: ["Flutter", "Firebase"], available: true },
  { id: 6, name: "Ananya Pai", university: "Manipal Institute", year: "2nd Year", skills: ["UI/UX", "Figma"], available: false },
  { id: 7, name: "Vikram Bhat", university: "St Aloysius College", year: "4th Year", skills: ["Python", "Data Science"], available: true },
  { id: 8, name: "Meera Kulkarni", university: "Manipal Institute", year: "3rd Year", skills: ["React", "Node.js"], available: true },
];

const mockHackathonRequests = [
  { id: 1, title: "Smart India Hackathon", need: ["Backend Dev", "ML"], postedBy: "Aarav Shetty" },
  { id: 2, title: "College Fintech Sprint", need: ["UI/UX", "React"], postedBy: "Priya Nair" },
  { id: 3, title: "Sustainability Hack 2026", need: ["Flutter", "Design"], postedBy: "Karthik Rao" },
  { id: 4, title: "AI for Good Challenge", need: ["Python", "Data Science"], postedBy: "Vikram Bhat" },
];

let activeUni = "all";
let activeSkill = "all";
let searchTerm = "";
let isVerified = false;

// ============================================
// INIT
// ============================================
document.addEventListener("DOMContentLoaded", () => {
  buildUniChips();
  buildSkillChips();
  renderHackathons();
  renderStudents();

  document.getElementById("searchInput").addEventListener("input", (e) => {
    searchTerm = e.target.value.toLowerCase();
    renderStudents();
  });

  document.getElementById("verifyForm").addEventListener("submit", handleVerifySubmit);
});

// ============================================
// FILTER CHIPS
// ============================================
function buildUniChips() {
  const unis = ["all", ...new Set(mockStudents.map(s => s.university))];
  const container = document.getElementById("uniChips");
  container.innerHTML = "";
  unis.forEach(uni => {
    const btn = document.createElement("button");
    btn.className = "chip" + (uni === "all" ? " active" : "");
    btn.textContent = uni === "all" ? "All Universities" : uni;
    btn.dataset.uni = uni;
    btn.onclick = () => {
      activeUni = uni;
      document.querySelectorAll("#uniChips .chip").forEach(c => c.classList.remove("active"));
      btn.classList.add("active");
      renderStudents();
    };
    container.appendChild(btn);
  });
}

function buildSkillChips() {
  const skills = ["all", ...new Set(mockStudents.flatMap(s => s.skills))];
  const container = document.getElementById("skillChips");
  container.innerHTML = "";
  skills.forEach(skill => {
    const btn = document.createElement("button");
    btn.className = "chip" + (skill === "all" ? " active" : "");
    btn.textContent = skill === "all" ? "All Skills" : skill;
    btn.dataset.skill = skill;
    btn.onclick = () => {
      activeSkill = skill;
      document.querySelectorAll("#skillChips .chip").forEach(c => c.classList.remove("active"));
      btn.classList.add("active");
      renderStudents();
    };
    container.appendChild(btn);
  });
}

// ============================================
// RENDER STUDENTS
// ============================================
function renderStudents() {
  const grid = document.getElementById("studentGrid");
  const countLabel = document.getElementById("resultCount");
  grid.innerHTML = "";

  const filtered = mockStudents.filter(s => {
    const matchesUni = activeUni === "all" || s.university === activeUni;
    const matchesSkill = activeSkill === "all" || s.skills.includes(activeSkill);
    const matchesSearch =
      searchTerm === "" ||
      s.name.toLowerCase().includes(searchTerm) ||
      s.university.toLowerCase().includes(searchTerm) ||
      s.skills.some(sk => sk.toLowerCase().includes(searchTerm));
    return matchesUni && matchesSkill && matchesSearch;
  });

  countLabel.textContent = `Showing ${filtered.length} student${filtered.length !== 1 ? "s" : ""}`;

  filtered.forEach(student => {
    const card = document.createElement("div");
    card.className = "student-card";
    card.innerHTML = `
      <div class="student-top">
        <div class="student-avatar">${getInitials(student.name)}</div>
        <div>
          <div class="student-name">${student.name}</div>
          <div class="student-uni">${student.university}</div>
        </div>
      </div>
      <span class="student-year">${student.year}</span>
      <div class="student-skills">
        ${student.skills.map(sk => `<span class="tag-mini">${sk}</span>`).join("")}
      </div>
      <div class="availability">
        <span class="dot ${student.available ? "" : "busy"}"></span>
        ${student.available ? "Available to collaborate" : "Currently busy"}
      </div>
      <button class="connect-btn" onclick="handleConnect(${student.id}, this)">Connect</button>
    `;
    grid.appendChild(card);
  });
}

function getInitials(name) {
  return name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();
}

// ============================================
// RENDER HACKATHON REQUESTS
// ============================================
function renderHackathons() {
  const container = document.getElementById("hackathonList");
  container.innerHTML = "";
  mockHackathonRequests.forEach(req => {
    const card = document.createElement("div");
    card.className = "hackathon-card";
    card.innerHTML = `
      <h4>${req.title}</h4>
      <p>Posted by ${req.postedBy}</p>
      <div class="hackathon-tags">
        ${req.need.map(n => `<span class="tag-mini">${n}</span>`).join("")}
      </div>
      <button class="connect-btn" onclick="handleConnect(${req.id}, this, true)">Offer to Join</button>
    `;
    container.appendChild(card);
  });
}

// ============================================
// CONNECT BUTTON HANDLER
// ============================================
function handleConnect(id, btnEl, isHackathon = false) {
  btnEl.textContent = "Request Sent";
  btnEl.classList.add("sent");
  btnEl.disabled = true;
  showPopup(isHackathon ? "You offered to join the team!" : "Connection request sent!");
}

// ============================================
// VERIFY MODAL
// ============================================
function openVerifyModal() {
  document.getElementById("verifyModal").classList.add("show");
}
function closeVerifyModal() {
  document.getElementById("verifyModal").classList.remove("show");
}

function handleVerifySubmit(e) {
  e.preventDefault();
  const email = document.getElementById("eduEmail").value.trim();
  const errorText = document.getElementById("verifyError");

  if (!email.toLowerCase().endsWith(".edu")) {
    errorText.textContent = "Please use a valid .edu university email.";
    return;
  }

  errorText.textContent = "";
  isVerified = true;

  const uniGuess = email.split("@")[1].split(".")[0];
  document.getElementById("idName").textContent = email.split("@")[0];
  document.getElementById("idUni").textContent = uniGuess.charAt(0).toUpperCase() + uniGuess.slice(1) + " University";
  const badge = document.getElementById("idBadge");
  badge.textContent = "✅ Verified";
  badge.classList.add("verified");

  closeVerifyModal();
  showPopup("Campus access unlocked!");
}

// ============================================
// MENTOR REQUEST (mock)
// ============================================
function requestMentor() {
  showPopup("Mentor request submitted! We'll match you soon.");
}

// ============================================
// POPUP HELPER
// ============================================
function showPopup(text) {
  const popup = document.getElementById("connectPopup");
  document.getElementById("popupText").textContent = text;
  popup.classList.add("show");
  setTimeout(() => popup.classList.remove("show"), 2500);
}