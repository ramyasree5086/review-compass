const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { query, platform } = await req.json();

    if (!query) {
      return new Response(
        JSON.stringify({ success: false, error: 'Query is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const apiKey = Deno.env.get('FIRECRAWL_API_KEY');
    if (!apiKey) {
      return new Response(
        JSON.stringify({ success: false, error: 'Firecrawl API key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Build search query based on platform
    let searchQuery = '';
    if (platform === 'amazon') {
      searchQuery = `${query} review site:amazon.com OR site:amazon.in`;
    } else if (platform === 'imdb') {
      searchQuery = `${query} user review site:imdb.com`;
    } else {
      searchQuery = `${query} review ${platform}`;
    }

    console.log('Searching for reviews:', searchQuery);

    // Step 1: Search for review pages
    const searchResponse = await fetch('https://api.firecrawl.dev/v1/search', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: searchQuery,
        limit: 3,
        scrapeOptions: {
          formats: ['markdown'],
          onlyMainContent: true,
        },
      }),
    });

    const searchData = await searchResponse.json();

    if (!searchResponse.ok) {
      console.error('Firecrawl search error:', searchData);
      return new Response(
        JSON.stringify({ success: false, error: searchData.error || 'Search failed' }),
        { status: searchResponse.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Extract review text from results
    const results = searchData.data || [];
    const reviews: string[] = [];

    // Noise patterns to filter out non-review content
    const noisePatterns = [
      /^http/i, /^\[/i, /^\(/i, /^#/i, /^\*/i, /^!/i,
      /cookie/i, /javascript/i, /sign in/i, /log in/i, /subscribe/i,
      /add to cart/i, /buy now/i, /click here/i, /privacy policy/i,
      /terms of/i, /copyright/i, /loading/i, /batch/i, /dialog/i,
      /navigation/i, /menu/i, /search for/i, /seek to/i, /selected$/i,
      /^\d+$/i, /com\//i, /^find us/i, /^beginning of/i, /staticb/i,
      /descriptions off/i, /currently behind/i, /uedata/i,
    ];

    for (const result of results) {
      const markdown = result.markdown || '';
      const sentences = markdown
        .split(/[.!?\n]+/)
        .map((s: string) => s.trim())
        .filter((s: string) => {
          if (s.length < 30 || s.length > 500) return false;
          // Filter noise
          if (noisePatterns.some(p => p.test(s))) return false;
          // Must contain some alphabetic words (not just codes/numbers)
          const wordCount = s.split(/\s+/).filter((w: string) => /^[a-zA-Z]+$/.test(w)).length;
          if (wordCount < 4) return false;
          return true;
        });
      
      reviews.push(...sentences.slice(0, 10));
    }

    // Deduplicate and limit
    const uniqueReviews = [...new Set(reviews)].slice(0, 15);

    console.log(`Found ${uniqueReviews.length} review excerpts`);

    return new Response(
      JSON.stringify({
        success: true,
        reviews: uniqueReviews,
        sources: results.map((r: any) => ({
          title: r.title || 'Unknown',
          url: r.url || '',
        })),
        query: query,
        platform: platform,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error fetching reviews:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch reviews';
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
