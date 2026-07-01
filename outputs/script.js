const header = document.querySelector("[data-header]");
const nav = document.querySelector("[data-nav]");
const navToggle = document.querySelector("[data-nav-toggle]");
const revealItems = document.querySelectorAll(".reveal");
const GOOGLE_SHEETS_WEBHOOK_URL = "https://script.google.com/macros/s/AKfycbx2aZBy7ShAX8tZXbwEhz4jIoo2wxauFaz4JEE-nmi5I5rP0iAanq39Fu6k8vTosR8/exec";
const form = document.querySelector("#preinscripcion-form");
const scrollProgress = document.querySelector("[data-scroll-progress]");
const mobileCta = document.querySelector(".mobile-cta");
const navLinks = document.querySelectorAll('.main-nav a[href^="#"]:not(.nav-cta)');
const trackedSections = [...navLinks]
  .map((link) => document.querySelector(link.getAttribute("href")))
  .filter(Boolean);

navToggle?.addEventListener("click", () => {
  const isOpen = nav.classList.toggle("is-open");
  navToggle.setAttribute("aria-expanded", String(isOpen));
  document.body.classList.toggle("nav-open", isOpen);
});

nav?.addEventListener("click", (event) => {
  if (event.target.matches("a")) {
    nav.classList.remove("is-open");
    navToggle?.setAttribute("aria-expanded", "false");
    document.body.classList.remove("nav-open");
  }
});

function updateScrollState() {
  header?.classList.toggle("is-scrolled", window.scrollY > 12);

  if (scrollProgress) {
    const scrollable = document.documentElement.scrollHeight - window.innerHeight;
    const progress = scrollable > 0 ? Math.min(window.scrollY / scrollable, 1) : 0;
    scrollProgress.style.transform = `scaleX(${progress})`;
  }

  mobileCta?.classList.toggle("is-visible", window.scrollY > 520);
}

window.addEventListener("scroll", updateScrollState, { passive: true });
updateScrollState();

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && nav?.classList.contains("is-open")) {
    nav.classList.remove("is-open");
    navToggle?.setAttribute("aria-expanded", "false");
    document.body.classList.remove("nav-open");
    navToggle?.focus();
  }
});

if ("IntersectionObserver" in window) {
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12 }
  );

  revealItems.forEach((item, index) => {
    item.style.setProperty("--reveal-delay", `${Math.min(index % 4, 3) * 70}ms`);
    revealObserver.observe(item);
  });

  const sectionObserver = new IntersectionObserver(
    (entries) => {
      const visibleSection = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

      if (!visibleSection) return;

      navLinks.forEach((link) => {
        const isActive = link.getAttribute("href") === `#${visibleSection.target.id}`;
        link.classList.toggle("is-active", isActive);
        if (isActive) link.setAttribute("aria-current", "page");
        else link.removeAttribute("aria-current");
      });
    },
    { rootMargin: "-25% 0px -60% 0px", threshold: [0.05, 0.2, 0.5] }
  );

  trackedSections.forEach((section) => sectionObserver.observe(section));
} else {
  revealItems.forEach((item) => item.classList.add("is-visible"));
}

const submitButton = form?.querySelector("button[type='submit']");
const formMessage = document.querySelector("#form-message");

function clearFieldErrors() {
  form?.querySelectorAll(".form-row.has-error").forEach((row) => row.classList.remove("has-error"));
  form?.querySelectorAll("[aria-invalid='true']").forEach((field) => field.setAttribute("aria-invalid", "false"));
  form?.querySelectorAll(".error-message").forEach((error) => { error.textContent = ""; });
}

form?.addEventListener("submit", async (event) => {
  event.preventDefault();

  const formData = new FormData(form);

  const payload = new URLSearchParams();
  payload.append("nombreCompleto", formData.get("nombreCompleto")?.trim() || "");
  payload.append("documento", formData.get("documento")?.trim() || "");
  payload.append("telefono", formData.get("telefono")?.trim() || "");
  payload.append("email", formData.get("email")?.trim() || "");
  payload.append("vehiculo", formData.get("vehiculo") || "");
  payload.append("mensaje", formData.get("mensaje")?.trim() || "");
  payload.append("origen", "Landing Lifty - Preinscripción");
  payload.append("fecha", new Date().toISOString());

  clearFieldErrors();

  if (
    !payload.get("nombreCompleto") ||
    !payload.get("documento") ||
    !payload.get("telefono") ||
    !payload.get("email") ||
    !payload.get("vehiculo")
  ) {
    formMessage.textContent = "Completá todos los campos obligatorios.";
    formMessage.className = "form-message error";
    return;
  }

  try {
    submitButton.disabled = true;
    submitButton.textContent = "Enviando...";
    formMessage.textContent = "";
    formMessage.className = "form-message";

    await fetch(GOOGLE_SHEETS_WEBHOOK_URL, {
      method: "POST",
      mode: "no-cors",
      body: payload
    });

    form.reset();

    formMessage.textContent = "Preinscripción enviada correctamente. Nos pondremos en contacto.";
    formMessage.className = "form-message success";

  } catch (error) {
    console.error("Error enviando preinscripción:", error);

    formMessage.textContent = "No pudimos enviar la preinscripción. Intentá nuevamente o contactanos por WhatsApp.";
    formMessage.className = "form-message error";

  } finally {
    submitButton.disabled = false;
    submitButton.textContent = "Enviar preinscripción";
  }
});
