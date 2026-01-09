export const createReview =
  ({ reviewsGateway }) =>
  async (payload) =>
    reviewsGateway.create(payload);
