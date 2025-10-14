let currentLang = 'en';
let projectsData = [];
let timelineData = [];
let translations = {};

const timelineContainer = document.getElementById('timeline-container');
const projectsContainer = document.getElementById('projects-container');
const languageButtons = document.querySelectorAll('.btn-language');

/**
 * Creates an HTML element for a single research project card.
 * @param {object} project - The data object for the research project.
 * @returns {HTMLElement} The created HTML div element.
 */
function createResearchCard(project) {
    const card = document.createElement('div');
    card.className = 'research-card';
    const doiLinkHtml = project.doi
        ? `<a href="${project.doi}" target="_blank" rel="noopener noreferrer" class="doi-link">${translations[currentLang]['read-more']}</a>`
        : '';
    card.innerHTML = `
        <div class="research-card-header">
            <h3>${project[`title_${currentLang}`]}</h3>
            <p class="research-year">${project.year}</p>
        </div>
        <div class="research-card-body">
            <p>${project[`text_${currentLang}`]}</p>
            ${doiLinkHtml}
        </div>
    `;
    return card;
}

/**
 * Renders all research project cards from the projectsData array into the DOM.
 */
function renderResearchProjects() {
    if (!projectsContainer) {
        console.error("Projects container not found.");
        return;
    }
    projectsContainer.innerHTML = ''; // Clear loading indicator
    const data = projectsData;
    data.forEach(project => {
        projectsContainer.appendChild(createResearchCard(project));
    });
}

/**
 * Creates an HTML element for a single timeline item.
 * @param {object} item - The data object for the timeline item.
 * @returns {HTMLElement} The created HTML div element.
 */
function createTimelineItem(item) {
    const container = document.createElement('div');
    container.classList.add('timeline-item', 'relative');

    // Adjust the image size and container padding for a larger image
    const imageSizeClasses = 'max-w-[112px] max-h-[112px] md:max-w-[128px] md:max-h-[128px] object-contain bg-white';
    const contentMarginClasses = 'ml-10 md:ml-12';

    // Generate the list of highlights
    const highlightsList = item.highlights[currentLang].map(highlight => `<li>${highlight}</li>`).join('');

    // Generate the list of responsibilities if present
    let responsibilitySection = '';
    if (item.responsibility && item.responsibility[currentLang]) {
        const responsibilityList = item.responsibility[currentLang].map(res => `<li>${res}</li>`).join('');
        responsibilitySection = `
            <div style="margin-top: 1rem;">
                <strong>${currentLang === 'en' ? 'Job Responsibility' : '職務経歴'}</strong>
                <ul class="text-base text-gray-700 leading-relaxed">${responsibilityList}</ul>
            </div>
        `;
    }

    container.innerHTML = `
        <div class="timeline-dot"></div>
        <div class="bg-white p-6 md:p-8 rounded-xl shadow-lg border border-gray-200 ${contentMarginClasses} flex flex-col sm:flex-row items-start sm:items-center gap-6">
            <!-- Use the explicit image path from the JSON data -->
            <img src="${item.image}" alt="${item.title[currentLang]} icon" class="${imageSizeClasses} object-cover flex-shrink-0 rounded-md" onerror="this.onerror=null;this.src='https://placehold.co/120x120/999/fff?text=ICON';">
            <div class="flex-grow">
                <p class="text-sm font-semibold text-blue-600 mb-1">${item.dates}</p>
                <h3 class="text-xl md:text-2xl font-bold text-gray-900 mb-1">${item.title[currentLang]}</h3>
                <p class="text-md text-gray-600 mb-3">${item.institution[currentLang]}</p>
                <!-- Render highlights as a bulleted list -->
                <ul class="text-base text-gray-700 leading-relaxed">${highlightsList}</ul>
                ${responsibilitySection}
            </div>
        </div>
    `;
    return container;
}

/**
 * Sets up the IntersectionObserver to animate timeline items on scroll.
 */
function animateOnScroll() {
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.2
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('in-view');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    document.querySelectorAll('.timeline-item').forEach(item => {
        observer.observe(item);
    });
}

