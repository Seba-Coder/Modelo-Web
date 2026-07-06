const API_URL = "api"

document.getElementById("loginForm").addEventListener("submit", async (e) => {
  e.preventDefault()

  const username = document.getElementById("username").value
  const password = document.getElementById("password").value
  const errorMsg = document.getElementById("error")

  try {
    const response = await fetch(`${API_URL}/login.php`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    })

    const result = await response.json()

    if (result.success) {
      window.location.href = "admin.html"
    } else {
      errorMsg.textContent = result.error || "Error en login"
      errorMsg.classList.add("show")
    }
  } catch (error) {
    errorMsg.textContent = "Error de conexión"
    errorMsg.classList.add("show")
  }
})