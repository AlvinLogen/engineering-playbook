class DebugTools {
    constructor(){
        this.performanceMarks = new Map();
        this.errorlog = [];
        this.init();
    }

    init(){
        if(!CONFIG.debug.enabled) return;

        this.setupConsoleEnhancements();
        this.setupPerformanceMonitoring();
        this.setupErrorTracking();
        this.addDebugPanel();

        console.log('%c Debug tools Activated', 'color: #4CAF50, font-weight: bold;');
    }

    setupConsoleEnhancements(){
        //Custom Console Methods
        window.debugLog = (message, data = null) => {
            if(CONFIG.debug.logLevel === 'debug'){
                console.group(`${message}`);
                if(data) console.log(data);
                console.trace();
                console.groupEnd;
            }
        };

        window.perfLog = (label, fn) => {
            const start = performance.now();
            const result = fn();
            const end = performance.now();
            console.log(`${label}: ${(end - start).toFixed(2)}ms`);
            return result
        };
    }

    setupPerformanceMonitoring(){
        //Mark page load performance
        window.addEventListener('load', () => {
            const loadTime = performance.timing.loadEventEnd - performance.timing.navigationStart;
            console.log(`Page load time: ${loadTime}ms`);

            // Check for slow resources
            const resources = performance.getEntriesByType('resource');
            const slowResources = resources.filter(r => r.duration > 1000);

            if(slowResources.length > 0){
                console.warn('Slow loading resources:', slowResources);
            }
        });
    }

    setupErrorTracking(){
        window.addEventListener('error', (e) => {
            this.errorlog.push({
                message: e.message,
                filename: e.filename,
                lineno: e.lineno,
                colno: e.colno,
                timestamp: new Date().toISOString()
            });

            console.error('Javascript Error:', e);
        });

        window.addEventListener('unhandledrejection', (e) => {
            this.errorlog.push({
                message: 'Unhandled Promise Rejection',
                reason: e.reason,
                timestamp: new Date().toISOString
            });

            console.warn('Unhandled Promise Rejection', e.reason);
        });
    }

    addDebugPanel(){
        if(document.getElementById('debug-panel')) return;

        const debugPanel = document.createElement('div');
        debugPanel.id = 'debug-panel';
        debugPanel.innerHTML = `
            <div class="debug-header">
                <h4>🔧 Debug Panel</h4>
                <button id="debug-toggle">−</button>
            </div>
            <div class="debug-content">
                <div class="debug-section">
                <h5>Performance</h5>
                <button onclick="debugTools.runPerformanceTest()">Run Performance Test</button>
                <div id="performance-results"></div>
                </div>
                <div class="debug-section">
                <h5>Errors (${this.errorLog.length})</h5>
                <button onclick="debugTools.showErrors()">Show Error Log</button>
                <div id="error-results"></div>
                </div>
                <div class="debug-section">
                <h5>Network</h5>
                <button onclick="debugTools.testAPIEndpoints()">Test API Endpoints</button>
                <div id="network-results"></div>
                </div>
            </div>       
        `;

        // Add Css Styling
        const style = document.createElement('style');
        style.textContent = `
            #debug-panel {
                position: fixed;
                top: 10px;
                right: 10px;
                width: 300px;
                background: #1a1a1a;
                color: #fff;
                border-radius: 8px;
                box-shadow: 0 4px 20px rgba(0,0,0,0.3);
                z-index: 10000;
                font-family: 'Courier New', monospace;
                font-size: 12px;
            }
            .debug-header {
                padding: 10px;
                background: #333;
                border-radius: 8px 8px 0 0;
                display: flex;
                justify-content: space-between;
                align-items: center;
            }
            .debug-content {
                padding: 10px;
                max-height: 400px;
                overflow-y: auto;
            }
            .debug-section {
                margin-bottom: 15px;
                padding-bottom: 10px;
                border-bottom: 1px solid #444;
            }
            .debug-section h5 {
                margin: 0 0 5px 0;
                color: #4CAF50;
            }
            .debug-section button {
                background: #4CAF50;
                color: white;
                border: none;
                padding: 5px 10px;
                border-radius: 4px;
                cursor: pointer;
                font-size: 11px;
            }
            #debug-toggle {
                background: none;
                border: none;
                color: white;
                cursor: pointer;
                font-size: 16px;
            }
        `;

        document.head.appendChild(style);
        document.body.appendChild(debugPanel);

        //Toggle functionality
        document.getElementById('debug-toggle').addEventListener('click', () => {
            const content = document.querySelector('.debug-content');
            const toggle = document.getElementById('debug-toggle');

            if(content.style.display === 'none'){
                content.style.display = 'block';
                toggle.textContent = '';
            } else {
                content.style.display = 'none';
                toggle.textContent = '+';
            }
        });
    }

    runPerformanceTest(){
        const results = document.getElementById('performance-results');
        results.innerHTML = '<div>Running tests....</div>';

        //Test DOM query performance
        const domTestStart = performance.now();
        for (let i = 0; i < 1000; i++){
            document.querySelectorAll('.test-selector');
        }

        const domTestEnd = performance.now();

        //Test Jquery performance
        const jQueryTestStart = performance.now();
        for(let i = 0; i < 1000; i++){
            $('.test-selector');
        }

        const JqueryTestEnd = performance.now();

        SpeechRecognitionResultList.innerHTML = `
            <div>DOM queries: ${(domTestEnd - domTestStart).toFixed(2)}ms</div>
            <div>jQuery queries: ${(jQueryTestEnd - jQueryTestStart).toFixed(2)}ms</div>
            <div>Memory: ${(performance.memory ? performance.memory.usedJSHeapSize / 1024 / 1024 : 'N/A')} MB</div>        
        `;
    }

    showErrors(){
        const results = document.getElementById('error-results');
        
        if(this.errorlog.length === 0){
            results.innerHTML = '<div style="color: #4CAF50;">No errors logged</div>';
        } else {
        results.innerHTML = this.errorLog.map(error => `
            <div style="color: #f44336; margin: 5px 0; padding: 5px; background: #2a2a2a; border-radius: 4px;">
            <strong>${error.message}</strong><br>
            <small>${error.timestamp}</small>
            </div>
        `).join('');            
        }
    }

    async testAPIEndpoints(){
        const results = document.getElementById('network-results');
        results.innerHTML = '<div>Testing endpoints...</div>';

        const endPoints = [
            {name: 'Health Check', url: 'api/health'},
            { name: 'Projects', url: '/api/projects' },
            { name: 'Contact', url: '/api/contact', method: 'POST' }           
        ];

        const testResults = [];

        for( let endpoint in endPoints) {
            try {
                const start = performance.now();
                const response = await fetch(endpoint.url, {
                    method: endpoint.method || 'GET',
                    headers: {'Content-Type': 'application/json'}
                });

                const end = performance.now();
                testResults.push({
                name: endpoint.name,
                status: response.status,
                time: (end - start).toFixed(2),
                success: response.ok
                });
            } catch (error) {
                testResults.push({
                name: endpoint.name,
                status: 'Error',
                time: 'N/A',
                success: false,
                error: error.message
                });                
            }
        }

        results.innerHTML = testResults.map(result => `
            <div style="color: ${result.success ? '#4CAF50' : '#f44336'}; margin: 2px 0;">
                ${result.name}: ${result.status} (${result.time}ms)
                ${result.error ? `<br><small>${result.error}</small>` : ''}
            </div>            
            `).join('');
    }
}

// Initial debug tools
$(document).ready(() => {
    if(CONFIG.debug.enabled){
        window.debugTools = new DebugTools();
    }
});