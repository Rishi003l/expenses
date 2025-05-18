// DOM Elements
const expenseForm = document.getElementById('expense-form');
const expenseList = document.getElementById('expense-list');
const recentExpenseList = document.getElementById('recent-expense-list');
const familyMemberSelect = document.getElementById('family-member');
const expenseDateInput = document.getElementById('expense-date');
const expenseCategorySelect = document.getElementById('expense-category');
const expenseAmountInput = document.getElementById('expense-amount');
const expenseDescriptionInput = document.getElementById('expense-description');
const totalAmountElement = document.getElementById('total-amount');
const latestExpenseElement = document.getElementById('latest-expense');
const latestDateElement = document.getElementById('latest-date');
const copyButton = document.getElementById('copy-button');
const exportButton = document.getElementById('export-button');
const sheetsButton = document.getElementById('sheets-button');
const importFileInput = document.getElementById('import-file');
const searchInput = document.getElementById('search-input');
const searchButton = document.getElementById('search-button');
const editModal = document.getElementById('edit-modal');
const closeModalButtons = document.querySelectorAll('.close, .close-modal');
const editForm = document.getElementById('edit-form');
const editId = document.getElementById('edit-id');
const editFamilyMember = document.getElementById('edit-family-member');
const editExpenseDate = document.getElementById('edit-expense-date');
const editExpenseCategory = document.getElementById('edit-expense-category');
const editExpenseAmount = document.getElementById('edit-expense-amount');
const editExpenseDescription = document.getElementById('edit-expense-description');
const quickAddBtn = document.getElementById('quick-add-btn');
const quickAddModal = document.getElementById('quick-add-modal');
const quickAddForm = document.getElementById('quick-add-form');
const budgetForm = document.getElementById('budget-form');
const budgetModal = document.getElementById('budget-modal');
const openBudgetModalBtn = document.getElementById('open-budget-modal');
const setBudgetBtn = document.getElementById('set-budget-btn');
const dashTabs = document.querySelectorAll('.dash-tab');
const dashboardTabs = document.querySelectorAll('.dashboard-tab');
const themeToggle = document.getElementById('theme-toggle');
const themeSwitch = document.getElementById('theme-switch');
const filterMember = document.getElementById('filter-member');
const filterCategory = document.getElementById('filter-category');
const filterPeriod = document.getElementById('filter-period');
const applyFiltersBtn = document.getElementById('apply-filters');
const toggleFormBtn = document.getElementById('toggle-form-btn');
const expenseFormContainer = document.getElementById('expense-form-container');
const clearAllDataBtn = document.getElementById('clear-all-data');
const exportAllDataBtn = document.getElementById('export-all-data');
const importDataBtn = document.getElementById('import-data');
const prevPageBtn = document.getElementById('prev-page');
const nextPageBtn = document.getElementById('next-page');
const pageInfoElement = document.getElementById('page-info');
const analyticsUpdateBtn = document.getElementById('update-analytics');
const analyticsPeriod = document.getElementById('analytics-period');
const topCategoriesElement = document.getElementById('top-categories');
const highestDayElement = document.getElementById('highest-day');
const topSpenderElement = document.getElementById('top-spender');
const activeMonthElement = document.getElementById('active-month');
const recommendationsElement = document.getElementById('expense-recommendations');

// Set today's date as default
const today = new Date().toISOString().split('T')[0];
if (expenseDateInput) expenseDateInput.value = today;

// Load expenses from localStorage
let expenses = JSON.parse(localStorage.getItem('expenses')) || [];
let currentId = JSON.parse(localStorage.getItem('currentId')) || 1;

// Pagination variables
let currentPage = 1;
const itemsPerPage = 10;
let filteredExpenses = [...expenses];

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    updateUI();
    applyStoredTheme();
    updateBudgetUI();
    handleTabNavigation();
    setupEventListeners();
});

