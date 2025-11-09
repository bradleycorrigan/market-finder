// Get credentials from environment variables
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_KEY;

// Import Supabase client
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

// Initialize Supabase
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Load markets and their vendors
async function loadMarkets() {
    const container = document.getElementById('markets-container');
    
    try {
        // Fetch markets
        const { data: markets, error: marketsError } = await supabase
            .from('markets')
            .select('*')
            .order('name');
        
        if (marketsError) throw marketsError;
        
        // Clear loading message
        container.innerHTML = '';
        
        if (markets.length === 0) {
            container.innerHTML = '<p>No markets found.</p>';
            return;
        }
        
        // Display each market as a card
        for (const market of markets) {
            // Get vendor count for this market using junction table
            const { count } = await supabase
                .from('vendor_markets')
                .select('*', { count: 'exact', head: true })
                .eq('market_id', market.id);
            
            const marketCard = document.createElement('div');
            marketCard.className = 'market-card';
            marketCard.innerHTML = `
                <h2><a href="market.html?id=${market.id}">${market.name}</a></h2>
                <p><strong>${market.address}</strong></p>
                <p>${market.days_open || 'Hours not listed'}</p>
                <p>${market.description}</p>
                <p><small>${count || 0} vendors</small></p>
            `;
            
            container.appendChild(marketCard);
        }
        
    } catch (error) {
        console.error('Error loading markets:', error);
        container.innerHTML = '<p>Error loading markets. Check console for details.</p>';
    }
}

// Load markets when page loads
loadMarkets();