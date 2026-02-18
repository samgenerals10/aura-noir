/**
 * Converted from TypeScript → JavaScript on 2026-02-16.
 * Learning notes:
 * - All TypeScript types/interfaces were removed (JS doesn’t use them).
 * - Runtime logic is unchanged; UI/Tailwind classes should render exactly the same.
 * - Read the inline comments around state, effects, handlers, and data flow.
 */
import { createClient } from '@supabase/supabase-js';


// Initialize database client
const supabaseUrl = 'https://jzvivqerhbdmqnjajgui.databasepad.com';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6IjVkMGIxMjFlLWM5ODAtNGFiNS1hODNiLTI4NjBlYTYzOGY0MCJ9.eyJwcm9qZWN0SWQiOiJqenZpdnFlcmhiZG1xbmphamd1aSIsInJvbGUiOiJhbm9uIiwiaWF0IjoxNzcxMjYwNzA1LCJleHAiOjIwODY2MjA3MDUsImlzcyI6ImZhbW91cy5kYXRhYmFzZXBhZCIsImF1ZCI6ImZhbW91cy5jbGllbnRzIn0.Fij1GxQvI6jqQzFH4YdGgsRj5DoQfxTGBGir_0sa52Q';
const supabase = createClient(supabaseUrl, supabaseKey);


export { supabase };