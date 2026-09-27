/* =========================================================
   COLLABX — COLLABORATORS DATA
   Stored in localStorage (collabxCollaborators) so the admin
   dashboard can add/edit/delete entries. Seeded with defaults
   on first load.
========================================================= */

const DEFAULT_COLLABORATORS = [

    {
        name: "Aisha Rahman",
        role: "Frontend Developer",
        initials: "AR",
        skills: ["Web Development", "UI/UX Design"],
        experience: "2 yrs experience",
        projects: "4 projects",
        available: true,
        bio: "Builds clean, responsive interfaces. Looking to team up on a real-world web app."
    },
    {
        name: "Devika Nair",
        role: "UI/UX Designer",
        initials: "DN",
        skills: ["UI/UX Design", "Photography"],
        experience: "3 yrs experience",
        projects: "6 projects",
        available: true,
        bio: "Designs user-first interfaces in Figma. Loves turning rough ideas into usable flows."
    },
    {
        name: "Rohan Mehta",
        role: "Python Developer",
        initials: "RM",
        skills: ["Python", "AI & ML"],
        experience: "1.5 yrs experience",
        projects: "3 projects",
        available: false,
        bio: "Backend and automation scripts in Python. Currently exploring ML model deployment."
    },
    {
        name: "Sara Thomas",
        role: "AI/ML Engineer",
        initials: "ST",
        skills: ["AI & ML", "Python"],
        experience: "2 yrs experience",
        projects: "5 projects",
        available: true,
        bio: "Trains and fine-tunes models. Interested in collaborating on an AI-powered chatbot."
    },
    {
        name: "Kevin Joseph",
        role: "Photographer",
        initials: "KJ",
        skills: ["Photography", "Video Editing"],
        experience: "4 yrs experience",
        projects: "8 projects",
        available: true,
        bio: "Shoots portraits and events. Open to content collaborations for student projects."
    },
    {
        name: "Meera Pillai",
        role: "Video Editor",
        initials: "MP",
        skills: ["Video Editing", "Content Writing"],
        experience: "2 yrs experience",
        projects: "5 projects",
        available: false,
        bio: "Edits short-form content and reels. Looking for a writer to collaborate with regularly."
    },
    {
        name: "Farhan Ali",
        role: "App Developer",
        initials: "FA",
        skills: ["App Development", "UI/UX Design"],
        experience: "1 yr experience",
        projects: "2 projects",
        available: true,
        bio: "Builds Flutter apps end to end. Wants to join a team building a real mobile product."
    },
    {
        name: "Neha Kurian",
        role: "Content Writer",
        initials: "NK",
        skills: ["Content Writing", "Web Development"],
        experience: "2 yrs experience",
        projects: "7 projects",
        available: true,
        bio: "Writes blog posts and website copy. Happy to pair with a developer on a portfolio site."
    }

];

function loadCollaborators() {
    const stored = localStorage.getItem("collabxCollaborators");
    if (stored) return JSON.parse(stored);
    localStorage.setItem("collabxCollaborators", JSON.stringify(DEFAULT_COLLABORATORS));
    return DEFAULT_COLLABORATORS;
}

let collaborators = loadCollaborators();


let activeSkill = "all";
let searchTerm = "";


/* ================= RENDER ================= */

function renderCollaborators() {

    const grid = document.getElementById("collabGrid");
    const noResults = document.getElementById("noResults");

    const filtered = collaborators.filter(person => {

        const matchesSkill =
            activeSkill === "all" || person.skills.includes(activeSkill);

        const matchesSearch =
            person.name.toLowerCase().includes(searchTerm) ||
            person.skills.some(skill => skill.toLowerCase().includes(searchTerm));

        return matchesSkill && matchesSearch;
    });

    grid.innerHTML = "";

    if (filtered.length === 0) {
        noResults.style.display = "block";
        return;
    }

    noResults.style.display = "none";

    filtered.forEach((person, index) => {

        const card = document.createElement("div");
        card.className = "collab-card";

        card.innerHTML = `
            <div class="collab-top">
                <div class="avatar">${person.initials}</div>
                <div class="collab-name-role">
                    <h3>${person.name}</h3>
                    <p>${person.role}</p>
                </div>
                <div class="availability">
                    <span class="dot ${person.available ? "" : "busy"}"></span>
                    ${person.available ? "Available" : "Busy"}
                </div>
            </div>

            <p class="collab-bio">${person.bio}</p>

            <div class="collab-meta">
                <span>${person.experience}</span>
                <span>${person.projects}</span>
            </div>

            <div class="tag-row">
                ${person.skills.map(skill => `<span class="tag">${skill}</span>`).join("")}
            </div>

            <button class="connect-btn" onclick="sendConnectRequest('${person.name.replace(/'/g, "\\'")}', this)">
                Connect
            </button>
        `;

        grid.appendChild(card);
    });
}


/* ================= SEARCH ================= */

document.getElementById("searchInput").addEventListener("input", function () {
    searchTerm = this.value.trim().toLowerCase();
    renderCollaborators();
});


/* ================= SKILL FILTER CHIPS ================= */

document.getElementById("chipRow").addEventListener("click", function (event) {

    const chip = event.target.closest(".chip");
    if (!chip) return;

    document.querySelectorAll(".chip").forEach(c => c.classList.remove("active"));
    chip.classList.add("active");

    activeSkill = chip.dataset.skill;
    renderCollaborators();
});


/* ================= CONNECT REQUEST (mock) ================= */

function sendConnectRequest(name, buttonEl) {

    // No backend yet — this just simulates the request being sent.
    buttonEl.textContent = "Request Sent";
    buttonEl.classList.add("sent");
    buttonEl.disabled = true;

    document.getElementById("popupName").textContent = `Request sent to ${name}!`;
    document.getElementById("connectPopup").style.display = "flex";
}

function closeConnectPopup() {
    document.getElementById("connectPopup").style.display = "none";
}


/* ================= INITIAL RENDER ================= */

renderCollaborators();