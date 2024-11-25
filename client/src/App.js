import React, { useState, useEffect, useCallback } from 'react';
import './App.css';
import { SocialMediaEmbed } from 'react-social-media-embed';

const App = () => {
  const API_URL = '/api/records';

  const [timelineData, setTimelineData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [offset, setOffset] = useState(null);

  // Fetch data from the backend
  const fetchRecords = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const response = await fetch(`${API_URL}${offset ? `?offset=${offset}` : ''}`);
      if (!response.ok) {
        throw new Error(`Error fetching records: ${response.status}`);
      }
      const data = await response.json();

      console.log('Fetched Records:', data); // Debug log for fetched data

      setTimelineData((prev) => [...prev, ...(data.records || [])]);
      setOffset(data.offset || null);
    } catch (err) {
      console.error('Error fetching records:', err.message);
      setError('Failed to fetch records.');
    } finally {
      setLoading(false);
    }
  }, [API_URL, offset]);

  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

  return (
    <div className="App">
      <h1>Genocide Archive Timeline</h1>
      {loading && <p>Loading...</p>}
      {error && <p className="error">{error}</p>}

      <div className="timeline">
        {timelineData.length > 0 ? (
          timelineData.map((record, index) => {
            const fields = record.fields || {};
            const {
              latitude,
              longitude,
              description,
              date,
              tags,
              geolocation_resolution,
              sensitive,
              source_1,
              source_2,
              source_3,
              source_4,
              source_5,
              Incident_Type,
              Reported_Near,
              Impact,
            } = fields;

            return (
              <div key={index} className="timeline-item">
                <div className="date">{date ? `Date: ${date}` : 'Date: Not provided'}</div>
                <h3>{description || 'No description available.'}</h3>
                {latitude && longitude && (
                  <p>
                    Location: {latitude}, {longitude} ({geolocation_resolution || 'Unknown resolution'})
                  </p>
                )}
                {tags && tags.length > 0 && <p>Tags: {tags.join(', ')}</p>}
                <p>Sensitive: {sensitive || 'Not specified'}</p>
                {Incident_Type && Incident_Type.length > 0 && (
                  <p>Incident Type: {Incident_Type.join(', ')}</p>
                )}
                {Reported_Near && <p>Reported Near: {Reported_Near}</p>}
                {Impact && Impact.length > 0 && <p>Impact: {Impact.join(', ')}</p>}
                <div className="sources">
                  {[source_1, source_2, source_3, source_4, source_5].map(
                    (source, idx) =>
                      source && (
                        <div key={idx}>
                          <SocialMediaEmbed url={source} width={500} height={300} />
                        </div>
                      )
                  )}
                </div>
              </div>
            );
          })
        ) : (
          !loading && <p>No data available.</p>
        )}
      </div>

      {offset && !loading && (
        <button className="load-more" onClick={fetchRecords}>
          Load More
        </button>
      )}
    </div>
  );
};

export default App;
