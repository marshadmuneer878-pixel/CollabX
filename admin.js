/* =========================================================
   COLLABX — ADMIN DASHBOARD LOGIC
   Reads/writes the same "collabxAccounts" localStorage key
   used by home.js, login.js and skills.js. Local browser only.
========================================================= */

/* ================= CHANGE THIS PASSWORD =================
   This is a client-side check only — anyone who views the page
   source can read it. It's a soft deterrent for a personal/dev
   dashboard, NOT real security. Don't rely on this to protect
   sensitive data.
========================================================= */
const ADMIN_PASSWORD = "collabx-admin";


let editingIndex = null;


/* ================= PASSWORD GATE ================= */

function checkPassword() {
    const entered = document.getElementById("gatePassword").value;

    if (entered === ADMIN_PASSWORD) {
        sessionStorage.setItem("collabxAdminUnlocked", "true");
        unlockDashboard();
    } else {
        document.getElementById("gateError").style.display = "block";
    }
}

function unlockDashboard() {
    document.getElementById("gate").style.display = "none";
    document.getElementById("dashboard").style.display = "block";
    renderAccounts();
    renderCollabAdmin();
    renderSkillsAdmin();
    renderProjectsAdmin();
}

function lockDashboard() {
    sessionStorage.removeItem("collabxAdminUnlocked");
    document.getElementById("dashboard").style.display = "none";
    document.getElementById("gate").style.display = "flex";
    document.getElementById("gatePassword").value = "";
}

// Stay unlocked for this tab session only (cleared on tab close)
if (sessionStorage.getItem("collabxAdminUnlocked") === "true") {
    unlockDashboard();
}


/* ================= TABS ================= */

document.querySelectorAll(".admin-tab").forEach(tab => {
    tab.addEventListener("click", () => {
        document.querySelectorAll(".admin-tab").forEach(t => t.classList.remove("active"));
        document.querySelectorAll(".tab-panel").forEach(p => p.classList.remove("active"));

        tab.classList.add("active");
        document.getElementById(`tab-${tab.dataset.tab}`).classList.add("active");
    });
});


/* ================= DATA HELPERS ================= */

function getAccounts() {
    return JSON.parse(localStorage.getItem("collabxAccounts") || "[]");
}

function saveAccounts(accounts) {
    localStorage.setItem("collabxAccounts", JSON.stringify(accounts));
}

function getCurrentUserEmail() {
    const current = JSON.parse(localStorage.getItem("collabxCurrentUser") || "null");
    return current ? current.email : null;
}

function initials(name) {
    if (!name) return "?";
    return name.trim().split(/\s+/).map(w => w[0]).join("").slice(0, 2).toUpperCase();
}


/* ================= RENDER ================= */

function renderAccounts() {

    const accounts = getAccounts();
    const searchTerm = document.getElementById("adminSearch").value.trim().toLowerCase();
    const currentEmail = getCurrentUserEmail();

    const tbody = document.getElementById("accountsBody");
    tbody.innerHTML = "";

    // Stats (always based on full list, not filtered)
    document.getElementById("statTotal").textContent = accounts.length;
    document.getElementById("statSkills").textContent =
        accounts.filter(a => a.skills && a.skills.trim() !== "").length;
    document.getElementById("statPics").textContent =
        accounts.filter(a => a.profilePic).length;

    const filtered = accounts
        .map((acc, index) => ({ acc, index })) // keep original index for edit/delete
        .filter(({ acc }) =>
            (acc.name || "").toLowerCase().includes(searchTerm) ||
            (acc.email || "").toLowerCase().includes(searchTerm)
        );

    if (filtered.length === 0) {
        tbody.innerHTML = `
            <tr class="empty-row">
                <td colspan="5">No accounts found${searchTerm ? " for that search" : " yet"}.</td>
            </tr>
        `;
        return;
    }

    filtered.forEach(({ acc, index }) => {

        const isCurrent = currentEmail && acc.email === currentEmail;

        const avatar = acc.profilePic
            ? `<img class="avatar-sm" src="${acc.profilePic}" alt="">`
            : `<div class="avatar-sm">${initials(acc.name)}</div>`;

        const row = document.createElement("tr");

        row.innerHTML = `
            <td>
                <div class="acc-name-cell">
                    ${avatar}
                    <span>${escapeHtml(acc.name || "—")}${isCurrent ? '<span class="current-tag">You</span>' : ""}</span>
                </div>
            </td>
            <td>${escapeHtml(acc.email || "—")}</td>
            <td class="skills-cell">${escapeHtml(acc.skills || "—")}</td>
            <td>${escapeHtml(acc.lookingFor || "—")}</td>
            <td>
                <div class="row-actions">
                    <button class="edit-btn" onclick="openEditModal(${index})">Edit</button>
                    <button class="delete-btn" onclick="deleteAccount(${index})">Delete</button>
                </div>
            </td>
        `;

        tbody.appendChild(row);
    });
}

