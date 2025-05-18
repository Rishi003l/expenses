// Chart rendering functions
function renderExpenseCharts() {
    renderCategoryChart();
    renderMemberChart();
    renderTimeChart();
}

function renderCategoryChart() {
    if (!expenses || expenses.length === 0) {
        document.getElementById('category-chart').innerHTML = '<p class="no-data">No expense data available</p>';
        return;
    }

    // Group expenses by category
    const categoryData = {};
    expenses.forEach(expense => {
        if (!categoryData[expense.category]) {
            categoryData[expense.category] = 0;
        }
        categoryData[expense.category] += expense.amount;
    });

    // Sort categories by amount
    const sortedCategories = Object.entries(categoryData).sort((a, b) => b[1] - a[1]);
    
    // Calculate percentages
    const totalAmount = sortedCategories.reduce((sum, [_, amount]) => sum + amount, 0);
    
    // Generate HTML for the chart
    let chartHTML = '';
    let legendHTML = '';
    
    const colors = [
        '#4CAF50', '#2196F3', '#FF9800', '#9C27B0', 
        '#E91E63', '#3F51B5', '#00BCD4', '#009688',
        '#8BC34A', '#CDDC39', '#FFC107', '#FF5722'
    ];
    
    sortedCategories.forEach(([category, amount], index) => {
        const percentage = (amount / totalAmount * 100).toFixed(1);
        const color = colors[index % colors.length];
        
        chartHTML += `
            <div class="donut-segment" style="--offset: ${index === 0 ? 0 : sortedCategories.slice(0, index).reduce((sum, [_, amt]) => sum + (amt / totalAmount * 100), 0)}; 
                    --value: ${percentage}; --bg: ${color};">
                <span data-tooltip="${category}: ₹${amount.toFixed(2)} (${percentage}%)"></span>
            </div>
        `;
        
        legendHTML += `
            <div class="legend-item">
                <span class="legend-color" style="background-color: ${color}"></span>
                <span class="legend-text">${category}: ₹${amount.toFixed(2)} (${percentage}%)</span>
            </div>
        `;
    });
    
    document.getElementById('category-chart').innerHTML = `
        <div class="chart-container">
            <div class="donut-chart">
                ${chartHTML}
                <div class="chart-center"></div>
            </div>
            <div class="chart-legend">
                ${legendHTML}
            </div>
        </div>
    `;
}

function renderMemberChart() {
    if (!expenses || expenses.length === 0) {
        document.getElementById('member-chart').innerHTML = '<p class="no-data">No expense data available</p>';
        return;
    }

    // Group expenses by member
    const memberData = {
        Lingeshwar: 0,
        Vani: 0,
        Ruchika: 0,
        Rishi: 0
    };
    
    expenses.forEach(expense => {
        memberData[expense.familyMember] += expense.amount;
    });

    // Calculate total for percentage
    const totalAmount = Object.values(memberData).reduce((sum, amount) => sum + amount, 0);
    
    // Generate HTML for the chart
    let chartHTML = '';
    
    const memberColors = {
        Lingeshwar: '#4CAF50',
        Vani: '#2196F3',
        Ruchika: '#FF9800',
        Rishi: '#E91E63'
    };
    
    // Find the max value for scaling
    const maxValue = Math.max(...Object.values(memberData));
    
    Object.entries(memberData).forEach(([member, amount]) => {
        const percentage = totalAmount > 0 ? (amount / totalAmount * 100).toFixed(1) : 0;
        const barHeight = maxValue > 0 ? (amount / maxValue * 100) : 0;
        
        chartHTML += `
            <div class="bar-container">
                <div class="bar-label">${member}</div>
                <div class="bar-wrapper">
                    <div class="bar" style="height: ${barHeight}%; background-color: ${memberColors[member]};" 
                        data-tooltip="₹${amount.toFixed(2)} (${percentage}%)"></div>
                </div>
                <div class="bar-value">₹${amount.toFixed(0)}</div>
            </div>
        `;
    });
    
    document.getElementById('member-chart').innerHTML = `
        <div class="bar-chart-container">
            ${chartHTML}
        </div>
    `;
}

