import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

export const supabase = createClient(
  'https://lkevjasifcerqucwrrqt.supabase.co', // your project URL and api key
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxrZXZqYXNpZmNlcnF1Y3dycnF0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEwMjM1NTEsImV4cCI6MjA2NjU5OTU1MX0.U5ewYGmfODCO9p9C3Cjrnn8Bpm7i2YOw6Q6UbBAMcnM' // your actual anon key
);