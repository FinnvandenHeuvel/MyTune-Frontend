export const getArtist =
  ({ spotifyGateway }) =>
  async (id) =>
    spotifyGateway.getArtist(id);
