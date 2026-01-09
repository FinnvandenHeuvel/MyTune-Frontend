export const getMe =
  ({ profileGateway }) =>
  async () =>
    profileGateway.me();
