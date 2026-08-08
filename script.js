const header = document.querySelector("[data-header]");
const nav = document.querySelector("[data-nav]");
const navToggle = document.querySelector("[data-nav-toggle]");
const serviceList = document.querySelector("[data-services-list]");
const workList = document.querySelector("[data-work-list]");
let observer;

const updateHeader = () => {
  header.classList.toggle("scrolled", window.scrollY > 12);
};

navToggle.addEventListener("click", () => {
  const isOpen = nav.classList.toggle("open");
  document.body.classList.toggle("nav-open", isOpen);
  navToggle.setAttribute("aria-expanded", String(isOpen));
});

nav.addEventListener("click", (event) => {
  if (event.target.matches("a")) {
    nav.classList.remove("open");
    document.body.classList.remove("nav-open");
    navToggle.setAttribute("aria-expanded", "false");
  }
});

const escapeHtml = (value = "") =>
  String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

const setText = (selector, value) => {
  const element = document.querySelector(selector);
  if (element && value) element.textContent = value;
};

const observeReveals = () => {
  document.querySelectorAll(".reveal").forEach((item) => {
    if (!item.classList.contains("visible")) observer.observe(item);
  });
};

const bindFilters = () => {
  const filterButtons = document.querySelectorAll("[data-filter]");
  const workCards = document.querySelectorAll("[data-category]");

  filterButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const filter = button.dataset.filter;

      filterButtons.forEach((item) => item.classList.remove("active"));
      button.classList.add("active");

      workCards.forEach((card) => {
        const isVisible = filter === "all" || card.dataset.category === filter;
        card.classList.toggle("hidden", !isVisible);
      });
    });
  });
};

const projectArt = (project) => {
  if (project.image) {
    return `<div class="work-art image-art"><img src="${escapeHtml(project.image)}" alt="${escapeHtml(project.title)}" /></div>`;
  }

  return `<div class="work-art ${escapeHtml(project.art || `${project.category}-art`)}"></div>`;
};

const projectGallery = (project) => {
  if (!Array.isArray(project.gallery) || project.gallery.length === 0) return "";
  const openLabel = project.galleryButton || "View more";
  const closeLabel = project.galleryClose || "Hide";

  return `
    <button class="work-accordion-toggle" type="button" aria-expanded="false" data-open-label="${escapeHtml(openLabel)}" data-close-label="${escapeHtml(closeLabel)}">
      <span>${escapeHtml(openLabel)}</span>
      <strong>+</strong>
    </button>
    <div class="work-accordion-panel" hidden>
      <div class="flyer-gallery">
        ${project.gallery
          .map(
            (item) => `
              <figure class="flyer-item">
                ${
                  item.image
                    ? `<img src="${escapeHtml(item.image)}" alt="${escapeHtml(item.title)}" />`
                    : `<div class="site-thumb"><span>${escapeHtml(item.title.split(" ").map((word) => word[0]).join("").slice(0, 4))}</span></div>`
                }
                <figcaption>
                  <strong>${escapeHtml(item.title)}</strong>
                  <span>${escapeHtml(item.description || "")}</span>
                  ${
                    item.link
                      ? `<a class="work-link gallery-link" href="${escapeHtml(item.link)}" target="_blank" rel="noreferrer">${escapeHtml(item.button || "Visit Project")}</a>`
                      : ""
                  }
                </figcaption>
              </figure>
            `
          )
          .join("")}
      </div>
    </div>
  `;
};

const bindAccordions = () => {
  document.querySelectorAll(".work-accordion-toggle").forEach((button) => {
    button.addEventListener("click", () => {
      const card = button.closest(".work-card");
      const panel = card.querySelector(".work-accordion-panel");
      const isOpen = button.getAttribute("aria-expanded") === "true";
      const openLabel = button.dataset.openLabel || "View more";
      const closeLabel = button.dataset.closeLabel || "Hide";

      button.setAttribute("aria-expanded", String(!isOpen));
      button.querySelector("span").textContent = isOpen ? openLabel : closeLabel;
      button.querySelector("strong").textContent = isOpen ? "+" : "-";
      panel.hidden = isOpen;
      card.classList.toggle("expanded", !isOpen);

      if (!isOpen) {
        setTimeout(() => card.scrollIntoView({ behavior: "smooth", block: "nearest" }), 120);
      }
    });
  });
};

