class InterestCalculator {
    constructor() {
        this.history = JSON.parse(localStorage.getItem('calculatorHistory')) || [];
        this.initializeEventListeners();
        this.loadHistory();
    }

    initializeEventListeners() {
        // Tab switching
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.switchTab(e.target.dataset.tab));
        });

        // Input validation
        document.querySelectorAll('input[type="number"]').forEach(input => {
            input.addEventListener('input', (e) => this.validateInput(e.target));
        });
    }

    switchTab(tabName) {
        // Update tab buttons
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

        // Update panels
        document.querySelectorAll('.calculator-panel').forEach(panel => {
            panel.classList.remove('active');
        });
        document.getElementById(tabName).classList.add('active');
    }

    validateInput(input) {
        const value = parseFloat(input.value);
        const errorElement = input.parentElement.querySelector('.error');
        
        // Remove existing error
        if (errorElement) {
            errorElement.remove();
        }
        input.parentElement.classList.remove('has-error');

        // Validate
        if (input.value && (isNaN(value) || value < 0)) {
            this.showInputError(input, 'Please enter a valid positive number');
            return false;
        }
        return true;
    }

    showInputError(input, message) {
        input.parentElement.classList.add('has-error');
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error';
        errorDiv.textContent = message;
        input.parentElement.appendChild(errorDiv);
    }

    calculateSimpleInterest() {
        const principal = parseFloat(document.getElementById('si-principal').value);
        const rate = parseFloat(document.getElementById('si-rate').value);
        const time = parseFloat(document.getElementById('si-time').value);
        const timeUnit = document.getElementById('si-time-unit').value;

        if (!this.validateInputs([principal, rate, time])) return;

        // Convert time to years
        let timeInYears = time;
        if (timeUnit === 'months') timeInYears = time / 12;
        if (timeUnit === 'days') timeInYears = time / 365;

        const interest = (principal * rate * timeInYears) / 100;
        const amount = principal + interest;

        const result = {
            type: 'Simple Interest',
            principal,
            rate,
            time: `${time} ${timeUnit}`,
            interest,
            amount,
            timestamp: new Date()
        };

        this.displaySimpleInterestResult(result);
        this.addToHistory(result);
    }

    calculateCompoundInterest() {
        const principal = parseFloat(document.getElementById('ci-principal').value);
        const rate = parseFloat(document.getElementById('ci-rate').value);
        const time = parseFloat(document.getElementById('ci-time').value);
        const frequency = parseInt(document.getElementById('ci-frequency').value);

        if (!this.validateInputs([principal, rate, time])) return;

        const amount = principal * Math.pow((1 + (rate / 100) / frequency), frequency * time);
        const interest = amount - principal;

        const result = {
            type: 'Compound Interest',
            principal,
            rate,
            time: `${time} years`,
            frequency: this.getFrequencyText(frequency),
            interest,
            amount,
            timestamp: new Date()
        };

        this.displayCompoundInterestResult(result);
        this.addToHistory(result);
    }

    calculateEMI() {
        const principal = parseFloat(document.getElementById('emi-principal').value);
        const rate = parseFloat(document.getElementById('emi-rate').value);
        const tenure = parseFloat(document.getElementById('emi-tenure').value);
        const tenureUnit = document.getElementById('emi-tenure-unit').value;

        if (!this.validateInputs([principal, rate, tenure])) return;

        // Convert tenure to months
        let tenureInMonths = tenure;
        if (tenureUnit === 'years') tenureInMonths = tenure * 12;

        const monthlyRate = rate / (12 * 100);
        const emi = (principal * monthlyRate * Math.pow(1 + monthlyRate, tenureInMonths)) / 
                   (Math.pow(1 + monthlyRate, tenureInMonths) - 1);
        
        const totalAmount = emi * tenureInMonths;
        const totalInterest = totalAmount - principal;

        const result = {
            type: 'EMI Calculator',
            principal,
            rate,
            tenure: `${tenure} ${tenureUnit}`,
            emi,
            totalAmount,
            totalInterest,
            timestamp: new Date()
        };

        this.displayEMIResult(result);
        this.addToHistory(result);
    }

    validateInputs(values) {
        for (let value of values) {
            if (isNaN(value) || value <= 0) {
                alert('Please enter valid positive numbers for all fields.');
                return false;
            }
        }
        return true;
    }

    displaySimpleInterestResult(result) {
        const resultSection = document.getElementById('si-result');
        resultSection.innerHTML = `
            <div class="result-card">
                <div class="result-header">
                    <div class="result-title">
                        <i class="fas fa-chart-line"></i>
                        Simple Interest Calculation
                    </div>
                    <button class="btn-secondary" onclick="calculator.saveResult('si')">
                        <i class="fas fa-save"></i> Save
                    </button>
                </div>
                <div class="result-grid">
                    <div class="result-item">
                        <div class="result-label">Principal Amount</div>
                        <div class="result-value">$${result.principal.toLocaleString()}</div>
                    </div>
                    <div class="result-item">
                        <div class="result-label">Interest Rate</div>
                        <div class="result-value">${result.rate}%</div>
                    </div>
                    <div class="result-item">
                        <div class="result-label">Time Period</div>
                        <div class="result-value">${result.time}</div>
                    </div>
                    <div class="result-item">
                        <div class="result-label">Simple Interest</div>
                        <div class="result-value">$${result.interest.toLocaleString()}</div>
                    </div>
                    <div class="result-item">
                        <div class="result-label">Total Amount</div>
                        <div class="result-value">$${result.amount.toLocaleString()}</div>
                    </div>
                </div>
            </div>
        `;
    }

    displayCompoundInterestResult(result) {
        const resultSection = document.getElementById('ci-result');
        resultSection.innerHTML = `
            <div class="result-card">
                <div class="result-header">
                    <div class="result-title">
                        <i class="fas fa-chart-area"></i>
                        Compound Interest Calculation
                    </div>
                    <button class="btn-secondary" onclick="calculator.saveResult('ci')">
                        <i class="fas fa-save"></i> Save
                    </button>
                </div>
                <div class="result-grid">
                    <div class="result-item">
                        <div class="result-label">Principal Amount</div>
                        <div class="result-value">$${result.principal.toLocaleString()}</div>
                    </div>
                    <div class="result-item">
                        <div class="result-label">Interest Rate</div>
                        <div class="result-value">${result.rate}%</div>
                    </div>
                    <div class="result-item">
                        <div class="result-label">Time Period</div>
                        <div class="result-value">${result.time}</div>
                    </div>
                    <div class="result-item">
                        <div class="result-label">Compounding</div>
                        <div class="result-value">${result.frequency}</div>
                    </div>
                    <div class="result-item">
                        <div class="result-label">Compound Interest</div>
                        <div class="result-value">$${result.interest.toLocaleString()}</div>
                    </div>
                    <div class="result-item">
                        <div class="result-label">Total Amount</div>
                        <div class="result-value">$${result.amount.toLocaleString()}</div>
                    </div>
                </div>
            </div>
        `;
    }

    displayEMIResult(result) {
        const resultSection = document.getElementById('emi-result');
        resultSection.innerHTML = `
            <div class="result-card">
                <div class="result-header">
                    <div class="result-title">
                        <i class="fas fa-credit-card"></i>
                        EMI Calculation
                    </div>
                    <button class="btn-secondary" onclick="calculator.saveResult('emi')">
                        <i class="fas fa-save"></i> Save
                    </button>
                </div>
                <div class="result-grid">
                    <div class="result-item">
                        <div class="result-label">Loan Amount</div>
                        <div class="result-value">$${result.principal.toLocaleString()}</div>
                    </div>
                    <div class="result-item">
                        <div class="result-label">Interest Rate</div>
                        <div class="result-value">${result.rate}%</div>
                    </div>
                    <div class="result-item">
                        <div class="result-label">Loan Tenure</div>
                        <div class="result-value">${result.tenure}</div>
                    </div>
                    <div class="result-item">
                        <div class="result-label">Monthly EMI</div>
                        <div class="result-value">$${result.emi.toLocaleString()}</div>
                    </div>
                    <div class="result-item">
                        <div class="result-label">Total Interest</div>
                        <div class="result-value">$${result.totalInterest.toLocaleString()}</div>
                    </div>
                    <div class="result-item">
                        <div class="result-label">Total Amount</div>
                        <div class="result-value">$${result.totalAmount.toLocaleString()}</div>
                    </div>
                </div>
            </div>
        `;
    }

    getFrequencyText(frequency) {
        const frequencies = {
            1: 'Annually',
            2: 'Semi-Annually',
            4: 'Quarterly',
            12: 'Monthly',
            365: 'Daily'
        };
        return frequencies[frequency] || 'Unknown';
    }

    addToHistory(result) {
        this.history.unshift(result);
        if (this.history.length > 50) {
            this.history = this.history.slice(0, 50);
        }
        localStorage.setItem('calculatorHistory', JSON.stringify(this.history));
        this.loadHistory();
    }

    loadHistory() {
        const historyList = document.getElementById('history-list');
        
        if (this.history.length === 0) {
            historyList.innerHTML = '<p class="no-history">No calculations yet. Start calculating to see your history!</p>';
            return;
        }

        historyList.innerHTML = this.history.map(item => `
            <div class="history-item">
                <div class="history-item-header">
                    <span class="history-type">${item.type}</span>
                    <span class="history-date">${new Date(item.timestamp).toLocaleString()}</span>
                </div>
                <div class="history-details">
                    ${this.getHistoryDetails(item)}
                </div>
            </div>
        `).join('');
    }

    getHistoryDetails(item) {
        if (item.type === 'Simple Interest') {
            return `Principal: $${item.principal.toLocaleString()}, Rate: ${item.rate}%, Time: ${item.time}, Interest: $${item.interest.toLocaleString()}`;
        } else if (item.type === 'Compound Interest') {
            return `Principal: $${item.principal.toLocaleString()}, Rate: ${item.rate}%, Time: ${item.time}, Frequency: ${item.frequency}, Interest: $${item.interest.toLocaleString()}`;
        } else if (item.type === 'EMI Calculator') {
            return `Loan: $${item.principal.toLocaleString()}, Rate: ${item.rate}%, Tenure: ${item.tenure}, EMI: $${item.emi.toLocaleString()}`;
        }
        return '';
    }

    clearHistory() {
        if (confirm('Are you sure you want to clear all history?')) {
            this.history = [];
            localStorage.removeItem('calculatorHistory');
            this.loadHistory();
        }
    }

    exportHistory() {
        if (this.history.length === 0) {
            alert('No history to export!');
            return;
        }

        const csvContent = this.generateCSV();
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `interest_calculator_history_${new Date().getTime()}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
    }

    generateCSV() {
        const headers = ['Type', 'Date', 'Principal', 'Rate', 'Time/Tenure', 'Interest/EMI', 'Total Amount'];
        const rows = this.history.map(item => {
            const date = new Date(item.timestamp).toLocaleString();
            if (item.type === 'EMI Calculator') {
                return [item.type, date, item.principal, item.rate, item.tenure, item.emi, item.totalAmount];
            } else {
                return [item.type, date, item.principal, item.rate, item.time, item.interest, item.amount];
            }
        });

        return [headers, ...rows].map(row => row.join(',')).join('\n');
    }
}

// Initialize calculator
const calculator = new InterestCalculator();

// Global functions for HTML onclick events
function calculateSimpleInterest() {
    calculator.calculateSimpleInterest();
}

function calculateCompoundInterest() {
    calculator.calculateCompoundInterest();
}

function calculateEMI() {
    calculator.calculateEMI();
}

function clearHistory() {
    calculator.clearHistory();
}

function exportHistory() {
    calculator.exportHistory();
}
