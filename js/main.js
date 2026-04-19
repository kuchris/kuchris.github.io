let currentLang = "en";
let projectsData = [];
let timelineData = [];
let skillsData = null;
let translations = {};

const timelineContainer = document.getElementById("timeline-container");
const projectsContainer = document.getElementById("projects-container");
const languageButtons = document.querySelectorAll(".btn-language");
const navToggle = document.getElementById("nav-toggle");
const navPanel = document.getElementById("site-menu");
const navLinks = document.querySelectorAll(".nav-links a");

const textMappings = {
    "nav-about": "nav-about",
    "nav-skills": "nav-skills",
    "nav-timeline": "nav-timeline",
    "nav-projects": "nav-projects",
    "nav-contact": "nav-contact",
    "hero-kicker": "hero-kicker",
    "hero-title": "hero-title",
    "hero-subtitle": "hero-subtitle",
    "hero-description": "hero-description",
    "cta-research": "cta-research",
    "cta-github": "cta-github",
    "cta-cv": "cta-cv",
    "hero-stat-1-value": "hero-stat-1-value",
    "hero-stat-1-label": "hero-stat-1-label",
    "hero-stat-2-value": "hero-stat-2-value",
    "hero-stat-2-label": "hero-stat-2-label",
    "hero-stat-3-value": "hero-stat-3-value",
    "hero-stat-3-label": "hero-stat-3-label",
    "hero-panel-label": "hero-panel-label",
    "hero-panel-title": "hero-panel-title",
    "hero-panel-text": "hero-panel-text",
    "hero-detail-1-label": "hero-detail-1-label",
    "hero-detail-1-value": "hero-detail-1-value",
    "hero-detail-2-label": "hero-detail-2-label",
    "hero-detail-2-value": "hero-detail-2-value",
    "hero-detail-3-label": "hero-detail-3-label",
    "hero-detail-3-value": "hero-detail-3-value",
    "about-kicker": "about-kicker",
    "about-title": "about-title",
    "about-text": "about-text",
    "about-card-label": "about-card-label",
    "about-card-title": "about-card-title",
    "about-point-1": "about-point-1",
    "about-point-2": "about-point-2",
    "about-point-3": "about-point-3",
    "skills-kicker": "skills-kicker",
    "skills-title": "skills-title",
    "skills-description": "skills-description",
    "timeline-kicker": "timeline-kicker",
    "timeline-title": "timeline-title",
    "timeline-description": "timeline-description",
    "projects-kicker": "projects-kicker",
    "projects-title": "projects-title",
    "projects-description": "projects-description",
    "contact-kicker": "contact-kicker",
    "contact-title": "contact-title",
    "contact-description": "contact-description",
    "contact-email": "contact-email",
    "contact-feature-hint": "contact-feature-hint",
    "contact-cv": "contact-cv",
    "contact-github": "contact-github",
    "contact-researchgate": "contact-researchgate",
    "footer-text": "footer-text"
};

function bindUI() {
    languageButtons.forEach((button) => {
        button.disabled = true;
        button.addEventListener("click", () => switchLanguage(button.dataset.lang));
    });

    if (navToggle) {
        navToggle.addEventListener("click", toggleMobileNav);
    }

    navLinks.forEach((link) => {
        link.addEventListener("click", closeMobileNav);
    });

    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape") {
            closeMobileNav();
        }
    });
}

function toggleMobileNav() {
    if (!navPanel || !navToggle) {
        return;
    }

    const isOpen = navPanel.classList.toggle("is-open");
    navToggle.setAttribute("aria-expanded", String(isOpen));
    document.body.classList.toggle("menu-open", isOpen);
}

function closeMobileNav() {
    if (!navPanel || !navToggle) {
        return;
    }

    navPanel.classList.remove("is-open");
    navToggle.setAttribute("aria-expanded", "false");
    document.body.classList.remove("menu-open");
}

function createResearchCard(project, index) {
    const card = document.createElement("article");
    card.className = "project-card";

    const projectTitle = project[`title_${currentLang}`] || project.title_en;
    const projectText = project[`text_${currentLang}`] || project.text_en;
    const links = project.links || (project.doi ? [{
        label_en: translations[currentLang]["read-more"],
        label_jp: translations[currentLang]["read-more"],
        url: project.doi
    }] : []);

    const linksHtml = links.length
        ? `
            <div class="project-links">
                ${links.map((link) => {
                    const label = link[`label_${currentLang}`] || link.label_en;
                    return `<a href="${link.url}" target="_blank" rel="noopener noreferrer" class="doi-link">${label}</a>`;
                }).join("")}
            </div>
        `
        : "";

    card.innerHTML = `
        <div class="project-card-head">
            <p class="project-index">Project ${String(index + 1).padStart(2, "0")}</p>
            <h3 class="project-title">${projectTitle}</h3>
        </div>
        <div class="project-card-body">
            <p class="project-summary">${projectText}</p>
        </div>
        <div class="project-card-foot">
            <span class="project-year">${project.year}</span>
            ${linksHtml}
        </div>
    `;

    return card;
}

