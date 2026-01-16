import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Profile from '../Pages/Profile';
import { AuthContext } from '../../app/providers/AuthProvider';

import { getMe } from '../../application/usecases/profile/getMe';
import { getMyReviews } from '../../application/usecases/profile/getMyReviews';

jest.mock('../../application/usecases/profile/getMe', () => ({ getMe: jest.fn() }));
jest.mock('../../application/usecases/profile/getMyReviews', () => ({ getMyReviews: jest.fn() }));

function setup({
  isAuthenticated,
  me,
  reviews,
  getMeThrows = false,
  getReviewsThrows = false,
} = {}) {
  const getMeFn = jest.fn();
  const getMyReviewsFn = jest.fn();

  if (getMeThrows) getMeFn.mockRejectedValue(new Error('Boom'));
  else
    getMeFn.mockResolvedValue(
      me ?? {
        username: 'testuser',
        email: 'test@example.com',
        date_joined: '2020-01-01T00:00:00Z',
      },
    );

  if (getReviewsThrows) getMyReviewsFn.mockRejectedValue(new Error('Nope'));
  else
    getMyReviewsFn.mockResolvedValue(
      reviews ?? [
        {
          id: 1,
          title: 'Nice',
          artist: 'Radiohead',
          album: 'Kid A',
          content: 'Great',
          rating: 5,
          created_at: '2020-02-01T00:00:00Z',
        },
      ],
    );

  getMe.mockReturnValue(getMeFn);
  getMyReviews.mockReturnValue(getMyReviewsFn);

  const setPage = jest.fn();

  render(
    <AuthContext.Provider value={{ isAuthenticated }}>
      <Profile setPage={setPage} />
    </AuthContext.Provider>,
  );

  return { setPage, getMeFn, getMyReviewsFn };
}

test('shows warning and can navigate to login when not authenticated', async () => {
  const { setPage } = setup({ isAuthenticated: false });

  expect(screen.getByText(/you must be logged in to view your profile/i)).toBeInTheDocument();

  fireEvent.click(screen.getByRole('button', { name: /go to login/i }));
  expect(setPage).toHaveBeenCalledWith('login');
});

test('loads and renders profile + my reviews when authenticated', async () => {
  setup({ isAuthenticated: true });

  // loading first
  expect(screen.getByText(/loading profile/i)).toBeInTheDocument();

  // then content
  expect(await screen.findByRole('heading', { level: 2, name: /profile/i })).toBeInTheDocument();
  expect(screen.getByText(/username:/i)).toBeInTheDocument();
  expect(screen.getByText(/email:/i)).toBeInTheDocument();

  // renders at least one review title
  expect(await screen.findByRole('heading', { level: 5, name: 'Nice' })).toBeInTheDocument();
});

test('shows empty state when authenticated but has no reviews', async () => {
  setup({ isAuthenticated: true, reviews: [] });

  expect(await screen.findByRole('heading', { level: 2, name: /profile/i })).toBeInTheDocument();
  expect(screen.getByText(/you haven’t posted any reviews yet/i)).toBeInTheDocument();
});

test('shows error state when profile loading fails', async () => {
  setup({ isAuthenticated: true, getMeThrows: true });

  expect(await screen.findByText(/boom/i)).toBeInTheDocument();
});
