import { Link } from 'react-router-dom';

export default function Navbar() {
  return (
    <nav className="bg-primary text-white p-4 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold">SkillHub</Link>
        <div className="space-x-4">
          <Link to="/jobs" className="hover:text-gray-200">Find Work</Link>
          <Link to="/post-job" className="hover:text-gray-200">Post Job</Link>
          <Link to="/dashboard" className="hover:text-gray-200">Dashboard</Link>
          <Link to="/login" className="bg-white text-primary px-4 py-2 rounded font-bold">Login</Link>
        </div>
      </div>
    </nav>
  );
}