function escapeHtml(str) {
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
}


/* ================= SEARCH ================= */

document.getElementById("adminSearch").addEventListener("input", renderAccounts);


/* ================= EDIT ================= */

function openEditModal(index) {
    const accounts = getAccounts();
    const acc = accounts[index];
    if (!acc) return;

    editingIndex = index;

    document.getElementById("editName").value = acc.name || "";
    document.getElementById("editEmail").value = acc.email || "";
    document.getElementById("editSkills").value = acc.skills || "";
    document.getElementById("editLookingFor").value = acc.lookingFor || "";

    document.getElementById("editPopup").style.display = "flex";
}

function closeEditModal() {
    document.getElementById("editPopup").style.display = "none";
    editingIndex = null;
}

function saveEdit() {
    if (editingIndex === null) return;

    const accounts = getAccounts();
    const acc = accounts[editingIndex];
    if (!acc) return;

    const newEmail = document.getElementById("editEmail").value.trim();

    // If email changed, make sure it doesn't collide with another account
    const collision = accounts.find((a, i) => i !== editingIndex && a.email === newEmail);
    if (collision) {
        alert("Another account already uses that email.");
        return;
    }

    const wasCurrent = getCurrentUserEmail() === acc.email;

    acc.name = document.getElementById("editName").value.trim();
    acc.email = newEmail;
    acc.skills = document.getElementById("editSkills").value.trim();
    acc.lookingFor = document.getElementById("editLookingFor").value.trim();

    saveAccounts(accounts);

    // Keep the "current user" session pointer in sync if we just edited them
    if (wasCurrent) {
        localStorage.setItem("collabxCurrentUser", JSON.stringify({ name: acc.name, email: acc.email }));
    }

    closeEditModal();
    renderAccounts();
}


/* ================= DELETE ================= */

function deleteAccount(index) {
    const accounts = getAccounts();
    const acc = accounts[index];
    if (!acc) return;

    const confirmed = confirm(`Delete account "${acc.name}" (${acc.email})? This can't be undone.`);
    if (!confirmed) return;

    const wasCurrent = getCurrentUserEmail() === acc.email;

    accounts.splice(index, 1);
    saveAccounts(accounts);

    if (wasCurrent) {
        localStorage.removeItem("collabxCurrentUser");
    }

    renderAccounts();
}

function clearAllAccounts() {
    const confirmed = confirm("Delete ALL accounts stored in this browser? This can't be undone.");
    if (!confirmed) return;

    localStorage.removeItem("collabxAccounts");
    localStorage.removeItem("collabxCurrentUser");
    renderAccounts();
}


/* =========================================================
   COLLABORATORS TAB
========================================================= */

let editingCollabIndex = null;

function getCollaboratorsAdmin() {
    return JSON.parse(localStorage.getItem("collabxCollaborators") || "[]");
}

