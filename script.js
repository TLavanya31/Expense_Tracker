let expenses = JSON.parse(localStorage.getItem('expenses')) || [];

const expensesTableBody = document.getElementById('expenses-table-body');
const addExpenseForm = document.getElementById('add-expense-form');
const editExpenseForm = document.getElementById('edit-expense-form');
const totalExpensesAmount = document.getElementById('total-expenses-amount');
const expensesByCategoryList = document.getElementById('expenses-by-category-list');
const expensesByDateList = document.getElementById('expenses-by-date-list');
const expensesChartCtx = document.getElementById('expenses-chart').getContext('2d');
let expensesChart;

addExpenseForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const date = document.getElementById('date').value;
    const description = document.getElementById('description').value;
    const category = document.getElementById('category').value;
    const amount = document.getElementById('amount').value;
    const newExpense = { date, description, category, amount };
    expenses.push(newExpense);
    saveAndRefresh();
    addExpenseForm.reset();
    bootstrap.Modal.getInstance(document.getElementById('addExpenseModal')).hide();
});

editExpenseForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const date = document.getElementById('edit-date').value;
    const description = document.getElementById('edit-description').value;
    const category = document.getElementById('edit-category').value;
    const amount = document.getElementById('edit-amount').value;
    const index = expenses.findIndex((expense) => expense.date === date && expense.description === description);
    if (index !== -1) {
        expenses[index] = { date, description, category, amount };
        saveAndRefresh();
        editExpenseForm.reset();
        bootstrap.Modal.getInstance(document.getElementById('editExpenseModal')).hide();
    }
});

function updateExpensesTable() {
    expensesTableBody.innerHTML = '';
    expenses.forEach((expense, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${expense.date}</td>
            <td>${expense.description}</td>
            <td>${expense.category}</td>
            <td>${expense.amount}</td>
            <td>
                <button class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#editExpenseModal" onclick="fillEditForm(${index})">Edit</button>
                <button class="btn btn-danger" onclick="deleteExpense(${index})">Delete</button>
            </td>`;
        expensesTableBody.appendChild(row);
    });
}

function updateTotalExpenses() {
    const total = expenses.reduce((sum, e) => sum + parseFloat(e.amount), 0);
    totalExpensesAmount.textContent = total.toFixed(2);
}

function updateExpensesByCategory() {
    expensesByCategoryList.innerHTML = '';
    const grouped = {};
    expenses.forEach(e => {
        grouped[e.category] = (grouped[e.category] || 0) + parseFloat(e.amount);
    });
    for (const category in grouped) {
        const li = document.createElement('li');
        li.textContent = `${category}: ${grouped[category].toFixed(2)}`;
        expensesByCategoryList.appendChild(li);
    }
}

function updateExpensesByDate() {
    expensesByDateList.innerHTML = '';
    const grouped = {};
    expenses.forEach(e => {
        grouped[e.date] = (grouped[e.date] || 0) + parseFloat(e.amount);
    });
    for (const date in grouped) {
        const li = document.createElement('li');
        li.textContent = `${date}: ${grouped[date].toFixed(2)}`;
        expensesByDateList.appendChild(li);
    }
}

function updateExpensesChart() {
    const categories = [...new Set(expenses.map(e => e.category))];
    const data = categories.map(cat =>
        expenses.filter(e => e.category === cat).reduce((sum, e) => sum + parseFloat(e.amount), 0)
    );

    if (expensesChart) expensesChart.destroy();

    expensesChart = new Chart(expensesChartCtx, {
        type: 'bar',
        data: {
            labels: categories,
            datasets: [{
                label: 'Expenses by Category',
                data: data,
                backgroundColor: ['#f87979', '#79d2f8', '#ffe08a', '#a8f7b2'],
                borderColor: ['#f44336', '#2196f3', '#ff9800', '#4caf50'],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: { beginAtZero: true }
            }
        }
    });
}

function fillEditForm(index) {
    const e = expenses[index];
    document.getElementById('edit-date').value = e.date;
    document.getElementById('edit-description').value = e.description;
    document.getElementById('edit-category').value = e.category;
    document.getElementById('edit-amount').value = e.amount;
}

function deleteExpense(index) {
    expenses.splice(index, 1);
    saveAndRefresh();
}

function saveAndRefresh() {
    localStorage.setItem('expenses', JSON.stringify(expenses));
    updateExpensesTable();
    updateTotalExpenses();
    updateExpensesByCategory();
    updateExpensesByDate();
    updateExpensesChart();
}

// Initial rendering
saveAndRefresh();
