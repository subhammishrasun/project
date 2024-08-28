import React, { useEffect, useState } from 'react';
import axios from 'axios';
import VideoPlayer from './VideoPlayer';

const VideoList = () => {
  const [videos, setVideos] = useState([]);
  const userId = 'someUserId'; // Replace with actual user ID

  useEffect(() => {
    axios.get('http://localhost:3001/videos')
      .then(response => {
        setVideos(response.data);
      })
      .catch(error => {
        console.error('Error fetching videos:', error);
      });
  }, []);

  const handleProgress = (videoId, currentTime) => {
    axios.post('http://localhost:3001/progress', { userId, videoId, currentTime }, {
      headers: {
        'Content-Type': 'application/json'
      }
    })
    .then(response => {
      console.log('Progress saved:', response.data);
    })
    .catch(error => {
      console.error('Error saving progress:', error);
    });
  };

  const handleSubmit = () => {
    // Example of performing an action on submit, e.g., submitting all video progress
    console.log('Submit button clicked');

    // Example: Send the list of videos or their progress to the server
    // This can be modified based on the actual requirements
    const progressData = videos.map(video => ({
      videoId: video._id,
      currentTime: video.currentTime // You need to have currentTime or manage it differently
    }));

    axios.post('http://localhost:3001/submit-videos', { userId, progressData }, {
      headers: {
        'Content-Type': 'application/json'
      }
    })
    .then(response => {
      console.log('Videos submitted:', response.data);
    })
    .catch(error => {
      console.error('Error submitting videos:', error);
    });
  };

  return (
    <div>
      <ul>
        {videos.map(video => (
          <li key={video._id}>
            <VideoPlayer
              videoUrl={video.url}
              videoId={video._id}
              userId={userId}
              onProgress={handleProgress}
            />
          </li>
        ))}
      </ul>
      <button onClick={handleSubmit}>Submit Videos</button>
    </div>
  );
};

export default VideoList;
