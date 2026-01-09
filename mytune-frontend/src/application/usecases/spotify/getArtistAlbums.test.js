import { getArtistAlbums } from './getArtistAlbums';

test('getArtistAlbums calls spotifyGateway.getArtistAlbums', async () => {
  const spotifyGateway = { getArtistAlbums: jest.fn().mockResolvedValue([{ id: 'al' }]) };
  const run = getArtistAlbums({ spotifyGateway });

  const res = await run('a');

  expect(spotifyGateway.getArtistAlbums).toHaveBeenCalledWith('a');
  expect(res).toEqual([{ id: 'al' }]);
});
