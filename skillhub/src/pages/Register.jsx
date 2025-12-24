import { useState } from 'react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '../lib/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { useNavigate, Link } from 'react-router-dom';

export default function Register() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: 'client' // Default role
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      // 1. Create User in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      const user = userCredential.user;

      // 2. Create User Document in Firestore (Matching SDD User Entity)
      // We use the Auth UID as the Document ID for easy lookup
      await setDoc(doc(db, "users", user.uid), {
        email: user.email,
        role: formData.role,
        isActive: true,
        createdAt: new Date()
      });

      alert("Account created!");
      navigate('/dashboard');
      
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded shadow-md w-96">
        <h2 className="text-2xl font-bold mb-6 text-center text-primary">Join SkillHub</h2>
        
        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">I want to be a:</label>
            <select 
              className="mt-1 block w-full p-2 border border-gray-300 rounded"
              value={formData.role}
              onChange={(e) => setFormData({...formData, role: e.target.value})}
            >
              <option value="client">Client (I want to hire)</option>
              <option value="freelancer">Freelancer (I want to work)</option>
            </select>
          </div>

          <div>
            <input 
              type="email" 
              placeholder="Email" 
              className="w-full p-2 border border-gray-300 rounded"
              required
              onChange={(e) => setFormData({...formData, email: e.target.value})}
            />
          </div>

          <div>
            <input 
              type="password" 
              placeholder="Password" 
              className="w-full p-2 border border-gray-300 rounded"
              required
              onChange={(e) => setFormData({...formData, password: e.target.value})}
            />
          </div>

          <button type="submit" className="w-full bg-primary text-white p-2 rounded hover:bg-blue-700">
            Sign Up
          </button>
        </form>

        <p className="mt-4 text-center text-sm">
          Already have an account? <Link to="/login" className="text-primary">Login</Link>
        </p>
      </div>
    </div>
  );
}