const renderContent = (content) => {
  setText(".brand strong", content.site?.name);
  setText(".hero-copy .eyebrow", content.hero?.eyebrow);
  setText(".hero-copy h1", content.hero?.title);
  setText(".hero-lead", content.hero?.lead);
  setText(".about .section-heading h2", content.about?.heading);

  const aboutParagraphs = document.querySelectorAll(".about-grid p");
  (content.about?.paragraphs || []).forEach((paragraph, index) => {
    if (aboutParagraphs[index]) aboutParagraphs[index].textContent = paragraph;
  });

  if (Array.isArray(content.services) && serviceList) {
    serviceList.innerHTML = content.services
      .map(
        (service, index) => `
          <article class="service-card reveal">
            <span>${String(index + 1).padStart(2, "0")}</span>
            <h3>${escapeHtml(service.title)}</h3>
            <p>${escapeHtml(service.description)}</p>
          </article>
        `
      )
      .join("");
  }

  if (Array.isArray(content.projects) && workList) {
    workList.innerHTML = content.projects
      .map(
        (project) => `
          <article class="work-card reveal" data-category="${escapeHtml(project.category || "design")}">
            ${projectArt(project)}
            <div>
              <span>${escapeHtml(project.label)}</span>
              <h3>${escapeHtml(project.title)}</h3>
              <p>${escapeHtml(project.description)}</p>
              ${
                project.link
                  ? `<a class="work-link" href="${escapeHtml(project.link)}" target="_blank" rel="noreferrer">${escapeHtml(project.button || "View Project")}</a>`
                  : ""
              }
              ${projectGallery(project)}
            </div>
          </article>
        `
      )
      .join("");
  }

  const email = content.site?.email || "fordimeji7@gmail.com";
  const whatsapp = content.site?.whatsapp || "08101469227";
  const whatsappUrl = content.site?.whatsappUrl || "https://wa.me/2348101469227";
  const instagram = content.site?.instagram || "@dmajorxtaweek";
  const instagramUrl = content.site?.instagramUrl || "https://www.instagram.com/dmajorxtaweek/";
  const contactLinks = document.querySelector(".contact-links");

  if (contactLinks) {
    contactLinks.innerHTML = `
      <a class="contact-card" href="mailto:${escapeHtml(email)}">
        <span>Mail</span>
        <strong>Email Me</strong>
      </a>
      <a class="contact-card" href="${escapeHtml(whatsappUrl)}">
        <span>WA</span>
        <strong>WhatsApp Me</strong>
      </a>
      <a class="contact-card" href="${escapeHtml(instagramUrl)}">
        <span>IG</span>
        <strong>Instagram</strong>
      </a>
    `;
  }

  const form = document.querySelector(".contact-form");
  if (form) form.action = `mailto:${email}`;

  bindFilters();
  bindAccordions();
  observeReveals();
};

const loadEditableContent = async () => {
  try {
    const response = await fetch("content.json", { cache: "no-store" });
    if (!response.ok) return;
    const content = await response.json();
    renderContent(content);
  } catch (error) {
    observeReveals();
    bindFilters();
  }
};

document.querySelectorAll("[data-filter]").forEach((button) => {
  button.addEventListener("click", () => {
    const filter = button.dataset.filter;
    const filterButtons = document.querySelectorAll("[data-filter]");
    const workCards = document.querySelectorAll("[data-category]");

    filterButtons.forEach((item) => item.classList.remove("active"));
    button.classList.add("active");

    workCards.forEach((card) => {
      const isVisible = filter === "all" || card.dataset.category === filter;
      card.classList.toggle("hidden", !isVisible);
    });
  });
});

observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        observer.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.16 }
);

window.addEventListener("scroll", updateHeader, { passive: true });
updateHeader();
loadEditableContent();
