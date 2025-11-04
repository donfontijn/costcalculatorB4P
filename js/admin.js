// Admin Panel Logic

const ADMIN_PASSWORD = 'admin123'; // TODO: Change this in production
let pricingData = null;
let originalPricingData = null;

document.addEventListener('DOMContentLoaded', async () => {
    try {
        pricingData = await loadPricingConfig();
        originalPricingData = JSON.parse(JSON.stringify(pricingData));
        setupEventListeners();
    } catch (error) {
        console.error('Failed to load pricing config:', error);
    }
});

function setupEventListeners() {
    document.getElementById('login-btn').addEventListener('click', handleLogin);
    document.getElementById('admin-password').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleLogin();
    });
    document.getElementById('save-btn').addEventListener('click', handleSave);
    document.getElementById('reset-btn').addEventListener('click', handleReset);
    document.getElementById('logout-btn').addEventListener('click', handleLogout);
}

function handleLogin() {
    const password = document.getElementById('admin-password').value;
    const errorMsg = document.getElementById('login-error');
    
    if (password === ADMIN_PASSWORD) {
        document.getElementById('login-screen').style.display = 'none';
        document.getElementById('admin-panel').style.display = 'block';
        loadPricingEditor();
    } else {
        errorMsg.style.display = 'block';
        document.getElementById('admin-password').value = '';
    }
}

function handleLogout() {
    document.getElementById('login-screen').style.display = 'block';
    document.getElementById('admin-panel').style.display = 'none';
    document.getElementById('admin-password').value = '';
    pricingData = JSON.parse(JSON.stringify(originalPricingData));
}

function loadPricingEditor() {
    // Load Scan-to-BIM prices
    loadPriceSection('scan-to-bim-prices', pricingData.scanToBIM);
    
    // Load Scan Only prices (nested structure)
    loadNestedPriceSection('scan-only-prices', pricingData.scanOnly);
    
    // Load Model Only prices
    loadPriceSection('model-only-prices', pricingData.modelOnly);
}

function loadPriceSection(containerId, prices) {
    const container = document.getElementById(containerId);
    container.innerHTML = '';
    
    Object.keys(prices).forEach(key => {
        const label = pricingData.roomTypeLabels[key] || key;
        const priceItem = createPriceInput(key, label, prices[key]);
        container.appendChild(priceItem);
    });
}

function loadNestedPriceSection(containerId, prices) {
    const container = document.getElementById(containerId);
    container.innerHTML = '';
    
    Object.keys(prices).forEach(key => {
        const label = pricingData.roomTypeLabels[key] || key;
        const group = document.createElement('div');
        group.className = 'nested-price-group';
        
        const groupLabel = document.createElement('label');
        groupLabel.textContent = label;
        groupLabel.style.color = 'var(--text-primary)';
        groupLabel.style.fontWeight = '600';
        groupLabel.style.marginBottom = '0.5rem';
        group.appendChild(groupLabel);
        
        if (typeof prices[key] === 'object') {
            Object.keys(prices[key]).forEach(subKey => {
                const subLabel = document.createElement('label');
                subLabel.textContent = subKey.charAt(0).toUpperCase() + subKey.slice(1);
                subLabel.style.color = 'var(--text-secondary)';
                subLabel.style.fontSize = '0.85rem';
                
                const input = document.createElement('input');
                input.type = 'number';
                input.step = '0.01';
                input.value = prices[key][subKey];
                input.dataset.category = key;
                input.dataset.subKey = subKey;
                input.className = 'price-input';
                
                input.addEventListener('input', (e) => {
                    pricingData.scanOnly[key][subKey] = parseFloat(e.target.value) || 0;
                });
                
                group.appendChild(subLabel);
                group.appendChild(input);
            });
        } else {
            const input = createPriceInput(key, '', prices[key]);
            group.appendChild(input);
        }
        
        container.appendChild(group);
    });
}

function createPriceInput(key, label, value) {
    const item = document.createElement('div');
    item.className = 'price-item';
    
    const labelEl = document.createElement('label');
    labelEl.textContent = label;
    item.appendChild(labelEl);
    
    const input = document.createElement('input');
    input.type = 'number';
    input.step = '0.01';
    input.value = value;
    input.dataset.key = key;
    input.className = 'price-input';
    
    input.addEventListener('input', (e) => {
        const category = getCategoryFromContainer(input.closest('.price-grid').id);
        if (category) {
            pricingData[category][key] = parseFloat(e.target.value) || 0;
        }
    });
    
    item.appendChild(input);
    return item;
}

function getCategoryFromContainer(containerId) {
    if (containerId.includes('scan-to-bim')) return 'scanToBIM';
    if (containerId.includes('scan-only')) return 'scanOnly';
    if (containerId.includes('model-only')) return 'modelOnly';
    return null;
}

async function handleSave() {
    try {
        // In a real application, this would be a POST request to a server
        // For now, we'll show a message and update local storage as backup
        localStorage.setItem('pricing_backup', JSON.stringify(pricingData));
        
        showSuccessMessage('Prijzen opgeslagen! (Let op: dit is lokaal. Voor productie is server-side opslag nodig.)');
        
        // TODO: Implement actual server-side save
        // const response = await fetch('/api/pricing', {
        //     method: 'POST',
        //     headers: { 'Content-Type': 'application/json' },
        //     body: JSON.stringify(pricingData)
        // });
    } catch (error) {
        console.error('Save failed:', error);
        alert('Fout bij opslaan: ' + error.message);
    }
}

function handleReset() {
    if (confirm('Weet je zeker dat je alle wijzigingen wilt resetten?')) {
        pricingData = JSON.parse(JSON.stringify(originalPricingData));
        loadPricingEditor();
        showSuccessMessage('Wijzigingen gereset');
    }
}

function showSuccessMessage(message) {
    const msg = document.createElement('div');
    msg.className = 'success-message';
    msg.textContent = message;
    document.body.appendChild(msg);
    
    setTimeout(() => {
        msg.remove();
    }, 3000);
}