/**
 * Renders all timeline items based on the current language.
 */
function renderTimeline() {
    if (!timelineContainer) {
        console.error("Timeline container not found.");
        return;
    }
    timelineContainer.innerHTML = ''; // Clear loading indicator
    // Use the single timelineData array now
    if (timelineData && timelineData.length > 0) {
        timelineData.forEach(item => {
            timelineContainer.appendChild(createTimelineItem(item));
        });
        animateOnScroll(); // Trigger animation after rendering
    } else {
        timelineContainer.innerHTML = '<p style="text-align: center; color: #e74c3c;">No timeline data available.</p>';
    }
}

/**
 * Switches the language of the entire page content.
 * @param {string} lang - The language to switch to ('en' or 'jp').
 */
function switchLanguage(lang) {
    currentLang = lang;
    updatePageText(currentLang);
    renderTimeline();
    renderResearchProjects();
    loadSkills();

    languageButtons.forEach(button => {
        button.classList.toggle('active', button.textContent.toLowerCase() === lang);
    });
    localStorage.setItem('preferredLang', lang);
}

/**
 * Updates all static text content on the page based on the current language.
 * @param {string} lang - The language to switch to.
 */
function updatePageText(lang) {
    document.getElementById('hero-title').textContent = translations[lang]['hero-title'];
    document.getElementById('hero-subtitle').textContent = translations[lang]['hero-subtitle'];
    document.getElementById('hero-description').textContent = translations[lang]['hero-description'];
    document.getElementById('cta-research').textContent = translations[lang]['cta-research'];
    document.getElementById('cta-github').textContent = translations[lang]['cta-github'];
    document.getElementById('about-title').textContent = translations[lang]['about-title'];
    document.getElementById('about-text').textContent = translations[lang]['about-text'];

    // Skills section
    document.getElementById('skills-title').textContent = translations[lang]['skills-title'];

    document.getElementById('timeline-title').textContent = translations[lang]['timeline-title'];
    document.getElementById('projects-title').textContent = translations[lang]['projects-title'];

    // Contact section
    document.getElementById('contact-title').textContent = translations[lang]['contact-title'];
    document.getElementById('contact-email').textContent = translations[lang]['contact-email'];
    document.getElementById('contact-github').textContent = translations[lang]['contact-github'];
    document.getElementById('contact-researchgate').textContent = translations[lang]['contact-researchgate'];
    document.getElementById('contact-description').textContent = translations[lang]['contact-description'];

    // Footer text
    document.getElementById('footer-text').innerHTML = translations[lang]['footer-text'];
}

// Asynchronous function to fetch JSON data
async function loadData() {
    try {
        const [projectsResponse, timelineResponse, translationsResponse] = await Promise.all([
            fetch('data/projects.json'),
            fetch('data/timeline.json'),
            fetch('data/translations.json')
        ]);

        if (!projectsResponse.ok || !timelineResponse.ok || !translationsResponse.ok) {
            throw new Error('Failed to load JSON data.');
        }

        projectsData = await projectsResponse.json();
        timelineData = await timelineResponse.json();
        translations = await translationsResponse.json();

        const savedLang = localStorage.getItem('preferredLang');
        const defaultLang = 'en';
        currentLang = savedLang || defaultLang;

        languageButtons.forEach(button => {
            button.classList.remove('active');
            if (button.textContent.toLowerCase() === currentLang) {
                button.classList.add('active');
            }
        });

        switchLanguage(currentLang);
        loadSkills();

    } catch (error) {
        console.error('Error loading data:', error);
        if (projectsContainer) projectsContainer.innerHTML = '<p style="text-align: center; color: #e74c3c;">Failed to load research projects. Please try again later.</p>';
        if (timelineContainer) timelineContainer.innerHTML = '<p style="text-align: center; color: #e74c3c;">Failed to load timeline data. Please try again later.</p>';
    }
}

document.addEventListener('DOMContentLoaded', loadData);
