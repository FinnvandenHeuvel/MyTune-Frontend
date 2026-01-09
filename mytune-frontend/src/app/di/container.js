import { createHttpClient } from '../../data/http/httpClient';
import { createBackendAuthGateway } from '../../data/gateways/backendAuthGateway';
import { createBackendProfileGateway } from '../../data/gateways/backendProfileGateway';
import { createBackendReviewsGateway } from '../../data/gateways/backendReviewsGateway';
import { createSpotifyGateway } from '../../data/gateways/spotifyGateway';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

export const container = (() => {
  const http = createHttpClient({ apiBaseUrl: API_BASE_URL });

  const authGateway = createBackendAuthGateway({ http });
  const profileGateway = createBackendProfileGateway({ http });
  const reviewsGateway = createBackendReviewsGateway({ http, apiBaseUrl: API_BASE_URL });

  const spotifyGateway = createSpotifyGateway();

  return { API_BASE_URL, http, authGateway, profileGateway, reviewsGateway, spotifyGateway };
})();
