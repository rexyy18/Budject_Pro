(function(global) {
    function buildUrl(path) {
        var base = (global.AppConfig && global.AppConfig.apiBaseUrl) || '';
        if (!base) return path;
        if (base.endsWith('/') && path.startsWith('/')) return base + path.slice(1);
        if (!base.endsWith('/') && !path.startsWith('/')) return base + '/' + path;
        return base + path;
    }

    function handleResponse(resp) {
        if (!resp.ok) {
            return resp.text().then(function(text) {
                var message = text || ('HTTP ' + resp.status);
                throw new Error(message);
            });
        }
        var contentType = resp.headers.get('content-type') || '';
        if (contentType.indexOf('application/json') !== -1) {
            return resp.json();
        }
        return resp.text();
    }

    var ApiService = {
        isEnabled: function() {
            return !!(global.AppConfig && global.AppConfig.useApi);
        },
        setEnabled: function(enabled) {
            if (!global.AppConfig) global.AppConfig = {};
            global.AppConfig.useApi = !!enabled;
            try { localStorage.setItem('budgettrackr_useApi', String(!!enabled)); } catch (e) {}
        },
        setBaseUrl: function(url) {
            if (!global.AppConfig) global.AppConfig = {};
            global.AppConfig.apiBaseUrl = url;
            try { localStorage.setItem('budgettrackr_apiBaseUrl', url || ''); } catch (e) {}
        },

        // Budgets
        fetchBudgets: function() {
            return fetch(buildUrl('/api/budgets'), { credentials: 'include' }).then(handleResponse);
        },
        createBudget: function(payload) {
            return fetch(buildUrl('/api/budgets'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(payload)
            }).then(handleResponse);
        },
        updateBudget: function(id, payload) {
            return fetch(buildUrl('/api/budgets/' + encodeURIComponent(id)), {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(payload)
            }).then(handleResponse);
        },
        deleteBudget: function(id) {
            return fetch(buildUrl('/api/budgets/' + encodeURIComponent(id)), {
                method: 'DELETE',
                credentials: 'include'
            }).then(handleResponse);
        },

        // Categories
        fetchCategories: function() {
            return fetch(buildUrl('/api/categories'), { credentials: 'include' }).then(handleResponse);
        },
        createCategory: function(name) {
            return fetch(buildUrl('/api/categories'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ name: name })
            }).then(handleResponse);
        },
        deleteCategory: function(name) {
            return fetch(buildUrl('/api/categories/' + encodeURIComponent(name)), {
                method: 'DELETE',
                credentials: 'include'
            }).then(handleResponse);
        },

        // Settings
        fetchSettings: function() {
            return fetch(buildUrl('/api/settings'), { credentials: 'include' }).then(handleResponse);
        },
        saveSettings: function(settings) {
            return fetch(buildUrl('/api/settings'), {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(settings)
            }).then(handleResponse);
        }
    };

    global.ApiService = ApiService;
})(window);


