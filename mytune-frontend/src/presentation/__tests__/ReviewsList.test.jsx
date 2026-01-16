import { render, screen } from '@testing-library/react';
import ReviewsList from '../components/reviews/ReviewsList';

import { listReviews } from '../../application/usecases/reviews/listReviews';

jest.mock('../../application/usecases/reviews/listReviews', () => ({
  listReviews: jest.fn(),
}));

test('renders reviews from backend', async () => {
  const run = jest.fn().mockResolvedValue([
    {
      id: 1,
      title: 'Great song',
      artist: 'Artist A',
      album: null,
      content: 'Loved it',
      rating: 5,
      user: 'testuser',
      created_at: '2025-01-01T00:00:00Z',
    },
  ]);

  listReviews.mockReturnValue(run);

  render(<ReviewsList />);

  expect(await screen.findByText(/great song/i)).toBeInTheDocument();
  expect(screen.getAllByText(/artist a/i).length).toBeGreaterThan(0);
});
