import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import SubmitReview from '../components/reviews/SubmitReview';
import { AuthContext } from '../../app/providers/AuthProvider';

import { createReview } from '../../application/usecases/reviews/createReview';

jest.mock('../../application/usecases/reviews/createReview', () => ({
  createReview: jest.fn(),
}));

function renderWithAuth(isAuthenticated) {
  return render(
    <AuthContext.Provider value={{ isAuthenticated }}>
      <SubmitReview />
    </AuthContext.Provider>,
  );
}

test('unit: blocks submit when not authenticated', async () => {
  const submitFn = jest.fn();
  createReview.mockReturnValue(submitFn);

  renderWithAuth(false);

  fireEvent.change(screen.getByLabelText(/title/i), { target: { value: 'Great album' } });
  fireEvent.change(screen.getByLabelText(/artist/i), { target: { value: 'Radiohead' } });
  fireEvent.change(screen.getByLabelText(/content/i), { target: { value: 'Loved it' } });
  fireEvent.change(screen.getByLabelText(/rating/i), { target: { value: '4' } });

  // Click submit (button is type="submit"), avoids .closest('form')
  fireEvent.click(screen.getByRole('button', { name: /submit review/i }));

  expect(submitFn).not.toHaveBeenCalled();
  expect(await screen.findByText(/you must be logged in to submit a review/i)).toBeInTheDocument();
});

test('unit: submits review and resets form when authenticated', async () => {
  const submitFn = jest.fn().mockResolvedValue(undefined);
  createReview.mockReturnValue(submitFn);

  renderWithAuth(true);

  fireEvent.change(screen.getByLabelText(/title/i), { target: { value: 'Great album' } });
  fireEvent.change(screen.getByLabelText(/artist/i), { target: { value: 'Radiohead' } });
  fireEvent.change(screen.getByLabelText(/content/i), { target: { value: 'Loved it' } });
  fireEvent.change(screen.getByLabelText(/rating/i), { target: { value: '4' } });

  fireEvent.click(screen.getByRole('button', { name: /submit review/i }));

  await waitFor(() => {
    expect(submitFn).toHaveBeenCalledWith({
      title: 'Great album',
      artist: 'Radiohead',
      content: 'Loved it',
      rating: 4,
    });
  });

  expect(await screen.findByText(/review submitted successfully/i)).toBeInTheDocument();

  expect(screen.getByLabelText(/title/i)).toHaveValue('');
  expect(screen.getByLabelText(/artist/i)).toHaveValue('');
  expect(screen.getByLabelText(/content/i)).toHaveValue('');
  expect(screen.getByLabelText(/rating/i)).toHaveValue('5');
});

test('unit: shows error when createReviewUC throws', async () => {
  const submitFn = jest.fn().mockRejectedValue(new Error('Boom'));
  createReview.mockReturnValue(submitFn);

  renderWithAuth(true);

  fireEvent.change(screen.getByLabelText(/title/i), { target: { value: 'Great album' } });
  fireEvent.change(screen.getByLabelText(/artist/i), { target: { value: 'Radiohead' } });
  fireEvent.change(screen.getByLabelText(/content/i), { target: { value: 'Loved it' } });

  fireEvent.click(screen.getByRole('button', { name: /submit review/i }));

  expect(await screen.findByText(/error:\s*boom/i)).toBeInTheDocument();
});
