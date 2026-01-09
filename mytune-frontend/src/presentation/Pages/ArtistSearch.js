import React, { useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { container } from '../../app/di/container';
import { searchArtists } from '../../application/usecases/spotify/searchArtists';

function ArtistSearch({ onArtistSelect }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [artists, setArtists] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const searchArtistsUC = useMemo(
    () => searchArtists({ spotifyGateway: container.spotifyGateway }),
    [],
  );

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    try {
      setLoading(true);
      setError('');
      const results = await searchArtistsUC(searchQuery);
      setArtists(results);
    } catch (err) {
      setError(err.message || 'Failed to search artists');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-5">
      <h2>Search for Artists</h2>

      <form onSubmit={handleSearch} className="mb-4">
        <div className="input-group">
          <input
            className="form-control"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button className="btn btn-primary" type="submit" disabled={loading}>
            {loading ? 'Searching...' : 'Search'}
          </button>
        </div>
      </form>

      {error && <div className="alert alert-danger">{error}</div>}

      <div className="row">
        {artists.map((artist) => (
          <div key={artist.id} className="col-md-4 mb-4">
            <div className="card h-100">
              {artist.images?.[0]?.url && (
                <img
                  src={artist.images[0].url}
                  className="card-img-top"
                  alt={artist.name}
                  style={{ height: '300px', objectFit: 'cover' }}
                />
              )}
              <div className="card-body d-flex flex-column">
                <h5 className="card-title">{artist.name}</h5>
                <p className="card-text">
                  <small className="text-muted">
                    {artist.followers?.total?.toLocaleString()} followers
                  </small>
                </p>
                <p className="card-text">
                  <small>{artist.genres?.slice(0, 3).join(', ')}</small>
                </p>
                <button
                  onClick={() => onArtistSelect(artist.id)}
                  className="btn btn-primary mt-auto w-100"
                >
                  View Details & Reviews
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

ArtistSearch.propTypes = {
  onArtistSelect: PropTypes.func.isRequired,
};

export default ArtistSearch;
