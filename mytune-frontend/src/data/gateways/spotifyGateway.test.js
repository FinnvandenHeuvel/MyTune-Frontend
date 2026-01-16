// spotifyGateway.test.js

function mockFetchResponse({ ok = true, status = 200, jsonData } = {}) {
  return {
    ok,
    status,
    json: jest.fn().mockResolvedValue(jsonData),
  };
}

describe('spotifyGateway', () => {
  beforeEach(() => {
    jest.resetModules(); // IMPORTANT: reset module state (accessToken/tokenExpiry)
    global.fetch = jest.fn();
    process.env.REACT_APP_SPOTIFY_CLIENT_ID = 'CID';
    process.env.REACT_APP_SPOTIFY_CLIENT_SECRET = 'CSECRET';
    global.btoa = (s) => Buffer.from(s, 'utf8').toString('base64'); // JSDOM often has btoa, but this makes it safe
  });

  afterEach(() => {
    delete process.env.REACT_APP_SPOTIFY_CLIENT_ID;
    delete process.env.REACT_APP_SPOTIFY_CLIENT_SECRET;
  });

  test('searchArtists: fetches token then searches and returns artists items', async () => {
    // 1) token fetch
    global.fetch.mockResolvedValueOnce(
      mockFetchResponse({
        ok: true,
        jsonData: { access_token: 'TOKEN', expires_in: 3600 },
      }),
    );

    // 2) search fetch
    global.fetch.mockResolvedValueOnce(
      mockFetchResponse({
        ok: true,
        jsonData: { artists: { items: [{ id: 'a1' }, { id: 'a2' }] } },
      }),
    );

    const { createSpotifyGateway } = await import('./spotifyGateway');
    const gw = createSpotifyGateway();

    const result = await gw.searchArtists('Daft Punk');

    expect(result).toEqual([{ id: 'a1' }, { id: 'a2' }]);
    expect(global.fetch).toHaveBeenCalledTimes(2);

    // token call
    expect(global.fetch.mock.calls[0][0]).toBe('https://accounts.spotify.com/api/token');
    expect(global.fetch.mock.calls[0][1]).toMatchObject({
      method: 'POST',
      headers: expect.objectContaining({
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: expect.stringMatching(/^Basic\s+/),
      }),
      body: 'grant_type=client_credentials',
    });

    // search call (ensure URL uses encodeURIComponent)
    const [searchUrl, searchOpts] = global.fetch.mock.calls[1];
    expect(searchUrl).toBe('https://api.spotify.com/v1/search?q=Daft%20Punk&type=artist&limit=10');
    expect(searchOpts).toEqual({
      headers: { Authorization: 'Bearer TOKEN' },
    });
  });

  test('getArtist: uses token then fetches artist details', async () => {
    global.fetch.mockResolvedValueOnce(
      mockFetchResponse({
        ok: true,
        jsonData: { access_token: 'TOKEN', expires_in: 3600 },
      }),
    );
    global.fetch.mockResolvedValueOnce(
      mockFetchResponse({
        ok: true,
        jsonData: { id: 'artist-1', name: 'Artist' },
      }),
    );

    const { createSpotifyGateway } = await import('./spotifyGateway');
    const gw = createSpotifyGateway();

    const result = await gw.getArtist('artist-1');

    expect(result).toEqual({ id: 'artist-1', name: 'Artist' });
    expect(global.fetch).toHaveBeenCalledTimes(2);

    expect(global.fetch.mock.calls[1][0]).toBe('https://api.spotify.com/v1/artists/artist-1');
    expect(global.fetch.mock.calls[1][1]).toEqual({
      headers: { Authorization: 'Bearer TOKEN' },
    });
  });

  test('getArtistAlbums: returns items array', async () => {
    global.fetch.mockResolvedValueOnce(
      mockFetchResponse({
        ok: true,
        jsonData: { access_token: 'TOKEN', expires_in: 3600 },
      }),
    );
    global.fetch.mockResolvedValueOnce(
      mockFetchResponse({
        ok: true,
        jsonData: { items: [{ id: 'alb1' }, { id: 'alb2' }] },
      }),
    );

    const { createSpotifyGateway } = await import('./spotifyGateway');
    const gw = createSpotifyGateway();

    const result = await gw.getArtistAlbums('artist-1');

    expect(result).toEqual([{ id: 'alb1' }, { id: 'alb2' }]);
    expect(global.fetch).toHaveBeenCalledTimes(2);

    expect(global.fetch.mock.calls[1][0]).toBe(
      'https://api.spotify.com/v1/artists/artist-1/albums?include_groups=album,single&limit=20',
    );
    expect(global.fetch.mock.calls[1][1]).toEqual({
      headers: { Authorization: 'Bearer TOKEN' },
    });
  });

  test('reuses cached token (does not call token endpoint twice when not expired)', async () => {
    // token fetch only once
    global.fetch.mockResolvedValueOnce(
      mockFetchResponse({
        ok: true,
        jsonData: { access_token: 'TOKEN', expires_in: 3600 },
      }),
    );

    // two API calls after token
    global.fetch.mockResolvedValueOnce(
      mockFetchResponse({
        ok: true,
        jsonData: { artists: { items: [] } },
      }),
    );
    global.fetch.mockResolvedValueOnce(
      mockFetchResponse({
        ok: true,
        jsonData: { id: 'artist-1' },
      }),
    );

    const { createSpotifyGateway } = await import('./spotifyGateway');
    const gw = createSpotifyGateway();

    await gw.searchArtists('X');
    await gw.getArtist('artist-1');

    expect(global.fetch).toHaveBeenCalledTimes(3);

    // first call was token, then search, then getArtist
    expect(global.fetch.mock.calls[0][0]).toBe('https://accounts.spotify.com/api/token');
    expect(global.fetch.mock.calls[1][0]).toContain('https://api.spotify.com/v1/search');
    expect(global.fetch.mock.calls[2][0]).toBe('https://api.spotify.com/v1/artists/artist-1');
  });

  test('throws when token endpoint fails', async () => {
    global.fetch.mockResolvedValueOnce(mockFetchResponse({ ok: false, status: 400, jsonData: {} }));

    const { createSpotifyGateway } = await import('./spotifyGateway');
    const gw = createSpotifyGateway();

    await expect(gw.searchArtists('X')).rejects.toThrow('Failed to get access token');
  });

  test('throws when search artists fails', async () => {
    global.fetch.mockResolvedValueOnce(
      mockFetchResponse({
        ok: true,
        jsonData: { access_token: 'TOKEN', expires_in: 3600 },
      }),
    );
    global.fetch.mockResolvedValueOnce(mockFetchResponse({ ok: false, status: 500, jsonData: {} }));

    const { createSpotifyGateway } = await import('./spotifyGateway');
    const gw = createSpotifyGateway();

    await expect(gw.searchArtists('X')).rejects.toThrow('Failed to search artists');
  });
});
