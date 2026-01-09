export const getMyReviews =
  ({ profileGateway }) =>
  async () =>
    profileGateway.myReviews();
