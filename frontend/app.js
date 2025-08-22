/**
 * BudgetTrackr - Glassmorphism Dashboard Application
 * Main JavaScript functionality
 */

class BudgetTrackr {
    constructor() {
        this.budgets = [];
        this.categories = ['Food', 'Transport', 'Rent', 'Utilities', 'Others'];
        this.settings = {
            defaultCurrency: 'GHS',
            theme: 'glass',
            userName: 'User'
        };
        this.usingBackend = (window.AppConfig && !!window.AppConfig.useApi) || false;
        this.currentModule = 'dashboard';
        this.editingBudgetId = null;
        this.charts = {};
        this._deleteConfirmHandler = null;
        
        this.init();
    }
    reviewBudget(budgetId) {
        console.log('reviewBudget called with ID:', budgetId);
        this.openBudgetModal(budgetId, { mode: 'view' });
    }

    editBudget(budgetId) {
        console.log('editBudget called with ID:', budgetId);
        this.openBudgetModal(budgetId, { mode: 'edit' });
    }

    deleteBudget(budgetId) {
        console.log('deleteBudget called with ID:', budgetId);
        const budget = this.budgets.find(b => b.id === budgetId);
        if (!budget) {
            console.log('Budget not found');
            return;
        }

        const modal = document.getElementById('delete-modal');
        const confirmBtn = document.getElementById('confirm-delete');
        
        if (!modal) {
            console.error('Delete modal not found!');
            return;
        }
        
        console.log('Delete modal found:', modal);
        
        // Update confirmation message
        const messageElement = modal.querySelector('.modal-body p');
        if (messageElement) {
            messageElement.textContent = `Are you sure you want to delete the budget "${budget.name}"? This action cannot be undone.`;
        }
        
        // Remove previous handler if set to avoid stacking
        if (this._deleteConfirmHandler) {
            confirmBtn.removeEventListener('click', this._deleteConfirmHandler);
            this._deleteConfirmHandler = null;
        }

        // Set up confirmation handler
        const handleConfirm = () => {
            console.log('Delete confirmed for budget:', budgetId);
            const isApi = window.ApiService && window.ApiService.isEnabled();
            const finalize = () => {
                this.closeAllModals();
                this.renderDashboard();
                this.renderBudgets();
                this.showToast('Budget deleted successfully', 'success');
                if (this._deleteConfirmHandler) {
                    confirmBtn.removeEventListener('click', this._deleteConfirmHandler);
                    this._deleteConfirmHandler = null;
                }
            };
            if (isApi) {
                window.ApiService.deleteBudget(budgetId)
                    .catch(() => null)
                    .finally(() => {
                        this.budgets = this.budgets.filter(b => b.id !== budgetId);
                        this.saveData();
                        finalize();
                    });
            } else {
                this.budgets = this.budgets.filter(b => b.id !== budgetId);
                this.saveData();
                finalize();
            }
        };
        this._deleteConfirmHandler = handleConfirm;
        confirmBtn.addEventListener('click', handleConfirm);
        
        // Ensure modal is visible
        modal.style.display = 'flex';
        modal.classList.add('active');
        
        console.log('Delete modal opened successfully');
        console.log('Modal display style:', modal.style.display);
        console.log('Modal classes:', modal.classList.toString());
    }
    init() {
        console.log('BudgetTrackr init started');
        this.loadData();
        console.log('Data loaded, budgets count:', this.budgets.length);
        this.setupEventListeners();
        console.log('Event listeners set up');
        this.renderDashboard();
        console.log('Dashboard rendered');
        this.applyTheme();
        
        // Add loading delay for better UX
        setTimeout(() => {
            this.renderCharts();
        }, 500);

        // Initialize API settings UI state
        const useApiEl = document.getElementById('use-backend-api');
        const apiBaseInput = document.getElementById('api-base-url');
        if (useApiEl) useApiEl.checked = !!(window.ApiService && window.ApiService.isEnabled());
        if (apiBaseInput && window.AppConfig) apiBaseInput.value = window.AppConfig.apiBaseUrl || '';

        this.fetchFromBackendAndRender();
        console.log('BudgetTrackr init completed');
    }

    fetchFromBackendAndRender() {
        if (!(window.ApiService && window.ApiService.isEnabled())) {
            return; // local mode
        }
        // Load remote settings first
        window.ApiService.fetchSettings()
            .then((remoteSettings) => {
                if (remoteSettings && typeof remoteSettings === 'object') {
                    this.settings = { ...this.settings, ...remoteSettings };
                }
            })
            .catch(() => {})
            .then(() => {
                // Load categories and budgets in parallel
                return Promise.all([
                    window.ApiService.fetchCategories().catch(() => null),
                    window.ApiService.fetchBudgets().catch(() => null)
                ]);
            })
            .then((results) => {
                const cats = results && results[0];
                const budgets = results && results[1];
                if (Array.isArray(cats) && cats.length) {
                    this.categories = cats.map(function(c) { return c.name || c; });
                }
                if (Array.isArray(budgets)) {
                    this.budgets = budgets;
                }
                this.saveData(); // keep local cache updated
                this.renderDashboard();
                this.renderBudgets();
                this.renderSettings();
                this.applyTheme();
                this.updateCurrencyDisplay();
                this.updateGreeting();
            })
            .catch(() => {
                // Silent failure keeps local mode functioning
            });
    }

