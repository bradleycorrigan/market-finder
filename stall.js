// Get credentials from environment variables
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_KEY;

// Import Supabase client
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

// Initialize Supabase
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Get stall ID from URL
const urlParams = new URLSearchParams(window.location.search);
const stallId = urlParams.get('id');

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

// Load stall details
async function loadStall() {
    const container = document.getElementById('stall-container');
    
    if (!stallId) {
        container.innerHTML = '<p>No stall ID provided.</p>';
        return;
    }
    
    try {
        // Fetch stall details
        const { data: stall, error: stallError } = await supabase
            .from('stalls')
            .select('*')
            .eq('id', stallId)
            .single();
        
        if (stallError) throw stallError;
        
        if (!stall) {
            container.innerHTML = '<p>Stall not found.</p>';
            return;
        }
        
        // Fetch all markets this stall operates at
        const { data: stallMarkets, error: marketsError } = await supabase
            .from('stall_markets')
            .select(`
                market:markets(id, name, address, days_open)
            `)
            .eq('stall_id', stallId);
        
        if (marketsError) throw marketsError;
        
        const markets = stallMarkets.map(vm => vm.market);
        
        // Build back link (go to first market if multiple)
        const backLink = markets.length > 0 
            ? `<a href="market.html?id=${markets[0].id}" class="back-link">← Back to ${markets[0].name}</a>`
            : `<a href="index.html" class="back-link">← Back to all markets</a>`;
        
        // Display stall details
        container.innerHTML = `
            ${backLink}
            
            ${stall.image_url ? `<img src="${stall.image_url}" alt="${stall.name}" style="width: 100%; max-height: 400px; object-fit: cover; border-radius: 8px; margin-bottom: 1rem;">` : ''}
            
            <div class="stall-header">
                <h1>${stall.name}</h1>
                ${createSocialLinks(stall.website, stall.instagram)}
            </div>
            
            <div class="stall-details">
                <h2>About</h2>
                <p>${stall.description || 'No description available'}</p>
                
                ${stall.long_description ? `
                    <h2>What We Think</h2>
                    <div class="long-description">${stall.long_description}</div>
                ` : ''}
                
                <h3>Products</h3>
                <p class="products">${stall.products || 'Products not listed'}</p>
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
        document.title = `${stall.name} - London Market Finder`;
        
        // Initialize Lucide icons
        lucide.createIcons();
        
    } catch (error) {
        console.error('Error loading stall:', error);
        container.innerHTML = '<p>Error loading stall. Check console for details.</p>';
    }
}

// Load stall when page loads
loadStall();