function setupEventListeners() {
    // Form submissions
const uploadButton = document.getElementById('upload-to-sheets');
if (uploadButton) uploadButton.addEventListener('click', uploadExpensesToSheets);

    if (expenseForm) expenseForm.addEventListener('submit', addExpense);
    if (editForm) editForm.addEventListener('submit', updateExpense);
    if (quickAddForm) quickAddForm.addEventListener('submit', quickAddExpense);
    if (budgetForm) budgetForm.addEventListener('submit', e => {
        e.preventDefault();
        setBudget();
    });
    
    // Buttons
    if (copyButton) copyButton.addEventListener('click', copyToClipboard);
    if (sheetsButton) sheetsButton.addEventListener('click', openGoogleSheets);
    if (exportButton) exportButton.addEventListener('click', exportToCsv);
    if (searchButton) searchButton.addEventListener('click', searchExpenses);
    if (quickAddBtn) quickAddBtn.addEventListener('click', () => {
        quickAddModal.style.display = 'block';
        document.getElementById('quick-family-member').focus();
    });
    if (applyFiltersBtn) applyFiltersBtn.addEventListener('click', applyFilters);
    if (themeToggle) themeToggle.addEventListener('click', toggleTheme);
    if (themeSwitch) themeSwitch.addEventListener('change', toggleTheme);
    if (toggleFormBtn) toggleFormBtn.addEventListener('click', toggleFormVisibility);
    if (prevPageBtn) prevPageBtn.addEventListener('click', () => changePage(-1));
    if (nextPageBtn) nextPageBtn.addEventListener('click', () => changePage(1));
    if (openBudgetModalBtn) openBudgetModalBtn.addEventListener('click', () => {
        budgetModal.style.display = 'block';
    });
    if (setBudgetBtn) setBudgetBtn.addEventListener('click', () => {
        budgetModal.style.display = 'block';
    });
    if (clearAllDataBtn) clearAllDataBtn.addEventListener('click', clearAllData);
    if (exportAllDataBtn) exportAllDataBtn.addEventListener('click', exportAllData);
    if (importDataBtn) importDataBtn.addEventListener('click', () => {
        importFileInput.click();
    });
    if (analyticsUpdateBtn) analyticsUpdateBtn.addEventListener('click', updateAnalytics);
    
    // Input events
    if (searchInput) searchInput.addEventListener('keyup', (e) => {
        if (e.key === 'Enter') {
            searchExpenses();
        }
    });
    if (importFileInput) importFileInput.addEventListener('change', handleFileUpload);
    
    // Modal closing
    closeModalButtons.forEach(button => {
        button.addEventListener('click', () => {
            editModal.style.display = 'none';
            quickAddModal.style.display = 'none';
            budgetModal.style.display = 'none';
        });
    });
    
    // Tab navigation
    dashTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const tabName = tab.getAttribute('data-tab');
            activateTab(tabName);
        });
    });
    
    // See all expenses link
    document.querySelectorAll('.see-all').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const tabName = link.getAttribute('data-tab');
            activateTab(tabName);
        });
    });
    
    // Window events
    window.addEventListener('click', (e) => {
        if (e.target === editModal) editModal.style.display = 'none';
        if (e.target === quickAddModal) quickAddModal.style.display = 'none';
        if (e.target === budgetModal) budgetModal.style.display = 'none';
    });
}

// Functions
function addExpense(e) {
    e.preventDefault();
    
    // Validate inputs
    if (!familyMemberSelect.value || !expenseDateInput.value || !expenseCategorySelect.value || !expenseAmountInput.value) {
        showNotification('Please fill in all required fields', 'error');
        return;
    }
    
    const newExpense = {
        id: currentId++,
        familyMember: familyMemberSelect.value,
        date: expenseDateInput.value,
        category: expenseCategorySelect.value,
        amount: parseFloat(expenseAmountInput.value),
        description: expenseDescriptionInput.value || 'N/A',
        timestamp: new Date().getTime()
    };
    
    expenses.push(newExpense);
    
    // Save to localStorage
    localStorage.setItem('expenses', JSON.stringify(expenses));
    localStorage.setItem('currentId', JSON.stringify(currentId));
    
    // Clear form
    expenseForm.reset();
    expenseDateInput.value = today;
    
    // Update UI
    updateUI();
    
    // Show confirmation
    showNotification('Expense added successfully!', 'success');
}

