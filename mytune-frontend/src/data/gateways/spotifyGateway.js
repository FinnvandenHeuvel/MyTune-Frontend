const CLIENT_ID = process.env.REACT_APP_SPOTIFY_CLIENT_ID;
const CLIENT_SECRET = process.env.REACT_APP_SPOTIFY_CLIENT_SECRET;

let accessToken = '';
let tokenExpiry = 0;

const getAccessToken = async () => {
  if (accessToken && Date.now() < tokenExpiry) return accessToken;

  const credentials = btoa(`${CLIENT_ID}:${CLIENT_SECRET}`);
  const response = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${credentials}`,
    },
    body: 'grant_type=client_credentials',
  });

  if (!response.ok) throw new Error('Failed to get access token');
  const data = await response.json();

  accessToken = data.access_token;
  tokenExpiry = Date.now() + data.expires_in * 1000;
  return accessToken;
};

export const createSpotifyGateway = () => ({
  searchArtists: async (artistName) => {
    const token = await getAccessToken();
    const res = await fetch(
      `https://api.spotify.com/v1/search?q=${encodeURIComponent(artistName)}&type=artist&limit=10`,
      { headers: { Authorization: `Bearer ${token}` } },
    );
    if (!res.ok) throw new Error('Failed to search artists');
    const data = await res.json();
    return data.artists.items;
  },

  getArtist: async (artistId) => {
    const token = await getAccessToken();
    const res = await fetch(`https://api.spotify.com/v1/artists/${artistId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error('Failed to fetch artist details');
    return res.json();
  },

  getArtistAlbums: async (artistId) => {
    const token = await getAccessToken();
    const res = await fetch(
      `https://api.spotify.com/v1/artists/${artistId}/albums?include_groups=album,single&limit=20`,
      { headers: { Authorization: `Bearer ${token}` } },
    );
    if (!res.ok) throw new Error('Failed to fetch albums');
    const data = await res.json();
    return data.items;
  },
});
