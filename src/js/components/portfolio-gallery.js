class PortfolioGallery {
    constructor() {
        this.projects = [];
        this.currentFilter = 'all';
        this.isLoading = false;
        this.init();
    }

    init(){
        try {
            this.loadProjects();
            this.setupFilters();
            this.bindEvents();

            if (CONFIG.debug.enabled){
                console.log('Portfolio gallery initialized');
            }
        } catch (error) {
            ErrorHandler.logError(error, 'Portfolio gallery initialization');
        }
    }

    async loadProjects() {
        this.setLoadingState(true);

        try {
            // Mock project data - later replace with API call
            this.projects = [
                {
                id: 1,
                title: 'Node.js API',
                description: 'RESTful API with health endpoints and database integration',
                technologies: ['Node.js', 'Express', 'SQL Server'],
                category: 'backend',
                imageUrl: 'src/assets/projects/api-project.jpg',
                githubUrl: 'https://github.com/yourusername/node-api-starter',
                liveUrl: null,
                featured: true
                },
                {
                id: 2,
                title: 'Portfolio Website',
                description: 'Responsive personal portfolio with interactive features',
                technologies: ['HTML', 'CSS', 'JavaScript', 'jQuery'],
                category: 'frontend',
                imageUrl: 'src/assets/projects/portfolio-project.jpg',
                githubUrl: 'https://github.com/yourusername/engineering-playbook',
                liveUrl: 'http://localhost',
                featured: true
                },
                {
                id: 3,
                title: 'Contact Form System',
                description: 'Dynamic contact form with validation and submission handling',
                technologies: ['JavaScript', 'jQuery', 'CSS'],
                category: 'frontend',
                imageUrl: 'src/assets/projects/contact-form.jpg',
                githubUrl: null,
                liveUrl: null,
                featured: false
                }
            ];

            this.renderProjects();           
        } catch (error) {
            ErrorHandler.logError(error, 'Loading projects');
            this.showErrorMessage('Failed to load projects');
        } finally {
            this.setLoadingState(false);
        }
    }

    setupFilters(){
        const categories = ['all', ...new Set(this.projects.map(p => p.category))];
        const $filterContainer = JQueryUtils.safeSelect('.portfolio-filters');

        if($filterContainer.length === 0) return;

        const filtersHtml = categories.map(category => 
            `<button class="filter-btn ${category === 'all' ? 'active' : ''}" 
                    data-filter="${category}">
                ${category.charAt(0).toUpperCase() + category.slice(1)}
            </button>`
        ).join('');

        $filterContainer.html(filtersHtml);
    }

    bindEvents(){
        JQueryUtils.bindEvent('.filter-btn', 'click', (e) => {
            this.handleFilterClick($(e.target));
        },'portfolio-filter');

        JQueryUtils.bindEvent('.project-card', 'click', (e) => {
            this.handleProjectClick($(e.currentTarget));
        } ,'project-card-click');
    }

    handleFilterClick($btn){
        const filter = $btn.data('filter');

        if(filter === this.currentFilter) return;

        // Update active state
        $('.filter-btn').removeClass('active');
        $btn.addClass('active');

        this.currentFilter = filter;
        this.filterProjects(filter);
    }

    filterProjects(filter){
        const $projectCards = $('.project-card');

        $projectCards.each((index, card) => {
            const $card = $(card);
            const category = $card.data('category');

            if(filter === 'all' || category === filter){
                $card.fadeIn(CONFIG.animations.duration);
            } else {
                $card.fadeOut(CONFIG.animations.duration);
            }
        });
    }

    renderProjects(){
        const $container = JQueryUtils.safeSelect('.portfolio-grid');

        if($container.length === 0){
            console.warn('Portfolio grid container not found');
            return;
        }

        const projectsHtml = this.projects.map(project => this.createProjectCard(project)).join('');
        $container.html(projectsHtml);

        // Initialize lazy loading for images
        this.initLazyLoading();
    }

    createProjectCard(project){
    const technologiesHtml = project.technologies.map(tech => 
      `<span class="tech-tag">${tech}</span>`
    ).join('');
    
    return `
      <div class="project-card" data-category="${project.category}" data-project-id="${project.id}">
        <div class="project-image">
          <img data-src="${project.imageUrl}" 
               alt="${project.title}" 
               class="lazy-load"
               src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkxvYWRpbmcuLi48L3RleHQ+PC9zdmc+">
          <div class="project-overlay">
            <div class="project-actions">
              ${project.liveUrl ? `<a href="${project.liveUrl}" class="btn btn-primary" target="_blank">Live Demo</a>` : ''}
              ${project.githubUrl ? `<a href="${project.githubUrl}" class="btn btn-secondary" target="_blank">GitHub</a>` : ''}
            </div>
          </div>
        </div>
        <div class="project-content">
          <h3 class="project-title">${project.title}</h3>
          <p class="project-description">${project.description}</p>
          <div class="project-technologies">
            ${technologiesHtml}
          </div>
        </div>
      </div>
    `;
    }

    initLazyLoading(){
        const lazyImages = document.querySelectorAll('.lazy-load');

        if('IntersectionObserver' in window){
            const imageObserver = new IntersectionObserver((entries, observer) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting){
                        const img = entry.target;
                        img.src = img.dataset.src;
                        img.classList.remove('lazy-load');
                        imageObserver.unobserve(img);
                    }
                });
            });

            lazyImages.forEach(img => imageObserver.observe(img));
        } else {
            // Fallback for older browsers
            lazyImages.forEach(img => {
                img.src = img.dataset.src;
                img.classList.remove('lazy-load');
            });
        }
    }

    setLoadingState(isLoading){
        this.isLoading = isLoading;
        const $loadingIndicator = JQueryUtils.safeSelect('.portfolio-loading');
        
        if(isLoading){
            $loadingIndicator.show();
        } else {
            $loadingIndicator.hide();
        }
    }

    showErrorMessage(message) {
        const $container = JQueryUtils.safeSelect('.portfolio-grid');
        $container.html(`
        <div class="portfolio-error">
            <p>${message}</p>
            <button class="btn btn-primary" onclick="portfolioGallery.loadProjects()">
            Try Again
            </button>
        </div>           
        `);
    }
}

$(document).ready(() => {
    if(CONFIG.features.portfolioFilters){
        window.PortfolioGallery = new PortfolioGallery();
    }
});


/*
When to Choose Each:
Use jQuery Objects ($variable) when you need:
    jQuery methods: .addClass(), .removeClass(), .data(), .attr(), .css()
    jQuery animations: .fadeIn(), .slideUp(), .animate()
    Event handling: .on(), .off(), .trigger()
    Chaining: $element.addClass('active').fadeIn().css('color', 'red')
Use Regular Variables when you need:
    Raw DOM properties: element.id, element.className, element.innerHTML
    Native JavaScript methods: element.getAttribute(), element.style.display
    Performance (jQuery has slight overhead)
    Working with non-DOM data: strings, numbers, arrays, objects
*/