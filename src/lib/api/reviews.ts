import { supabase } from '@/integrations/supabase/client';

export interface ReviewSource {
  title: string;
  url: string;
}

export interface FetchReviewsResponse {
  success: boolean;
  reviews?: string[];
  sources?: ReviewSource[];
  query?: string;
  platform?: string;
  error?: string;
}

export async function fetchReviews(
  query: string,
  platform: string
): Promise<FetchReviewsResponse> {
  const { data, error } = await supabase.functions.invoke('fetch-reviews', {
    body: { query, platform },
  });

  if (error) {
    return { success: false, error: error.message };
  }

  return data as FetchReviewsResponse;
}
