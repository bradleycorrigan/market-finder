// Get credentials from environment variables
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_KEY;

// Import Supabase client
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

// Initialize Supabase
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Get market ID from URL
const urlParams = new URLSearchParams(window.location.search);
const marketId = urlParams.get('id');

// Load market details and vendors
async function loadMarket() {
    const marketContainer = document.getElementById('market-container');
    const vendorsContainer = document.getElementById('vendors-container');
    
    if (!marketId) {
        marketContainer.innerHTML = '<p>No market ID provided.</p>';
        return;
    }
    
    try {
        // Fetch market details
        const { data: market, error: marketError } = await supabase
            .from('markets')
            .select('*')
            .eq('id', marketId)
            .single();
        
        if (marketError) throw marketError;
        
        if (!market) {
            marketContainer.innerHTML = '<p>Market not found.</p>';
            return;
        }
        
        // Display market details
        marketContainer.innerHTML = `
            <div class="market-header">
                <h1>${market.name}</h1>
                <p><strong>${market.address}</strong></p>
                <p>${market.days_open || 'Hours not listed'}</p>
                <p>${market.description}</p>
            </div>
        `;
        
        // Update page title
        document.title = `${market.name} - London Market Finder`;
        
        // Fetch vendors for this market through junction table
        const { data: vendorMarkets, error: vendorsError } = await supabase
            .from('vendor_markets')
            .select(`
                vendor:vendors(*)
            `)
            .eq('market_id', marketId);
        
        if (vendorsError) throw vendorsError;
        
        const vendors = vendorMarkets.map(vm => vm.vendor);
        
        // Display vendors
        if (vendors.length === 0) {
            vendorsContainer.innerHTML = '<p>No vendors listed for this market yet.</p>';
            return;
        }
        
        vendorsContainer.innerHTML = `
            <h2>Vendors (${vendors.length})</h2>
            <div class="vendor-grid"></div>
        `;
        
        const vendorGrid = vendorsContainer.querySelector('.vendor-grid');
        
        vendors.forEach(vendor => {
            const vendorCard = document.createElement('div');
            vendorCard.className = 'vendor-card';
            vendorCard.innerHTML = `
                <a href="vendor.html?id=${vendor.id}">
                    <h3>${vendor.name}</h3>
                    <p>${vendor.description || 'No description available'}</p>
                    <p class="products">${vendor.products || 'Products not listed'}</p>
                </a>
            `;
            vendorGrid.appendChild(vendorCard);
        });
        
    } catch (error) {
        console.error('Error loading market:', error);
        marketContainer.innerHTML = '<p>Error loading market. Check console for details.</p>';
    }
}

// Load market when page loads
loadMarket();