function renderResearchProjects() {
    if (!projectsContainer) {
        return;
    }

    projectsContainer.innerHTML = "";

    if (!projectsData.length) {
        projectsContainer.innerHTML = `<p class="loading-indicator">${translations[currentLang]["projects-error"]}</p>`;
        return;
    }

    projectsData.forEach((group) => {
        const section = document.createElement("section");
        section.className = "projects-group";

        const title = group[`title_${currentLang}`] || group.title_en;
        const description = group[`description_${currentLang}`] || group.description_en;

        section.innerHTML = `
            <div class="projects-group-head">
                <h3 class="projects-group-title">${title}</h3>
                <p class="projects-group-description">${description}</p>
            </div>
            <div class="projects-group-grid"></div>
        `;

        const grid = section.querySelector(".projects-group-grid");
        group.items.forEach((project, index) => {
            grid.appendChild(createResearchCard(project, index));
        });

        projectsContainer.appendChild(section);
    });
}

function createTimelineItem(item) {
    const container = document.createElement("article");
    container.className = "timeline-item";

    const highlights = item.highlights[currentLang]
        .map((highlight) => `<li>${highlight}</li>`)
        .join("");

    let responsibilitiesHtml = "";

    if (item.responsibility && item.responsibility[currentLang]) {
        const responsibilityItems = item.responsibility[currentLang]
            .map((entry) => `<li>${entry}</li>`)
            .join("");

        responsibilitiesHtml = `
            <div class="timeline-responsibilities">
                <strong>${translations[currentLang]["timeline-responsibility"]}</strong>
                <ul>${responsibilityItems}</ul>
            </div>
        `;
    }

    container.innerHTML = `
        <div class="timeline-dot"></div>
        <div class="timeline-card">
            <div class="timeline-media">
                <img src="${item.image}" alt="${item.title[currentLang]} logo" loading="lazy">
            </div>
            <div class="timeline-body">
                <p class="timeline-date">${item.dates}</p>
                <h3 class="timeline-role">${item.title[currentLang]}</h3>
                <p class="timeline-org">${item.institution[currentLang]}</p>
                <ul class="timeline-list">${highlights}</ul>
                ${responsibilitiesHtml}
            </div>
        </div>
    `;

    const image = container.querySelector("img");
    image.addEventListener("error", () => {
        image.style.display = "none";
    }, { once: true });

    return container;
}

function animateOnScroll() {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        document.querySelectorAll(".timeline-item").forEach((item) => item.classList.add("in-view"));
        return;
    }

    const observer = new IntersectionObserver((entries, currentObserver) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add("in-view");
                currentObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.16 });

    document.querySelectorAll(".timeline-item").forEach((item) => observer.observe(item));
}

function renderTimeline() {
    if (!timelineContainer) {
        return;
    }

    timelineContainer.innerHTML = "";

    if (!timelineData.length) {
        timelineContainer.innerHTML = `<p class="loading-indicator">${translations[currentLang]["timeline-empty"]}</p>`;
        return;
    }

    timelineData.forEach((item) => {
        timelineContainer.appendChild(createTimelineItem(item));
    });

    animateOnScroll();
}

function updatePageText(lang) {
    const pack = translations[lang];

    if (!pack) {
        return;
    }

    document.documentElement.lang = lang === "jp" ? "ja" : "en";
    document.title = pack["page-title"];

    Object.entries(textMappings).forEach(([id, key]) => {
        const node = document.getElementById(id);
        if (node) {
            node.textContent = pack[key];
        }
    });
}

function updateLanguageButtons(lang) {
    languageButtons.forEach((button) => {
        const isActive = button.dataset.lang === lang;
        button.classList.toggle("active", isActive);
        button.setAttribute("aria-pressed", String(isActive));
        button.disabled = false;
    });
}

function switchLanguage(lang) {
    if (!translations[lang]) {
        return;
    }

    currentLang = lang;
    updatePageText(lang);
    updateLanguageButtons(lang);
    renderTimeline();
    renderResearchProjects();
    renderSkills();
    closeMobileNav();
    localStorage.setItem("preferredLang", lang);
}

function handleLoadError() {
    if (projectsContainer) {
        projectsContainer.innerHTML = `<p class="loading-indicator">${translations[currentLang]?.["projects-error"] || "Failed to load projects."}</p>`;
    }

    if (timelineContainer) {
        timelineContainer.innerHTML = `<p class="loading-indicator">${translations[currentLang]?.["timeline-error"] || "Failed to load timeline."}</p>`;
    }

    const skillsCards = document.getElementById("skills-cards");
    if (skillsCards) {
        skillsCards.innerHTML = `<p class="loading-indicator">${translations[currentLang]?.["skills-error"] || "Failed to load skills."}</p>`;
    }
}

async function loadData() {
    try {
        const [projectsResponse, timelineResponse, translationsResponse, skillsResponse] = await Promise.all([
            fetch("data/projects.json"),
            fetch("data/timeline.json"),
            fetch("data/translations.json"),
            fetch("data/skills.json")
        ]);

        if (!projectsResponse.ok || !timelineResponse.ok || !translationsResponse.ok || !skillsResponse.ok) {
            throw new Error("Failed to load site data.");
        }

        projectsData = await projectsResponse.json();
        timelineData = await timelineResponse.json();
        translations = await translationsResponse.json();
        skillsData = await skillsResponse.json();

        const savedLang = localStorage.getItem("preferredLang");
        currentLang = savedLang && translations[savedLang] ? savedLang : "en";

        switchLanguage(currentLang);
    } catch (error) {
        console.error("Error loading data:", error);
        handleLoadError();
    }
}

bindUI();
document.addEventListener("DOMContentLoaded", loadData);
