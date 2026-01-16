import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ArtistSearch from '../Pages/ArtistSearch';

import { searchArtists } from '../../application/usecases/spotify/searchArtists';

jest.mock('../../application/usecases/spotify/searchArtists', () => ({
  searchArtists: jest.fn(),
}));

test('search displays artists', async () => {
  const run = jest
    .fn()
    .mockResolvedValue([
      { id: '1', name: 'Radiohead', followers: { total: 1000 }, images: [], genres: [] },
    ]);

  searchArtists.mockReturnValue(run);

  render(<ArtistSearch onArtistSelect={jest.fn()} />);

  userEvent.type(screen.getByRole('textbox'), 'radiohead');
  userEvent.click(screen.getByRole('button', { name: /search/i }));

  expect(searchArtists).toHaveBeenCalledTimes(1);

  await waitFor(() => {
    expect(run).toHaveBeenCalledWith('radiohead');
  });

  expect(await screen.findByText('Radiohead')).toBeInTheDocument();
});
