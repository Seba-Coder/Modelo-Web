const API_URL = "api"

let lastReservationIds = new Set()
let notificationCheckInterval = null

document.addEventListener("DOMContentLoaded", async () => {
  try {
    const response = await fetch("api/login.php")
    const result = await response.json()
    
    if (!result.success) {
      window.location.href = "login.html"
    }
  } catch (error) {
    window.location.href = "login.html"
  }

  loadReservations()
  loadMenu()
  await loadReservations()
  lastReservationIds = new Set(reservations.map(r => r.id))
  
  // Iniciar polling cada 10 segundos para nuevas reservas
  startNotificationPolling()
})

function startNotificationPolling() {
  notificationCheckInterval = setInterval(async () => {
    await checkForNewReservations()
  }, 10000) // 10 segundos
}

async function checkForNewReservations() {
  try {
    const response = await fetch(`${API_URL}/reservations.php`)
    if (!response.ok) return
    
    const data = await response.json()
    const currentIds = new Set(data.map(r => r.id))
    
    // Detectar nuevas reservas (IDs que no estaban antes)
    const newReservations = data.filter(r => !lastReservationIds.has(r.id))
    
    if (newReservations.length > 0) {
      newReservations.forEach((reservation, index) => {
        setTimeout(() => {
          showNotification(
            'Nueva Reserva',
            `${reservation.name} - ${reservation.guests} personas - ${formatDateDDMMYYYY(reservation.reservation_date)} ${reservation.reservation_time}`
          )
        }, index * 3000)
      })
      
      reservations = data
      lastReservationIds = currentIds
      updateStats()
      renderReservations()
    } else if (currentIds.size < lastReservationIds.size) {
      // Se eliminó una reserva
      reservations = data
      lastReservationIds = currentIds
      updateStats()
      renderReservations()
    }
  } catch (error) {
    console.error('Error checking for new reservations:', error)
  }
}

function showNotification(title, message) {
  const banner = document.getElementById('notificationBanner')
  const titleEl = document.getElementById('notificationTitle')
  const messageEl = document.getElementById('notificationMessage')
  
  titleEl.textContent = title
  messageEl.textContent = message
  
  banner.className = 'notification-banner success'
  banner.classList.add('show')
  
  setTimeout(() => {
    hideNotification()
  }, 5000)
}

function hideNotification() {
  const banner = document.getElementById('notificationBanner')
  banner.classList.remove('show')
}

window.addEventListener('beforeunload', () => {
  if (notificationCheckInterval) {
    clearInterval(notificationCheckInterval)
  }
})

// Sidebar Toggle
const sidebarToggle = document.getElementById('sidebarToggle')
const sidebar = document.querySelector('.sidebar')

if (sidebarToggle && sidebar) {
  sidebarToggle.addEventListener('click', () => {
    if (window.innerWidth > 768) {
      // Desktop: colapsar/expandir
      sidebar.classList.toggle('collapsed')
    } else {
      // Móvil: abrir/cerrar
      sidebar.classList.toggle('active')
    }
  })
}

// Cerrar sidebar en celular al clickear un link
document.querySelectorAll('.sidebar-link').forEach(link => {
  link.addEventListener('click', () => {
    if (window.innerWidth <= 768) {
      sidebar.classList.remove('active')
    }
  })
})

// Cerrar sidebar en celular al clickear fuera
document.addEventListener('click', (e) => {
  if (window.innerWidth <= 768 && !sidebar.contains(e.target) && !sidebarToggle.contains(e.target)) {
    sidebar.classList.remove('active')
  }
})

// Section Navigation
document.querySelectorAll(".sidebar-link").forEach((link) => {
  link.addEventListener("click", () => {
    const section = link.getAttribute("data-section")

    // Update active link
    document.querySelectorAll(".sidebar-link").forEach((l) => l.classList.remove("active"))
    link.classList.add("active")

    // Update active section
    document.querySelectorAll(".content-section").forEach((s) => s.classList.remove("active"))
    document.getElementById(`${section}-section`).classList.add("active")
  })
})

// Reservations Management
let reservations = []

