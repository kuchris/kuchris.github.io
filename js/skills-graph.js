function renderSkills() {
    const container = document.getElementById("skills-cards");

    if (!container || !Array.isArray(skillsData)) {
        return;
    }

    container.innerHTML = "";

    if (!skillsData.length) {
        container.innerHTML = `<p class="loading-indicator">${translations[currentLang]?.["skills-empty"] || "No skills available."}</p>`;
        return;
    }

    skillsData.forEach((category) => {
        container.appendChild(createSkillsCard(category));
    });
}

function createSkillsCard(category) {
    const card = document.createElement("article");
    card.className = "skills-card";

    const title = category[`title_${currentLang}`] || category.title_en;
    const description = category[`description_${currentLang}`] || category.description_en;

    const itemsHtml = (category.items || [])
        .map((item) => {
            const label = item[`label_${currentLang}`] || item.label_en;
            const featuredClass = item.featured ? " skill-pill-featured" : "";
            return `<li class="skill-pill${featuredClass}">${label}</li>`;
        })
        .join("");

    card.innerHTML = `
        <div class="skills-card-header">
            <h3 class="skills-card-title">${title}</h3>
            <p class="skills-card-description">${description}</p>
        </div>
        <ul class="skills-list">${itemsHtml}</ul>
    `;

    return card;
}
