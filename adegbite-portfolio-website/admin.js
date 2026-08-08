let content = null;

const statusEl = document.querySelector("[data-status]");
const projectList = document.querySelector("[data-projects]");
const serviceList = document.querySelector("[data-services]");
const projectTemplate = document.querySelector("[data-project-template]");
const serviceTemplate = document.querySelector("[data-service-template]");

const defaultProject = {
  category: "design",
  label: "Creative Design",
  title: "New Project",
  description: "Describe this work and the result you created.",
  link: "",
  button: "",
  image: "",
  art: "design-art"
};

const defaultService = {
  title: "New Service",
  description: "Describe this service."
};

const setStatus = (message) => {
  statusEl.textContent = message;
};

const getByPath = (source, path) =>
  path.split(".").reduce((value, key) => (value == null ? "" : value[key]), source);

const setByPath = (source, path, value) => {
  const parts = path.split(".");
  const last = parts.pop();
  const target = parts.reduce((item, key) => item[key], source);
  target[last] = value;
};

async function loadContent() {
  const response = await fetch("content.json", { cache: "no-store" });
  if (!response.ok) throw new Error("Could not load website content.");
  content = await response.json();
  bindFields();
  renderProjects();
  renderServices();
  setStatus("Ready. Make your changes, then save.");
}

function bindFields() {
  document.querySelectorAll("[data-path]").forEach((field) => {
    field.value = getByPath(content, field.dataset.path) || "";
    field.addEventListener("input", () => {
      setByPath(content, field.dataset.path, field.value);
    });
  });
}

function renderProjects() {
  projectList.innerHTML = "";
  content.projects.forEach((project, index) => {
    const card = projectTemplate.content.firstElementChild.cloneNode(true);
    card.querySelector("h3").textContent = project.title || `Project ${index + 1}`;

    card.querySelectorAll("[data-field]").forEach((field) => {
      field.value = project[field.dataset.field] || "";
      field.addEventListener("input", () => {
        project[field.dataset.field] = field.value;
        if (field.dataset.field === "category") {
          project.art = `${field.value}-art`;
        }
      });
    });

    card.querySelector("[data-remove-project]").addEventListener("click", () => {
      content.projects.splice(index, 1);
      renderProjects();
    });

    card.querySelector("[data-upload-project]").addEventListener("change", async (event) => {
      const file = event.target.files[0];
      if (!file) return;
      const formData = new FormData();
      formData.append("image", file);
      setStatus("Uploading image...");
      const response = await fetch("/api/upload", { method: "POST", body: formData });
      const result = await response.json();
      if (!response.ok || !result.ok) throw new Error(result.error || "Upload failed.");
      project.image = result.url;
      card.querySelector('[data-field="image"]').value = result.url;
      setStatus("Image uploaded. Save changes to publish it.");
    });

    projectList.append(card);
  });
}

function renderServices() {
  serviceList.innerHTML = "";
  content.services.forEach((service, index) => {
    const card = serviceTemplate.content.firstElementChild.cloneNode(true);
    card.querySelector("h3").textContent = service.title || `Service ${index + 1}`;

    card.querySelectorAll("[data-field]").forEach((field) => {
      field.value = service[field.dataset.field] || "";
      field.addEventListener("input", () => {
        service[field.dataset.field] = field.value;
      });
    });

    card.querySelector("[data-remove-service]").addEventListener("click", () => {
      content.services.splice(index, 1);
      renderServices();
    });

    serviceList.append(card);
  });
}

document.querySelector("[data-add-project]").addEventListener("click", () => {
  content.projects.push({ ...defaultProject });
  renderProjects();
});

document.querySelector("[data-add-service]").addEventListener("click", () => {
  content.services.push({ ...defaultService });
  renderServices();
});

document.querySelector("[data-save]").addEventListener("click", async () => {
  setStatus("Saving changes...");
  const response = await fetch("/api/content", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(content)
  });
  const result = await response.json();
  if (!response.ok || !result.ok) throw new Error(result.error || "Save failed.");
  setStatus("Saved. Refresh the portfolio page to see the latest content.");
});

loadContent().catch((error) => {
  setStatus(`${error.message} Start the local editor with: npm start`);
});
