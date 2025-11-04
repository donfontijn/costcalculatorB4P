// Pricing configuration loader
let pricingConfig = null;

async function loadPricingConfig() {
    try {
        // Try to load from API first (if KV is configured), otherwise fallback to static file
        try {
            const apiResponse = await fetch('/api/get-pricing');
            if (apiResponse.ok) {
                const apiData = await apiResponse.json();
                if (apiData.pricing) {
                    pricingConfig = apiData.pricing;
                    return pricingConfig;
                }
            }
        } catch (apiError) {
            console.log('API pricing not available, using static file');
        }
        
        // Fallback to static pricing.json
        const response = await fetch('config/pricing.json');
        pricingConfig = await response.json();
        return pricingConfig;
    } catch (error) {
        console.error('Error loading pricing configuration:', error);
        throw error;
    }
}