async function loadReservations() {
  try {
    const response = await fetch(`${API_URL}/reservations.php`)
    reservations = await response.json()
    renderReservations()
    updateStats()
  } catch (error) {
    console.error("Error loading reservations:", error)
    document.getElementById("reservationsTable").innerHTML =
      '<tr><td colspan="9" class="loading">Error al cargar reservas</td></tr>'
  }
}

function formatDateDDMMYYYY(isoDate) {
  if (!isoDate) return ""
  const [y, m, d] = isoDate.split("-")
  return `${d}/${m}/${y}`
}

function getStatusText(status) {
  const statusMap = {
    pending: "Pendiente",
    confirmed: "Confirmada",
    cancelled: "Cancelada",
  }
  return statusMap[status] || status
}

function renderReservations() {
  const tbody = document.getElementById("reservationsTable")
  const statusFilter = document.getElementById("statusFilter").value
  const dateFilter = document.getElementById("dateFilter").value
  const searchText = document.getElementById("searchReservations").value.toLowerCase()

  let filtered = reservations

  if (statusFilter !== "all") {
    filtered = filtered.filter((r) => r.status === statusFilter)
  }

  if (dateFilter) {
    filtered = filtered.filter((r) => r.reservation_date === dateFilter)
  }

  if (searchText) {
    filtered = filtered.filter((r) => 
      r.name.toLowerCase().includes(searchText) ||
      r.email.toLowerCase().includes(searchText) ||
      r.phone.toLowerCase().includes(searchText)
    )
  }

  if (filtered.length === 0) {
    tbody.innerHTML = '<tr><td colspan="9" class="loading">No hay reservas</td></tr>'
    return
  }

  tbody.innerHTML = filtered
    .map(
      (reservation) => `
        <tr data-id="${reservation.id}">
            <td>${reservation.name}</td>
            <td>${reservation.email}</td>
            <td>${reservation.phone}</td>
            <td>${formatDateDDMMYYYY(reservation.reservation_date)}</td>
            <td>${reservation.reservation_time}</td>
            <td>${reservation.guests}</td>
            <td>${reservation.message}</td>
            <td>
                <div class="status-cell" data-id="${reservation.id}">
                    <span class="status-badge status-${reservation.status}">
                        ${getStatusText(reservation.status)}
                    </span>
                    <button class="btn btn-sm btn-icon edit-status-btn" title="Editar estado">
                        <i class="fas fa-edit"></i>
                    </button>
                </div>
            </td>
            <td>
                <button
                  type="button"
                  class="btn btn-sm btn-danger ${reservation.status !== "cancelled" ? "btn-disabled" : ""}"
                  title="${reservation.status !== "cancelled" ? "Solo se pueden eliminar las reservas con estado cancelado" : "Eliminar reserva"}"
                  onclick="deleteReservation(${reservation.id})">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        </tr>
    `,
    )
    .join("")

  // Añadir eventos a los botones de editar estado
  tbody.querySelectorAll(".edit-status-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation()
      const cell = btn.closest(".status-cell")
      const reservationId = parseInt(cell.dataset.id)
      editStatusInline(reservationId, cell)
    })
  })
}

function editStatusInline(reservationId, cell) {
  const reservation = reservations.find((r) => r.id === reservationId)
  if (!reservation) return

  // Reemplazar contenido con select
  cell.innerHTML = `
    <select class="status-select-inline" data-id="${reservationId}">
        <option value="pending" ${reservation.status === "pending" ? "selected" : ""}>Pendiente</option>
        <option value="confirmed" ${reservation.status === "confirmed" ? "selected" : ""}>Confirmada</option>
        <option value="cancelled" ${reservation.status === "cancelled" ? "selected" : ""}>Cancelada</option>
    </select>
    <button class="btn btn-sm btn-icon confirm-status-btn" title="Confirmar cambio">
        <i class="fas fa-check"></i>
    </button>
    <button class="btn btn-sm btn-icon cancel-status-btn" title="Cancelar">
        <i class="fas fa-times"></i>
    </button>
  `

  // Evento para confirmar
  cell.querySelector(".confirm-status-btn").addEventListener("click", async () => {
    const newStatus = cell.querySelector(".status-select-inline").value
    await updateReservationStatus(reservationId, newStatus)
  })

  // Evento para cancelar edición
  cell.querySelector(".cancel-status-btn").addEventListener("click", () => {
    renderReservations()
  })

  // Enfocar el select
  cell.querySelector(".status-select-inline").focus()
}

