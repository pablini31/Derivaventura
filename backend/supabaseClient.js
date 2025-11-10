// Cliente Supabase compartido para el backend
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.warn('⚠️ SUPABASE_URL o SUPABASE_SERVICE_KEY no configuradas.');
  console.warn('   SUPABASE_URL:', SUPABASE_URL ? '✅ Configurada' : '❌ No configurada');
  console.warn('   SUPABASE_SERVICE_KEY:', SUPABASE_SERVICE_KEY ? '✅ Configurada' : '❌ No configurada');
  module.exports = null;
} else {
  console.log('✅ Supabase client creado correctamente');
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
  module.exports = supabase;
}
