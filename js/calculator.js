// Calculator logic and advice system

let pricing = null;

// Initialize calculator when page loads
document.addEventListener('DOMContentLoaded', async () => {
    try {
        pricing = await loadPricingConfig();
        initializeCalculator();
    } catch (error) {
        console.error('Failed to initialize calculator:', error);
        document.getElementById('calculation-results').innerHTML = 
            '<p class="error">Fout bij het laden van configuratie. Controleer of config/pricing.json bestaat.</p>';
    }
});

function initializeCalculator() {
    const inputs = ['surface-area', 'service-type', 'room-type', 'scanning-time'];
    
    inputs.forEach(inputId => {
        const element = document.getElementById(inputId);
        if (element) {
            element.addEventListener('input', handleCalculation);
            element.addEventListener('change', handleCalculation);
        }
    });

    // Initial calculation
    handleCalculation();
    
    // Setup export button
    const exportBtn = document.getElementById('export-btn');
    if (exportBtn) {
        exportBtn.addEventListener('click', handleExport);
    }
}

function handleCalculation() {
    const surfaceArea = parseFloat(document.getElementById('surface-area').value) || 0;
    const serviceType = document.getElementById('service-type').value;
    const roomType = document.getElementById('room-type').value;
    const scanningTime = document.getElementById('scanning-time').value;

    // Show/hide scanning time based on service type
    const scanningTimeGroup = document.getElementById('scanning-time-group');
    if (serviceType === 'model-only') {
        scanningTimeGroup.style.display = 'none';
    } else {
        scanningTimeGroup.style.display = 'block';
    }

    if (surfaceArea <= 0) {
        resetResults();
        updateAdvice([], surfaceArea, serviceType, roomType, scanningTime);
        return;
    }

    const pricePerM2 = calculatePricePerM2(serviceType, roomType, scanningTime);
    const totalPrice = surfaceArea * pricePerM2;

    updateResults(pricePerM2, totalPrice, surfaceArea, serviceType, roomType);
    updateAdvice(pricePerM2, surfaceArea, serviceType, roomType, scanningTime);
}

function calculatePricePerM2(serviceType, roomType, scanningTime) {
    if (!pricing) return 0;

    let price = 0;

    if (serviceType === 'scan-to-bim') {
        price = pricing.scanToBIM[roomType] || 0;
    } else if (serviceType === 'scan-only') {
        const scanPricing = pricing.scanOnly[roomType];
        if (scanPricing) {
            price = scanPricing[scanningTime] || scanPricing.overdag || 0;
        }
    } else if (serviceType === 'model-only') {
        price = pricing.modelOnly[roomType] || 0;
    }

    return price;
}

function updateResults(pricePerM2, totalPrice, surfaceArea, serviceType, roomType) {
    document.getElementById('price-per-m2').textContent = formatCurrency(pricePerM2);
    document.getElementById('total-price').textContent = formatCurrency(totalPrice);

    // Show/hide export button
    const exportBtn = document.getElementById('export-btn');
    if (exportBtn) {
        exportBtn.style.display = surfaceArea > 0 ? 'flex' : 'none';
    }

    // Update breakdown
    const breakdownList = document.getElementById('breakdown-list');
    const serviceLabel = pricing.serviceTypeLabels[serviceType] || serviceType;
    const roomLabel = pricing.roomTypeLabels[roomType] || roomType;

    breakdownList.innerHTML = `
        <div class="breakdown-item">
            <span class="breakdown-label">Servicetype:</span>
            <span class="breakdown-value">${serviceLabel}</span>
        </div>
        <div class="breakdown-item">
            <span class="breakdown-label">Ruimtetype:</span>
            <span class="breakdown-value">${roomLabel}</span>
        </div>
        <div class="breakdown-item">
            <span class="breakdown-label">Oppervlakte:</span>
            <span class="breakdown-value">${formatNumber(surfaceArea)} m²</span>
        </div>
        <div class="breakdown-item">
            <span class="breakdown-label">Prijs per m²:</span>
            <span class="breakdown-value">${formatCurrency(pricePerM2)}</span>
        </div>
        <div class="breakdown-item highlight">
            <span class="breakdown-label">Totaal:</span>
            <span class="breakdown-value">${formatCurrency(totalPrice)}</span>
        </div>
    `;
}

