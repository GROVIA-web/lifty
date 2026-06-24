const header = document.querySelector("[data-header]");
const nav = document.querySelector("[data-nav]");
const navToggle = document.querySelector("[data-nav-toggle]");
const revealItems = document.querySelectorAll(".reveal");
const contactForm = document.querySelector("#contact-form");
const audienceButtons = document.querySelectorAll("[data-audience]");
const audiencePanels = document.querySelectorAll("[data-panel]");

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

window.addEventListener("scroll", () => {
  header?.classList.toggle("is-scrolled", window.scrollY > 12);
});

audienceButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const selectedAudience = button.dataset.audience;

    audienceButtons.forEach((item) => {
      item.classList.toggle("is-active", item === button);
    });

    audiencePanels.forEach((panel) => {
      panel.hidden = panel.dataset.panel !== selectedAudience;
    });
  });
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

  revealItems.forEach((item) => revealObserver.observe(item));
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
  if (error) error.textContent = message || "";
}

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
    return;
  }

  feedback.textContent =
    "¡Gracias! Tu interés quedó validado y listo para conectarse al canal de contacto.";
  contactForm.reset();
});