function quickAddExpense(e) {
    e.preventDefault();
    
    const familyMember = document.getElementById('quick-family-member').value;
    const amount = document.getElementById('quick-expense-amount').value;
    const category = document.getElementById('quick-expense-category').value;
    const description = document.getElementById('quick-expense-description').value;
    
    if (!familyMember || !amount || !category) {
        showNotification('Please fill in all required fields', 'error');
        return;
    }
    
    const newExpense = {
        id: currentId++,
        familyMember: familyMember,
        date: today,
        category: category,
        amount: parseFloat(amount),
        description: description || 'N/A',
        timestamp: new Date().getTime()
    };
    
    expenses.push(newExpense);
    
    // Save to localStorage
    localStorage.setItem('expenses', JSON.stringify(expenses));
    localStorage.setItem('currentId', JSON.stringify(currentId));
    
    // Close modal and update UI
    quickAddModal.style.display = 'none';
    quickAddForm.reset();
    
    updateUI();
    
    showNotification('Expense added successfully!', 'success');
}

function deleteExpense(id) {
    if (confirm('Are you sure you want to delete this expense?')) {
        expenses = expenses.filter(expense => expense.id !== id);
        localStorage.setItem('expenses', JSON.stringify(expenses));
        updateUI();
        showNotification('Expense deleted successfully!', 'success');
    }
}

function editExpense(id) {
    const expense = expenses.find(expense => expense.id === id);
    if (!expense) return;
    
    editId.value = expense.id;
    editFamilyMember.value = expense.familyMember;
    editExpenseDate.value = expense.date;
    editExpenseCategory.value = expense.category;
    editExpenseAmount.value = expense.amount;
    editExpenseDescription.value = expense.description !== 'N/A' ? expense.description : '';
    
    editModal.style.display = 'block';
}

function updateExpense(e) {
    e.preventDefault();
    
    const id = parseInt(editId.value);
    const expenseIndex = expenses.findIndex(expense => expense.id === id);
    
    if (expenseIndex === -1) return;
    
    expenses[expenseIndex] = {
        id: id,
        familyMember: editFamilyMember.value,
        date: editExpenseDate.value,
        category: editExpenseCategory.value,
        amount: parseFloat(editExpenseAmount.value),
        description: editExpenseDescription.value || 'N/A',
        timestamp: expenses[expenseIndex].timestamp || new Date().getTime()
    };
    
    localStorage.setItem('expenses', JSON.stringify(expenses));
    editModal.style.display = 'none';
    updateUI();
    showNotification('Expense updated successfully!', 'success');
}

function updateUI() {
    // Sort expenses by date (newest first)
    expenses.sort((a, b) => new Date(b.date) - new Date(a.date));
    filteredExpenses = [...expenses];
    
    // Apply any active filters
    if (filterMember && filterMember.value !== 'all') {
        filteredExpenses = filteredExpenses.filter(expense => expense.familyMember === filterMember.value);
    }
    
    if (filterCategory && filterCategory.value !== 'all') {
        filteredExpenses = filteredExpenses.filter(expense => expense.category === filterCategory.value);
    }
    
    if (filterPeriod && filterPeriod.value !== 'all') {
        const dateFilters = getDateFilterRange(filterPeriod.value);
        if (dateFilters.start && dateFilters.end) {
            filteredExpenses = filteredExpenses.filter(expense => {
                const expenseDate = new Date(expense.date);
                return expenseDate >= dateFilters.start && expenseDate <= dateFilters.end;
            });
        }
    }
    
    updateExpenseTable();
    updateRecentExpenses();
    updateStatistics();
    renderExpenseCharts();
    updateAnalytics();
}

