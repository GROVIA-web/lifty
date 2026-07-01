const header = document.querySelector("[data-header]");
const nav = document.querySelector("[data-nav]");
const navToggle = document.querySelector("[data-nav-toggle]");
const revealItems = document.querySelectorAll(".reveal");
const GOOGLE_SHEETS_WEBHOOK_URL = "https://script.google.com/macros/s/AKfycby4GkuCrRj2ksznIoHGbzVt5WMMHBltG6jYfPME5_WMK1LYNunDJykDuC32g_PSh9SP/exec";
const preinscripcionForm = document.querySelector("#preinscripcion-form");
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

const validators = {
  nombreCompleto: (value) => value.trim().length >= 2 || "Ingresá tu nombre completo.",
  documento: (value) => value.trim().length >= 6 || "Ingresá tu documento.",
  telefono: (value) => value.trim().length >= 7 || "Ingresá un teléfono válido.",
  email: (value) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim()) || "Ingresá un email válido.",
  vehiculo: (value) => value.trim() !== "" || "Elegí una opción.",
};

function setFieldError(field, message) {
  const row = field?.closest(".form-row");
  const error = row?.querySelector(".error-message");

  row?.classList.toggle("has-error", Boolean(message));
  field?.setAttribute("aria-invalid", String(Boolean(message)));
  if (error) error.textContent = message || "";
}

preinscripcionForm?.addEventListener("input", (event) => {
  const field = event.target;
  const validate = validators[field.name];

  if (validate && field.closest(".form-row")?.classList.contains("has-error")) {
    const result = validate(field.value);
    setFieldError(field, result === true ? "" : result);
  }
});

preinscripcionForm?.addEventListener("submit", async (event) => {
  event.preventDefault();

  const formData = new FormData(preinscripcionForm);
  const submitButton = preinscripcionForm.querySelector("button[type='submit']");
  const formMessage = document.querySelector("#form-message");
  const payload = {
    nombreCompleto: formData.get("nombreCompleto")?.trim(),
    documento: formData.get("documento")?.trim(),
    telefono: formData.get("telefono")?.trim(),
    email: formData.get("email")?.trim(),
    vehiculo: formData.get("vehiculo"),
    mensaje: formData.get("mensaje")?.trim(),
    origen: "Landing Lifty - Preinscripción",
    fecha: new Date().toISOString(),
  };
  let isValid = true;

  Object.entries(validators).forEach(([name, validate]) => {
    const field = preinscripcionForm.elements[name];
    const result = validate(String(formData.get(name) || ""));

    if (result !== true) {
      isValid = false;
      setFieldError(field, result);
    } else {
      setFieldError(field, "");
    }
  });

  if (!isValid) {
    if (formMessage) {
      formMessage.textContent = "Completá todos los campos obligatorios.";
      formMessage.className = "form-message error";
    }
    preinscripcionForm.querySelector(".has-error input, .has-error select, .has-error textarea")?.focus();
    return;
  }

  if (GOOGLE_SHEETS_WEBHOOK_URL === "PEGAR_ACA_LA_URL_DE_APPS_SCRIPT") {
    if (formMessage) {
      formMessage.textContent =
        "Falta pegar la URL de Google Apps Script para activar el envío.";
      formMessage.className = "form-message error";
    }
    return;
  }

  try {
    submitButton.disabled = true;
    submitButton.textContent = "Enviando...";
    if (formMessage) {
      formMessage.textContent = "";
      formMessage.className = "form-message";
    }

    await fetch(GOOGLE_SHEETS_WEBHOOK_URL, {
      method: "POST",
      mode: "no-cors",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    preinscripcionForm.reset();

    if (formMessage) {
      formMessage.textContent =
        "Preinscripción enviada correctamente. Nos pondremos en contacto.";
      formMessage.className = "form-message success";
    }
  } catch (error) {
    console.error("Error enviando preinscripción:", error);

    if (formMessage) {
      formMessage.textContent =
        "No pudimos enviar la preinscripción. Intentá nuevamente o contactanos por WhatsApp.";
      formMessage.className = "form-message error";
    }
  } finally {
    submitButton.disabled = false;
    submitButton.textContent = "Enviar preinscripción";
  }
});
