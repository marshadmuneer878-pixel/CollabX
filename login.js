function loginUser() {
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;

  if (!email || !password) {
    alert("Enter email and password.");
    return;
  }

  const accounts = JSON.parse(localStorage.getItem("collabxAccounts") || "[]");
  const match = accounts.find(a => a.email === email && a.password === password);

  if (!match) {
    alert("Invalid email or password. Create account first.");
    return;
  }

  localStorage.setItem("collabxCurrentUser", JSON.stringify({ name: match.name, email: match.email }));
  alert(`Welcome back, ${match.name}!`);
  window.location.href = "index.html";
}