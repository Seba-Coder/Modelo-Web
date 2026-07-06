// API Base URL
const API_URL = "api"

// Navbar scroll effect
window.addEventListener("scroll", () => {
  const navbar = document.getElementById("navbar")
  if (window.scrollY > 50) {
    navbar.classList.add("scrolled")
  } else {
    navbar.classList.remove("scrolled")
  }
})

// Mobile menu toggle
const menuToggle = document.getElementById("menuToggle")
const navMenu = document.getElementById("navMenu")

menuToggle.addEventListener("click", () => {
  navMenu.classList.toggle("active")
})

// Close mobile menu when clicking a link
document.querySelectorAll(".nav-link").forEach((link) => {
  link.addEventListener("click", () => {
    navMenu.classList.remove("active")
  })
})

// Smooth scrolling
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener("click", function (e) {
    e.preventDefault()
    const target = document.querySelector(this.getAttribute("href"))
    if (target) {
      const offset = 80
      const targetPosition = target.offsetTop - offset
      window.scrollTo({
        top: targetPosition,
        behavior: "smooth",
      })
    }
  })
})

// Load menu from API
async function loadMenu() {
  try {
    const response = await fetch(`${API_URL}/menu.php`)
    const categories = await response.json()

    if (categories && categories.length > 0) {
      renderMenuTabs(categories)
      renderMenuContent(categories)

      // Activate first tab
      const firstTab = document.querySelector(".menu-tab")
      if (firstTab) {
        firstTab.click()
      }
    }
  } catch (error) {
    console.error("Error loading menu:", error)
    renderDefaultMenu()
  }
}

function renderMenuTabs(categories) {
  const tabsContainer = document.getElementById("menuTabs")
  tabsContainer.innerHTML = ""

  categories.forEach((category, index) => {
    const tab = document.createElement("button")
    tab.className = "menu-tab"
    tab.textContent = category.name
    tab.setAttribute("data-category", category.id)

    tab.addEventListener("click", () => {
      // Remove active class from all tabs
      document.querySelectorAll(".menu-tab").forEach((t) => t.classList.remove("active"))
      document.querySelectorAll(".menu-category").forEach((c) => c.classList.remove("active"))

      // Add active class to clicked tab and corresponding content
      tab.classList.add("active")
      document.getElementById(`category-${category.id}`).classList.add("active")
    })

    tabsContainer.appendChild(tab)
  })
}

function renderMenuContent(categories) {
  const contentContainer = document.getElementById("menuContent")
  contentContainer.innerHTML = ""

  categories.forEach((category) => {
    const categoryDiv = document.createElement("div")
    categoryDiv.className = "menu-category"
    categoryDiv.id = `category-${category.id}`

    const menuGrid = document.createElement("div")
    menuGrid.className = "menu-grid"

    if (category.items && category.items.length > 0) {
      category.items.forEach((item) => {
        const menuItem = document.createElement("div")
        menuItem.className = "menu-item"

        menuItem.innerHTML = `
                    <div class="menu-item-info">
                        <h3>${item.name}</h3>
                        <p>${item.description}</p>
                    </div>
                    <div class="menu-item-price">$${Number.parseFloat(item.price).toFixed(2)}</div>
                `

        menuGrid.appendChild(menuItem)
      })
    } else {
      menuGrid.innerHTML =
        '<p style="text-align: center; color: var(--text-light);">No hay platos en esta categoría</p>'
    }

    categoryDiv.appendChild(menuGrid)
    contentContainer.appendChild(categoryDiv)
  })
}

function renderDefaultMenu() {
  const defaultCategories = [
    {
      id: 1,
      name: "Parrilla Argentina",
      items: [
        {
          name: "Bife de Chorizo",
          description: "Corte premium de 400g a la parrilla con chimichurri",
          price: "4500.00",
        },
        { name: "Asado de Tira", description: "Costillas jugosas cocinadas a la parrilla argentina", price: "3800.00" },
      ],
    },
    {
      id: 2,
      name: "Cocina Peruana",
      items: [
        {
          name: "Ceviche Clásico",
          description: "Pescado fresco marinado en limón con ají y cebolla",
          price: "3200.00",
        },
        { name: "Lomo Saltado", description: "Tiras de lomo salteadas con papas fritas y arroz", price: "3500.00" },
      ],
    },
  ]

  renderMenuTabs(defaultCategories)
  renderMenuContent(defaultCategories)
  document.querySelector(".menu-tab").click()
}

// Generar horarios disponibles según el día
const dateInput = document.getElementById('date')
const timeSelect = document.getElementById('time')

dateInput.addEventListener('change', function() {
  const selectedDate = new Date(this.value + 'T00:00:00')
  const dayOfWeek = selectedDate.getDay() // 0 = Domingo, 5 = Viernes, 6 = Sábado
  
  generateTimeOptions(dayOfWeek, this.value)
  timeSelect.disabled = false
  timeSelect.value = '' // Reset selección
})