function saveCollaboratorsAdmin(list) {
    localStorage.setItem("collabxCollaborators", JSON.stringify(list));
}

function renderCollabAdmin() {
    const list = getCollaboratorsAdmin();
    const searchTerm = document.getElementById("collabSearch").value.trim().toLowerCase();
    const tbody = document.getElementById("collabBody");
    tbody.innerHTML = "";

    const filtered = list
        .map((c, index) => ({ c, index }))
        .filter(({ c }) =>
            (c.name || "").toLowerCase().includes(searchTerm) ||
            (c.skills || []).join(",").toLowerCase().includes(searchTerm)
        );

    if (filtered.length === 0) {
        tbody.innerHTML = `<tr class="empty-row"><td colspan="5">No collaborators found.</td></tr>`;
        return;
    }

    filtered.forEach(({ c, index }) => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${escapeHtml(c.name || "—")}</td>
            <td>${escapeHtml(c.role || "—")}</td>
            <td class="skills-cell">${escapeHtml((c.skills || []).join(", "))}</td>
            <td>${c.available ? "Available" : "Busy"}</td>
            <td>
                <div class="row-actions">
                    <button class="edit-btn" onclick="openCollabModal(${index})">Edit</button>
                    <button class="delete-btn" onclick="deleteCollab(${index})">Delete</button>
                </div>
            </td>
        `;
        tbody.appendChild(row);
    });
}

document.getElementById("collabSearch").addEventListener("input", renderCollabAdmin);

function openCollabModal(index) {
    editingCollabIndex = index;
    const modalTitle = document.getElementById("collabModalTitle");

    if (index === null) {
        modalTitle.textContent = "Add Collaborator";
        document.getElementById("collabName").value = "";
        document.getElementById("collabRole").value = "";
        document.getElementById("collabSkills").value = "";
        document.getElementById("collabExperience").value = "";
        document.getElementById("collabProjects").value = "";
        document.getElementById("collabAvailable").value = "true";
        document.getElementById("collabBio").value = "";
    } else {
        const c = getCollaboratorsAdmin()[index];
        modalTitle.textContent = "Edit Collaborator";
        document.getElementById("collabName").value = c.name || "";
        document.getElementById("collabRole").value = c.role || "";
        document.getElementById("collabSkills").value = (c.skills || []).join(", ");
        document.getElementById("collabExperience").value = c.experience || "";
        document.getElementById("collabProjects").value = c.projects || "";
        document.getElementById("collabAvailable").value = c.available ? "true" : "false";
        document.getElementById("collabBio").value = c.bio || "";
    }

    document.getElementById("collabPopup").style.display = "flex";
}

function closeCollabModal() {
    document.getElementById("collabPopup").style.display = "none";
    editingCollabIndex = null;
}

function saveCollab() {
    const list = getCollaboratorsAdmin();

    const name = document.getElementById("collabName").value.trim();
    const skillsArr = document.getElementById("collabSkills").value
        .split(",").map(s => s.trim()).filter(Boolean);

    const entry = {
        name,
        role: document.getElementById("collabRole").value.trim(),
        initials: name.split(/\s+/).map(w => w[0]).join("").slice(0, 2).toUpperCase(),
        skills: skillsArr,
        experience: document.getElementById("collabExperience").value.trim(),
        projects: document.getElementById("collabProjects").value.trim(),
        available: document.getElementById("collabAvailable").value === "true",
        bio: document.getElementById("collabBio").value.trim()
    };

    if (editingCollabIndex === null) {
        list.push(entry);
    } else {
        list[editingCollabIndex] = entry;
    }

    saveCollaboratorsAdmin(list);
    closeCollabModal();
    renderCollabAdmin();
}

function deleteCollab(index) {
    const list = getCollaboratorsAdmin();
    const c = list[index];
    if (!confirm(`Delete collaborator "${c.name}"?`)) return;

    list.splice(index, 1);
    saveCollaboratorsAdmin(list);
    renderCollabAdmin();
}


/* =========================================================
   SKILLS TAB
========================================================= */

let editingSkillIndex = null;

function getSkillsAdmin() {
    return JSON.parse(localStorage.getItem("collabxSkills") || "[]");
}

function saveSkillsAdmin(list) {
    localStorage.setItem("collabxSkills", JSON.stringify(list));
}

function renderSkillsAdmin() {
    const list = getSkillsAdmin();
    const searchTerm = document.getElementById("skillSearchAdmin").value.trim().toLowerCase();
    const tbody = document.getElementById("skillsBody");
    tbody.innerHTML = "";

    const filtered = list
        .map((s, index) => ({ s, index }))
        .filter(({ s }) =>
            (s.title || "").toLowerCase().includes(searchTerm) ||
            (s.owner || "").toLowerCase().includes(searchTerm)
        );

    if (filtered.length === 0) {
        tbody.innerHTML = `<tr class="empty-row"><td colspan="5">No skills found.</td></tr>`;
        return;
    }

    filtered.forEach(({ s, index }) => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${escapeHtml(s.title || "—")}</td>
            <td class="skills-cell">${escapeHtml(s.category || "—")}</td>
            <td>${escapeHtml(s.owner || "—")}</td>
            <td>${escapeHtml(s.type || "—")}</td>
            <td>
                <div class="row-actions">
                    <button class="edit-btn" onclick="openSkillModal(${index})">Edit</button>
                    <button class="delete-btn" onclick="deleteSkill(${index})">Delete</button>
                </div>
            </td>
        `;
        tbody.appendChild(row);
    });
}

