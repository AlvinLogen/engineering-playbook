// Defensive jQuery wrapper
class JQueryUtils {
    //Safe jQuery selector with error handling
    static safeSelect(selector){
        if (typeof selector != 'string' || selector.length === 0){
            throw new Error('Pre-condition failed: selector must be a non-empty string');
        }

        try {
            const $elements = $(selector);

            if ($elements.length === 0 && CONFIG.debug.enabled){
                console.warn(`No elements found for selector: ${selector}`);
            }

            return $elements;
        } catch (error){
            ErrorHandler.logError(error, `JQuery selector: ${selector}`);
            throw new Error(`Invalid selector: ${selector}`)
        }
    }

    //Safe event binding with automatic cleanup
    static bindEvent(selector, event, handler, context = 'unknown'){
        try{
            const $elements = this.safeSelect(selector);

            if ($elements.length === 0){
                console.warn(`Cannot bind ${event} to ${selector}: no elements found`);
                return false;
            }

            //Wrap handler with error handling
            const safeHandler = function(e){
                try{
                    handler.call(this, e);
                } catch(error) {
                    ErrorHandler.logError(error, `Event handler: ${event} on ${selector}`);
                    e.stopPropagation();
                }
            };

            $elements.on(event, safeHandler);
            return true;
        } catch(error){
            ErrorHandler.logError(error, `Event binding: ${event} on ${selector}`);
            return false; 
        }
    }

    //Safe DOM manipulation with validation
    static safeUpdate(selector, content, method = 'html'){
        try {
            const $elements = this.safeSelect(selector);

            if($elements.length === 0 ){
                throw new Error(`Cannot update ${selector}: elements not found`);
            }

            //Sanitize content if its HTML
            if (method === 'html' && typeof content === 'string'){
                content = ValidationUtils.sanitizeInput(content);
            }

            switch (method){
                case 'html':
                    $elements.html(content);
                    break;
                case 'text':
                    $elements.text(content);
                    break;
                case 'val':
                    $elements.val(content);
                    break;
                default:
                    throw new Error(`Unsupported update method: ${method}`);
            }

            return true;
        } catch(error){
            ErrorHandler.logError(error, `DOM update: ${selector}`);
            return false;
        }
    }
}