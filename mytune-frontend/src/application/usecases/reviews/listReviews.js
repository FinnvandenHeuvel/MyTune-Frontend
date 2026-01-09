export const listReviews =
  ({ reviewsGateway }) =>
  async (params) =>
    reviewsGateway.list(params);
