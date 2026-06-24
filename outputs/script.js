const header = document.querySelector("[data-header]");
const nav = document.querySelector("[data-nav]");
const navToggle = document.querySelector("[data-nav-toggle]");
const revealItems = document.querySelectorAll(".reveal");
const contactForm = document.querySelector("#contact-form");
const scrollProgress = document.querySelector("[data-scroll-progress]");
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
  name: (value) => value.trim().length >= 2 || "Ingresá tu nombre.",
  phone: (value) => value.trim().length >= 7 || "Ingresá un teléfono válido.",
  email: (value) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim()) || "Ingresá un email válido.",
  interest: (value) => value.trim() !== "" || "Elegí una opción.",
  message: (value) => value.trim().length >= 8 || "Contanos brevemente tu interés.",
};

function setFieldError(field, message) {
  const row = field.closest(".form-row");
  const error = row?.querySelector(".error-message");

  row?.classList.toggle("has-error", Boolean(message));
  field.setAttribute("aria-invalid", String(Boolean(message)));
  if (error) error.textContent = message || "";
}

contactForm?.addEventListener("input", (event) => {
  const field = event.target;
  const validate = validators[field.name];

  if (validate && field.closest(".form-row")?.classList.contains("has-error")) {
    const result = validate(field.value);
    setFieldError(field, result === true ? "" : result);
  }
});

contactForm?.addEventListener("submit", (event) => {
  event.preventDefault();

  const formData = new FormData(contactForm);
  let isValid = true;

  Object.entries(validators).forEach(([name, validate]) => {
    const field = contactForm.elements[name];
    const result = validate(String(formData.get(name) || ""));

    if (result !== true) {
      isValid = false;
      setFieldError(field, result);
    } else {
      setFieldError(field, "");
    }
  });

  const feedback = contactForm.querySelector(".form-feedback");

  if (!isValid) {
    feedback.textContent = "Revisá los campos marcados antes de enviar.";
    contactForm.querySelector(".has-error input, .has-error select, .has-error textarea")?.focus();
    return;
  }

  feedback.textContent =
    "¡Gracias! Tu interés quedó validado y listo para conectarse al canal de contacto.";
  contactForm.reset();
});