function resetResults() {
    document.getElementById('price-per-m2').textContent = '€0.00';
    document.getElementById('total-price').textContent = '€0.00';
    document.getElementById('breakdown-list').innerHTML = 
        '<p class="placeholder-text">Vul de projectparameters in om de berekening te zien</p>';
}

function updateAdvice(pricePerM2, surfaceArea, serviceType, roomType, scanningTime) {
    const adviceContent = document.getElementById('advice-content');
    const adviceItems = [];

    if (surfaceArea <= 0) {
        adviceContent.innerHTML = '<p class="advice-placeholder">Vul de projectparameters in om advies te ontvangen</p>';
        return;
    }

    // Project size advice
    if (surfaceArea < 1000) {
        adviceItems.push({
            type: 'info',
            text: 'Klein project - overweeg om te combineren met andere projecten voor kostenoptimalisatie'
        });
    } else if (surfaceArea >= 1000 && surfaceArea < 5000) {
        adviceItems.push({
            type: 'info',
            text: 'Standaard projectgrootte - goede balans tussen kosten en efficiëntie'
        });
    } else if (surfaceArea >= 5000 && surfaceArea < 10000) {
        adviceItems.push({
            type: 'info',
            text: 'Middelgroot project - schaalvoordelen beginnen zichtbaar te worden'
        });
    } else {
        adviceItems.push({
            type: 'info',
            text: 'Groot project - fasering kan helpen bij planning en risicobeheer'
        });
    }

    // Room type advice
    if (roomType === 'technisch') {
        adviceItems.push({
            type: 'warning',
            text: 'Technische ruimtes zijn complexer - extra tijd nodig voor begeleiding en toegang'
        });
    } else if (roomType === 'plafonds-te-openen') {
        adviceItems.push({
            type: 'warning',
            text: '⚠️ Let op: Plafonds openen verdubbelt bijna de kosten. Overweeg of gedeeltelijk openen door Allinq mogelijk is voor kostenbesparing'
        });
    } else if (roomType === 'plafonds-lamellen') {
        adviceItems.push({
            type: 'info',
            text: 'Lamellenplafonds vereisen extra foto\'s en video\'s - iets langere doorlooptijd'
        });
    } else if (roomType === 'dak-buiten') {
        adviceItems.push({
            type: 'success',
            text: 'Dak/buiten ruimtes hebben beperkte techniek - relatief eenvoudig en kostenbesparend'
        });
    } else if (roomType === 'lift-compleet') {
        adviceItems.push({
            type: 'warning',
            text: 'Lift compleet modelleren is zeer intensief (€50/m² voor scan, €40/m² voor model) - overweeg of \'in zicht\' voldoende is'
        });
    }

    // Service type advice
    if (serviceType === 'scan-only') {
        adviceItems.push({
            type: 'info',
            text: 'Scan only levert puntenwolk op - voor modelleren later is volledige Scan-to-BIM efficiënter'
        });
    } else if (serviceType === 'model-only') {
        adviceItems.push({
            type: 'info',
            text: 'Model only vereist bestaande scan data - controleer of deze beschikbaar is'
        });
    } else if (serviceType === 'scan-to-bim') {
        adviceItems.push({
            type: 'success',
            text: 'Volledige service - optimaal voor nieuwe projecten zonder bestaande data'
        });
    }

    // Scanning time advice
    if (serviceType !== 'model-only') {
        if (scanningTime === 'nachtwerk') {
            adviceItems.push({
                type: 'warning',
                text: '🌙 Nachtwerk is 2x duurder dan overdag (€5/m² vs €2.49/m² voor plafonds). Overweeg of overdag scannen mogelijk is voor kostenbesparing'
            });
        } else {
            adviceItems.push({
                type: 'success',
                text: 'Overdag scannen is kostenefficiënter - alleen gebruiken wanneer operationele vereisten dit toestaan'
            });
        }
    }

    // Combination advice
    if (surfaceArea > 10000 && roomType === 'technisch' && scanningTime === 'nachtwerk') {
        adviceItems.push({
            type: 'warning',
            text: '⚠️ Hoogste kostencombinatie - overweeg fasering of alternatieven'
        });
    } else if (surfaceArea < 1000 && roomType === 'plafonds-te-openen') {
        adviceItems.push({
            type: 'info',
            text: 'Kleine projecten met plafonds te openen zijn relatief duur per m² - overweeg bundeling'
        });
    } else if (roomType === 'technisch' && scanningTime === 'nachtwerk') {
        adviceItems.push({
            type: 'warning',
            text: 'Complexe combinatie - extra planning nodig voor toegang en begeleiding'
        });
    }

    // Cost optimization tips
    if (pricePerM2 > 70) {
        adviceItems.push({
            type: 'warning',
            text: `Hoge kosten per m² (${formatCurrency(pricePerM2)}) - overweeg alternatieve ruimtetypen of servicetypen`
        });
    }

    // Planning tips
    if (surfaceArea > 10000) {
        adviceItems.push({
            type: 'info',
            text: 'Grote projecten (>10k m²) hebben langere doorlooptijden - plan vroegtijdig'
        });
    }

    if (roomType === 'technisch' || roomType === 'plafonds-te-openen') {
        adviceItems.push({
            type: 'info',
            text: 'Complexe ruimtes vereisen meer voorbereiding - reken op extra tijd voor vergunningen en toegang'
        });
    }

    // Render advice
    if (adviceItems.length === 0) {
        adviceContent.innerHTML = '<p class="advice-placeholder">Geen specifiek advies beschikbaar</p>';
    } else {
        adviceContent.innerHTML = adviceItems.map(item => 
            `<div class="advice-item advice-${item.type}">
                <span class="advice-icon">${getAdviceIcon(item.type)}</span>
                <p>${item.text}</p>
            </div>`
        ).join('');
    }
}

