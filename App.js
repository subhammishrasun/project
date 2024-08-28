import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import VideoList from './components/videoList'; // Import the VideoList component

const App = () => {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<VideoList />} />
          {/* Additional routes can be added here */}
          
        </Routes>
      </div>
    </Router>
  );
};

export default App;
