import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://gtlntaigxnnlsalocafi.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd0bG50YWlneG5ubHNhbG9jYWZpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjA0NzM5NDMsImV4cCI6MjAzNjA0OTk0M30.GFUMf21m2yYm3lwrdisu-6Mt7AC3fqiRKRCckBpionA';
export const supabase = createClient(supabaseUrl, supabaseKey);


export default supabase;