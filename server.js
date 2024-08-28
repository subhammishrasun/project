const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json()); // Ensure Express can parse JSON requests

// MongoDB connection URI
const MONGO_URI = 'mongodb://localhost:27017/video-library';

// Connect to MongoDB
mongoose.connect(MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

const PORT = process.env.PORT || 3001;

// Define Video Schema
const videoSchema = new mongoose.Schema({
  title: String,
  url: String,
  order: Number
});

const Video = mongoose.model('Video', videoSchema);

// Define User Progress Schema
const progressSchema = new mongoose.Schema({
  userId: String,
  videoId: { type: mongoose.Schema.Types.ObjectId, ref: 'Video' }, // Correctly use ObjectId type
  currentTime: Number
});

const Progress = mongoose.model('Progress', progressSchema);

// Routes
app.get('/submit', async (req, res) => {
  try {
    const videos = await Video.find().sort({ order: 1 });
    res.json(videos);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/progress', async (req, res) => {
  const { userId, videoId, currentTime } = req.body;
  try {
    // Convert videoId to ObjectId
    const videoObjectId = new mongoose.Types.ObjectId(videoId);

    let progress = await Progress.findOne({ userId, videoId: videoObjectId });
    
    if (progress) {
      progress.currentTime = currentTime;
    } else {
      progress = new Progress({ userId, videoId: videoObjectId, currentTime });
    }
    
    await progress.save();
    res.json(progress);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get('/progress/:userId/:videoId', async (req, res) => {
  const { userId, videoId } = req.params;
  try {
    // Convert videoId to ObjectId
    const videoObjectId = new mongoose.Types.ObjectId(videoId);

    const progress = await Progress.findOne({ userId, videoId: videoObjectId });
    res.json(progress || { currentTime: 0 });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// New route for submitting all videos' progress
app.post('/submit-videos', async (req, res) => {
  const { userId, progressData } = req.body;
  try {
    if (!userId || !Array.isArray(progressData)) {
      return res.status(400).json({ message: 'Invalid input data' });
    }

    // Process each progress item
    const updates = progressData.map(async ({ videoId, currentTime }) => {
      try {
        const videoObjectId = new mongoose.Types.ObjectId(videoId);
        let progress = await Progress.findOne({ userId, videoId: videoObjectId });

        if (progress) {
          progress.currentTime = currentTime;
        } else {
          progress = new Progress({ userId, videoId: videoObjectId, currentTime });
        }
        
        return progress.save();
      } catch (error) {
        console.error(`Error updating progress for video ${videoId}:`, error);
        return null;
      }
    });

    // Wait for all updates to complete
    await Promise.all(updates);

    res.json({ message: 'All video progress submitted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