function updateExpenseTable() {
    if (!expenseList) return;
    
    // Calculate pagination
    const totalPages = Math.ceil(filteredExpenses.length / itemsPerPage);
    if (currentPage > totalPages) currentPage = 1;
    
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    const paginatedExpenses = filteredExpenses.slice(start, end);
    
    // Update pagination controls
    if (pageInfoElement) pageInfoElement.textContent = `Page ${currentPage} of ${totalPages || 1}`;
    if (prevPageBtn) prevPageBtn.disabled = currentPage === 1;
    if (nextPageBtn) nextPageBtn.disabled = currentPage === totalPages || totalPages === 0;
    
    // Clear expense list
    expenseList.innerHTML = '';
    
    // Add expenses to the table or show "no data" message
    if (paginatedExpenses.length === 0) {
        expenseList.innerHTML = `
            <tr>
                <td colspan="6" style="text-align: center;">No expenses found</td>
            </tr>
        `;
        return;
    }
    
    // Add expenses to the table
    paginatedExpenses.forEach(expense => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${expense.familyMember}</td>
            <td>${formatDate(expense.date)}</td>
            <td>${expense.category}</td>
            <td>₹${expense.amount.toFixed(2)}</td>
            <td>${expense.description}</td>
            <td class="action-cell">
                <button class="btn btn-edit btn-sm" onclick="editExpense(${expense.id})">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-delete btn-sm" onclick="deleteExpense(${expense.id})">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        expenseList.appendChild(row);
    });
}

