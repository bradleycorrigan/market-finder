// Get credentials from environment variables
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_KEY;

// Import Supabase client
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

// Initialize Supabase
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Get vendor ID from URL
const urlParams = new URLSearchParams(window.location.search);
const vendorId = urlParams.get('id');

// Load vendor details
async function loadVendor() {
    const container = document.getElementById('vendor-container');
    
    if (!vendorId) {
        container.innerHTML = '<p>No vendor ID provided.</p>';
        return;
    }
    
    try {
        // Fetch vendor details
        const { data: vendor, error: vendorError } = await supabase
            .from('vendors')
            .select('*')
            .eq('id', vendorId)
            .single();
        
        if (vendorError) throw vendorError;
        
        if (!vendor) {
            container.innerHTML = '<p>Vendor not found.</p>';
            return;
        }
        
        // Fetch all markets this vendor operates at
        const { data: vendorMarkets, error: marketsError } = await supabase
            .from('vendor_markets')
            .select(`
                market:markets(id, name, address, days_open)
            `)
            .eq('vendor_id', vendorId);
        
        if (marketsError) throw marketsError;
        
        const markets = vendorMarkets.map(vm => vm.market);
        
        // Build back link (go to first market if multiple)
        const backLink = markets.length > 0 
            ? `<a href="market.html?id=${markets[0].id}" class="back-link">← Back to ${markets[0].name}</a>`
            : `<a href="index.html" class="back-link">← Back to all markets</a>`;
        
        // Display vendor details
        container.innerHTML = `
            ${backLink}
            
            <div class="vendor-header">
                <h1>${vendor.name}</h1>
            </div>
            
            <div class="vendor-details">
                <h2>About</h2>
                <p>${vendor.description || 'No description available'}</p>
                
                <h3>Products</h3>
                <p class="products">${vendor.products || 'Products not listed'}</p>
            </div>
            
            <div class="market-info">
                <h3>Find them at:</h3>
                ${markets.length === 0 
                    ? '<p>No markets listed</p>' 
                    : markets.map(market => `
                        <div style="margin-bottom: 1rem;">
                            <p><strong><a href="market.html?id=${market.id}">${market.name}</a></strong></p>
                            <p>${market.address}</p>
                            <p>${market.days_open || 'Hours not listed'}</p>
                        </div>
                    `).join('')
                }
            </div>
        `;
        
        // Update page title
        document.title = `${vendor.name} - London Market Finder`;
        
    } catch (error) {
        console.error('Error loading vendor:', error);
        container.innerHTML = '<p>Error loading vendor. Check console for details.</p>';
    }
}

// Load vendor when page loads
loadVendor();