function getAdviceIcon(type) {
    switch(type) {
        case 'warning': return '⚠️';
        case 'success': return '✓';
        case 'info': return 'ℹ️';
        default: return '•';
    }
}

function formatCurrency(amount) {
    return new Intl.NumberFormat('nl-NL', {
        style: 'currency',
        currency: 'EUR',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(amount);
}

function formatNumber(number) {
    return new Intl.NumberFormat('nl-NL', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(number);
}

// Export functionality
function handleExport() {
    const surfaceArea = parseFloat(document.getElementById('surface-area').value) || 0;
    const serviceType = document.getElementById('service-type').value;
    const roomType = document.getElementById('room-type').value;
    const scanningTime = document.getElementById('scanning-time').value;
    
    if (surfaceArea <= 0) {
        alert('Vul eerst een oppervlakte in om te exporteren');
        return;
    }
    
    const pricePerM2 = calculatePricePerM2(serviceType, roomType, scanningTime);
    const totalPrice = surfaceArea * pricePerM2;
    
    // Export to Excel/CSV
    exportToExcel(surfaceArea, serviceType, roomType, scanningTime, pricePerM2, totalPrice);
}

function exportToExcel(surfaceArea, serviceType, roomType, scanningTime, pricePerM2, totalPrice) {
    const serviceLabel = pricing.serviceTypeLabels[serviceType] || serviceType;
    const roomLabel = pricing.roomTypeLabels[roomType] || roomType;
    
    // Prepare data
    const timestamp = new Date().toLocaleString('nl-NL');
    const data = [
        ['BIM Costcalculator - Scenario Export'],
        ['Gegenereerd op:', timestamp],
        [''],
        ['PROJECTPARAMETERS'],
        ['Oppervlakte (m²):', formatNumber(surfaceArea)],
        ['Servicetype:', serviceLabel],
        ['Ruimtetype:', roomLabel],
        scanningTime !== 'model-only' ? ['Scanning tijd:', scanningTime === 'nachtwerk' ? 'Nachtwerk' : 'Overdag'] : null,
        [''],
        ['BEREKENING'],
        ['Prijs per m²:', formatCurrency(pricePerM2)],
        ['Totaal project:', formatCurrency(totalPrice)],
        [''],
        ['OPMERKING'],
        ['Dit is een indicatieve schatting op basis van uitvoeringskosten.'],
        ['Voor een gedetailleerde offerte wordt een volledige calculatie gemaakt met uren × uurtarieven.']
    ].filter(row => row !== null);
    
    // Convert to CSV
    const csvContent = data.map(row => 
        row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')
    ).join('\n');
    
    // Create blob and download
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    const filename = `BIM_Costcalculator_${timestamp.replace(/[/:]/g, '_').replace(/,/g, '')}.csv`;
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

