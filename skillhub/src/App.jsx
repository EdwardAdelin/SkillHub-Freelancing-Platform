import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';

// Import Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import PostJob from './pages/PostJob';
import JobSearch from './pages/JobSearch';
import JobDetails from './pages/JobDetails';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50 text-secondary">
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/post-job" element={<PostJob />} />
          <Route path="/jobs" element={<JobSearch />} />
          {/* Dynamic route for specific jobs */}
          <Route path="/jobs/:id" element={<JobDetails />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;