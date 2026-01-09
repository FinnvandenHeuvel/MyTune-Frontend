import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ArtistSearch from '../Pages/ArtistSearch';

jest.mock('../../application/usecases/spotify/searchArtists', () => ({
  searchArtists: jest.fn(),
}));

import { searchArtists } from '../../application/usecases/spotify/searchArtists';

test('search displays artists', async () => {
  const run = jest
    .fn()
    .mockResolvedValue([
      { id: '1', name: 'Radiohead', followers: { total: 1000 }, images: [], genres: [] },
    ]);

  searchArtists.mockReturnValue(run);

  render(<ArtistSearch onArtistSelect={jest.fn()} />);

  await userEvent.type(screen.getByRole('textbox'), 'radiohead');
  await userEvent.click(screen.getByRole('button', { name: /search/i }));

  // first call: DI
  expect(searchArtists).toHaveBeenCalledTimes(1);
  // second call: actual execution with query
  expect(run).toHaveBeenCalledWith('radiohead');

  expect(await screen.findByText('Radiohead')).toBeInTheDocument();
});
