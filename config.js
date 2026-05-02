// ==========================================
// CONFIGURATION & SHARED UTILITIES
// ==========================================

const CONFIG = {
    // SUPABASE CONFIGURATION
    // Replace these with your actual Supabase project credentials
    SUPABASE_URL: "https://vovkgbsehheznoiwkrgb.supabase.co",
    SUPABASE_ANON_KEY: "sb_publishable_JhF7OOwVxRCrIJyJwAQ1ug_OuclSxWt",
    
    // NAVIGATION LINKS
    // Updated to reflect the new descriptive HTML file names
    NAV_LINKS: {
        hotel: "index.html",
        rooms: "booking.html",
        experiences: "index.html#experiences",
        about: "about.html",
        contact: "contact.html",
        booking: "booking.html",
        admin: "admin.html"
    }
};

// ==========================================
// INITIALIZATION & CORE FUNCTIONS
// ==========================================



/**
 * Initializes the Supabase client using the CONFIG credentials.
 */
function initSupabase() {
    if (typeof supabase !== 'undefined' && supabase.createClient) {
        window.supabaseClient = supabase.createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_ANON_KEY);
        console.log("Supabase initialized successfully");
    } else {
        console.warn("Supabase library not found. Ensure the CDN link is in the HTML <head>.");
    }
}

/**
 * Shared function to submit form data to a specific Supabase table.
 * @param {string} table - The name of the table (e.g., 'bookings', 'contact_messages')
 * @param {Object} data - The data object to insert
 */
async function submitToSupabase(table, data) {
    if (!window.supabaseClient) {
        console.error("Cannot submit: Supabase is not initialized.");
        return { error: "Supabase not initialized" };
    }
    const { data: result, error } = await window.supabaseClient.from(table).insert([data]);
    return { data: result, error };
}

// Make functions globally accessible for HTML files
window.HOTEL_CONFIG = CONFIG;
window.submitToSupabase = submitToSupabase;
window.initSupabase = initSupabase;
