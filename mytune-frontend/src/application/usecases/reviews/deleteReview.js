export const deleteReview =
  ({ reviewsGateway }) =>
  async (id) =>
    reviewsGateway.delete(id);
