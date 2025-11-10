// Cliente Supabase compartido para el backend
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.warn('Warning: SUPABASE_URL or SUPABASE_SERVICE_KEY not set. Supabase client will not be available.');
}

const supabase = createClient(SUPABASE_URL || '', SUPABASE_SERVICE_KEY || '');

module.exports = supabase;
