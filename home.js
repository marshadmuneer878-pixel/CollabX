// =========================================================
// SIDEBAR (hamburger menu)
// =========================================================

function toggleSidebar() {
  document.getElementById("profileSidebar").classList.toggle("active");
  document.getElementById("sidebarOverlay").classList.toggle("active");
}

function closeSidebar() {
  document.getElementById("profileSidebar").classList.remove("active");
  document.getElementById("sidebarOverlay").classList.remove("active");
}

function previewProfilePic(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (e) => {
    const pic = document.getElementById("sidebarProfilePic");
    pic.style.backgroundImage = `url('${e.target.result}')`;
    pic.style.backgroundSize = "cover";
    pic.style.backgroundPosition = "center";
    pic.innerHTML = "";

    // attach pic to the current account so it persists with the rest of the profile
    const current = JSON.parse(localStorage.getItem("collabxCurrentUser") || "null");
    if (current) {
      const accounts = JSON.parse(localStorage.getItem("collabxAccounts") || "[]");
      const idx = accounts.findIndex(a => a.email === current.email);
      if (idx !== -1) {
        accounts[idx].profilePic = e.target.result;
        localStorage.setItem("collabxAccounts", JSON.stringify(accounts));
      }
    }
  };
  reader.readAsDataURL(file);
}

// =========================================================
// FILL SIDEBAR FROM STORED ACCOUNT
// =========================================================

function fillSidebarFromAccount(account) {
  if (!account) return;
  document.getElementById("sidebarUserName").textContent = account.name || "Your Name";
  document.getElementById("sidebarUserEmail").textContent = account.email || "your@email.com";
  document.getElementById("sidebarUserSkills").textContent = account.skills || "-";
  document.getElementById("sidebarLookingFor").textContent = account.lookingFor || "-";

  if (account.profilePic) {
    const pic = document.getElementById("sidebarProfilePic");
    pic.style.backgroundImage = `url('${account.profilePic}')`;
    pic.style.backgroundSize = "cover";
    pic.style.backgroundPosition = "center";
    pic.innerHTML = "";
  }
}

function loadCurrentUserIntoSidebar() {
  const current = JSON.parse(localStorage.getItem("collabxCurrentUser") || "null");
  if (!current) return;
  const accounts = JSON.parse(localStorage.getItem("collabxAccounts") || "[]");
  const account = accounts.find(a => a.email === current.email);
  fillSidebarFromAccount(account);
}

// =========================================================
// PROFILE POPUP (Create Account)
// =========================================================

function openProfile() {
  document.getElementById("profilePopup").style.display = "flex";
}

function closeProfile() {
  document.getElementById("profilePopup").style.display = "none";
}

document.getElementById("profileForm").addEventListener("submit", (e) => {
  e.preventDefault();

  const name = document.getElementById("profileName").value.trim();
  const email = document.getElementById("profileEmail").value.trim();
  const password = document.getElementById("profilePassword").value;
  const skillsInput = document.getElementById("profileSkills").value.trim();
  const lookingFor = document.getElementById("profileLookingFor").value.trim();

  const accounts = JSON.parse(localStorage.getItem("collabxAccounts") || "[]");

  // already have an account? send to login instead of creating a new one
  const existing = accounts.find(a => a.email === email);
  if (existing) {
    alert("You already created an account with this email. Please log in instead.");
    closeProfile();
    window.location.href = "login.html";
    return;
  }

  // password rule: min 8 chars, at least 1 uppercase, 1 lowercase, 1 number
  const passwordRule = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
  if (!passwordRule.test(password)) {
    alert("Password must be at least 8 characters and include 1 uppercase letter, 1 lowercase letter, and 1 number.");
    return;
  }

  const account = { name, email, password, skills: skillsInput, lookingFor };
  accounts.push(account);
  localStorage.setItem("collabxAccounts", JSON.stringify(accounts));
  localStorage.setItem("collabxCurrentUser", JSON.stringify({ name: account.name, email: account.email }));

  fillSidebarFromAccount(account);

  closeProfile();
  e.target.reset();
  alert("Profile created! You're logged in.");
});

// =========================================================
// SKILLS POPUP (Explore Skills)
// =========================================================

function openSkills() {
  document.getElementById("skillsPopup").style.display = "flex";
}

function closeSkills() {
  document.getElementById("skillsPopup").style.display = "none";
}

// =========================================================
// SINGLE SKILL POPUP (from "What Are You Looking For" cards)
// =========================================================

const skillInfo = {
  "Web Development": {
    icon: "💻",
    description: "Web Development involves creating websites and web applications using technologies such as HTML, CSS, JavaScript and other web technologies. Find people who can help you build websites or share your web development skills with others."
  },
  "UI/UX Design": {
    icon: "🎨",
    description: "UI/UX Design focuses on creating attractive, user-friendly and enjoyable digital experiences. Connect with designers, developers and creators to bring your ideas to life."
  },
  "Python": {
    icon: "🐍",
    description: "Python is a powerful and beginner-friendly programming language used in web development, automation, data analysis, artificial intelligence and many other areas."
  },
  "AI & ML": {
    icon: "🤖",
    description: "Artificial Intelligence and Machine Learning involve creating systems that can learn, analyze information and make intelligent decisions. Collaborate with people interested in AI, ML and innovative projects."
  },
  "Photography": {
    icon: "📸",
    description: "Photography is the art of capturing and creating meaningful visual content. Connect with photographers, designers and creators for projects, events and creative collaborations."
  },
  "Video Editing": {
    icon: "🎬",
    description: "Video Editing involves transforming raw footage into engaging visual stories. Find editors for your projects or showcase your editing skills and collaborate with other creators."
  }
};

function openskill(skillName) {
  const skill = skillInfo[skillName];
  if (!skill) {
    console.log("Skill not found:", skillName);
    return;
  }
  document.getElementById("skill1Icon").textContent = skill.icon;
  document.getElementById("skill1Title").textContent = skillName;
  document.getElementById("skill1Description").textContent = skill.description;
  document.getElementById("skill1Popup").style.display = "flex";
}

function closeskill() {
  document.getElementById("skill1Popup").style.display = "none";
}

// =========================================================
// FIND COLLABORATORS / POST SKILL
// =========================================================

function findCollaborator() {
  window.location.href = "collaborators.html";
}

function postSkill() {
  window.location.href = "skill.html";
}

// =========================================================
// INIT
// =========================================================

document.addEventListener("DOMContentLoaded", loadCurrentUserIntoSidebar);