import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ArtistDetailPage from '../Pages/ArtistDetailPage';
import { AuthContext } from '../../app/providers/AuthProvider';

import { getArtist } from '../../application/usecases/spotify/getArtist';
import { getArtistAlbums } from '../../application/usecases/spotify/getArtistAlbums';
import { listReviews } from '../../application/usecases/reviews/listReviews';
import { createReview } from '../../application/usecases/reviews/createReview';

jest.mock('../../application/usecases/spotify/getArtist', () => ({ getArtist: jest.fn() }));
jest.mock('../../application/usecases/spotify/getArtistAlbums', () => ({
  getArtistAlbums: jest.fn(),
}));
jest.mock('../../application/usecases/reviews/listReviews', () => ({ listReviews: jest.fn() }));
jest.mock('../../application/usecases/reviews/createReview', () => ({ createReview: jest.fn() }));

const ARTIST = {
  id: 'a1',
  name: 'Radiohead',
  followers: { total: 1234 },
  images: [{ url: 'https://example.com/radiohead.jpg' }],
  genres: ['alternative', 'rock'],
  external_urls: { spotify: 'https://open.spotify.com/artist/a1' },
};

const ALBUMS = [
  {
    id: 'al1',
    name: 'Kid A',
    release_date: '2000-10-02',
    images: [{ url: 'https://example.com/kida.jpg' }],
  },
  {
    id: 'al2',
    name: 'OK Computer',
    release_date: '1997-06-16',
    images: [{ url: 'https://example.com/okc.jpg' }],
  },
];

const REVIEWS_INITIAL = [
  {
    id: 1,
    title: 'Great',
    content: 'Amazing album',
    rating: 5,
    user: 'alice',
    album: 'Kid A',
    created_at: '2020-01-01T00:00:00.000Z',
  },
];

function setupUsecases({
  isAuthenticated = false,
  getArtistThrows = false,
  reviewsFirst = REVIEWS_INITIAL,
  reviewsAfterCreate = [
    ...REVIEWS_INITIAL,
    { id: 2, title: 'New', content: 'Nice', rating: 4, user: 'bob' },
  ],
  createThrows = false,
} = {}) {
  const getArtistFn = jest.fn();
  const getAlbumsFn = jest.fn();
  const listReviewsFn = jest.fn();
  const createReviewFn = jest.fn();

  if (getArtistThrows) getArtistFn.mockRejectedValue(new Error('Artist API down'));
  else getArtistFn.mockResolvedValue(ARTIST);

  getAlbumsFn.mockResolvedValue(ALBUMS);

  // first call = initial load, second call = after successful create
  listReviewsFn.mockResolvedValueOnce(reviewsFirst).mockResolvedValueOnce(reviewsAfterCreate);

  if (createThrows) createReviewFn.mockRejectedValue(new Error('Create failed'));
  else createReviewFn.mockResolvedValue(undefined);

  getArtist.mockReturnValue(getArtistFn);
  getArtistAlbums.mockReturnValue(getAlbumsFn);
  listReviews.mockReturnValue(listReviewsFn);
  createReview.mockReturnValue(createReviewFn);

  const onBack = jest.fn();

  render(
    <AuthContext.Provider value={{ isAuthenticated }}>
      <ArtistDetailPage artistId="a1" onBack={onBack} />
    </AuthContext.Provider>,
  );

  return { onBack, getArtistFn, getAlbumsFn, listReviewsFn, createReviewFn };
}

test('loads artist + albums + reviews and shows unauth warning', async () => {
  setupUsecases({ isAuthenticated: false });

  // initial loading state
  expect(screen.getByText(/loading/i)).toBeInTheDocument();

  // page loaded
  expect(await screen.findByRole('heading', { level: 1, name: 'Radiohead' })).toBeInTheDocument();

  // albums rendered (use album cover image alt text to avoid duplicate "Kid A" in reviews)
  expect(screen.getByAltText('Kid A')).toBeInTheDocument();
  expect(screen.getByAltText('OK Computer')).toBeInTheDocument();

  // unauthenticated branch
  expect(screen.getByText(/you must be logged in to submit a review/i)).toBeInTheDocument();

  // existing review rendered (review title is unique)
  expect(screen.getByRole('heading', { level: 5, name: 'Great' })).toBeInTheDocument();
});

test('clicking Back calls onBack', async () => {
  const { onBack } = setupUsecases({ isAuthenticated: false });

  await screen.findByRole('heading', { level: 1, name: 'Radiohead' });

  fireEvent.click(screen.getByRole('button', { name: /back to search/i }));

  expect(onBack).toHaveBeenCalledTimes(1);
});

test('authenticated user can select album, submit review, and refresh reviews', async () => {
  const { createReviewFn, listReviewsFn } = setupUsecases({ isAuthenticated: true });

  await screen.findByRole('heading', { level: 1, name: 'Radiohead' });

  // choose an album
  fireEvent.click(screen.getAllByRole('button', { name: /write review/i })[0]);

  // album selected header shown
  expect(screen.getByText(/review:\s*kid a/i)).toBeInTheDocument();

  // fill form (placeholders are stable)
  fireEvent.change(screen.getByPlaceholderText(/review title/i), {
    target: { value: 'My review' },
  });
  fireEvent.change(screen.getByPlaceholderText(/share your thoughts/i), {
    target: { value: 'So good' },
  });
  fireEvent.change(screen.getByRole('combobox'), { target: { value: '4' } });

  fireEvent.click(screen.getByRole('button', { name: /submit review/i }));

  await waitFor(() => {
    expect(createReviewFn).toHaveBeenCalledTimes(1);
  });

  expect(createReviewFn).toHaveBeenCalledWith(
    expect.objectContaining({
      title: 'My review',
      content: 'So good',
      rating: 4,
      artist: 'Radiohead',
      artist_id: 'a1',
      album: 'Kid A',
      album_id: 'al1',
    }),
  );

  // refreshReviews called again after create => listReviews called twice total
  await waitFor(() => {
    expect(listReviewsFn).toHaveBeenCalledTimes(2);
  });

  expect(await screen.findByText(/review submitted successfully/i)).toBeInTheDocument();
});

test('shows error state if initial load fails', async () => {
  setupUsecases({ getArtistThrows: true });

  expect(await screen.findByText(/error:\s*artist api down/i)).toBeInTheDocument();
});

test('shows error message if submit fails', async () => {
  const { createReviewFn } = setupUsecases({ isAuthenticated: true, createThrows: true });

  await screen.findByRole('heading', { level: 1, name: 'Radiohead' });

  fireEvent.change(screen.getByPlaceholderText(/review title/i), { target: { value: 'Oops' } });
  fireEvent.change(screen.getByPlaceholderText(/share your thoughts/i), {
    target: { value: 'Nope' },
  });

  fireEvent.click(screen.getByRole('button', { name: /submit review/i }));

  await waitFor(() => {
    expect(createReviewFn).toHaveBeenCalledTimes(1);
  });

  expect(await screen.findByText(/error:\s*create failed/i)).toBeInTheDocument();
});
