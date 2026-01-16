import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ReviewsList from '../components/reviews/ReviewsList';

import { listReviews } from '../../application/usecases/reviews/listReviews';
import { deleteReview } from '../../application/usecases/reviews/deleteReview';
import { getMe } from '../../application/usecases/profile/getMe';

jest.mock('../../application/usecases/reviews/listReviews', () => ({ listReviews: jest.fn() }));
jest.mock('../../application/usecases/reviews/deleteReview', () => ({ deleteReview: jest.fn() }));
jest.mock('../../application/usecases/profile/getMe', () => ({ getMe: jest.fn() }));

const REVIEWS = [
  {
    id: 1,
    title: 'A Kid A Review',
    artist: 'Radiohead',
    album: 'Kid A',
    content: 'Great',
    user: 'alice',
    rating: 5,
    created_at: '2020-01-02T10:00:00.000Z',
  },
  {
    id: 2,
    title: 'OK Computer',
    artist: 'Radiohead',
    album: 'OK Computer',
    content: 'Classic',
    user: 'bob',
    rating: 4,
    created_at: '2020-01-01T10:00:00.000Z',
  },
  {
    id: 3,
    title: 'Discovery',
    artist: 'Daft Punk',
    album: 'Discovery',
    content: 'Fun',
    user: 'carol',
    rating: 3,
    created_at: '2020-01-03T10:00:00.000Z',
  },
];

function setupUsecases({
  reviews = REVIEWS,
  isAdmin = false,
  getMeThrows = false,
  listThrows = false,
  deleteThrows = false,
} = {}) {
  const listFn = jest.fn();
  const deleteFn = jest.fn();
  const getMeFn = jest.fn();

  if (listThrows) listFn.mockRejectedValue(new Error('Nope'));
  else listFn.mockResolvedValue(reviews);

  if (getMeThrows) getMeFn.mockRejectedValue(new Error('Not logged in'));
  else getMeFn.mockResolvedValue({ is_admin: isAdmin });

  if (deleteThrows) deleteFn.mockRejectedValue(new Error('Delete failed'));
  else deleteFn.mockResolvedValue(undefined);

  listReviews.mockReturnValue(listFn);
  deleteReview.mockReturnValue(deleteFn);
  getMe.mockReturnValue(getMeFn);

  return { listFn, deleteFn, getMeFn };
}

test('shows loading then renders reviews (non-admin; no Delete buttons)', async () => {
  setupUsecases({ isAdmin: false, reviews: REVIEWS });

  render(<ReviewsList />);

  expect(screen.getByText(/loading reviews/i)).toBeInTheDocument();

  expect(await screen.findByText(/all reviews/i)).toBeInTheDocument();
  expect(screen.getByRole('heading', { level: 5, name: 'A Kid A Review' })).toBeInTheDocument();

  // non-admin => no delete buttons
  expect(screen.queryByRole('button', { name: /delete/i })).not.toBeInTheDocument();
});

test('admin sees Delete button and can delete a review when confirmed', async () => {
  const { deleteFn } = setupUsecases({ isAdmin: true, reviews: REVIEWS });

  globalThis.confirm = jest.fn().mockReturnValue(true);

  render(<ReviewsList />);

  expect(await screen.findByText(/all reviews/i)).toBeInTheDocument();

  // Before delete: 3 rendered review titles (h5)
  expect(screen.getAllByRole('heading', { level: 5 }).length).toBe(3);

  fireEvent.click(screen.getAllByRole('button', { name: /delete/i })[0]);

  await waitFor(() => {
    expect(deleteFn).toHaveBeenCalledTimes(1);
  });

  // After delete: 2 rendered review titles
  await waitFor(() => {
    expect(screen.getAllByRole('heading', { level: 5 }).length).toBe(2);
  });
});

test('clicking Delete does nothing when confirm is cancelled', async () => {
  const { deleteFn } = setupUsecases({ isAdmin: true, reviews: REVIEWS });
  globalThis.confirm = jest.fn().mockReturnValue(false);

  render(<ReviewsList />);

  expect(await screen.findByText(/all reviews/i)).toBeInTheDocument();

  fireEvent.click(screen.getAllByRole('button', { name: /delete/i })[0]);

  expect(deleteFn).not.toHaveBeenCalled();
});

