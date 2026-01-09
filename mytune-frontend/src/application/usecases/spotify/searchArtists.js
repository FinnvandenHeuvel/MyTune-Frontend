export const searchArtists =
  ({ spotifyGateway }) =>
  async (q) =>
    spotifyGateway.searchArtists(q);
