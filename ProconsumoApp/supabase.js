import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://mjhnkskrmelshxdslerz.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1qaG5rc2tybWVsc2h4ZHNsZXJ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU2MDg1MjEsImV4cCI6MjA2MTE4NDUyMX0.v-TTk-_y725XZ53humKLL-9VWL8qjbqubyrkXxro3Rc";

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);