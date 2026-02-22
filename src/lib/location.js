// src/lib/location.js
// ─────────────────────────────────────────────────────────────────────────────
// Helper to fetch approximate location based on IP address.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Fetches approximate location data using a public IP-API.
 * Returns a string label like "New York, NY, US" or "Unknown".
 */
export async function getApproximateLocation() {
  try {
    // Using ip-api.com (HTTP only for free tier, but works for basic app)
    // Alternatively: ipapi.co (HTTPS support for free tier)
    const response = await fetch('https://ipapi.co/json/');
    const data = await response.json();
    
    if (data.city && data.region && data.country_name) {
      return `${data.city}, ${data.region_code}, ${data.country_code}`;
    }
    
    return 'Unknown Location';
  } catch (err) {
    console.error('Location fetch error:', err);
    return 'Unknown Location';
  }
}
