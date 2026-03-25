// API Configuration
const API_BASE_URL = 'http://localhost:3000/api';

// State Management
let currentUser = null;
let authToken = null;

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    setupEventListeners();
});

// Check if user is authenticated
function checkAuth() {
    const token = localStorage.getItem('authToken');
    const user = localStorage.getItem('user');
    
    if (token && user) {
        authToken = token;
        currentUser = JSON.parse(user);
        showDashboard();
        loadDashboardData();
    } else {
        showAuthPage();
    }
}

// Setup Event Listeners
function setupEventListeners() {
    // Auth tabs
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const tab = e.target.dataset.tab;
            switchTab(tab);
        });
    });

    // Login form
    document.getElementById('login-form').addEventListener('submit', handleLogin);
    
    // Register form
    document.getElementById('register-form').addEventListener('submit', handleRegister);
    
    // Logout
    document.getElementById('logout-btn').addEventListener('click', handleLogout);
    
    // Add Income button
    document.getElementById('add-income-btn').addEventListener('click', () => {
        showModal('income-modal');
    });
    
    // Add Expense button
    document.getElementById('add-expense-btn').addEventListener('click', () => {
        resetExpenseForm();
        showModal('expense-modal');
    });

    // Quick add fixed expense (rent, subscriptions, etc.)
    document.querySelectorAll('.btn-quick-fixed').forEach(btn => {
        btn.addEventListener('click', () => {
            const cat = btn.dataset.cat || '';
            const desc = btn.dataset.desc || '';
            openFixedExpensePreset(cat, desc);
        });
    });
    
    // Income form
    document.getElementById('income-form').addEventListener('submit', handleAddIncome);
    
    // Expense form
    document.getElementById('expense-form').addEventListener('submit', handleAddExpense);
    
    // AI Suggest button
    document.getElementById('ai-suggest-btn').addEventListener('click', handleAISuggest);
    
    // Auto-suggest when description changes
    document.getElementById('expense-description').addEventListener('blur', function() {
        if (this.value && !document.getElementById('expense-category').value) {
            handleAISuggest();
        }
    });
    
    // Close modals
    document.querySelectorAll('.close').forEach(closeBtn => {
        closeBtn.addEventListener('click', () => {
            closeAllModals();
        });
    });
    
    // Close modal on outside click
    window.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) {
            closeAllModals();
        }
    });
}

// Tab Switching
function switchTab(tab) {
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelectorAll('.auth-form').forEach(form => {
        form.classList.remove('active');
    });
    
    document.querySelector(`[data-tab="${tab}"]`).classList.add('active');
    document.getElementById(`${tab}-form`).classList.add('active');
    clearError();

    const heading = document.getElementById('auth-form-heading');
    const sub = document.getElementById('auth-form-sub');
    if (heading && sub) {
        if (tab === 'login') {
            heading.textContent = 'Welcome back';
            sub.textContent = 'Sign in with your email and password.';
        } else {
            heading.textContent = 'Create account';
            sub.textContent = 'Register to start tracking your finances.';
        }
    }
}

// Show Auth Page
function showAuthPage() {
    document.getElementById('auth-page').classList.remove('hidden');
    document.getElementById('dashboard-page').classList.add('hidden');
}

// Show Dashboard
function showDashboard() {
    document.getElementById('auth-page').classList.add('hidden');
    document.getElementById('dashboard-page').classList.remove('hidden');
    document.getElementById('username-display').textContent = currentUser.username;
}