    setupEventListeners() {
        // Navigation
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const module = item.dataset.module;
                this.switchModule(module);
            });
        });

        // Theme toggle
        document.querySelector('.theme-toggle').addEventListener('click', () => {
            this.cycleTheme();
        });

        // Add budget button
        document.querySelector('.add-budget-btn').addEventListener('click', () => {
            this.openBudgetModal();
        });

        // Search functionality
        // document.querySelector('.search-input').addEventListener('input', (e) => {
        //     this.handleSearch(e.target.value);
        // });

        // Budget form
        document.getElementById('budget-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleBudgetSubmit();
        });

        // Category form
        document.getElementById('category-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleCategorySubmit();
        });

        // Modal close buttons
        document.querySelectorAll('.close-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                this.closeAllModals();
            });
        });

        // Cancel buttons
        document.getElementById('cancel-budget').addEventListener('click', () => {
            this.closeAllModals();
        });

        document.getElementById('cancel-category').addEventListener('click', () => {
            this.closeAllModals();
        });

        document.getElementById('cancel-delete').addEventListener('click', () => {
            this.closeAllModals();
        });

        // Chart period switcher
        document.querySelectorAll('.switcher-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const period = btn.dataset.period;
                this.switchChartPeriod(period);
            });
        });

        // Theme buttons
        document.querySelectorAll('.theme-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const theme = btn.dataset.theme;
                this.switchTheme(theme);
            });
        });

        // Settings
        document.getElementById('default-currency').addEventListener('change', (e) => {
            this.settings.defaultCurrency = e.target.value;
            this.saveData();
            this.updateCurrencyDisplay();
            this.renderDashboard();
            if (window.ApiService && window.ApiService.isEnabled()) {
                window.ApiService.saveSettings(this.settings).catch(() => {});
            }
        });

        // General settings save button
        const saveGeneralSettingsBtn = document.getElementById('save-general-settings');
        if (saveGeneralSettingsBtn) {
            saveGeneralSettingsBtn.addEventListener('click', () => {
                const userName = document.getElementById('user-name').value.trim();
                if (userName) {
                    this.settings.userName = userName;
                    this.saveData();
                    this.updateGreeting();
                    this.showToast('Settings saved successfully', 'success');
                    if (window.ApiService && window.ApiService.isEnabled()) {
                        window.ApiService.saveSettings(this.settings).catch(() => {});
                    }
                } else {
                    this.showToast('Please enter a valid user name', 'error');
                }
            });
        }

        // API settings controls
        const useApiEl = document.getElementById('use-backend-api');
        const apiBaseInput = document.getElementById('api-base-url');
        const saveApiBtn = document.getElementById('save-api-settings');
        if (saveApiBtn) {
            saveApiBtn.addEventListener('click', () => {
                const enabled = !!(useApiEl && useApiEl.checked);
                const baseUrl = apiBaseInput ? apiBaseInput.value.trim() : '';
                if (window.ApiService) {
                    window.ApiService.setEnabled(enabled);
                    window.ApiService.setBaseUrl(baseUrl);
                }
                this.showToast('API settings saved', 'success');
                this.fetchFromBackendAndRender();
            });
        }

        // Data management
        const exportDataBtn = document.getElementById('export-data');
        if (exportDataBtn) {
            exportDataBtn.addEventListener('click', () => {
                this.exportData();
            });
        }

        const importDataBtn = document.getElementById('import-data');
        if (importDataBtn) {
            importDataBtn.addEventListener('click', () => {
                const importFile = document.getElementById('import-file');
                if (importFile) importFile.click();
            });
        }

        const importFile = document.getElementById('import-file');
        if (importFile) {
            importFile.addEventListener('change', (e) => {
                this.importData(e.target.files[0]);
            });
        }

        // Add category button
        const addCategoryBtn = document.getElementById('add-category-btn');
        if (addCategoryBtn) {
            addCategoryBtn.addEventListener('click', () => {
                this.openCategoryModal();
            });
        }

        // Sidebar add category button (optional)
        const sidebarAddCategoryBtn = document.querySelector('.add-category-sidebar-btn');
        if (sidebarAddCategoryBtn) {
            sidebarAddCategoryBtn.addEventListener('click', () => {
                this.openCategoryModal();
            });
        }

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeAllModals();
            }
        });

        // Filter events
        const categoryFilter = document.getElementById('category-filter');
        if (categoryFilter) {
            categoryFilter.addEventListener('change', (e) => {
                this.filterBudgets();
            });
        }

        const dateFilter = document.getElementById('date-filter');
        if (dateFilter) {
            dateFilter.addEventListener('change', (e) => {
                this.filterBudgets();
            });
        }

        // Delegated actions for budgets table (review/edit/delete)
        const budgetsTableBody = document.getElementById('budgets-table-body');
        if (budgetsTableBody) {
            budgetsTableBody.addEventListener('click', (event) => {
                console.log('Table clicked:', event.target);
                const actionButton = event.target.closest('button.action-btn');
                if (!actionButton) {
                    console.log('No action button found');
                    return;
                }
                
                console.log('Action button found:', actionButton);
                const budgetId = actionButton.getAttribute('data-budget-id');
                if (!budgetId) {
                    console.log('No budget ID found');
                    return;
                }

                console.log('Budget ID:', budgetId);
                console.log('Button classes:', actionButton.classList.toString());

                if (actionButton.classList.contains('review')) {
                    console.log('Calling reviewBudget');
                    this.reviewBudget(budgetId);
                } else if (actionButton.classList.contains('edit')) {
                    console.log('Calling editBudget');
                    this.editBudget(budgetId);
                } else if (actionButton.classList.contains('delete')) {
                    console.log('Calling deleteBudget');
                    this.deleteBudget(budgetId);
                }
            });
            console.log('Event delegation set up for budgets table');
        } else {
            console.error('Budgets table body not found during event setup');
        }
    }

    switchModule(moduleName) {
        console.log('switchModule called with:', moduleName);
        
        // Hide all modules
        document.querySelectorAll('.module').forEach(module => {
            module.classList.remove('active');
        });

        // Show selected module
        const targetModule = document.getElementById(moduleName);
        if (targetModule) {
            targetModule.classList.add('active');
        } else {
            console.error(`Module ${moduleName} not found`);
            return;
        }

        // Update navigation
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });
        const navItem = document.querySelector(`[data-module="${moduleName}"]`);
        if (navItem) {
            navItem.classList.add('active');
        }

        // Update module title
        const moduleTitle = document.querySelector('.module-title');
        if (moduleTitle) {
            moduleTitle.textContent = this.getModuleTitle(moduleName);
        }

        // Update current module
        this.currentModule = moduleName;

        // Render module-specific content
        switch (moduleName) {
            case 'dashboard':
                console.log('Rendering dashboard');
                this.renderDashboard();
                break;
            case 'budgets':
                console.log('Rendering budgets');
                this.renderBudgets();
                break;
            case 'reports':
                console.log('Rendering reports');
                this.renderReports();
                break;
            case 'settings':
                console.log('Rendering settings');
                this.renderSettings();
                break;
            case 'help':
                console.log('Help content is static');
                // Help content is static
                break;
        }

        // Render charts if switching to reports
        if (moduleName === 'reports') {
            setTimeout(() => {
                this.renderCharts();
            }, 100);
        }

        // Show search bar only in Budgets module
        const searchContainer = document.getElementById('dynamic-search-container');
        if (searchContainer) {
            if (moduleName === 'budgets') {
                searchContainer.innerHTML = `
                    <div class="search-container">
                        <i class="fas fa-search search-icon"></i>
                        <input type="text" class="search-input" placeholder="Search budgets..." aria-label="Search budgets">
                    </div>
                `;
                // Add event listener for search input
                const searchInput = searchContainer.querySelector('.search-input');
                if (searchInput) {
                    searchInput.addEventListener('input', (e) => {
                        this.handleSearch(e.target.value);
                    });
                }
            } else {
                searchContainer.innerHTML = '';
            }
        }
    }

    getModuleTitle(moduleName) {
        const titles = {
            'dashboard': 'Dashboard',
            'budgets': 'Budget Management',
            'reports': 'Reports & Analytics',
            'settings': 'Settings',
            'help': 'Help & About'
        };
        return titles[moduleName] || 'Dashboard';
    }

    renderDashboard() {
        this.updateGreeting();
        this.updateDashboardStats();
        this.renderBudgetTrendsChart();
    }

    updateDashboardStats() {
        const totalBudgeted = this.budgets.reduce((sum, budget) => {
            if (budget.currency === this.settings.defaultCurrency) {
                return sum + budget.amount;
            }
            return sum;
        }, 0);

        const uniqueCategories = new Set(this.budgets.map(b => b.category)).size;
        
        const upcomingBudgets = this.budgets.filter(budget => {
            const effectiveDate = new Date(budget.effectiveDate);
            const today = new Date();
            return effectiveDate >= today;
        }).length;

        const totalBudgetedElement = document.getElementById('total-budgeted');
        const totalCategoriesElement = document.getElementById('total-categories');
        const upcomingBudgetsElement = document.getElementById('upcoming-budgets');
        
        if (totalBudgetedElement) {
            totalBudgetedElement.textContent = this.formatCurrency(totalBudgeted, this.settings.defaultCurrency);
        }
        if (totalCategoriesElement) {
            totalCategoriesElement.textContent = uniqueCategories;
        }
        if (upcomingBudgetsElement) {
            upcomingBudgetsElement.textContent = upcomingBudgets;
        }

        // Activity stats section doesn't exist in the HTML, so we skip it
        // this.updateActivityStats();
    }

    renderBudgetTrendsChart(period = 'monthly') {
        const ctx = document.getElementById('budget-trends-chart');
        if (!ctx) return;

        // Destroy existing chart if it exists
        if (this.charts.budgetTrends) {
            this.charts.budgetTrends.destroy();
        }

        const data = period === 'weekly' ? this.getWeeklyBudgetData() : this.getMonthlyBudgetData();

        this.charts.budgetTrends = new Chart(ctx, {
            type: 'line',
            data: {
                labels: data.labels,
                datasets: [{
                    label: `Budget Trends (${period})`,
                    data: data.values,
                    borderColor: '#FF8A3D',
                    backgroundColor: 'rgba(255, 138, 61, 0.1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4,
                    pointBackgroundColor: '#FF8A3D',
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2,
                    pointRadius: 6,
                    pointHoverRadius: 8
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    x: {
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        },
                        ticks: {
                            color: 'rgba(255, 255, 255, 0.7)'
                        }
                    },
                    y: {
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        },
                        ticks: {
                            color: 'rgba(255, 255, 255, 0.7)',
                            callback: function(value) {
                                return this.formatCurrency(value, this.settings.defaultCurrency);
                            }.bind(this)
                        }
                    }
                },
                interaction: {
                    intersect: false,
                    mode: 'index'
                }
            }
        });
    }

    getMonthlyBudgetData() {
        const months = [];
        const values = [];
        const now = new Date();
        
        for (let i = 11; i >= 0; i--) {
            const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const monthName = date.toLocaleDateString('en-US', { month: 'short' });
            months.push(monthName);
            
            const monthBudgets = this.budgets.filter(budget => {
                const budgetDate = new Date(budget.budgetDate);
                return budgetDate.getMonth() === date.getMonth() && 
                       budgetDate.getFullYear() === date.getFullYear() &&
                       budget.currency === this.settings.defaultCurrency;
            });
            
            const total = monthBudgets.reduce((sum, b) => sum + b.amount, 0);
            values.push(total);
        }
        
        return { labels: months, values };
    }

    getWeeklyBudgetData() {
        const weeks = [];
        const values = [];
        const now = new Date();
        
        for (let i = 7; i >= 0; i--) {
            const date = new Date(now);
            date.setDate(date.getDate() - (i * 7));
            const weekStart = new Date(date);
            weekStart.setDate(date.getDate() - date.getDay());
            
            const weekLabel = `Week ${Math.ceil((date.getDate() + date.getDay()) / 7)}`;
            weeks.push(weekLabel);
            
            const weekBudgets = this.budgets.filter(budget => {
                const budgetDate = new Date(budget.budgetDate);
                const weekEnd = new Date(weekStart);
                weekEnd.setDate(weekStart.getDate() + 6);
                
                return budgetDate >= weekStart && 
                       budgetDate <= weekEnd &&
                       budget.currency === this.settings.defaultCurrency;
            });
            
            const total = weekBudgets.reduce((sum, b) => sum + b.amount, 0);
            values.push(total);
        }
        
        return { labels: weeks, values };
    }

    switchChartPeriod(period) {
        // Update active button
        document.querySelectorAll('.switcher-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-period="${period}"]`).classList.add('active');
        
        // Re-render chart
        this.renderBudgetTrendsChart(period);
    }

    renderBudgets() {
        console.log('renderBudgets called');
        this.populateCategories();
        this.renderBudgetsTable();
    }

    populateCategories() {
        const categorySelects = [
            document.getElementById('budget-category'),
            document.getElementById('category-filter')
        ];

        categorySelects.forEach(select => {
            if (select) {
                select.innerHTML = '<option value="">Select Category</option>';
                this.categories.forEach(category => {
                    const option = document.createElement('option');
                    option.value = category;
                    option.textContent = category;
                    select.appendChild(option);
                });
            }
        });
    }

    renderBudgetsTable() {
        console.log('renderBudgetsTable called');
        console.log('Budgets array:', this.budgets);
        
        const tbody = document.getElementById('budgets-table-body');
        if (!tbody) {
            console.error('Table body not found!');
            return;
        }
        
        console.log('Table body found:', tbody);
        tbody.innerHTML = '';

        if (this.budgets.length === 0) {
            console.log('No budgets to render');
            tbody.innerHTML = `
                <tr>
                    <td colspan="6" style="text-align: center; padding: 40px;">
                        <p class="no-budgets-message">No budgets found. Create your first budget to get started!</p>
                    </td>
                </tr>
            `;
            return;
        }

        console.log('Rendering', this.budgets.length, 'budgets');

        this.budgets.forEach(budget => {
            const row = document.createElement('tr');
            row.setAttribute('data-id', budget.id);
            
            // Create action buttons with proper structure
            const actionButtonsHtml = `
                <div class="action-buttons">
                    <button type="button" class="action-btn review" data-budget-id="${budget.id}" aria-label="Review budget">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button type="button" class="action-btn edit" data-budget-id="${budget.id}" aria-label="Edit budget">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button type="button" class="action-btn delete" data-budget-id="${budget.id}" aria-label="Delete budget">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            `;
            
            row.innerHTML = `
                <td>${budget.name}</td>
                <td>${this.formatCurrency(budget.amount, budget.currency)}</td>
                <td><span class="category-chip">${budget.category}</span></td>
                <td>${this.formatDate(budget.budgetDate)}</td>
                <td>${this.formatDate(budget.effectiveDate)}</td>
                <td>${actionButtonsHtml}</td>
            `;
            
            tbody.appendChild(row);
            console.log('Added row for budget:', budget.id);
        });
        
        console.log('Table rendering complete');
    }

    renderReports() {
        // Reports content is rendered via renderCharts()
    }

    renderSettings() {
        // Update user name
        document.getElementById('user-name').value = this.settings.userName;
        
        // Update default currency
        document.getElementById('default-currency').value = this.settings.defaultCurrency;
        
        // Update theme buttons
        document.querySelectorAll('.theme-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-theme="${this.settings.theme}"]`).classList.add('active');
        
        // Render categories
        this.renderCategoriesList();
    }

    renderCategoriesList() {
        const container = document.getElementById('categories-list');
        container.innerHTML = '';

        this.categories.forEach(category => {
            const item = document.createElement('div');
            item.className = 'category-item';
            item.innerHTML = `
                <span class="category-name">${category}</span>
                <button class="delete-category" onclick="app.deleteCategory('${category}')" aria-label="Delete category">
                    <i class="fas fa-times"></i>
                </button>
            `;
            container.appendChild(item);
        });
    }

    renderCharts() {
        this.renderCategoryPieChart();
        this.renderMonthlyBarChart();
        this.renderCumulativeLineChart();
    }

    renderCategoryPieChart() {
        const ctx = document.getElementById('category-pie-chart');
        if (!ctx) return;

        if (this.charts.categoryPie) {
            this.charts.categoryPie.destroy();
        }

        const categoryData = {};
        this.budgets.forEach(budget => {
            if (budget.currency === this.settings.defaultCurrency) {
                categoryData[budget.category] = (categoryData[budget.category] || 0) + budget.amount;
            }
        });

        const labels = Object.keys(categoryData);
        const data = Object.values(categoryData);

        if (data.length === 0) {
            document.getElementById('category-insight').innerHTML = '<p>No data available</p>';
            return;
        }

        const colors = ['#FF8A3D', '#6C8CF5', '#21C776', '#FFC447', '#FF5D5D', '#A855F7', '#10B981'];

        this.charts.categoryPie = new Chart(ctx, {
            type: 'pie',
            data: {
                labels: labels,
                datasets: [{
                    data: data,
                    backgroundColor: colors.slice(0, labels.length),
                    borderWidth: 2,
                    borderColor: 'rgba(255, 255, 255, 0.2)'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            color: 'rgba(255, 255, 255, 0.8)',
                            padding: 20,
                            usePointStyle: true
                        }
                    }
                }
            }
        });

        // Update insight
        const maxCategory = labels[data.indexOf(Math.max(...data))];
        const maxAmount = Math.max(...data);
        const total = data.reduce((sum, val) => sum + val, 0);
        const percentage = ((maxAmount / total) * 100).toFixed(1);
        
        document.getElementById('category-insight').innerHTML = 
            `<p><strong>${maxCategory}</strong> represents ${percentage}% of your total budget</p>`;
    }

    renderMonthlyBarChart() {
        const ctx = document.getElementById('monthly-bar-chart');
        if (!ctx) return;

        if (this.charts.monthlyBar) {
            this.charts.monthlyBar.destroy();
        }

        const monthlyData = this.getMonthlyBudgetData();

        if (monthlyData.values.every(v => v === 0)) {
            document.getElementById('monthly-insight').innerHTML = '<p>No data available</p>';
            return;
        }

        this.charts.monthlyBar = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: monthlyData.labels,
                datasets: [{
                    label: 'Monthly Budgets',
                    data: monthlyData.values,
                    backgroundColor: 'rgba(108, 140, 245, 0.8)',
                    borderColor: '#6C8CF5',
                    borderWidth: 2,
                    borderRadius: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    x: {
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        },
                        ticks: {
                            color: 'rgba(255, 255, 255, 0.7)'
                        }
                    },
                    y: {
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        },
                        ticks: {
                            color: 'rgba(255, 255, 255, 0.7)'
                        }
                    }
                }
            }
        });

        // Update insight
        const currentMonth = monthlyData.values[monthlyData.values.length - 1];
        const previousMonth = monthlyData.values[monthlyData.values.length - 2] || 0;
        let insight = '';
        
        if (previousMonth > 0) {
            const change = ((currentMonth - previousMonth) / previousMonth) * 100;
            if (change > 0) {
                insight = `This month's budget is ${change.toFixed(1)}% higher than last month`;
            } else if (change < 0) {
                insight = `This month's budget is ${Math.abs(change).toFixed(1)}% lower than last month`;
            } else {
                insight = 'This month\'s budget is the same as last month';
            }
        } else {
            insight = 'This is your first month with budget data';
        }
        
        document.getElementById('monthly-insight').innerHTML = `<p>${insight}</p>`;
    }

    renderCumulativeLineChart() {
        const ctx = document.getElementById('cumulative-line-chart');
        if (!ctx) return;

        if (this.charts.cumulativeLine) {
            this.charts.cumulativeLine.destroy();
        }

        const monthlyData = this.getMonthlyBudgetData();
        const cumulativeData = [];
        let runningTotal = 0;
        
        monthlyData.values.forEach(value => {
            runningTotal += value;
            cumulativeData.push(runningTotal);
        });

        if (cumulativeData.every(v => v === 0)) {
            document.getElementById('cumulative-insight').innerHTML = '<p>No data available</p>';
            return;
        }

        this.charts.cumulativeLine = new Chart(ctx, {
            type: 'line',
            data: {
                labels: monthlyData.labels,
                datasets: [{
                    label: 'Cumulative Budget',
                    data: cumulativeData,
                    borderColor: '#21C776',
                    backgroundColor: 'rgba(33, 199, 118, 0.1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4,
                    pointBackgroundColor: '#21C776',
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2,
                    pointRadius: 5
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    x: {
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        },
                        ticks: {
                            color: 'rgba(255, 255, 255, 0.7)'
                        }
                    },
                    y: {
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        },
                        ticks: {
                            color: 'rgba(255, 255, 255, 0.7)'
                        }
                    }
                }
            }
        });

        // Update insight
        const totalGrowth = cumulativeData[cumulativeData.length - 1];
        const averageGrowth = totalGrowth / cumulativeData.length;
        
        document.getElementById('cumulative-insight').innerHTML = 
            `<p>Your cumulative budget has grown to ${this.formatCurrency(totalGrowth, this.settings.defaultCurrency)} with an average monthly growth of ${this.formatCurrency(averageGrowth, this.settings.defaultCurrency)}</p>`;
    }



        updateGreeting() {
        const hour = new Date().getHours();
        let greeting = 'Good Morning';

        if (hour >= 12 && hour < 17) {
            greeting = 'Good Afternoon';
        } else if (hour >= 17) {
            greeting = 'Good Evening';
        }

        document.querySelector('.greeting').textContent = `${greeting}, ${this.settings.userName} 👋`;
    }

    openBudgetModal(budgetId = null, options = {}) {
        console.log('openBudgetModal called with ID:', budgetId, 'options:', options);
        const isViewOnly = options.mode === 'view';
        this.isViewing = !!isViewOnly;
        this.editingBudgetId = budgetId;
        const modal = document.getElementById('budget-modal');
        const title = document.getElementById('budget-modal-title');
        const form = document.getElementById('budget-form');
        const submitBtn = form.querySelector('button[type="submit"]');
        const cancelBtn = form.querySelector('#cancel-budget');
        const inputs = form.querySelectorAll('input, select, textarea');

        console.log('Modal elements found:', { modal, title, form, submitBtn, cancelBtn, inputs: inputs.length });

        if (!modal) {
            console.error('Budget modal not found!');
            return;
        }

        if (budgetId) {
            // Editing existing budget
            const budget = this.budgets.find(b => b.id === budgetId);
            if (budget) {
                title.textContent = isViewOnly ? 'View Budget' : 'Edit Budget';
                document.getElementById('budget-name').value = budget.name;
                document.getElementById('budget-amount').value = budget.amount;
                document.getElementById('budget-currency').value = budget.currency;
                document.getElementById('budget-category').value = budget.category;
                document.getElementById('budget-description').value = budget.description || '';
                document.getElementById('budget-date').value = budget.budgetDate;
                document.getElementById('effective-date').value = budget.effectiveDate;
            }
        } else {
            // Creating new budget
            title.textContent = 'Add New Budget';
            form.reset();
            
            // Set default dates
            const today = new Date().toISOString().split('T')[0];
            document.getElementById('budget-date').value = today;
            document.getElementById('effective-date').value = today;
        }

        // Toggle read-only UI state
        if (inputs && inputs.length) {
            inputs.forEach(function(ctrl) {
                ctrl.disabled = isViewOnly;
            });
        }
        if (submitBtn) {
            submitBtn.style.display = isViewOnly ? 'none' : '';
        }
        if (cancelBtn) {
            cancelBtn.style.display = isViewOnly ? 'none' : '';
        }

        this.populateCategories();
        
        // Ensure modal is visible
        modal.style.display = 'flex';
        modal.classList.add('active');
        
        console.log('Modal opened successfully');
        console.log('Modal display style:', modal.style.display);
        console.log('Modal classes:', modal.classList.toString());
    }

    openCategoryModal() {
        const modal = document.getElementById('category-modal');
        document.getElementById('category-form').reset();
        modal.classList.add('active');
    }

    handleBudgetSubmit() {
        const formData = {
            name: document.getElementById('budget-name').value.trim(),
            amount: parseFloat(document.getElementById('budget-amount').value),
            currency: document.getElementById('budget-currency').value,
            category: document.getElementById('budget-category').value,
            description: document.getElementById('budget-description').value.trim(),
            budgetDate: document.getElementById('budget-date').value,
            effectiveDate: document.getElementById('effective-date').value
        };

        // Validation
        if (!formData.name || !formData.amount || !formData.category || !formData.budgetDate || !formData.effectiveDate) {
            this.showToast('Please fill in all required fields', 'error');
            return;
        }

        if (formData.amount <= 0) {
            this.showToast('Amount must be greater than 0', 'error');
            return;
        }

        const isApi = window.ApiService && window.ApiService.isEnabled();
        if (this.editingBudgetId) {
            if (isApi) {
                window.ApiService.updateBudget(this.editingBudgetId, formData)
                    .then((updated) => {
                        const index = this.budgets.findIndex(b => b.id === this.editingBudgetId);
                        if (index !== -1) this.budgets[index] = { ...this.budgets[index], ...updated };
                        this.afterBudgetMutation('Budget updated successfully');
                    })
                    .catch((err) => {
                        this.showToast('API error updating budget. Saved locally.', 'warning');
                        this.updateBudgetLocal(this.editingBudgetId, formData);
                        this.afterBudgetMutation();
                    });
                return;
            } else {
                this.updateBudgetLocal(this.editingBudgetId, formData);
            }
        } else {
            if (isApi) {
                window.ApiService.createBudget(formData)
                    .then((created) => {
                        if (created && created.id) {
                            this.budgets.push(created);
                        } else {
                            const fallback = this.createLocalBudget(formData);
                            this.budgets.push(fallback);
                        }
                        this.afterBudgetMutation('Budget created successfully');
                    })
                    .catch(() => {
                        this.showToast('API error creating budget. Saved locally.', 'warning');
                        const fallback = this.createLocalBudget(formData);
                        this.budgets.push(fallback);
                        this.afterBudgetMutation();
                    });
                return;
            } else {
                const newBudget = this.createLocalBudget(formData);
                this.budgets.push(newBudget);
            }
        }

        this.afterBudgetMutation('Budget saved');
        this.closeAllModals();
    }

    createLocalBudget(formData) {
        return {
            id: this.generateId(),
            ...formData,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
    }

    updateBudgetLocal(id, formData) {
        const index = this.budgets.findIndex(b => b.id === id);
        if (index !== -1) {
            this.budgets[index] = {
                ...this.budgets[index],
                ...formData,
                updatedAt: new Date().toISOString()
            };
        }
    }

    afterBudgetMutation(message) {
        this.saveData();
        this.showToast(message || 'Success', 'success');
        this.renderDashboard();
        this.renderBudgets();
        this.editingBudgetId = null;
    }

    handleCategorySubmit() {
        const categoryName = document.getElementById('category-name').value.trim();
        
        if (!categoryName) {
            this.showToast('Please enter a category name', 'error');
            return;
        }

        if (this.categories.includes(categoryName)) {
            this.showToast('Category already exists', 'warning');
            return;
        }
        const isApi = window.ApiService && window.ApiService.isEnabled();
        const finish = () => {
            this.closeAllModals();
            this.renderSettings();
            this.renderBudgets();
            this.showToast('Category added successfully', 'success');
        };
        if (isApi) {
            window.ApiService.createCategory(categoryName)
                .then(() => {
                    this.categories.push(categoryName);
                    this.saveData();
                    finish();
                })
                .catch(() => {
                    this.categories.push(categoryName);
                    this.saveData();
                    this.showToast('API error adding category. Saved locally.', 'warning');
                    finish();
                });
        } else {
            this.categories.push(categoryName);
            this.saveData();
            finish();
        }
    }



    // Optional alias if UI refers to Review as an entry point

    deleteCategory(categoryName) {
        // Check if category is in use
        const budgetsUsingCategory = this.budgets.filter(b => b.category === categoryName);
        
        if (budgetsUsingCategory.length > 0) {
            this.showToast(`Cannot delete category "${categoryName}" - it's being used by ${budgetsUsingCategory.length} budget(s)`, 'warning');
            return;
        }
        const isApi = window.ApiService && window.ApiService.isEnabled();
        const finalize = () => {
            this.renderSettings();
            this.renderBudgets();
            this.showToast('Category deleted successfully', 'success');
        };
        if (isApi) {
            window.ApiService.deleteCategory(categoryName)
                .catch(() => null)
                .finally(() => {
                    this.categories = this.categories.filter(c => c !== categoryName);
                    this.saveData();
                    finalize();
                });
        } else {
            this.categories = this.categories.filter(c => c !== categoryName);
            this.saveData();
            finalize();
        }
    }

    filterBudgets() {
        const categoryFilter = document.getElementById('category-filter').value;
        const dateFilter = document.getElementById('date-filter').value;

        const filteredBudgets = this.budgets.filter(budget => {
            let matchesCategory = true;
            let matchesDate = true;

            if (categoryFilter) {
                matchesCategory = budget.category === categoryFilter;
            }

            if (dateFilter) {
                const budgetDate = new Date(budget.budgetDate);
                const filterDate = new Date(dateFilter);
                matchesDate = budgetDate.toDateString() === filterDate.toDateString();
            }

            return matchesCategory && matchesDate;
        });

        this.renderFilteredBudgets(filteredBudgets);
    }



    renderFilteredBudgets(budgets) {
        const tbody = document.getElementById('budgets-table-body');
        tbody.innerHTML = '';

        if (budgets.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="6" style="text-align: center; padding: 40px;">
                        <p class="no-budgets-message">No budgets match the current filters</p>
                    </td>
                </tr>
            `;
            return;
        }

        budgets.forEach(budget => {
            const row = document.createElement('tr');
            row.setAttribute('data-id', budget.id);
            
            // Create action buttons with proper structure
            const actionButtonsHtml = `
                <div class="action-buttons">
                    <button type="button" class="action-btn review" data-budget-id="${budget.id}" aria-label="Review budget">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button type="button" class="action-btn edit" data-budget-id="${budget.id}" aria-label="Edit budget">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button type="button" class="action-btn delete" data-budget-id="${budget.id}" aria-label="Delete budget">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            `;
            
            row.innerHTML = `
                <td>${budget.name}</td>
                <td>${this.formatCurrency(budget.amount, budget.currency)}</td>
                <td><span class="category-chip">${budget.category}</span></td>
                <td>${this.formatDate(budget.budgetDate)}</td>
                <td>${this.formatDate(budget.effectiveDate)}</td>
                <td>${actionButtonsHtml}</td>
            `;
            tbody.appendChild(row);
        });
    }

    handleSearch(query) {
        if (!query.trim()) {
            this.renderBudgetsTable();
            return;
        }

        const filteredBudgets = this.budgets.filter(budget => 
            budget.name.toLowerCase().includes(query.toLowerCase()) ||
            budget.category.toLowerCase().includes(query.toLowerCase()) ||
            budget.description.toLowerCase().includes(query.toLowerCase())
        );

        this.renderFilteredBudgets(filteredBudgets);
    }

    switchTheme(theme) {
        // Remove existing theme classes
        document.body.classList.remove('light-theme', 'dark-theme');
        
        // Add selected theme class
        if (theme !== 'glass') {
            document.body.classList.add(`${theme}-theme`);
        }
        
        // Update active theme button
        document.querySelectorAll('.theme-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-theme="${theme}"]`).classList.add('active');
        
        // Update theme toggle icon
        const themeToggle = document.querySelector('.theme-toggle i');
        if (theme === 'dark') {
            themeToggle.className = 'fas fa-sun';
        } else {
            themeToggle.className = 'fas fa-moon';
        }
        
        // Save theme preference
        this.settings.theme = theme;
        this.saveData();
    }

    cycleTheme() {
        const themes = ['glass', 'light', 'dark'];
        const currentIndex = themes.indexOf(this.settings.theme);
        const nextIndex = (currentIndex + 1) % themes.length;
        this.switchTheme(themes[nextIndex]);
    }

    applyTheme() {
        this.switchTheme(this.settings.theme);
    }

    updateCurrencyDisplay() {
        document.getElementById('current-currency').textContent = this.settings.defaultCurrency;
    }

    exportData() {
        const data = {
            budgets: this.budgets,
            categories: this.categories,
            settings: this.settings
        };

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `budgettrackr_export_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        this.showToast('Data exported successfully', 'success');
    }

    importData(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);
                
                if (data.budgets && Array.isArray(data.budgets)) {
                    this.budgets = data.budgets;
                }
                
                if (data.categories && Array.isArray(data.categories)) {
                    this.categories = data.categories;
                }
                
                if (data.settings && typeof data.settings === 'object') {
                    this.settings = { ...this.settings, ...data.settings };
                }
                
                this.saveData();
                this.renderDashboard();
                this.renderBudgets();
                this.renderSettings();
                this.applyTheme();
                this.updateCurrencyDisplay();
                
                this.showToast('Data imported successfully', 'success');
            } catch (error) {
                this.showToast('Error importing data. Please check the file format.', 'error');
            }
        };
        reader.readAsText(file);
    }

    closeAllModals() {
        console.log('closeAllModals called');
        document.querySelectorAll('.modal').forEach(modal => {
            console.log('Closing modal:', modal.id);
            modal.classList.remove('active');
            modal.style.display = 'none';
        });
        this.editingBudgetId = null;
        // Clean up any pending delete confirm handler to avoid stacking
        const confirmBtn = document.getElementById('confirm-delete');
        if (confirmBtn && this._deleteConfirmHandler) {
            confirmBtn.removeEventListener('click', this._deleteConfirmHandler);
            this._deleteConfirmHandler = null;
        }
        console.log('All modals closed');
    }

    showToast(message, type = 'success') {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.textContent = message;

        const container = document.getElementById('toast-container');
        container.appendChild(toast);

        // Show toast
        setTimeout(() => toast.classList.add('show'), 100);

        // Hide and remove toast
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 300);
        }, 3000);
    }

    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    formatCurrency(amount, currency) {
        const symbols = {
            'GHS': '₵',
            'USD': '$',
            'EUR': '€'
        };
        
        const symbol = symbols[currency] || currency;
        return `${symbol}${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }

    formatDate(dateString) {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }

    loadData() {
        const savedData = localStorage.getItem('budgetTrackr_v1');
        if (savedData) {
            try {
                const data = JSON.parse(savedData);
                this.budgets = data.budgets || [];
                this.categories = data.categories || ['Food', 'Transport', 'Rent', 'Utilities', 'Others'];
                this.settings = { ...this.settings, ...data.settings };
                // Update greeting with loaded user name
                this.updateGreeting();
            } catch (error) {
                console.error('Error loading saved data:', error);
            }
        }

        // Provide seed data if none exists
        if (this.budgets.length === 0) {
            this.provideSeedData();
        }
    }

    provideSeedData() {
        const seedBudgets = [
            {
                id: this.generateId(),
                name: 'Monthly Groceries',
                amount: 450.00,
                currency: 'GHS',
                category: 'Food',
                description: 'Monthly groceries and household items',
                budgetDate: '2025-01-01',
                effectiveDate: '2025-01-05',
                createdAt: new Date('2025-01-01').toISOString(),
                updatedAt: new Date('2025-01-01').toISOString()
            },
            {
                id: this.generateId(),
                name: 'Transportation',
                amount: 200.00,
                currency: 'GHS',
                category: 'Transport',
                description: 'Monthly transportation costs',
                budgetDate: '2025-01-01',
                effectiveDate: '2025-01-03',
                createdAt: new Date('2025-01-01').toISOString(),
                updatedAt: new Date('2025-01-01').toISOString()
            },
            {
                id: this.generateId(),
                name: 'Rent Payment',
                amount: 1200.00,
                currency: 'GHS',
                category: 'Rent',
                description: 'Monthly rent payment',
                budgetDate: '2025-01-01',
                effectiveDate: '2025-01-07',
                createdAt: new Date('2025-01-01').toISOString(),
                updatedAt: new Date('2025-01-01').toISOString()
            }
        ];

        this.budgets = seedBudgets;
        this.saveData();
    }

    saveData() {
        const data = {
            budgets: this.budgets,
            categories: this.categories,
            settings: this.settings
        };
        localStorage.setItem('budgetTrackr_v1', JSON.stringify(data));
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.app = new BudgetTrackr();
});
