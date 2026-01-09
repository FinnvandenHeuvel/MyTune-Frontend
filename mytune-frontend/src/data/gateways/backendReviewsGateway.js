export const createBackendReviewsGateway = ({ http, apiBaseUrl }) => ({
  // Public list endpoint (no auth). Using raw fetch keeps it truly public.
  list: async (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    const url = `${apiBaseUrl}/reviews/${qs ? `?${qs}` : ''}`;

    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch reviews');
    return res.json();
  },

  // Auth required (creates Review linked to request.user in backend)
  create: (payload) => http.post('/reviews/', payload),

  // Admin only
  delete: (id) => http.del(`/reviews/${id}/`),
});
