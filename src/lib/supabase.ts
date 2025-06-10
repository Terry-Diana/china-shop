import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://mqpjosywrnnqepkuebxb.supabase.co';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1xcGpvc3l3cm5ucWVwa3VlYnhiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkxMDg2NDQsImV4cCI6MjA2NDY4NDY0NH0.CSf-8YGs7Mq5855n4sHgli9BGFW52xgcK0HeHYn9Zy8';

if (!supabaseUrl || !supabaseKey) {
  console.error('Supabase environment variables:', {
    url: supabaseUrl,
    key: supabaseKey ? 'Present' : 'Missing'
  });
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseKey);