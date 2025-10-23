const CONFIG = {
    animations: {
        duration: 300,
        easing: 'ease-in-out',
    },
    validation: {
        emailPattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        minNameLength: 2, 
        maxMesageLength: 500
    },
    features: {
        contactForm: true,
        portfolioFilters: true
    },
    debug: {
        enabled: true,
        logLevel: 'info'
    }
};

Object.freeze(CONFIG);