import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://tkoctiuwbywxofyvtdju.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRrb2N0aXV3Ynl3eG9meXZ0ZGp1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIxMTc2NDIsImV4cCI6MjA4NzY5MzY0Mn0.VToxV4qACddbVnfmOov865OVFjAOON9eTFmstIjR0ok';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
