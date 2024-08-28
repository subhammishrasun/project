import React, { useEffect, useRef } from 'react';
import videojs from 'video.js';
import 'video.js/dist/video-js.css';
import axios from 'axios';

const VideoPlayer = ({ videoUrl, videoId, userId, onProgress }) => {
  const videoRef = useRef(null);

  useEffect(() => {
    const videoElement = videoRef.current;
    if (!videoElement) return;

    // Initialize Video.js
    const player = videojs(videoElement, {
      controls: true,
      autoplay: false,
      preload: 'auto',
    });

    // Set the video source
    player.src({ type: 'video/mp4', src: videoUrl });

    // Fetch and set the last known position
    axios.get(`http://localhost:3001/progress/${userId}/${videoId}`)
      .then(response => {
        const { currentTime } = response.data;
        player.currentTime(currentTime);
      })
      .catch(error => {
        console.error('Error fetching progress:', error);
      });

    // Event listeners for time update and video end
    player.on('timeupdate', () => {
      const currentTime = player.currentTime();
      onProgress(videoId, currentTime);
    });

    player.on('ended', () => {
      onProgress(videoId, player.currentTime());
    });

    // Cleanup on component unmount
    return () => {
      if (player) {
        player.dispose();
      }
    };
  }, [videoUrl, videoId, userId, onProgress]);

  return (
    <div>
      <video
        ref={videoRef}
        id="video-player"
        className="video-js vjs-default-skin"
      />
    </div>
  );
};

export default VideoPlayer;