async function updateReservationStatus(id, status) {
  try {
    const response = await fetch(`${API_URL}/reservations.php`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    })

    const result = await response.json()
    if (result.success) {
      await loadReservations()
    }
  } catch (error) {
    console.error("Error updating reservation:", error)
    alert("Error al actualizar la reserva")
  }
}

async function deleteReservation(id) {
  // Validación previa en cliente
  const r = reservations.find((x) => x.id === id)
  if (!r) {
    alert("Reserva no encontrada")
    return
  }
  if (r.status !== "cancelled") {
    alert("Solo se pueden eliminar las reservas con estado cancelado")
    return
  }

  if (!confirm("¿Estás seguro de eliminar esta reserva?")) return

  try {
    const response = await fetch(`${API_URL}/reservations.php`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    })

    const result = await response.json()
    if (result.success) {
      await loadReservations()
      alert("Reserva eliminada correctamente")
    } else {
      alert("Error al eliminar la reserva: " + (result.error || result.message || "Error desconocido"))
    }
  } catch (error) {
    console.error("Error deleting reservation:", error)
    alert("Error al eliminar la reserva")
  }
}

function updateStats() {
  document.getElementById("totalReservations").textContent = reservations.length
  document.getElementById("pendingReservations").textContent = reservations.filter((r) => r.status === "pending").length
  document.getElementById("confirmedReservations").textContent = reservations.filter(
    (r) => r.status === "confirmed",
  ).length
}

// Filters
document.getElementById("statusFilter").addEventListener("change", renderReservations)
document.getElementById("dateFilter").addEventListener("change", renderReservations)
document.getElementById("searchReservations").addEventListener("input", renderReservations)

// Menu Management
let menuCategories = []

async function loadMenu() {
  try {
    const response = await fetch(`${API_URL}/menu.php`)
    menuCategories = await response.json()
    renderMenuManagement()
    
    // Agregar event listener para búsqueda de menú
    const searchMenuInput = document.getElementById("searchMenu")
    if (searchMenuInput) {
      searchMenuInput.addEventListener("input", renderMenuManagement)
    }
  } catch (error) {
    console.error("Error loading menu:", error)
    document.getElementById("menuManagement").innerHTML = '<p class="loading">Error al cargar el menú</p>'
  }
}

