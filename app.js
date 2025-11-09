// Get credentials from environment variables
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_KEY;

// Import Supabase client
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

// Initialize Supabase
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Helper function to create social links HTML
// This takes the website and instagram values and creates the HTML for the links
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
        // Remove @ symbol if someone includes it
        const instaHandle = instagram.replace('@', '');
        links.push(`
            <a href="https://instagram.com/${instaHandle}" target="_blank" rel="noopener">
                <i data-lucide="instagram"></i>
                @${instaHandle}
            </a>
        `);
    }
    
    // If there are any links, wrap them in the social-links div
    if (links.length > 0) {
        return `<div class="social-links">${links.join('')}</div>`;
    }
    
    return '';
}

// Load markets and their vendors
async function loadMarkets() {
    const container = document.getElementById('markets-container');
    
    try {
        // Fetch markets from database
        const { data: markets, error: marketsError } = await supabase
            .from('markets')
            .select('*')
            .order('name');
        
        // If there's an error, throw it to be caught below
        if (marketsError) throw marketsError;
        
        // Clear the loading message
        container.innerHTML = '';
        
        // If no markets found, show message
        if (markets.length === 0) {
            container.innerHTML = '<p>No markets found.</p>';
            return;
        }
        
        // Loop through each market and create a card
        for (const market of markets) {
            // Get vendor count for this market using junction table
            const { count } = await supabase
                .from('vendor_markets')
                .select('*', { count: 'exact', head: true })
                .eq('market_id', market.id);
            
            // Create a new div element for the market card
            const marketCard = document.createElement('div');
            marketCard.className = 'market-card';
            
            // Build the HTML for the card
            // We use template literals (backticks) to insert variables
            marketCard.innerHTML = `
                ${market.image_url ? `<img src="${market.image_url}" alt="${market.name}">` : ''}
                <h2><a href="market.html?id=${market.id}">${market.name}</a></h2>
                <p><strong>${market.address}</strong></p>
                <p>${market.days_open || 'Hours not listed'}</p>
                <p>${market.description}</p>
                ${createSocialLinks(market.website, market.instagram)}
                <p><small>${count || 0} vendors</small></p>
            `;
            
            // Add the card to the page
            container.appendChild(marketCard);
        }
        
        // Initialize Lucide icons after adding all cards
        // This converts <i data-lucide="..."> into actual SVG icons
        lucide.createIcons();
        
    } catch (error) {
        // If anything goes wrong, log it and show error message
        console.error('Error loading markets:', error);
        container.innerHTML = '<p>Error loading markets. Check console for details.</p>';
    }
}

// Run loadMarkets when the page finishes loading
loadMarkets();