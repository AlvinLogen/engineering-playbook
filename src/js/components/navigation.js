class NavigationController {
    constructor() {
        this.currentSection = '';
        this.scrollThreshold = 100;
        this.init();
    }

    init(){
        try {
            this.bindEvents();
            this.setupSmoothScrolling();
            this.updateActiveSession();

            if(CONFIG.debug.enabled){
                console.log('Navigation initialized');
            }

        } catch (error) {
            ErrorHandler.logError(error, 'Navigation Initialization')    
        }
    }

    bindEvents(){
        //Smooth scroll for navigation links
        JQueryUtils.bindEvent('a[href^="#"]', 'click', (e) => {
            this.handleSmoothScroll(e);
        }, 'smooth-scroll');

        //Update active section on scroll
        $(window).on('scroll', this.throttle(() => {
            this.updateActiveSession();
            this.handleScrollEffects();
        }, 100));

        //Mobile menu toggle
        JQueryUtils.bindEvent('.mobile-menu-toggle', 'click', (e) => {
            this.toggleMobileMenu();
        }, 'mobile-menu');
    }

    handleSmoothScroll(e){
        e.preventDefault();

        const $link = $(e.currentTarget);
        const $targetId = $link.attr('href');
        const $target = $($targetId);

        if($target.length === 0) return;

        const offsetTop = $target.offsetTop().top - 70; // Account for fixed header

        $('html, body').animate({
            scrollTop: offsetTop
        }, CONFIG.animations.duration, CONFIG.animations.easing);

        // Close mobile menu if open
        this.closeMobileMenu();
    }

    updateActiveSession() {
        const sections = ['home', 'about', 'portfolio', 'contact'];
        let activeSession = '';

        for(let section of sections){
            const $section = $(`#${section}`);
            if($section.length === 0) continue;

            const sectionTop = $section.offset().top - 100;
            const sectionBottom = sectionTop + $section.outerHeight();
            const scrollTop = $(window).scrollTop();

            if(scrollTop >= sectionTop && scrollTop < sectionBottom){
                activeSection = section;
                break;
            }
        }

        if(activeSession != this.currentSection){
            this.currentSection = activeSession;
            this.highlightActiveNavItem(activeSection);
        }
    }
    
    highlightActiveNavItem(activeSection) {
        $('.nav-link').removeClass('active');

        if(activeSection){
            $(`.nav-link[href="#${activeSection}"]`).addClass('active');
        }
    }

    handleScrollEffects(){
        const scrollTop = $(window).scrollTop();
        const $header = $('.main-header');

        // Add/remove scrolled class for header styling
        if(scrollTop > this.scrollThreshold){
            $header.addClass('scrolled');
        } else {
            $header.removeClass('scrolled');
        }

        // Parallax effect for hero section
        const $heroSection = $('.hero-section');
        if($heroSection.length > 0){
            const parallaxSpeed = 0.5;
            const yPos = -(scrollTop * parallaxSpeed);
            $heroSection.css('transform', `translateY(${yPos}px)`);
        }
    }

    toggleMobileMenu(){
        const $mobileMenu = $('.mobile-nav');
        const $toggle = $('.mobile-menu-toggle');

        $mobileMenu.toggleClass('active');
        $toggle.toggleClass('active');

        // Prevent body scroll when menu is open
        if($mobileMenu.hasClass('active')) {
            $('body').addClass('menu-option');
        } else {
            $('body').removeClass('menu-option');
        }
    }

    closeMobileMenu() {
        $('.mobile-nav').removeClass('active');
        $('.mobile-menu-toggle').removeClass('active');
        $('body').removeClass('menu-open');
    }

    setupSmoothScrolling() {
        // Ensure smooth scrolling is enabled
        $('html').css('scroll-behaviour', 'smooth');
    }

    // Utility function from throttling scroll events
    throttle(func, limit){
        let inThrottle;
        return function(){
            const args = arguments;
            const context = this;
            if(!inThrottle){
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        }
    }
}

$(document).ready(() => {
    new NavigationController();
});