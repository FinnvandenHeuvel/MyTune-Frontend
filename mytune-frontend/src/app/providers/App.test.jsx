import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import App from '../App';

import { AuthContext } from './AuthProvider';

// 1) Mock AuthProvider/AuthContext so we can control auth state and functions
jest.mock('./AuthProvider', () => {
  const React = require('react');
  return {
    AuthProvider: ({ children }) => <>{children}</>,
    AuthContext: React.createContext({}),
  };
});

// 2) Mock pages/components so we only test App behavior (not UI internals)
jest.mock('../../presentation/components/reviews/ReviewsList', () => () => <div>REVIEWS_LIST</div>);

jest.mock('../../presentation/Pages/ArtistSearch', () => (props) => (
  <div>
    ARTIST_SEARCH
    <button onClick={() => props.onArtistSelect('artist-123')}>SELECT_ARTIST</button>
  </div>
));

jest.mock('../../presentation/Pages/ArtistDetailPage', () => (props) => (
  <div>
    ARTIST_DETAIL {props.artistId}
    <button onClick={props.onBack}>BACK_TO_SEARCH</button>
  </div>
));

jest.mock('../../presentation/Pages/Login', () => () => <div>LOGIN_PAGE</div>);
jest.mock('../../presentation/Pages/Register', () => () => <div>REGISTER_PAGE</div>);
jest.mock('../../presentation/Pages/Profile', () => () => <div>PROFILE_PAGE</div>);

function renderWithAuth(authValue) {
  return render(
    <AuthContext.Provider value={authValue}>
      <App />
    </AuthContext.Provider>,
  );
}

test('artist search -> select artist -> detail -> back goes to search', () => {
  renderWithAuth({
    isAuthenticated: false,
    setIsAuthenticated: jest.fn(),
    logout: jest.fn(),
  });

  // go to search
  fireEvent.click(screen.getByRole('button', { name: /search artists/i }));
  expect(screen.getByText('ARTIST_SEARCH')).toBeInTheDocument();

  // select an artist -> detail page shows with id
  fireEvent.click(screen.getByRole('button', { name: /select_artist/i }));
  expect(screen.getByText(/ARTIST_DETAIL/i)).toHaveTextContent('artist-123');

  // back -> returns to search
  fireEvent.click(screen.getByRole('button', { name: /back_to_search/i }));
  expect(screen.getByText('ARTIST_SEARCH')).toBeInTheDocument();
});
