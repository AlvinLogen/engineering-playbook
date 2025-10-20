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
            if (this.form.length === 0) {
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

        JQueryUtils.bindEvent('#message', 'input', (e) => {
            this.updateCharacterCount($(e.target));
        }, 'character-counter')

        //Form Reset
        JQueryUtils.bindEvent('button[type="reset"]', 'click', (e) => {
            this.handleReset();
        }, 'form-reset');

        //Prevent multiple submissions
        JQueryUtils.bindEvent('#submit-btn', 'click', (e) => {
            if (this.isSubmitting) {
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
    updateCharacterCount($field) {
        const currentLength = $field.val().length;
        const maxLength = parseInt($field.attr('maxlength')) || 500;
        const $counter = JQueryUtils.safeSelect('#char-counter');

        if ($counter.length > 0) {
            $counter.text(currentLength);

            const $counterContainer = $counter.parent();

            if (currentLength > maxLength * 0.9) {
                $counterContainer.addClass('warning');
            } else {
                $counterContainer.removeClass('warning');
            }
        }
    }

    // Validate Individual field
    validateField($field){
        const fieldName = $field.attr('name');
        const fieldValue = $field.val().trim();
        const rules = this.validationRules[fieldName] || [];
        const $errorCounter = $field.siblings('.field-errors');

        $errorCounter.empty();
        $field.removeClass('error');

        for (let rule of rules) {
            const [ruleName, ruleValue] = rule.split(':');

            if(!this.applyValidationRule(fieldValue, ruleName, ruleValue)) {
                const errorMessage = this.getErrorMessage(fieldName, ruleName, ruleValue);
                $errorCounter.append(`<div class="error-message">${errorMessage}</div>`);
                $field.addClass('error');
                return false;
            }
        }

        return true;
    }

    applyValidationRule(value, ruleName, ruleValue){
        switch (ruleName){
            case 'required':
                return value.length > 0;
            case 'min':
                return value.length >= parseInt(ruleValue);
            case 'max':
                return value.length <= parseInt(ruleValue);
            case 'email':
                return ValidationUtils.validateEmail(value);
            default:
                return true;
        }
    }

    // Display errors for specific field
    getErrorMessage(fieldName, ruleName, ruleValue){
        const message = {
            required: `${fieldName} is required`,
            min: `${fieldName} must be at least ${ruleValue} characters`,
            max: `${fieldName} cannot exceed ${ruleValue} characters`,
            email: 'Please enter a valid email address'
        };

        return message[ruleName] || `${fieldName} is invalid`;
    }

    // Validate entire form 
    validateForm() {
        let isValid = true;
        const $fields = this.form.find('.form-control');

        $fields.each((index, field) => {
            if (!this.validateField($(field))) {
                isValid = false;
            }
        });

        return isValid;
    }

    // Get form data as object
    getFormData() {
        const formData = {};
        const $fields = this.form.find('.form-control');

        $fields.forEach((index, field) => {
            const $field = $(field);
            const fieldName = $field.attr('name');
            const fieldValue = ValidationUtils.sanitizeInput($field.val().trim());
            formData[fieldName] = fieldValue;
        });

        return formData;
    }

    // Handle form submission
    async handleSubmit(e) {
        e.preventDefault();

        if(this.isSubmitting) return;

        try {
            if(!this.validateForm()){
                this.showMessage('Please correct the errors below', 'error');
                return;
            }

            this.isSubmitting = true;
            this.setSubmissionState(true);

            const formData = this.getFormData();
            const success = await this.submitForm(formData);

            if (success){
                this.showMessage('Thank you! Your message has been sent successfully', 'success');
                this.form[0].reset();
                this.clearAllErrors();
            } else {
                this.showMessage('Sorry, there was an error sending your message. Please try again.', 'error');
            }

        } catch(error){
            ErrorHandler.logError(error, 'Form submission');
            this.showMessage('An unexpected error occurred. Please try again later.', 'error');
        } finally {
            this.isSubmitting = false;
            this.setSubmissionState(false);
        }
    }

    // Simulate form submission (to be replaced with API call)
    async submitForm(formData){
        return new Promise((resolve) => {
            setTimeout(() => {
                // Simulate 90% success rate
                const success = Math.random() > 0.1;
                resolve(success);
            }, 2000);
        });
    }  

    // Set submission state UI
    setSubmissionState(isSubmitting){
        const $submitBtn = JQueryUtils.safeSelect('#submit-btn');
        const $btnText = $submitBtn.find('.btn-text');
        const $btnLoading = $submitBtn.find('.btn-loading');

        if(isSubmitting){
            $submitBtn.prop('disabled', true);
            $btnText.hide();
            $btnLoading.show();
        } else {
            $submitBtn.prop('disabled', false);
            $btnText.show();
            $btnLoading.hide();
        }
    }

    // Show form messages
    showMessage(message, type){
        const $messageContainer = JQueryUtils.safeSelect('#form-messages');
        $messageContainer.empty();

        const messageHtml = `
            <div class="alert alert-${type}">
                <span class="alert-icon"></span>
                <span class="alert-message">${message}</span>
            </div>
        `;

        $messageContainer.html(messageHtml);

        if(type === 'success'){
            setTimeout(() => {
                $messageContainer.fadeOut(() => {
                    $messageContainer.empty().show();
                });
            }, 5000);
        }
    }

    // Handle form reset
    handleReset(e){
        if (this.isSubmitting){
            e.preventDefault();
            return;
        }

        setTimeout(() => {
            this.clearAllErrors();
            this.updateCharacterCount();
            JQueryUtils.safeSelect('#form-messages').empty();
        }, 100);
    }

    // Clear all form errors
    clearAllErrors() {
        this.form.find('.form-control').removeClass('error success');
        this.form.find('.field-errors').empty();
    }
}

// Initialize when DOM is ready
$(document).ready(() => {
    if(CONFIG.features.contactForm){
        new ContactFormController();
    }
});

