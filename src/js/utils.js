class ValidationUtils {
    // Validate email using contract-based approach
    static validateEmail(email){
        //Pre-condition check
        if (typeof email !== 'string' || email.length === 0){
            throw new Error('Pre=condition failed: email must be a non-empty string');
        }

        const isValid = CONFIG.validation.emailPattern.test(email);

        //Post-condition: result must be boolean
        if (typeof isValid !== 'boolean'){
            throw new Error('Post-condition failed: result must be boolean');
        }

        return isValid;
    }

    // Sanitizes user input to prevent XSS
    static sanitizeInput(input){
        if (typeof input !== 'string') {
            throw new Error('Pre-condition failed: input must be a string');
        }

        const sanitized = input.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#27;');

        // Invariant: output should not contain dangerous characters
        if (sanitized.includes('<script') || sanitized.includes('javascript:')){
            throw new Error('Invariant violated: dangerous content detected');
        }

        return sanitized;
    }

    // Validates form data with comprehensive checks
    static validateFormData(formData){
        const errors = [];

        // Name validation
        if(!formData.name || formData.name.trim().length < CONFIG.validation.minNameLength){
            errors.push('Name must be at least ' + CONFIG.validation.minNameLength + ' characters');
        }

        //Email validation
        try {
            if (!this.validateEmail(formData.email)){
                errors.push('Please enter a valid email address');
            }
        } catch (error){
            errors.push('Email validation error: ' + error.message);
        }

        //Message validation
        if(!formData.message || formData.message.trim().length === 0){
            errors.push('Message cannot be empty');
        } else if (formData.message.length > CONFIG.validation.maxMesageLength){
            errors.push('Message too long (max ' + CONFIG.validation.maxMesageLength + ' characters');
        }

        return {
            isValid: errors.length === 0,
            errors: errors
        };
    }
}

class ErrorHandler {
    //Centralized error logging following Pragmatic principles
    static logError (error, context = ''){
        if (!CONFIG.debug.enabled) return;

        const errorInfo = {
            timestamp: new Date().toISOString(),
            message: error.message, 
            stack: error.stack,
            context, 
            userAgent: navigator.userAgent
        };

        if (CONFIG.debug.logLevel === 'debug'){
            console.error('Error occurred: ', errorInfo);
        }
    }

    // User-friendly error display
    static displayUserError(message, element) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = message;

        // Clear existing errors
        const existingErrors = element.querySelectorAll('.error-message');
        existingErrors.forEach(err => err.remove());

        element.appendChild(errorDiv);

        //Auto-remove after 5 seconds
        setTimeout(() => {
            if (errorDiv.parentNode){
                errorDiv.parentNode.removeChild(errorDiv);
            }
        }, 5000);
    }
}