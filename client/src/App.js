import React, { useState, useEffect, useCallback } from 'react';
import './App.css';
import { SocialMediaEmbed } from 'react-social-media-embed';

const App = () => {
  const API_URL = '/api/records'; // Backend endpoint for fetching records

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
      setTimelineData((prev) => [...prev, ...data.records]);
      setOffset(data.offset || null); // Update offset for pagination
    } catch (err) {
      console.error('Error fetching records:', err.message);
      setError('Failed to fetch records.');
    } finally {
      setLoading(false);
    }
  }, [API_URL, offset]);

  // Fetch records on component mount
  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

  return (
    <div className="App">
      <h1>Genocide Archive Timeline</h1>
      <div className="timeline">
        {timelineData.length > 0 ? (
          timelineData.map((record, index) => (
            <div key={index} className="timeline-item">
              <div className="date">
                {record.fields.date ? `Date: ${record.fields.date}` : 'Date: Not provided'}
              </div>
              <h3>{record.fields.description || 'No description available.'}</h3>
              {record.fields.source_1 && (
                <SocialMediaEmbed url={record.fields.source_1} width={500} height={300} />
              )}
            </div>
          ))
        ) : (
          <p>No data available.</p>
        )}
      </div>
      {loading && <p>Loading...</p>}
      {error && <p className="error">{error}</p>}
      {offset && (
        <button className="load-more" onClick={fetchRecords}>
          Load More
        </button>
      )}
    </div>
  );
};

export default App;
