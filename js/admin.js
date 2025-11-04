// Admin Panel Logic

// Password is now checked server-side via API
let pricingData = null;
let originalPricingData = null;
let authToken = null;

document.addEventListener('DOMContentLoaded', async () => {
    try {
        console.log('Loading pricing config...');
        pricingData = await loadPricingConfig();
        console.log('Pricing data loaded:', pricingData ? 'SUCCESS' : 'FAILED');
        
        if (!pricingData) {
            throw new Error('Pricing data is null');
        }
        
        originalPricingData = JSON.parse(JSON.stringify(pricingData));
        setupEventListeners();
        console.log('Admin panel initialized');
    } catch (error) {
        console.error('Failed to load pricing config:', error);
        const loginScreen = document.getElementById('login-screen');
        if (loginScreen) {
            loginScreen.innerHTML = `
                <div class="login-box">
                    <h2>Fout bij laden</h2>
                    <p style="color: var(--accent-warning);">Kon prijzen data niet laden: ${error.message}</p>
                    <button onclick="location.reload()" class="admin-btn primary">Herlaad pagina</button>
                </div>
            `;
        }
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

async function handleLogin() {
    const password = document.getElementById('admin-password').value;
    const errorMsg = document.getElementById('login-error');
    
    try {
        const response = await fetch('/api/admin', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ password })
        });
        
        const data = await response.json();
        
        if (data.success) {
            authToken = data.token;
            console.log('Login successful, loading editor...');
            
            // Ensure pricing data is loaded before showing editor
            if (!pricingData) {
                console.log('Pricing data not loaded yet, loading now...');
                try {
                    pricingData = await loadPricingConfig();
                    originalPricingData = JSON.parse(JSON.stringify(pricingData));
                } catch (loadError) {
                    console.error('Failed to load pricing after login:', loadError);
                    errorMsg.style.display = 'block';
                    errorMsg.textContent = 'Fout bij laden van prijzen: ' + loadError.message;
                    return;
                }
            }
            
            document.getElementById('login-screen').style.display = 'none';
            document.getElementById('admin-panel').style.display = 'block';
            errorMsg.style.display = 'none';
            loadPricingEditor();
        } else {
            errorMsg.style.display = 'block';
            errorMsg.textContent = data.error || 'Onjuist wachtwoord';
            document.getElementById('admin-password').value = '';
        }
    } catch (error) {
        console.error('Login error:', error);
        errorMsg.style.display = 'block';
        errorMsg.textContent = 'Fout bij inloggen: ' + (error.message || 'Probeer het opnieuw.');
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
    if (!pricingData) {
        console.error('Pricing data not loaded');
        const adminContent = document.querySelector('.admin-content');
        if (adminContent) {
            adminContent.innerHTML = '<p style="color: var(--accent-warning);">Fout: Prijzen data niet geladen. Herlaad de pagina.</p>';
        }
        return;
    }

    try {
        // Load Scan-to-BIM prices
        if (pricingData.scanToBIM) {
            loadPriceSection('scan-to-bim-prices', pricingData.scanToBIM);
        } else {
            document.getElementById('scan-to-bim-prices').innerHTML = '<p>Geen data beschikbaar</p>';
        }
        
        // Load Scan Only prices (nested structure)
        if (pricingData.scanOnly) {
            loadNestedPriceSection('scan-only-prices', pricingData.scanOnly);
        } else {
            document.getElementById('scan-only-prices').innerHTML = '<p>Geen data beschikbaar</p>';
        }
        
        // Load Model Only prices
        if (pricingData.modelOnly) {
            loadPriceSection('model-only-prices', pricingData.modelOnly);
        } else {
            document.getElementById('model-only-prices').innerHTML = '<p>Geen data beschikbaar</p>';
        }
    } catch (error) {
        console.error('Error loading pricing editor:', error);
        const adminContent = document.querySelector('.admin-content');
        if (adminContent) {
            adminContent.innerHTML = `<p style="color: var(--accent-warning);">Fout bij laden: ${error.message}</p>`;
        }
    }
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
    if (!authToken) {
        alert('Niet ingelogd');
        return;
    }

    try {
        const response = await fetch('/api/save-pricing', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify({ pricing: pricingData })
        });

        const data = await response.json();

        if (response.ok) {
            localStorage.setItem('pricing_backup', JSON.stringify(pricingData));
            showSuccessMessage(data.message || 'Prijzen opgeslagen!');
        } else {
            throw new Error(data.error || 'Fout bij opslaan');
        }
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

