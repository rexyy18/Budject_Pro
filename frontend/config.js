(function() {
    if (!window.AppConfig) {
        var storedUseApi = localStorage.getItem('budgettrackr_useApi');
        var storedApiBase = localStorage.getItem('budgettrackr_apiBaseUrl');
        window.AppConfig = {
            useApi: storedUseApi === 'true' || false,
            apiBaseUrl: storedApiBase || 'http://localhost:4000'
        };
    }
})();