function renderTimeChart() {
    if (!expenses || expenses.length === 0) {
        document.getElementById('time-chart').innerHTML = '<p class="no-data">No expense data available</p>';
        return;
    }

    // Group expenses by month
    const monthlyData = {};
    
    expenses.forEach(expense => {
        const date = new Date(expense.date);
        const monthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        
        if (!monthlyData[monthYear]) {
            monthlyData[monthYear] = {
                Lingeshwar: 0,
                Vani: 0,
                Ruchika: 0,
                Rishi: 0,
                total: 0
            };
        }
        
        monthlyData[monthYear][expense.familyMember] += expense.amount;
        monthlyData[monthYear].total += expense.amount;
    });
    
    // Sort by date
    const sortedMonths = Object.entries(monthlyData)
        .sort(([a], [b]) => a.localeCompare(b))
        .slice(-6); // Only show last 6 months
    
    // Generate HTML for the chart
    let chartHTML = '';
    let labelsHTML = '';
    
    const memberColors = {
        Lingeshwar: '#4CAF50',
        Vani: '#2196F3',
        Ruchika: '#FF9800',
        Rishi: '#E91E63'
    };
    
    // Find max total for scaling
    const maxTotal = Math.max(...sortedMonths.map(([_, data]) => data.total));
    
    sortedMonths.forEach(([monthYear, data]) => {
        const [year, month] = monthYear.split('-');
        const date = new Date(year, month - 1);
        const monthName = date.toLocaleString('default', { month: 'short' });
        const displayLabel = `${monthName} ${year}`;
        
        let stacksHTML = '';
        
        ['Lingeshwar', 'Vani', 'Ruchika', 'Rishi'].forEach(member => {
            if (data[member] > 0) {
                const percentage = (data[member] / data.total * 100);
                stacksHTML += `
                    <div class="stack-bar" 
                         style="height: ${percentage}%; background-color: ${memberColors[member]};"
                         data-tooltip="${member}: ₹${data[member].toFixed(2)}"></div>
                `;
            }
        });
        
        const barHeight = maxTotal > 0 ? (data.total / maxTotal * 100) : 0;
        
        chartHTML += `
            <div class="time-bar-container">
                <div class="time-bar-wrapper" style="height: ${barHeight}%;">
                    ${stacksHTML}
                </div>
            </div>
        `;
        
        labelsHTML += `
            <div class="time-label">${displayLabel}</div>
        `;
    });
    
    document.getElementById('time-chart').innerHTML = `
        <div class="time-chart-container">
            <div class="time-bars">
                ${chartHTML}
            </div>
            <div class="time-labels">
                ${labelsHTML}
            </div>
        </div>
        <div class="time-chart-legend">
            <div class="legend-item"><span class="legend-color" style="background-color: ${memberColors.Lingeshwar}"></span> Lingeshwar</div>
            <div class="legend-item"><span class="legend-color" style="background-color: ${memberColors.Vani}"></span> Vani</div>
            <div class="legend-item"><span class="legend-color" style="background-color: ${memberColors.Ruchika}"></span> Ruchika</div>
            <div class="legend-item"><span class="legend-color" style="background-color: ${memberColors.Rishi}"></span> Rishi</div>
        </div>
    `;
}

// Export function
function exportToCsv() {
    if (expenses.length === 0) {
        alert('No expenses to export!');
        return;
    }
    
    // Create CSV content
    const headers = ['ID', 'Family Member', 'Date', 'Category', 'Amount', 'Description'];
    let csvContent = headers.join(',') + '\n';
    
    expenses.forEach(expense => {
        const row = [
            expense.id,
            expense.familyMember,
            expense.date,
            expense.category,
            expense.amount,
            `"${expense.description.replace(/"/g, '""')}"`  // Escape quotes in description
        ];
        csvContent += row.join(',') + '\n';
    });
    
    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `family_expenses_${new Date().toISOString().slice(0, 10)}.csv`);
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    showNotification('CSV file downloaded successfully!', 'success');
}

// Import function
function handleFileUpload(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const content = e.target.result;
            const rows = content.split('\n');
            
            if (rows.length < 2) {
                showNotification('Invalid CSV file format.', 'error');
                return;
            }
            
            const headers = rows[0].split(',');
            
            // Simple validation to check if it's likely our format
            if (!headers.includes('Family Member') && !headers.includes('Amount')) {
                showNotification('CSV format does not match expected format.', 'error');
                return;
            }
            
            // Ask for confirmation
            if (confirm(`Import ${rows.length - 1} expense records? This will not remove existing records.`)) {
                // Process rows (skip header)
                let importCount = 0;
                
                for (let i = 1; i < rows.length; i++) {
                    if (!rows[i].trim()) continue; // Skip empty rows
                    
                    const values = parseCSVRow(rows[i]);
                    
                    if (values.length >= 5) {
                        const newExpense = {
                            id: currentId++,
                            familyMember: values[1],
                            date: values[2],
                            category: values[3],
                            amount: parseFloat(values[4]),
                            description: values[5] || 'N/A'
                        };
                        
                        expenses.push(newExpense);
                        importCount++;
                    }
                }
                
                // Save to localStorage
                localStorage.setItem('expenses', JSON.stringify(expenses));
                localStorage.setItem('currentId', JSON.stringify(currentId));
                
                // Update UI
                updateUI();
                
                showNotification(`Successfully imported ${importCount} expense records!`, 'success');
            }
        } catch (error) {
            console.error(error);
            showNotification('Error processing CSV file.', 'error');
        }
        
        // Reset file input
        document.getElementById('import-file').value = '';
    };
    
    reader.readAsText(file);
}

