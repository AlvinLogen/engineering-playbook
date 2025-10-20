class NavigationController {
    constructor() {
        this.currentSection = '';
        this.scrollThreshold = 100;
        this.init();
    }

    init(){
        
    }
}

$(document).ready(() => {
    new NavigationController();
});