function updateRecentExpenses() {
    if (!recentExpenseList) return;
    
    // Get 5 most recent expenses
    const recentExpenses = expenses.slice(0, 5);
    
    // Clear recent expense list
    recentExpenseList.innerHTML = '';
    
    if (recentExpenses.length === 0) {
        recentExpenseList.innerHTML = `
            <tr>
                <td colspan="5" style="text-align: center;">No recent expenses</td>
            </tr>
        `;
        return;
    }
    
    // Add recent expenses to the table
    recentExpenses.forEach(expense => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${expense.familyMember}</td>
            <td>${formatDate(expense.date)}</td>
            <td>${expense.category}</td>
            <td>₹${expense.amount.toFixed(2)}</td>
            <td class="action-cell">
                <button class="btn btn-edit btn-sm" onclick="editExpense(${expense.id})">
                    <i class="fas fa-edit"></i>
                </button>
            </td>
        `;
        recentExpenseList.appendChild(row);
    });
}

function updateStatistics() {
    // Calculate total expenses
    const totalExpenses = expenses.reduce((total, expense) => total + expense.amount, 0);
    if (totalAmountElement) {
        totalAmountElement.textContent = `₹${totalExpenses.toFixed(2)}`;
    }
    
    // Update latest expense
    if (expenses.length > 0 && latestExpenseElement) {
        const latest = expenses[0]; // Already sorted by date
        latestExpenseElement.textContent = `${latest.familyMember} spent ₹${latest.amount.toFixed(2)} on ${latest.category}`;
        if (latestDateElement) {
            latestDateElement.textContent = formatDate(latest.date);
        }
    } else if (latestExpenseElement) {
        latestExpenseElement.textContent = 'None';
        if (latestDateElement) {
            latestDateElement.textContent = '';
        }
    }
}

function formatDate(dateString) {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
}

function copyToClipboard() {
    if (expenses.length === 0) {
        showNotification('No expenses to copy!', 'error');
        return;
    }
    
    // Create a formatted string with tab separators for pasting into spreadsheets
    let text = 'Family Member\tDate\tCategory\tAmount\tDescription\n';
    
    expenses.forEach(expense => {
        text += `${expense.familyMember}\t${expense.date}\t${expense.category}\t${expense.amount}\t${expense.description}\n`;
    });
    
    // Create a temporary textarea element to copy the text
    const textarea = document.createElement('textarea');
    textarea.value = text;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
    
    showNotification('Expense data copied to clipboard!', 'success');
}

function openGoogleSheets() {
    window.open('https://docs.google.com/spreadsheets/d/18gkpS5t7HB6d9d0gaa3FWUXEjABf9Tlx3i0h_EmaVBY/edit?gid=0#gid=0', '_blank');
}

function searchExpenses() {
    const searchTerm = searchInput.value.toLowerCase().trim();
    
    if (searchTerm === '') {
        updateUI();
        return;
    }
    
    filteredExpenses = expenses.filter(expense => 
        expense.familyMember.toLowerCase().includes(searchTerm) ||
        expense.category.toLowerCase().includes(searchTerm) ||
        expense.description.toLowerCase().includes(searchTerm) ||
        expense.date.includes(searchTerm) ||
        expense.amount.toString().includes(searchTerm)
    );
    
    currentPage = 1;
    updateExpenseTable();
}

function applyFilters() {
    // Reset the current page when applying new filters
    currentPage = 1;
    updateUI();
}

function changePage(direction) {
    currentPage += direction;
    updateExpenseTable();
    
    // Scroll to top of table
    document.querySelector('.table-container').scrollIntoView({ behavior: 'smooth' });
}

function getDateFilterRange(filterValue) {
    const today = new Date();
    let start, end;
    
    switch (filterValue) {
        case 'this-month':
            start = new Date(today.getFullYear(), today.getMonth(), 1);
            end = new Date(today.getFullYear(), today.getMonth() + 1, 0);
            break;
        case 'last-month':
            start = new Date(today.getFullYear(), today.getMonth() - 1, 1);
            end = new Date(today.getFullYear(), today.getMonth(), 0);
            break;
        case 'this-year':
            start = new Date(today.getFullYear(), 0, 1);
            end = new Date(today.getFullYear(), 11, 31);
            break;
        default:
            start = null;
            end = null;
    }
    
    return { start, end };
}

function toggleFormVisibility() {
    expenseFormContainer.classList.toggle('collapsed');
    
    // Change the button icon
    if (expenseFormContainer.classList.contains('collapsed')) {
        toggleFormBtn.innerHTML = '<i class="fas fa-chevron-down"></i>';
    } else {
        toggleFormBtn.innerHTML = '<i class="fas fa-chevron-up"></i>';
    }
}

function activateTab(tabName) {
    // Deactivate all tabs
    dashTabs.forEach(tab => tab.classList.remove('active'));
    dashboardTabs.forEach(panel => panel.classList.remove('active'));
    
    // Activate the selected tab
    document.querySelector(`.dash-tab[data-tab="${tabName}"]`).classList.add('active');
    document.getElementById(`${tabName}-tab`).classList.add('active');
}

function handleTabNavigation() {
    // Check if a tab is already active
    const activeTab = document.querySelector('.dash-tab.active');
    if (!activeTab) {
        // Activate the first tab by default
        activateTab('overview');
    }
}

function clearAllData() {
    if (confirm('Are you sure you want to clear all expense data? This action cannot be undone.')) {
        localStorage.removeItem('expenses');
        localStorage.removeItem('currentId');
        localStorage.removeItem('budget');
        
        expenses = [];
        currentId = 1;
        currentPage = 1;
        
        updateUI();
        updateBudgetUI();
        
        showNotification('All data has been cleared', 'success');
    }
}

function exportAllData() {
    const data = {
        expenses: expenses,
        currentId: currentId,
        budget: JSON.parse(localStorage.getItem('budget') || 'null')
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `family_expense_tracker_backup_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    showNotification('Data exported successfully!', 'success');
}

function updateAnalytics() {
    if (!expenses || expenses.length === 0) {
        if (topCategoriesElement) {
            topCategoriesElement.innerHTML = '<p class="no-data">No expense data available</p>';
        }
        if (highestDayElement) {
            highestDayElement.textContent = 'N/A';
        }
        if (topSpenderElement) {
            topSpenderElement.textContent = 'N/A';
        }
        if (activeMonthElement) {
            activeMonthElement.textContent = 'N/A';
        }
        if (recommendationsElement) {
            recommendationsElement.innerHTML = '<p>Add some expenses to see personalized recommendations.</p>';
        }
        return;
    }
    
    // Get top spending categories
    const categoryData = {};
    expenses.forEach(expense => {
        if (!categoryData[expense.category]) {
            categoryData[expense.category] = 0;
        }
        categoryData[expense.category] += expense.amount;
    });
    
    const sortedCategories = Object.entries(categoryData)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);
    
    if (topCategoriesElement) {
        let listHTML = '';
        sortedCategories.forEach(([category, amount]) => {
            listHTML += `
                <li>
                    <span>${category}</span>
                    <span>₹${amount.toFixed(2)}</span>
                </li>
            `;
        });
        topCategoriesElement.innerHTML = `<ul class="top-list">${listHTML}</ul>`;
    }
    
    // Find highest spending day
    const dailyTotals = {};
    expenses.forEach(expense => {
        if (!dailyTotals[expense.date]) {
            dailyTotals[expense.date] = 0;
        }
        dailyTotals[expense.date] += expense.amount;
    });
    
    let highestDay = null;
    let highestAmount = 0;
    
    for (const [date, amount] of Object.entries(dailyTotals)) {
        if (amount > highestAmount) {
            highestAmount = amount;
            highestDay = date;
        }
    }
    
    if (highestDayElement && highestDay) {
        highestDayElement.textContent = `${formatDate(highestDay)} (₹${highestAmount.toFixed(2)})`;
    }
    
    // Find top spender
    const memberTotals = {
        Lingeshwar: 0,
        Vani: 0,
        Ruchika: 0,
        Rishi: 0
    };
    
    expenses.forEach(expense => {
        memberTotals[expense.familyMember] += expense.amount;
    });
    
    let topSpender = null;
    let topAmount = 0;
    
    for (const [member, amount] of Object.entries(memberTotals)) {
        if (amount > topAmount) {
            topAmount = amount;
            topSpender = member;
        }
    }
    
    if (topSpenderElement && topSpender) {
        topSpenderElement.textContent = `${topSpender} (₹${topAmount.toFixed(2)})`;
    }
    
    // Find most active month
    const monthlyActivity = {};
    
    expenses.forEach(expense => {
        const date = new Date(expense.date);
        const monthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        
        if (!monthlyActivity[monthYear]) {
            monthlyActivity[monthYear] = 0;
        }
        
        monthlyActivity[monthYear]++;
    });
    
    let mostActiveMonth = null;
    let mostTransactions = 0;
    
    for (const [month, count] of Object.entries(monthlyActivity)) {
        if (count > mostTransactions) {
            mostTransactions = count;
            mostActiveMonth = month;
        }
    }
    
    if (activeMonthElement && mostActiveMonth) {
        const [year, month] = mostActiveMonth.split('-');
        const date = new Date(year, month - 1);
        const monthName = date.toLocaleString('default', { month: 'long' });
        activeMonthElement.textContent = `${monthName} ${year} (${mostTransactions} expenses)`;
    }
    
    // Generate recommendations
    if (recommendationsElement) {
        let recommendations = '';
        
        // Check if a budget is set
        const budget = JSON.parse(localStorage.getItem('budget'));
        if (!budget) {
            recommendations += '<p>💡 <strong>Tip:</strong> Set a budget to track your spending limits.</p>';
        }
        
        // Check for high spending categories
        if (sortedCategories.length > 0) {
            const topCategory = sortedCategories[0][0];
            const topAmount = sortedCategories[0][1];
            const totalExpense = expenses.reduce((sum, expense) => sum + expense.amount, 0);
            const percentage = (topAmount / totalExpense * 100).toFixed(1);
            
            if (percentage > 30) {
                recommendations += `<p>⚠️ <strong>Alert:</strong> You spend ${percentage}% of your budget on ${topCategory}. Consider reducing expenses in this category.</p>`;
            }
        }
        
        // Check for frequent small expenses
        const smallExpenses = expenses.filter(expense => expense.amount < 100);
        if (smallExpenses.length > expenses.length * 0.4) {
            recommendations += '<p>💡 <strong>Tip:</strong> You have many small expenses. These can add up quickly - try to consolidate some of these purchases.</p>';
        }
        
        // Check for spending patterns
        const recentMonthExpenses = expenses.filter(expense => {
            const expenseDate = new Date(expense.date);
            const oneMonthAgo = new Date();
            oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
            return expenseDate >= oneMonthAgo;
        });
        
        if (recentMonthExpenses.length > 0) {
            const recentTotal = recentMonthExpenses.reduce((sum, expense) => sum + expense.amount, 0);
            const avgMonthly = recentTotal;
            
            // If we have enough data, give a projection
            if (expenses.length > 10) {
                recommendations += `<p>📊 <strong>Projection:</strong> At your current rate, you're spending approximately ₹${avgMonthly.toFixed(2)} per month.</p>`;
            }
        }
        
        if (recommendations === '') {
            recommendations = '<p>Your spending looks balanced! Keep up the good work.</p>';
        }
        
        recommendationsElement.innerHTML = recommendations;
    }
}

function showNotification(message, type) {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    // Add to document
    document.body.appendChild(notification);
    
    // Show with animation
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);
    
    // Remove after delay
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}
