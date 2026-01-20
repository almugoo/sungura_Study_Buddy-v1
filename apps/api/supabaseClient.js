const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });


const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

let supabase = null;

if (!supabaseUrl || !supabaseServiceKey) {
    console.warn('WARNING: Supabase URL or Service Key is missing in .env. Supabase integration will be disabled.');
} else {
    try {
        supabase = createClient(supabaseUrl, supabaseServiceKey);
    } catch (error) {
        console.error('Failed to initialize Supabase client:', error.message);
    }
}

module.exports = { supabase };

