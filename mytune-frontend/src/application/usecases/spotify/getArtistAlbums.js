export const getArtistAlbums =
  ({ spotifyGateway }) =>
  async (id) =>
    spotifyGateway.getArtistAlbums(id);
