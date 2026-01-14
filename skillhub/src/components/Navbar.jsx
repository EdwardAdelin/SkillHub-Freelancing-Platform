import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/AuthContext';
import { signOut } from 'firebase/auth';
import { auth } from '../lib/firebase';

export default function Navbar() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/');
  };

  return (
    <nav className="bg-primary text-white p-4 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold">SkillHub</Link>
        
        <div className="flex items-center space-x-6">
          <Link to="/jobs" className="hover:text-gray-200">Browse Jobs</Link>
          
          {user ? (
            <>
              {/* Show different links based on Role */}
              {user.role === 'client' && (
                <Link to="/post-job" className="hover:text-gray-200">Post Job</Link>
              )}
              
              <Link to="/dashboard" className="hover:text-gray-200">Dashboard</Link>
              
              <div className="flex items-center space-x-3 ml-4">
                <Link to="/profile" className="text-sm font-semibold bg-blue-700 px-3 py-1 rounded">
                  {user.email.split('@')[0]}
                </Link>
                <button 
                  onClick={handleLogout} 
                  className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded text-sm font-bold transition"
                >
                  Logout
                </button>
              </div>
            </>
          ) : (
            <Link to="/login" className="bg-white text-primary px-4 py-2 rounded font-bold hover:bg-gray-100">
              Login
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}