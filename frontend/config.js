(function() {
    if (!window.AppConfig) {
        var storedUseApi = localStorage.getItem('budgettrackr_useApi');
        var storedApiBase = localStorage.getItem('budgettrackr_apiBaseUrl');
        window.AppConfig = {
            useApi: storedUseApi !== null ? storedUseApi === 'true' : true,
            apiBaseUrl: storedApiBase || 'http://localhost:8000'
        };
    }
})();