// API Functions
async function apiCall(endpoint, options = {}) {
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers
    };
    
    if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`;
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            ...options,
            headers
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error || 'Request failed');
        }
        
        return data;
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
}

// Login Handler
async function handleLogin(e) {
    e.preventDefault();
    clearError();
    
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    
    try {
        const data = await apiCall('/login', {
            method: 'POST',
            body: JSON.stringify({ email, password })
        });
        
        authToken = data.token;
        currentUser = data.user;
        
        localStorage.setItem('authToken', authToken);
        localStorage.setItem('user', JSON.stringify(currentUser));
        
        showDashboard();
        loadDashboardData();
    } catch (error) {
        showError(error.message);
    }
}

// Register Handler
async function handleRegister(e) {
    e.preventDefault();
    clearError();
    
    const username = document.getElementById('register-username').value;
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;
    
    try {
        const data = await apiCall('/register', {
            method: 'POST',
            body: JSON.stringify({ username, email, password })
        });
        
        authToken = data.token;
        currentUser = data.user;
        
        localStorage.setItem('authToken', authToken);
        localStorage.setItem('user', JSON.stringify(currentUser));
        
        showDashboard();
        loadDashboardData();
    } catch (error) {
        showError(error.message);
    }
}

// Logout Handler
function handleLogout() {
    authToken = null;
    currentUser = null;
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    showAuthPage();
    clearError();
}

// Load Dashboard Data
async function loadDashboardData() {
    try {
        const [dashboard, expenses, income] = await Promise.all([
            apiCall('/dashboard'),
            apiCall('/expenses'),
            apiCall('/income')
        ]);
        
        updateSummary(dashboard);
        displayFixedExpenses(expenses);
        displayExpenses(expenses);
        displayIncome(income);
    } catch (error) {
        console.error('Error loading dashboard:', error);
    }
}

// Format AI tip: escape HTML, then **bold** → <strong>
function formatTipHtml(text) {
    const escaped = String(text)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
    return escaped.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
}

// Update Summary Cards + AI panel
function updateSummary(data) {
    document.getElementById('total-income').textContent = `Rs ${data.totalIncome.toFixed(2)}`;
    document.getElementById('total-expenses').textContent = `Rs ${data.totalExpenses.toFixed(2)}`;
    document.getElementById('fixed-expenses').textContent = `Rs ${data.fixedExpenses.toFixed(2)}`;
    
    const balance = data.balance;
    const balanceElement = document.getElementById('balance');
    balanceElement.textContent = `Rs ${balance.toFixed(2)}`;
    balanceElement.style.color = balance >= 0 ? '#28a745' : '#dc3545';
    
    renderAIPanel(data);
}

function renderAIPanel(data) {
    const insightsEl = document.getElementById('ai-insights-list');
    const savingsEl = document.getElementById('ai-savings-list');
    const predBanner = document.getElementById('ai-prediction-banner');
    const investBanner = document.getElementById('ai-invest-banner');
    const investList = document.getElementById('ai-invest-list');

    // Insights (spending overview)
    if (data.insights && data.insights.length > 0) {
        insightsEl.innerHTML = data.insights.map(t => `<li>${formatTipHtml(t)}</li>`).join('');
    } else {
        insightsEl.innerHTML = '<li>No spending data yet — add expenses to see overview.</li>';
    }

    // Savings tips
    if (data.savingsTips && data.savingsTips.length > 0) {
        savingsEl.innerHTML = data.savingsTips.map(t => `<li>${formatTipHtml(t)}</li>`).join('');
    } else {
        savingsEl.innerHTML = '<li>Add expenses to see AI savings suggestions.</li>';
    }

    // Prediction strip
    if (data.prediction && data.prediction.predictedTotal > 0) {
        const p = data.prediction;
        const conf = p.confidence ? p.confidence.charAt(0).toUpperCase() + p.confidence.slice(1) : '';
        predBanner.classList.remove('hidden');
        predBanner.innerHTML = `<strong>Forecast:</strong> Next month’s spending may be around <strong>Rs ${p.predictedTotal.toFixed(2)}</strong> ` +
            `(confidence: ${conf}). Fixed ~Rs ${(p.fixedExpenses || 0).toFixed(2)}, variable portion estimated.`;
    } else {
        predBanner.classList.add('hidden');
        predBanner.innerHTML = '';
    }

    // Investment suggestions (SIP, MF, etc.) from average monthly savings
    const inv = data.investmentProfile;
    if (inv && inv.tips && inv.tips.length > 0) {
        const months = inv.monthsAnalyzed || 0;
        const avg = typeof inv.averageMonthlySavings === 'number' ? inv.averageMonthlySavings : 0;
        investBanner.classList.remove('hidden');
        if (months > 0) {
            investBanner.innerHTML = `Estimated <strong>average monthly savings</strong>: <strong>Rs ${avg.toFixed(2)}</strong> (from <strong>${months}</strong> calendar month(s) in your tracker).`;
        } else {
            investBanner.innerHTML = `Add dated <strong>income</strong> and <strong>expenses</strong> so we can estimate monthly savings and suggest SIPs / mutual funds.`;
        }
        investList.innerHTML = inv.tips.map(t => `<li>${formatTipHtml(t)}</li>`).join('');
    } else {
        investBanner.classList.add('hidden');
        investBanner.innerHTML = '';
        investList.innerHTML = '<li>Investment suggestions will appear here once we can estimate your monthly savings.</li>';
    }
}

function escapeHtml(str) {
    if (str == null) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

function resetExpenseForm() {
    document.getElementById('expense-form').reset();
    const hint = document.getElementById('ai-suggestion-text');
    if (hint) hint.style.display = 'none';
}

function openFixedExpensePreset(category, description) {
    resetExpenseForm();
    document.getElementById('expense-category').value = category;
    document.getElementById('expense-description').value = description || '';
    document.getElementById('expense-fixed').checked = true;
    showModal('expense-modal');
}

// Fixed & recurring only (rent, subscriptions, EMI, etc.)
function displayFixedExpenses(expenses) {
    const fixed = expenses.filter(e => e.isFixed);
    const container = document.getElementById('fixed-expenses-list');
    const summary = document.getElementById('fixed-expenses-summary');
    const totalEl = document.getElementById('fixed-expenses-monthly-total');

    if (fixed.length === 0) {
        container.innerHTML = '<div class="empty-state"><p>No fixed expenses yet. Use <strong>Quick add</strong> (Rent, Subscriptions…) or add an expense and tick <strong>Fixed / recurring</strong>.</p></div>';
        summary.classList.add('hidden');
        return;
    }

    const total = fixed.reduce((s, e) => s + Number(e.amount), 0);
    summary.classList.remove('hidden');
    totalEl.textContent = `Rs ${total.toFixed(2)}`;

    const sorted = [...fixed].sort((a, b) => new Date(b.date) - new Date(a.date));
    container.innerHTML = sorted.map(expense => `
        <div class="list-item expense-item fixed-item">
            <div class="item-info">
                <div class="item-title">${escapeHtml(expense.category)} <span class="fixed-badge">Recurring</span></div>
                ${expense.description ? `<div class="item-description">${escapeHtml(expense.description)}</div>` : ''}
                <div class="item-date">${formatDate(expense.date)}</div>
            </div>
            <div style="display: flex; align-items: center; gap: 15px;">
                <span class="item-amount">-Rs ${Number(expense.amount).toFixed(2)}</span>
                <button class="delete-btn" onclick="deleteExpense(${JSON.stringify(expense.id)})">Delete</button>
            </div>
        </div>
    `).join('');
}

// Variable / one-off expenses only (fixed items appear in section above)
function displayExpenses(expenses) {
    const variable = expenses.filter(e => !e.isFixed);
    const container = document.getElementById('expenses-list');

    if (variable.length === 0) {
        container.innerHTML = '<div class="empty-state"><p>No variable expenses yet. Fixed items are listed in <strong>Fixed &amp; recurring</strong> above.</p></div>';
        return;
    }

    const sorted = [...variable].sort((a, b) => new Date(b.date) - new Date(a.date));
    container.innerHTML = sorted.map(expense => `
        <div class="list-item expense-item">
            <div class="item-info">
                <div class="item-title">${escapeHtml(expense.category)}</div>
                ${expense.description ? `<div class="item-description">${escapeHtml(expense.description)}</div>` : ''}
                <div class="item-date">${formatDate(expense.date)}</div>
            </div>
            <div style="display: flex; align-items: center; gap: 15px;">
                <span class="item-amount">-Rs ${Number(expense.amount).toFixed(2)}</span>
                <button class="delete-btn" onclick="deleteExpense(${JSON.stringify(expense.id)})">Delete</button>
            </div>
        </div>
    `).join('');
}

// Display Income
function displayIncome(income) {
    const container = document.getElementById('income-list');
    
    if (income.length === 0) {
        container.innerHTML = '<div class="empty-state"><p>No income recorded yet. Add your first income!</p></div>';
        return;
    }
    
    container.innerHTML = income.map(item => `
        <div class="list-item income-item">
            <div class="item-info">
                <div class="item-title">${item.source}</div>
                ${item.description ? `<div class="item-description">${item.description}</div>` : ''}
                <div class="item-date">${formatDate(item.date)}</div>
            </div>
            <div style="display: flex; align-items: center; gap: 15px;">
                <span class="item-amount">+Rs ${item.amount.toFixed(2)}</span>
                <button class="delete-btn" onclick="deleteIncome('${item.id}')">Delete</button>
            </div>
        </div>
    `).join('');
}

// Add Income Handler
async function handleAddIncome(e) {
    e.preventDefault();
    
    const source = document.getElementById('income-source').value;
    const amount = document.getElementById('income-amount').value;
    const description = document.getElementById('income-description').value;
    
    try {
        await apiCall('/income', {
            method: 'POST',
            body: JSON.stringify({ source, amount, description })
        });
        
        closeAllModals();
        document.getElementById('income-form').reset();
        loadDashboardData();
    } catch (error) {
        alert('Error adding income: ' + error.message);
    }
}

// AI Suggest Handler
async function handleAISuggest() {
    const description = document.getElementById('expense-description').value;
    const amount = document.getElementById('expense-amount').value;
    
    if (!description) {
        alert('Please enter a description first for AI to suggest a category');
        return;
    }
    
    try {
        const suggestion = await apiCall('/ai/suggest-category', {
            method: 'POST',
            body: JSON.stringify({ description, amount })
        });
        
        document.getElementById('expense-category').value = suggestion.category;
        document.getElementById('expense-fixed').checked = suggestion.isFixed;
        
        const suggestionText = document.getElementById('ai-suggestion-text');
        suggestionText.textContent = `✨ AI suggested: ${suggestion.category}${suggestion.isFixed ? ' (Fixed Expense)' : ''}`;
        suggestionText.style.display = 'block';
        
        setTimeout(() => {
            suggestionText.style.display = 'none';
        }, 5000);
    } catch (error) {
        console.error('AI suggestion error:', error);
    }
}

// Add Expense Handler
async function handleAddExpense(e) {
    e.preventDefault();
    
    const category = document.getElementById('expense-category').value;
    const amount = document.getElementById('expense-amount').value;
    const description = document.getElementById('expense-description').value;
    const isFixed = document.getElementById('expense-fixed').checked;
    
    try {
        await apiCall('/expenses', {
            method: 'POST',
            body: JSON.stringify({ category, amount, description, isFixed })
        });
        
        closeAllModals();
        document.getElementById('expense-form').reset();
        document.getElementById('ai-suggestion-text').style.display = 'none';
        loadDashboardData();
    } catch (error) {
        alert('Error adding expense: ' + error.message);
    }
}

// Delete Expense
async function deleteExpense(id) {
    if (!confirm('Are you sure you want to delete this expense?')) {
        return;
    }
    
    try {
        await apiCall(`/expenses/${id}`, {
            method: 'DELETE'
        });
        
        loadDashboardData();
    } catch (error) {
        alert('Error deleting expense: ' + error.message);
    }
}

// Delete Income
async function deleteIncome(id) {
    if (!confirm('Are you sure you want to delete this income?')) {
        return;
    }
    
    try {
        await apiCall(`/income/${id}`, {
            method: 'DELETE'
        });
        
        loadDashboardData();
    } catch (error) {
        alert('Error deleting income: ' + error.message);
    }
}

// Modal Functions
function showModal(modalId) {
    const el = document.getElementById(modalId);
    if (!el) return;
    el.classList.remove('hidden'); /* in case .hidden was applied; it blocks display with !important */
    el.classList.add('show');
}

function closeAllModals() {
    document.querySelectorAll('.modal').forEach((modal) => {
        modal.classList.remove('show');
    });
}

// Utility Functions
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
    });
}

function showError(message) {
    const errorDiv = document.getElementById('auth-error');
    errorDiv.textContent = message;
    errorDiv.classList.add('show');
}

function clearError() {
    const errorDiv = document.getElementById('auth-error');
    errorDiv.textContent = '';
    errorDiv.classList.remove('show');
}

// Make functions available globally for onclick handlers
window.deleteExpense = deleteExpense;
window.deleteIncome = deleteIncome;
