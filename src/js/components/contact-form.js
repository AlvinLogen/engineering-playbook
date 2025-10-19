class ContactFormController {
    constructor() {
        this.form = null;
        this.isSubmitting = false;
        this.validationRules = {};
        this.init();
    }

    // Initialize the contact form with defensive programming
    init() {
        try {
            this.form = JQueryUtils.safeSelect('#contact-form');
            if (this.form.length === 0 ){
                throw new Error('Contact form not found')
            }

            this.setupValidationRules();
            this.bindEvents();
            this.setupCharacterCounter();

            if (CONFIG.debug.enabled) {
                console.log('Contact form initialized successfully.');
            }

        } catch (error) {
            ErrorHandler.logError(error, 'ContactForm Initialization.');
        }
    }

    // Setup validation rules from data attributes
    setupValidationRules() {
        const formFields = this.form.find('[data-validation]');

        formFields.each((index, field) => {
            const $field = $(field);
            const rules = $field.data('validation').split('|');

            this.validationRules[$field.attr('name')] = rules;
        });
    }

    // Bind all form events with error handling
    bindEvents() {
        //Form Submission
        JQueryUtils.bindEvent('#contact-form', 'submit', (e) => {
            this.handleSubmit(e);
        }, 'form-submission');

        //Real-time validation
        JQueryUtils.bindEvent('.form-control', 'blur', (e) => {
            this.validateField($(e.target));
        }, 'field-validation');

        //Form Reset
        JQueryUtils.bindEvent('button[type="reset"]', 'click', (e) => {
            this.handleReset();
        }, 'form-reset');

        //Prevent multiple submissions
        JQueryUtils.bindEvent('#submit-btn', 'click', (e) => {
            if (this.isSubmitting){
                e.preventDefault();
                e.stopPropagation();
            }
        }, 'submission-prevention');
    }

    // Setup character counter for message field
    setupCharacterCounter() {
        const messageField = JQueryUtils.safeSelect('#message');
        const charCounter = JQueryUtils.safeSelect('#char-counter');

        if (messageField.length && charCounter.length) {
            JQueryUtils.bindEvent('#message', 'input', () => {
                this.updateCharacterCount();
            }, 'character-counting');
        }

        // Initial count
        this.updateCharacterCount();
    }

    // Update character counter with visual feedback
    updateCharacterCount() {
        // TO DO
    }

    // Validate Individual field


    // Display errors for specific field


    // Validate entire form 


    // Get form data as object

    // Handle form submission


    // Simulate form submission (to be replaced with API call)

    // Set submission state UI

    // Show form messages

    // Handle form reset

    // Clear all form errors
}