document.getElementById("skillSearchAdmin").addEventListener("input", renderSkillsAdmin);

function openSkillModal(index) {
    editingSkillIndex = index;
    const modalTitle = document.getElementById("skillModalTitle");

    if (index === null) {
        modalTitle.textContent = "Add Skill";
        document.getElementById("skillTitleAdmin").value = "";
        document.getElementById("skillCategoryAdmin").value = "Development";
        document.getElementById("skillOwnerAdmin").value = "";
        document.getElementById("skillTypeAdmin").value = "text";
        document.getElementById("skillDescAdmin").value = "";
    } else {
        const s = getSkillsAdmin()[index];
        modalTitle.textContent = "Edit Skill";
        document.getElementById("skillTitleAdmin").value = s.title || "";
        document.getElementById("skillCategoryAdmin").value = s.category || "Development";
        document.getElementById("skillOwnerAdmin").value = s.owner || "";
        document.getElementById("skillTypeAdmin").value = s.type || "text";
        document.getElementById("skillDescAdmin").value = s.desc || "";
    }

    document.getElementById("skillPopup").style.display = "flex";
}

function closeSkillModal() {
    document.getElementById("skillPopup").style.display = "none";
    editingSkillIndex = null;
}

function saveSkill() {
    const list = getSkillsAdmin();

    const entry = {
        id: editingSkillIndex === null ? Date.now() : list[editingSkillIndex].id,
        title: document.getElementById("skillTitleAdmin").value.trim() || "Untitled Skill",
        category: document.getElementById("skillCategoryAdmin").value,
        owner: document.getElementById("skillOwnerAdmin").value.trim() || "Unknown",
        type: document.getElementById("skillTypeAdmin").value,
        desc: document.getElementById("skillDescAdmin").value.trim()
    };

    if (editingSkillIndex === null) {
        list.unshift(entry);
    } else {
        list[editingSkillIndex] = entry;
    }

    saveSkillsAdmin(list);
    closeSkillModal();
    renderSkillsAdmin();
}

function deleteSkill(index) {
    const list = getSkillsAdmin();
    const s = list[index];
    if (!confirm(`Delete skill "${s.title}"?`)) return;

    list.splice(index, 1);
    saveSkillsAdmin(list);
    renderSkillsAdmin();
}


