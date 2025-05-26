// Theme toggle functionality
document.addEventListener('DOMContentLoaded', function() {
    const themeToggle = document.getElementById('themeToggle');
    const body = document.body;

    // Check for saved theme preference
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        body.setAttribute('data-theme', 'dark');
        themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
    }

    themeToggle.addEventListener('click', () => {
        if (body.getAttribute('data-theme') === 'dark') {
            body.removeAttribute('data-theme');
            themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
            localStorage.setItem('theme', 'light');
        } else {
            body.setAttribute('data-theme', 'dark');
            themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
            localStorage.setItem('theme', 'dark');
        }
    });

    // Initialize NSSF type section visibility
    const nssfTypeSection = document.getElementById('nssfTypeSection');
    const nssfSelection = document.querySelector('input[name="nssfSelection"]:checked');
    nssfTypeSection.style.display = nssfSelection.value === 'yes' ? 'block' : 'none';

    // PAYE Tax Bands (2024 Uganda Tax Rates)
    const PAYE_BANDS = [
        { threshold: 0, rate: 0 },
        { threshold: 235000, rate: 0.10 },
        { threshold: 335000, rate: 0.20 },
        { threshold: 410000, rate: 0.30 },
        { threshold: 10000000, rate: 0.40 }
    ];

    // Calculate PAYE
    function calculatePAYE(taxableIncome) {
        let paye = 0;
        let remainingIncome = taxableIncome;

        for (let i = PAYE_BANDS.length - 1; i >= 0; i--) {
            const band = PAYE_BANDS[i];
            if (remainingIncome > band.threshold) {
                const taxableInBand = remainingIncome - band.threshold;
                paye += taxableInBand * band.rate;
                remainingIncome = band.threshold;
            }
        }

        return paye;
    }

    // Calculate NSSF
    function calculateNSSF(grossSalary, nssfSelection, nssfType) {
        if (nssfSelection === 'no') {
            return { employee: 0, employer: 0 };
        }
        
        // If NSSF is selected (yes), calculate based on type
        if (nssfType === 'employee') {
            return {
                employee: grossSalary * 0.05,  // 5% for employee
                employer: grossSalary * 0.10   // 10% for employer
            };
        } else {
            return {
                employee: 0,
                employer: grossSalary * 0.10   // 10% for employer
            };
        }
    }

    // Format currency
    function formatCurrency(amount) {
        return new Intl.NumberFormat('en-UG', {
            style: 'currency',
            currency: 'UGX',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount);
    }

    // Main calculation function
    function calculateNetPay(event) {
        if (event) {
            event.preventDefault();
            event.stopPropagation();
        }

        // Get input values
        const grossSalary = parseFloat(document.getElementById('grossSalary').value) || 0;
        if (grossSalary <= 0) {
            alert('Please enter a valid gross salary');
            return;
        }

        const salaryPeriod = document.querySelector('input[name="salaryPeriod"]:checked').value;
        const nssfSelection = document.querySelector('input[name="nssfSelection"]:checked').value;
        const nssfType = document.querySelector('input[name="nssfType"]:checked').value;
        const housingAllowance = parseFloat(document.getElementById('housingAllowance').value) || 0;
        const transportAllowance = parseFloat(document.getElementById('transportAllowance').value) || 0;
        const otherAllowance = parseFloat(document.getElementById('otherAllowance').value) || 0;

        // Convert annual salary to monthly if needed
        const monthlyGrossSalary = salaryPeriod === 'annual' ? grossSalary / 12 : grossSalary;
        const monthlyHousingAllowance = salaryPeriod === 'annual' ? housingAllowance / 12 : housingAllowance;
        const monthlyTransportAllowance = salaryPeriod === 'annual' ? transportAllowance / 12 : transportAllowance;
        const monthlyOtherAllowance = salaryPeriod === 'annual' ? otherAllowance / 12 : otherAllowance;

        // Calculate taxable income (Gross + Allowances)
        const taxableIncome = monthlyGrossSalary + monthlyHousingAllowance + monthlyTransportAllowance + monthlyOtherAllowance;

        // Calculate deductions
        const paye = calculatePAYE(taxableIncome);
        const nssf = calculateNSSF(monthlyGrossSalary, nssfSelection, nssfType);
        const totalDeductions = paye + nssf.employee;

        // Calculate net pay
        const netPay = taxableIncome - totalDeductions;

        // Update results
        document.getElementById('paye').textContent = formatCurrency(paye);
        document.getElementById('nssfEmployee').textContent = formatCurrency(nssf.employee);
        document.getElementById('nssfEmployer').textContent = formatCurrency(nssf.employer);
        document.getElementById('totalDeductions').textContent = formatCurrency(totalDeductions);
        document.getElementById('netPay').textContent = formatCurrency(netPay);

        // Show results section
        document.getElementById('results').style.display = 'block';
    }

    // Export to PDF
    function exportToPDF() {
        // Create a temporary div for the export
        const exportDiv = document.createElement('div');
        exportDiv.className = 'export-content';
        
        // Get the current date
        const currentDate = new Date().toLocaleDateString('en-UG');
        
        // Get all the values
        const grossSalary = document.getElementById('grossSalary').value;
        const nssfSelection = document.querySelector('input[name="nssfSelection"]:checked').value;
        const nssfType = document.querySelector('input[name="nssfType"]:checked').value;
        const housingAllowance = document.getElementById('housingAllowance').value;
        const transportAllowance = document.getElementById('transportAllowance').value;
        const otherAllowance = document.getElementById('otherAllowance').value;
        
        // Create the content for export with better PDF styling
        exportDiv.innerHTML = `
            <div style="font-family: Arial, sans-serif; padding: 20px; width: 100%; max-width: 700px; margin: 0 auto;">
                <div style="text-align: center; margin-bottom: 20px;">
                    <h2 style="color: #2c3e50; margin: 0; font-size: 24px;">Salary Slip</h2>
                    <p style="margin: 5px 0; font-size: 14px;">Date: ${currentDate}</p>
                </div>
                
                <div style="margin-bottom: 20px; padding: 15px; background-color: #f8f9fa; border-radius: 4px; border: 1px solid #e0e0e0;">
                    <h3 style="color: #2c3e50; margin: 0 0 10px 0; font-size: 18px;">Salary Details</h3>
                    <p style="margin: 8px 0; font-size: 14px;"><strong>Gross Salary:</strong> ${formatCurrency(parseFloat(grossSalary))}</p>
                    <p style="margin: 8px 0; font-size: 14px;"><strong>NSSF Status:</strong> ${nssfSelection === 'yes' ? 'Yes' : 'No'}</p>
                    ${nssfSelection === 'yes' ? `<p style="margin: 8px 0; font-size: 14px;"><strong>NSSF Type:</strong> ${nssfType === 'employee' ? 'Employee (5%)' : 'Employer (10%)'}</p>` : ''}
                </div>
                
                <div style="margin-bottom: 20px; padding: 15px; background-color: #f8f9fa; border-radius: 4px; border: 1px solid #e0e0e0;">
                    <h3 style="color: #2c3e50; margin: 0 0 10px 0; font-size: 18px;">Allowances</h3>
                    <p style="margin: 8px 0; font-size: 14px;"><strong>Housing Allowance:</strong> ${formatCurrency(parseFloat(housingAllowance) || 0)}</p>
                    <p style="margin: 8px 0; font-size: 14px;"><strong>Transport Allowance:</strong> ${formatCurrency(parseFloat(transportAllowance) || 0)}</p>
                    <p style="margin: 8px 0; font-size: 14px;"><strong>Other Allowance:</strong> ${formatCurrency(parseFloat(otherAllowance) || 0)}</p>
                </div>
                
                <div style="margin-bottom: 20px; padding: 15px; background-color: #f8f9fa; border-radius: 4px; border: 1px solid #e0e0e0;">
                    <h3 style="color: #2c3e50; margin: 0 0 10px 0; font-size: 18px;">Deductions</h3>
                    <p style="margin: 8px 0; font-size: 14px;"><strong>PAYE:</strong> ${document.getElementById('paye').textContent}</p>
                    <p style="margin: 8px 0; font-size: 14px;"><strong>NSSF (Employee):</strong> ${document.getElementById('nssfEmployee').textContent}</p>
                    <p style="margin: 8px 0; font-size: 14px;"><strong>NSSF (Employer):</strong> ${document.getElementById('nssfEmployer').textContent}</p>
                    <p style="margin: 8px 0; font-size: 14px;"><strong>Total Deductions:</strong> ${document.getElementById('totalDeductions').textContent}</p>
                </div>
                
                <div style="padding: 15px; background-color: #f8f9fa; border-radius: 4px; border-top: 2px solid #2c3e50;">
                    <h3 style="color: #2c3e50; margin: 0 0 10px 0; font-size: 18px;">Net Pay</h3>
                    <p style="font-size: 20px; font-weight: bold; color: #27ae60; margin: 5px 0;">${document.getElementById('netPay').textContent}</p>
                </div>
            </div>
        `;

        // Configure PDF options
        const opt = {
            margin: 10,
            filename: 'salary-slip.pdf',
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { 
                scale: 1,
                useCORS: true,
                letterRendering: true,
                logging: false,
                allowTaint: true,
                scrollX: 0,
                scrollY: 0,
                windowWidth: 800
            },
            jsPDF: { 
                unit: 'mm',
                format: 'a4', 
                orientation: 'portrait',
                hotfixes: ['px_scaling']
            }
        };

        // Generate PDF
        html2pdf()
            .set(opt)
            .from(exportDiv)
            .save()
            .catch(err => {
                console.error('PDF generation error:', err);
            });
    }

    // Export to Word
    function exportToWord() {
        // Get the current date
        const currentDate = new Date().toLocaleDateString('en-UG');
        
        // Get all the values
        const grossSalary = document.getElementById('grossSalary').value;
        const nssfSelection = document.querySelector('input[name="nssfSelection"]:checked').value;
        const nssfType = document.querySelector('input[name="nssfType"]:checked').value;
        const housingAllowance = document.getElementById('housingAllowance').value;
        const transportAllowance = document.getElementById('transportAllowance').value;
        const otherAllowance = document.getElementById('otherAllowance').value;

        // Create the Word document content
        const content = `
            <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
            <head>
                <meta charset='utf-8'>
                <title>Salary Slip</title>
                <style>
                    body { font-family: Arial, sans-serif; }
                    h2 { color: #2c3e50; text-align: center; }
                    h3 { color: #2c3e50; }
                    .section { margin: 20px 0; padding: 15px; background-color: #f8f9fa; }
                    .total { border-top: 2px solid #2c3e50; padding-top: 10px; }
                    .net-pay { font-size: 1.2em; font-weight: bold; color: #27ae60; }
                </style>
            </head>
            <body>
                <h2>Salary Slip</h2>
                <p style="text-align: right;">Date: ${currentDate}</p>
                
                <div class="section">
                    <h3>Salary Details</h3>
                    <p><strong>Gross Salary:</strong> ${formatCurrency(parseFloat(grossSalary))}</p>
                    <p><strong>NSSF Status:</strong> ${nssfSelection === 'yes' ? 'Yes' : 'No'}</p>
                    ${nssfSelection === 'yes' ? `<p><strong>NSSF Type:</strong> ${nssfType === 'employee' ? 'Employee (5%)' : 'Employer (10%)'}</p>` : ''}
                </div>
                
                <div class="section">
                    <h3>Allowances</h3>
                    <p><strong>Housing Allowance:</strong> ${formatCurrency(parseFloat(housingAllowance) || 0)}</p>
                    <p><strong>Transport Allowance:</strong> ${formatCurrency(parseFloat(transportAllowance) || 0)}</p>
                    <p><strong>Other Allowance:</strong> ${formatCurrency(parseFloat(otherAllowance) || 0)}</p>
                </div>
                
                <div class="section">
                    <h3>Deductions</h3>
                    <p><strong>PAYE:</strong> ${document.getElementById('paye').textContent}</p>
                    <p><strong>NSSF (Employee):</strong> ${document.getElementById('nssfEmployee').textContent}</p>
                    <p><strong>NSSF (Employer):</strong> ${document.getElementById('nssfEmployer').textContent}</p>
                    <p><strong>Total Deductions:</strong> ${document.getElementById('totalDeductions').textContent}</p>
                </div>
                
                <div class="section total">
                    <h3>Net Pay</h3>
                    <p class="net-pay">${document.getElementById('netPay').textContent}</p>
                </div>
            </body>
            </html>
        `;

        // Create blob and download
        const blob = new Blob([content], { type: 'application/msword' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'salary-slip.doc';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }

    // Reset form and results
    function resetForm() {
        // Reset form inputs
        document.getElementById('salaryForm').reset();
        
        // Reset results
        document.getElementById('paye').textContent = formatCurrency(0);
        document.getElementById('nssfEmployee').textContent = formatCurrency(0);
        document.getElementById('nssfEmployer').textContent = formatCurrency(0);
        document.getElementById('totalDeductions').textContent = formatCurrency(0);
        document.getElementById('netPay').textContent = formatCurrency(0);
        
        // Hide NSSF type section
        document.getElementById('nssfTypeSection').style.display = 'none';
        
        // Reset NSSF selection to default (No)
        const nssfNoRadio = document.querySelector('input[name="nssfSelection"][value="no"]');
        if (nssfNoRadio) {
            nssfNoRadio.checked = true;
        }
    }

    // Add event listeners
    const salaryForm = document.getElementById('salaryForm');
    if (salaryForm) {
        salaryForm.addEventListener('submit', function(e) {
            e.preventDefault();
            calculateNetPay(e);
        });
    }

    // Add click handler for calculate button
    const calculateButton = document.querySelector('.btn-primary');
    if (calculateButton) {
        calculateButton.addEventListener('click', function(e) {
            e.preventDefault();
            calculateNetPay(e);
        });
    }

    document.getElementById('exportPdf').addEventListener('click', exportToPDF);
    document.getElementById('exportWord').addEventListener('click', exportToWord);
    document.getElementById('resetButton').addEventListener('click', resetForm);

    // NSSF Type section visibility
    document.querySelectorAll('input[name="nssfSelection"]').forEach(radio => {
        radio.addEventListener('change', (e) => {
            const nssfTypeSection = document.getElementById('nssfTypeSection');
            nssfTypeSection.style.display = e.target.value === 'yes' ? 'block' : 'none';
        });
    });

    // Input validation
    document.querySelectorAll('input[type="number"]').forEach(input => {
        input.addEventListener('input', (e) => {
            if (e.target.value < 0) {
                e.target.value = 0;
            }
        });
    });
}); 