function parseCSVRow(row) {
    const result = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < row.length; i++) {
        const char = row[i];
        
        if (char === '"') {
            inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
            result.push(current);
            current = '';
        } else {
            current += char;
        }
    }
    
    result.push(current); // Add the last value
    return result;
}

// Function for budget tracking
function setBudget() {
    const budgetAmount = parseFloat(document.getElementById('budget-amount').value);
    if (isNaN(budgetAmount) || budgetAmount <= 0) {
        showNotification('Please enter a valid budget amount', 'error');
        return;
    }
    
    const budgetPeriod = document.getElementById('budget-period').value;
    const budgetData = {
        amount: budgetAmount,
        period: budgetPeriod,
        startDate: new Date().toISOString().split('T')[0]
    };
    
    localStorage.setItem('budget', JSON.stringify(budgetData));
    updateBudgetUI();
    
    showNotification('Budget set successfully!', 'success');
    document.getElementById('budget-form').reset();
    
    // Close the modal
    document.getElementById('budget-modal').style.display = 'none';
}

function updateBudgetUI() {
    const budgetCard = document.getElementById('budget-card');
    const storedBudget = localStorage.getItem('budget');
    
    if (!storedBudget) {
        budgetCard.innerHTML = `
            <h3>Budget</h3>
            <p class="no-budget">No budget set</p>
            <button id="set-budget-btn" class="btn btn-secondary">Set Budget</button>
        `;
        document.getElementById('set-budget-btn').addEventListener('click', () => {
            document.getElementById('budget-modal').style.display = 'block';
        });
        return;
    }
    
    const budget = JSON.parse(storedBudget);
    const totalExpenses = calculateExpensesForBudget(budget);
    const remaining = budget.amount - totalExpenses;
    const percentUsed = (totalExpenses / budget.amount) * 100;
    
    let statusClass = 'budget-good';
    if (percentUsed > 90) {
        statusClass = 'budget-danger';
    } else if (percentUsed > 70) {
        statusClass = 'budget-warning';
    }
    
    budgetCard.innerHTML = `
        <h3>Budget</h3>
        <p class="budget-period">${formatBudgetPeriod(budget.period)} Budget</p>
        <div class="budget-amount">₹${budget.amount.toFixed(2)}</div>
        <div class="budget-progress ${statusClass}">
            <div class="progress-bar" style="width: ${Math.min(percentUsed, 100)}%"></div>
        </div>
        <div class="budget-details">
            <div class="budget-spent">
                <span>Spent</span>
                <span>₹${totalExpenses.toFixed(2)}</span>
            </div>
            <div class="budget-remaining">
                <span>Remaining</span>
                <span>₹${remaining.toFixed(2)}</span>
            </div>
        </div>
        <button id="reset-budget-btn" class="btn btn-secondary">Reset Budget</button>
    `;
    
    document.getElementById('reset-budget-btn').addEventListener('click', () => {
        if (confirm('Are you sure you want to reset your budget?')) {
            localStorage.removeItem('budget');
            updateBudgetUI();
            showNotification('Budget has been reset', 'success');
        }
    });
}

function calculateExpensesForBudget(budget) {
    if (!expenses || expenses.length === 0) return 0;
    
    const today = new Date();
    let startDate;
    
    switch (budget.period) {
        case 'daily':
            startDate = new Date(today.setHours(0, 0, 0, 0));
            break;
        case 'weekly':
            startDate = new Date(today.setDate(today.getDate() - today.getDay()));
            startDate.setHours(0, 0, 0, 0);
            break;
        case 'monthly':
            startDate = new Date(today.getFullYear(), today.getMonth(), 1);
            break;
        case 'yearly':
            startDate = new Date(today.getFullYear(), 0, 1);
            break;
        default:
            startDate = new Date(budget.startDate);
    }
    
    // Calculate the total expenses since the start date
    return expenses
        .filter(expense => new Date(expense.date) >= startDate)
        .reduce((total, expense) => total + expense.amount, 0);
}

function formatBudgetPeriod(period) {
    const formats = {
        daily: 'Daily',
        weekly: 'Weekly',
        monthly: 'Monthly',
        yearly: 'Yearly'
    };
    return formats[period] || 'Custom';
}

// Theme functions
function toggleTheme() {
    const currentTheme = localStorage.getItem('theme') || 'light';
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    
    document.body.className = newTheme;
    localStorage.setItem('theme', newTheme);
    
    // Update button text
    document.getElementById('theme-toggle').innerHTML = 
        newTheme === 'light' 
            ? '<i class="fas fa-moon"></i>' 
            : '<i class="fas fa-sun"></i>';
}

function applyStoredTheme() {
    const storedTheme = localStorage.getItem('theme') || 'light';
    document.body.className = storedTheme;
    
    // Set button icon
    if (document.getElementById('theme-toggle')) {
        document.getElementById('theme-toggle').innerHTML = 
            storedTheme === 'light' 
                ? '<i class="fas fa-moon"></i>' 
                : '<i class="fas fa-sun"></i>';
    }
}