/* =========================================================
   PROJECTS TAB (Featured Projects on the home page)
========================================================= */

let editingProjectIndex = null;

function getProjectsAdmin() {
    return JSON.parse(localStorage.getItem("collabxProjects") || "[]");
}

function saveProjectsAdmin(list) {
    localStorage.setItem("collabxProjects", JSON.stringify(list));
}

function renderProjectsAdmin() {
    const list = getProjectsAdmin();
    const tbody = document.getElementById("projectsBody");
    tbody.innerHTML = "";

    if (list.length === 0) {
        tbody.innerHTML = `<tr class="empty-row"><td colspan="5">No projects yet.</td></tr>`;
        return;
    }

    list.forEach((p, index) => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${p.icon || ""} ${escapeHtml(p.title || "—")}</td>
            <td>${escapeHtml(p.createdBy || "—")}</td>
            <td>${escapeHtml(p.collaborators || "—")}</td>
            <td class="skills-cell">${escapeHtml(p.skillsUsed || "—")}</td>
            <td>
                <div class="row-actions">
                    <button class="edit-btn" onclick="openProjectModal(${index})">Edit</button>
                    <button class="delete-btn" onclick="deleteProject(${index})">Delete</button>
                </div>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function openProjectModal(index) {
    editingProjectIndex = index;
    const modalTitle = document.getElementById("projectModalTitle");

    if (index === null) {
        modalTitle.textContent = "Add Project";
        document.getElementById("projectIcon").value = "🚀";
        document.getElementById("projectTitle").value = "";
        document.getElementById("projectCreatedBy").value = "";
        document.getElementById("projectCollaborators").value = "";
        document.getElementById("projectSkillsUsed").value = "";
        document.getElementById("projectDescription").value = "";
        document.getElementById("projectOutcome").value = "";
        document.getElementById("projectLink").value = "#";
    } else {
        const p = getProjectsAdmin()[index];
        modalTitle.textContent = "Edit Project";
        document.getElementById("projectIcon").value = p.icon || "🚀";
        document.getElementById("projectTitle").value = p.title || "";
        document.getElementById("projectCreatedBy").value = p.createdBy || "";
        document.getElementById("projectCollaborators").value = p.collaborators || "";
        document.getElementById("projectSkillsUsed").value = p.skillsUsed || "";
        document.getElementById("projectDescription").value = p.description || "";
        document.getElementById("projectOutcome").value = p.outcome || "";
        document.getElementById("projectLink").value = p.link || "#";
    }

    document.getElementById("projectPopup").style.display = "flex";
}

function closeProjectModal() {
    document.getElementById("projectPopup").style.display = "none";
    editingProjectIndex = null;
}

function saveProject() {
    const list = getProjectsAdmin();

    const entry = {
        icon: document.getElementById("projectIcon").value.trim() || "🚀",
        title: document.getElementById("projectTitle").value.trim() || "Untitled Project",
        createdBy: document.getElementById("projectCreatedBy").value.trim(),
        collaborators: document.getElementById("projectCollaborators").value.trim(),
        skillsUsed: document.getElementById("projectSkillsUsed").value.trim(),
        description: document.getElementById("projectDescription").value.trim(),
        outcome: document.getElementById("projectOutcome").value.trim(),
        link: document.getElementById("projectLink").value.trim() || "#"
    };

    if (editingProjectIndex === null) {
        list.push(entry);
    } else {
        list[editingProjectIndex] = entry;
    }

    saveProjectsAdmin(list);
    closeProjectModal();
    renderProjectsAdmin();
}

function deleteProject(index) {
    const list = getProjectsAdmin();
    const p = list[index];
    if (!confirm(`Delete project "${p.title}"?`)) return;

    list.splice(index, 1);
    saveProjectsAdmin(list);
    renderProjectsAdmin();
}
