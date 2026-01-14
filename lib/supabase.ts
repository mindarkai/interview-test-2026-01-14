import { createClient, SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl=process.env['NEXT_PUBLIC_SUPABASE_URL']??'';
const supabaseKey=process.env['NEXT_PUBLIC_SUPABASE_ANON_KEY']??'';

let _client:SupabaseClient;

export const supClient=()=>{
    return _client??(_client=createClient(supabaseUrl,supabaseKey));
}
