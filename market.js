// Get credentials from environment variables
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_KEY;

// Import Supabase client
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

// Initialize Supabase
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Get market ID from URL
// Example: market.html?id=1 → marketId = '1'
const urlParams = new URLSearchParams(window.location.search);
const marketId = urlParams.get('id');

// Helper function to create social links HTML
function createSocialLinks(website, instagram) {
    const links = [];
    
    if (website) {
        links.push(`
            <a href="${website}" target="_blank" rel="noopener">
                <i data-lucide="external-link"></i>
                Website
            </a>
        `);
    }
    
    if (instagram) {
        const instaHandle = instagram.replace('@', '');
        links.push(`
            <a href="https://instagram.com/${instaHandle}" target="_blank" rel="noopener">
                <i data-lucide="instagram"></i>
                @${instaHandle}
            </a>
        `);
    }
    
    if (links.length > 0) {
        return `<div class="social-links">${links.join('')}</div>`;
    }
    
    return '';
}

// Load market details and stalls
async function loadMarket() {
    const marketContainer = document.getElementById('market-container');
    const stallsContainer = document.getElementById('stalls-container');
    
    // If no ID in URL, show error
    if (!marketId) {
        marketContainer.innerHTML = '<p>No market ID provided.</p>';
        return;
    }
    
    try {
        // Fetch this specific market from database
        const { data: market, error: marketError } = await supabase
            .from('markets')
            .select('*')
            .eq('id', marketId)  // Only get market with this ID
            .single();  // We expect exactly one result
        
        if (marketError) throw marketError;
        
        // If market doesn't exist
        if (!market) {
            marketContainer.innerHTML = '<p>Market not found.</p>';
            return;
        }
        
        // Display market details
        marketContainer.innerHTML = `
            <div class="market-header">
                ${market.image_url ? `<img src="${market.image_url}" alt="${market.name}" style="width: 100%; max-height: 400px; object-fit: cover; border-radius: 8px; margin-bottom: 1rem;">` : ''}
                <h1>${market.name}</h1>
                <p><strong>${market.address}</strong></p>
                <p>${market.days_open || 'Hours not listed'}</p>
                <p>${market.description}</p>
                ${createSocialLinks(market.website, market.instagram)}
            </div>
        `;
        
        // Update the browser tab title
        document.title = `${market.name} - London Market Finder`;
        
        // Fetch stalls for this market through junction table
        const { data: stallMarkets, error: stallsError } = await supabase
            .from('stall_markets')
            .select(`
                stall:stalls(*)
            `)
            .eq('market_id', marketId);
        
        if (stallsError) throw stallsError;
        
        // Extract just the stall objects from the results
        // stallMarkets is an array like [{stall: {...}}, {stall: {...}}]
        // We want just [{...}, {...}]
        const stalls = stallMarkets.map(sm => sm.stall);
        
        // Display stalls
        if (stalls.length === 0) {
            stallsContainer.innerHTML = '<p>No stalls listed for this market yet.</p>';
            return;
        }
        
        // Create the stalls section heading
        stallsContainer.innerHTML = `
            <h2>Our Favourite Stalls (${stalls.length})</h2>
            <div class="stall-grid"></div>
        `;
        
        // Get the grid container we just created
        const stallGrid = stallsContainer.querySelector('.stall-grid');
        
        // Loop through each stall and create a card
        stalls.forEach(stall => {
            const stallCard = document.createElement('div');
            stallCard.className = 'stall-card';
            stallCard.innerHTML = `
                ${stall.image_url ? `<img src="${stall.image_url}" alt="${stall.name}" style="width: 100%; height: 150px; object-fit: cover; border-radius: 8px; margin-bottom: 0.5rem;">` : ''}
                <a href="stall.html?id=${stall.id}">
                    <h3>${stall.name}</h3>
                    <p>${stall.description || 'No description available'}</p>
                    <p class="products">${stall.products || 'Products not listed'}</p>
                </a>
                ${createSocialLinks(stall.website, stall.instagram)}
            `;
            stallGrid.appendChild(stallCard);
        });
        
        // Initialize Lucide icons
        lucide.createIcons();
        
    } catch (error) {
        console.error('Error loading market:', error);
        marketContainer.innerHTML = '<p>Error loading market. Check console for details.</p>';
    }
}

// Load market when page loads
loadMarket();