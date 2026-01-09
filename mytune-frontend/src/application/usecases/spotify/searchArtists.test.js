import { searchArtists } from './searchArtists';

test('searchArtists calls spotifyGateway.searchArtists', async () => {
  const spotifyGateway = { searchArtists: jest.fn().mockResolvedValue([{ id: '1' }]) };
  const run = searchArtists({ spotifyGateway });

  const res = await run('radiohead');

  expect(spotifyGateway.searchArtists).toHaveBeenCalledWith('radiohead');
  expect(res).toEqual([{ id: '1' }]);
});
