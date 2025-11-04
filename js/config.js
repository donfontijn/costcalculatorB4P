// Pricing configuration loader
let pricingConfig = null;

async function loadPricingConfig() {
    try {
        const response = await fetch('config/pricing.json');
        pricingConfig = await response.json();
        return pricingConfig;
    } catch (error) {
        console.error('Error loading pricing configuration:', error);
        throw error;
    }
}