function renderMenuManagement() {
  const container = document.getElementById("menuManagement")
  const searchText = document.getElementById("searchMenu")?.value.toLowerCase() || ""

  if (menuCategories.length === 0) {
    container.innerHTML = '<p class="loading">No hay categorías. Agrega una para comenzar.</p>'
    return
  }

  // Filtrar categorías y platos según búsqueda
  let filteredCategories = menuCategories
  if (searchText) {
    filteredCategories = menuCategories.map(category => {
      // Si la categoría coincide, mostrar todos sus platos
      if (category.name.toLowerCase().includes(searchText)) {
        return category
      }
      // Si la categoría no coincide, filtrar solo los platos que coincidan
      const filteredItems = category.items?.filter(dish => 
        dish.name.toLowerCase().includes(searchText) ||
        dish.description.toLowerCase().includes(searchText)
      ) || []
      
      // Solo incluir la categoría si tiene platos que coincidan
      if (filteredItems.length > 0) {
        return { ...category, items: filteredItems }
      }
      return null
    }).filter(Boolean)
  }

  if (filteredCategories.length === 0) {
    container.innerHTML = '<p class="loading">No se encontraron resultados</p>'
    return
  }

  container.innerHTML = filteredCategories
    .map(
      (category, catIndex) => `
        <div class="category-card">
            <div class="category-header">
                <h3 class="category-title">${category.name}</h3>
                <div class="category-actions">
                    <div class="reorder-buttons">
                        <button class="btn btn-sm btn-icon" onclick="moveCategoryUp(${catIndex})" 
                                ${catIndex === 0 ? "disabled" : ""}>
                            <i class="fas fa-arrow-up"></i>
                        </button>
                        <button class="btn btn-sm btn-icon" onclick="moveCategoryDown(${catIndex})"
                                ${catIndex === menuCategories.length - 1 ? "disabled" : ""}>
                            <i class="fas fa-arrow-down"></i>
                        </button>
                    </div>
                    <button class="btn btn-sm btn-primary" onclick="openDishModal(${category.id})">
                        <i class="fas fa-plus"></i> Agregar Plato
                    </button>
                    <button class="btn btn-sm btn-secondary" onclick="editCategory(${category.id})">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="deleteCategory(${category.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
            <div class="dishes-list">
                ${
                  category.items && category.items.length > 0
                    ? category.items
                        .map(
                          (dish, dishIndex) => `
                        <div class="dish-item">
                            <div class="dish-info">
                                <h4>${dish.name}</h4>
                                <p>${dish.description}</p>
                                <span class="dish-price">$${Number.parseFloat(dish.price).toFixed(2)}</span>
                            </div>
                            <div style="display: flex; align-items: center;">
                                <div class="reorder-buttons">
                                    <button class="btn btn-sm btn-icon" onclick="moveDishUp(${category.id}, ${dishIndex})"
                                            ${dishIndex === 0 ? "disabled" : ""}>
                                        <i class="fas fa-arrow-up"></i>
                                    </button>
                                    <button class="btn btn-sm btn-icon" onclick="moveDishDown(${category.id}, ${dishIndex})"
                                            ${dishIndex === category.items.length - 1 ? "disabled" : ""}>
                                        <i class="fas fa-arrow-down"></i>
                                    </button>
                                </div>
                                <div class="dish-actions">
                                    <button class="btn btn-sm btn-secondary" onclick="editDish(${category.id}, ${dish.id})">
                                        <i class="fas fa-edit"></i>
                                    </button>
                                    <button class="btn btn-sm btn-danger" onclick="deleteDish(${category.id}, ${dish.id})">
                                        <i class="fas fa-trash"></i>
                                    </button>
                                </div>
                            </div>
                        </div>
                    `,
                        )
                        .join("")
                    : '<p style="text-align: center; color: var(--text-light); padding: 1rem;">No hay platos en esta categoría</p>'
                }
            </div>
        </div>
    `,
    )
    .join("")
}

// Category Management
document.getElementById("addCategoryBtn").addEventListener("click", () => {
  document.getElementById("categoryModalTitle").textContent = "Agregar Categoría"
  document.getElementById("categoryForm").reset()
  document.getElementById("categoryId").value = ""
  document.getElementById("categoryModal").classList.add("active")
})

document.getElementById("categoryForm").addEventListener("submit", async (e) => {
  e.preventDefault()

  const id = document.getElementById("categoryId").value
  const name = document.getElementById("categoryName").value

  try {
    const method = id ? "PUT" : "POST"
    const body = id ? { id, name, type: "category" } : { name, type: "category" }

    const response = await fetch(`${API_URL}/menu.php`, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })

    const result = await response.json()
    if (result.success) {
      closeCategoryModal()
      await loadMenu()
    }
  } catch (error) {
    console.error("Error saving category:", error)
    alert("Error al guardar la categoría")
  }
})

function editCategory(id) {
  const category = menuCategories.find((c) => c.id === id)
  if (category) {
    document.getElementById("categoryModalTitle").textContent = "Editar Categoría"
    document.getElementById("categoryId").value = category.id
    document.getElementById("categoryName").value = category.name
    document.getElementById("categoryModal").classList.add("active")
  }
}

async function deleteCategory(id) {
  if (!confirm("¿Estás seguro de eliminar esta categoría y todos sus platos?")) return

  try {
    const response = await fetch(`${API_URL}/menu.php`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, type: "category" }),
    })

    const result = await response.json()
    if (result.success) {
      await loadMenu()
    }
  } catch (error) {
    console.error("Error deleting category:", error)
    alert("Error al eliminar la categoría")
  }
}

function closeCategoryModal() {
  document.getElementById("categoryModal").classList.remove("active")
}