function generateTimeOptions(dayOfWeek, selectedDateString) {
  timeSelect.innerHTML = '<option value="">Selecciona un horario</option>'
  
  // Obtener fecha/hora actual
  const now = new Date()
  const today = now.toISOString().split('T')[0] // YYYY-MM-DD
  const currentHour = now.getHours()
  const currentMinute = now.getMinutes()
  
  // Definir horarios según el día
  let startHour = 11
  let endHour = (dayOfWeek === 5 || dayOfWeek === 6) ? 24 : 23 // Viernes/Sábado hasta 00:00
  let endMinute = (dayOfWeek === 5 || dayOfWeek === 6) ? 0 : 30 // 23:30 o 00:00
  
  // Generar opciones cada 15 minutos
  for (let hour = startHour; hour <= endHour; hour++) {
    const minutes = ['00', '15', '30', '45']
    
    minutes.forEach(minute => {
      // Validar último horario
      if (hour === endHour && parseInt(minute) > endMinute) return
      if (hour === 24 && parseInt(minute) > 0) return // Solo 00:00
      
      const displayHour = hour === 24 ? '00' : hour.toString().padStart(2, '0')
      const timeValue = `${displayHour}:${minute}:00`
      const timeDisplay = `${displayHour}:${minute}`
      
      // Validar si la hora es pasada (solo si es hoy)
      let isDisabled = false
      if (selectedDateString === today) {
        // Si es hoy, desactivar horarios pasados
        if (hour < currentHour || (hour === currentHour && parseInt(minute) <= currentMinute)) {
          isDisabled = true
        }
      }
      
      const option = document.createElement('option')
      option.value = timeValue
      option.textContent = timeDisplay
      option.disabled = isDisabled
      
      timeSelect.appendChild(option)
    })
  }
}

// Validar fecha mínima (hoy)
document.addEventListener('DOMContentLoaded', () => {
  const today = new Date().toISOString().split('T')[0]
  dateInput.setAttribute('min', today)
})

// Reservation form submission
const reservationForm = document.getElementById("reservationForm")
const formMessage = document.getElementById("formMessage")

reservationForm.addEventListener("submit", async (e) => {
  e.preventDefault()

  // Validar que se seleccionó una hora
  if (!timeSelect.value) {
    alert('Por favor selecciona un horario')
    return
  }

  const formData = {
    name: document.getElementById("name").value,
    email: document.getElementById("email").value,
    phone: document.getElementById("phone").value,
    guests: document.getElementById("guests").value,
    date: document.getElementById("date").value,
    time: timeSelect.value,
    message: document.getElementById("message").value,
  }

  // Show loading state
  const submitBtn = reservationForm.querySelector('button[type="submit"]')
  const originalText = submitBtn.textContent
  submitBtn.textContent = "Enviando..."
  submitBtn.disabled = true

  try {
    console.log("[v0] Sending reservation:", formData)

    const response = await fetch(`${API_URL}/reservations.php`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    })

    console.log("[v0] Response status:", response.status)

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const result = await response.json()
    console.log("[v0] Response data:", result)

    if (result.success) {
      formMessage.className = "form-message success"
      formMessage.textContent = "¡Reserva confirmada! Te contactaremos pronto para confirmar los detalles."
      formMessage.style.display = "block"
      reservationForm.reset()
    } else {
      throw new Error(result.error || "Error al crear la reserva")
    }
  } catch (error) {
    console.error("[v0] Reservation error:", error)
    formMessage.className = "form-message error"
    formMessage.textContent = "Error al enviar la reserva. Por favor, intenta nuevamente."
    formMessage.style.display = "block"
  } finally {
    // Restore button state
    submitBtn.textContent = originalText
    submitBtn.disabled = false
  }

  // Hide message after 5 seconds
  setTimeout(() => {
    formMessage.style.display = "none"
  }, 5000)
})

// Initialize
document.addEventListener("DOMContentLoaded", () => {
  loadMenu()
  initCarousel()
})

// Gallery Carousel
function initCarousel() {
  const track = document.querySelector('.carousel-track')
  const slides = Array.from(document.querySelectorAll('.carousel-slide'))
  const prevBtn = document.querySelector('.carousel-btn-prev')
  const nextBtn = document.querySelector('.carousel-btn-next')
  const indicators = Array.from(document.querySelectorAll('.indicator'))
  
  if (!track || slides.length === 0) return
  
  // Initialize captions with alt text
  slides.forEach(slide => {
    const img = slide.querySelector('img')
    const caption = slide.querySelector('.carousel-caption')
    if (img && caption) {
      caption.textContent = img.alt
    }
  })
  
  let currentIndex = 0
  let startX = 0
  let isDragging = false
  
  const updateCarousel = () => {
    track.style.transform = `translateX(-${currentIndex * 100}%)`
    
    // Update indicators
    indicators.forEach((indicator, index) => {
      indicator.classList.toggle('active', index === currentIndex)
    })
  }
  
  const goToSlide = (index) => {
    currentIndex = index
    if (currentIndex < 0) currentIndex = slides.length - 1
    if (currentIndex >= slides.length) currentIndex = 0
    updateCarousel()
  }
  
  // Button navigation
  prevBtn?.addEventListener('click', () => goToSlide(currentIndex - 1))
  nextBtn?.addEventListener('click', () => goToSlide(currentIndex + 1))
  
  // Indicator navigation
  indicators.forEach((indicator, index) => {
    indicator.addEventListener('click', () => goToSlide(index))
  })
  
  // Keyboard navigation
  document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') goToSlide(currentIndex - 1)
    if (e.key === 'ArrowRight') goToSlide(currentIndex + 1)
  })
  
  // Touch/swipe support
  track.addEventListener('touchstart', (e) => {
    startX = e.touches[0].clientX
    isDragging = true
  })
  
  track.addEventListener('touchmove', (e) => {
    if (!isDragging) return
    e.preventDefault()
  })
  
  track.addEventListener('touchend', (e) => {
    if (!isDragging) return
    isDragging = false
    
    const endX = e.changedTouches[0].clientX
    const diff = startX - endX
    
    if (Math.abs(diff) > 50) {
      if (diff > 0) {
        goToSlide(currentIndex + 1)
      } else {
        goToSlide(currentIndex - 1)
      }
    }
  })
  
  // Auto-play (optional, comentado por defecto)
  // setInterval(() => goToSlide(currentIndex + 1), 5000)
}
