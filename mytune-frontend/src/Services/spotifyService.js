const CLIENT_ID = process.env.REACT_APP_SPOTIFY_CLIENT_ID;
const CLIENT_SECRET = process.env.REACT_APP_SPOTIFY_CLIENT_SECRET;

let accessToken = '';
let tokenExpiry = 0;

// Get access token
export const getAccessToken = async () => {
    // Return existing token if still valid
    if (accessToken && Date.now() < tokenExpiry) {
        return accessToken;
    }

    const credentials = btoa(`${CLIENT_ID}:${CLIENT_SECRET}`);

    const response = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': `Basic ${credentials}`
        },
        body: 'grant_type=client_credentials'
    });

    if (!response.ok) {
        throw new Error('Failed to get access token');
    }

    const data = await response.json();
    accessToken = data.access_token;
    tokenExpiry = Date.now() + (data.expires_in * 1000); // Convert to milliseconds

    return accessToken;
};

// Search for artists
export const searchArtist = async (artistName) => {
    const token = await getAccessToken();

    const response = await fetch(
        `https://api.spotify.com/v1/search?q=${encodeURIComponent(artistName)}&type=artist&limit=10`,
        {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        }
    );

    if (!response.ok) {
        throw new Error('Failed to search artists');
    }

    const data = await response.json();
    return data.artists.items;
};

// Get artist details
export const getArtist = async (artistId) => {
    const token = await getAccessToken();

    const response = await fetch(
        `https://api.spotify.com/v1/artists/${artistId}`,
        {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        }
    );

    if (!response.ok) {
        throw new Error('Failed to fetch artist details');
    }

    return response.json();
};

// Get artist's top tracks
export const getArtistTopTracks = async (artistId, market = 'US') => {
    const token = await getAccessToken();

    const response = await fetch(
        `https://api.spotify.com/v1/artists/${artistId}/top-tracks?market=${market}`,
        {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        }
    );

    if (!response.ok) {
        throw new Error('Failed to fetch top tracks');
    }

    const data = await response.json();
    return data.tracks;
};