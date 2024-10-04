import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://mvxazgyzgiuivzngdbov.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im12eGF6Z3l6Z2l1aXZ6bmdkYm92Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mjc5ODcyMjMsImV4cCI6MjA0MzU2MzIyM30.Qg05UnatADTemLtofxUeI-b7CQqt3gb8bVNmuO7q5n0';
export const supabase = createClient(supabaseUrl, supabaseKey);


export default supabase;