test('shows alert when delete fails', async () => {
  const { deleteFn } = setupUsecases({ isAdmin: true, reviews: REVIEWS, deleteThrows: true });

  globalThis.confirm = jest.fn().mockReturnValue(true);
  globalThis.alert = jest.fn();

  render(<ReviewsList />);

  expect(await screen.findByText(/all reviews/i)).toBeInTheDocument();

  fireEvent.click(screen.getAllByRole('button', { name: /delete/i })[0]);

  await waitFor(() => {
    expect(deleteFn).toHaveBeenCalledTimes(1);
  });

  await waitFor(() => {
    expect(globalThis.alert).toHaveBeenCalledTimes(1);
  });
});

test('filters by search + min rating + artist/album and clears filters', async () => {
  setupUsecases({ isAdmin: false, reviews: REVIEWS });

  render(<ReviewsList />);
  expect(await screen.findByText(/all reviews/i)).toBeInTheDocument();

  // Search for "discovery" (matches Daft Punk review)
  fireEvent.change(screen.getByLabelText(/^search$/i), { target: { value: 'discovery' } });

  // Assert the *review title* (avoid matching option/span text too)
  expect(await screen.findByRole('heading', { level: 5, name: 'Discovery' })).toBeInTheDocument();

  expect(
    screen.queryByRole('heading', { level: 5, name: 'A Kid A Review' }),
  ).not.toBeInTheDocument();

  // Min rating 4+ => Discovery(3) should disappear
  fireEvent.change(screen.getByLabelText(/min rating/i), { target: { value: '4' } });
  expect(await screen.findByText(/no reviews match your filters/i)).toBeInTheDocument();

  // Clear filters returns all
  fireEvent.click(screen.getByRole('button', { name: /clear filters/i }));
  expect(
    await screen.findByRole('heading', { level: 5, name: 'A Kid A Review' }),
  ).toBeInTheDocument();

  // Artist filter: Radiohead only
  fireEvent.change(screen.getByLabelText(/^artist$/i), { target: { value: 'Radiohead' } });
  expect(
    await screen.findByRole('heading', { level: 5, name: 'A Kid A Review' }),
  ).toBeInTheDocument();
  expect(screen.queryByRole('heading', { level: 5, name: 'Discovery' })).not.toBeInTheDocument();

  // Album filter: OK Computer only
  fireEvent.change(screen.getByLabelText(/^album$/i), { target: { value: 'OK Computer' } });
  expect(await screen.findByRole('heading', { level: 5, name: 'OK Computer' })).toBeInTheDocument();
  expect(
    screen.queryByRole('heading', { level: 5, name: 'A Kid A Review' }),
  ).not.toBeInTheDocument();
});

test('sorting: rating high->low changes order', async () => {
  setupUsecases({ reviews: REVIEWS });

  render(<ReviewsList />);
  expect(await screen.findByText(/all reviews/i)).toBeInTheDocument();

  fireEvent.change(screen.getByLabelText(/^sort$/i), { target: { value: 'rating_desc' } });

  const titles = screen.getAllByRole('heading', { level: 5 }).map((h) => h.textContent);

  // rating_desc => 5 first, then 4, then 3
  expect(titles[0]).toBe('A Kid A Review');
  expect(titles[1]).toBe('OK Computer');
  expect(titles[2]).toBe('Discovery');
});

test('renders error state when listReviews fails', async () => {
  setupUsecases({ listThrows: true });

  render(<ReviewsList />);

  expect(await screen.findByText(/error:\s*nope/i)).toBeInTheDocument();
});

test('getMe failure does not break page and keeps non-admin', async () => {
  setupUsecases({ getMeThrows: true, reviews: REVIEWS });

  render(<ReviewsList />);

  expect(await screen.findByText(/all reviews/i)).toBeInTheDocument();
  expect(screen.queryByRole('button', { name: /delete/i })).not.toBeInTheDocument();
});