// Dish Management
function openDishModal(categoryId, dishId = null) {
  document.getElementById("dishCategoryId").value = categoryId
  document.getElementById("dishId").value = dishId || ""

  if (dishId) {
    const category = menuCategories.find((c) => c.id === categoryId)
    const dish = category.items.find((d) => d.id === dishId)

    document.getElementById("dishModalTitle").textContent = "Editar Plato"
    document.getElementById("dishName").value = dish.name
    document.getElementById("dishDescription").value = dish.description
    document.getElementById("dishPrice").value = dish.price
  } else {
    document.getElementById("dishModalTitle").textContent = "Agregar Plato"
    document.getElementById("dishForm").reset()
  }

  document.getElementById("dishModal").classList.add("active")
}

function editDish(categoryId, dishId) {
  openDishModal(categoryId, dishId)
}

document.getElementById("dishForm").addEventListener("submit", async (e) => {
  e.preventDefault()

  const categoryId = document.getElementById("dishCategoryId").value
  const dishId = document.getElementById("dishId").value
  const name = document.getElementById("dishName").value
  const description = document.getElementById("dishDescription").value
  const price = document.getElementById("dishPrice").value

  try {
    const method = dishId ? "PUT" : "POST"
    const body = {
      type: "dish",
      category_id: categoryId,
      name,
      description,
      price,
    }

    if (dishId) {
      body.id = dishId
    }

    const response = await fetch(`${API_URL}/menu.php`, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })

    const result = await response.json()
    if (result.success) {
      closeDishModal()
      await loadMenu()
    }
  } catch (error) {
    console.error("Error saving dish:", error)
    alert("Error al guardar el plato")
  }
})

async function deleteDish(categoryId, dishId) {
  if (!confirm("¿Estás seguro de eliminar este plato?")) return

  try {
    const response = await fetch(`${API_URL}/menu.php`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: dishId, type: "dish" }),
    })

    const result = await response.json()
    if (result.success) {
      await loadMenu()
    }
  } catch (error) {
    console.error("Error deleting dish:", error)
    alert("Error al eliminar el plato")
  }
}

function closeDishModal() {
  document.getElementById("dishModal").classList.remove("active")
}

// Reordering
async function moveCategoryUp(index) {
  if (index === 0) return
  const temp = menuCategories[index]
  menuCategories[index] = menuCategories[index - 1]
  menuCategories[index - 1] = temp
  await saveMenuOrder()
}

async function moveCategoryDown(index) {
  if (index === menuCategories.length - 1) return
  const temp = menuCategories[index]
  menuCategories[index] = menuCategories[index + 1]
  menuCategories[index + 1] = temp
  await saveMenuOrder()
}

async function moveDishUp(categoryId, dishIndex) {
  const category = menuCategories.find((c) => c.id === categoryId)
  if (dishIndex === 0 || !category) return

  const temp = category.items[dishIndex]
  category.items[dishIndex] = category.items[dishIndex - 1]
  category.items[dishIndex - 1] = temp
  await saveMenuOrder()
}

async function moveDishDown(categoryId, dishIndex) {
  const category = menuCategories.find((c) => c.id === categoryId)
  if (dishIndex === category.items.length - 1 || !category) return

  const temp = category.items[dishIndex]
  category.items[dishIndex] = category.items[dishIndex + 1]
  category.items[dishIndex + 1] = temp
  await saveMenuOrder()
}

async function saveMenuOrder() {
  try {
    const response = await fetch(`${API_URL}/menu.php`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "reorder", menu: menuCategories }),
    })

    const result = await response.json()
    if (result.success) {
      renderMenuManagement()
    }
  } catch (error) {
    console.error("Error saving order:", error)
    alert("Error al guardar el orden")
  }
}

// Modal close handlers
document.querySelectorAll(".close").forEach((closeBtn) => {
  closeBtn.addEventListener("click", () => {
    closeBtn.closest(".modal").classList.remove("active")
  })
})

window.onclick = (event) => {
  if (event.target.classList.contains("modal")) {
    event.target.classList.remove("active")
  }
}

// Initialize
document.addEventListener("DOMContentLoaded", () => {
  loadReservations()
  loadMenu()
})
