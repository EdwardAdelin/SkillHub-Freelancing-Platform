import { useState } from 'react';
import { useAuth } from '../lib/AuthContext';
import { db } from '../lib/firebase';
import { collection, addDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';

export default function PostJob() {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    budget: '',
    deadline: '',
    category: 'Development' // Default category
  });

  // Redirect if not logged in or not a client
  if (!user) return <div className="p-10">Please login to post a job.</div>;
  if (user.role !== 'client') return <div className="p-10 text-red-500">Only Clients can post jobs.</div>;

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Create the Job Document in 'jobs' collection
      await addDoc(collection(db, "jobs"), {
        ...formData,
        clientId: user.uid,           // Link to the user who posted it (FK in SDD)
        clientName: user.displayName || user.email,
        status: 'open',               // Default status (SDD)
        postedAt: new Date(),
        budget: Number(formData.budget) // Ensure it is stored as a number
      });

      alert("Job Posted Successfully!");
      navigate('/dashboard'); // Go back to dashboard to see it
    } catch (error) {
      console.error("Error posting job:", error);
      alert("Error posting job");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-10 flex justify-center">
      <div className="bg-white p-8 rounded shadow-md w-full max-w-2xl">
        <h1 className="text-3xl font-bold mb-6 text-primary">Post a New Job</h1>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">Job Title</label>
            <input 
              type="text" 
              className="w-full p-3 border rounded mt-1"
              placeholder="e.g. React Developer Needed for E-commerce Site"
              required
              onChange={(e) => setFormData({...formData, title: e.target.value})}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Budget ($)</label>
              <input 
                type="number" 
                className="w-full p-3 border rounded mt-1"
                placeholder="500"
                required
                onChange={(e) => setFormData({...formData, budget: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Deadline</label>
              <input 
                type="date" 
                className="w-full p-3 border rounded mt-1"
                required
                onChange={(e) => setFormData({...formData, deadline: e.target.value})}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Category</label>
            <select 
              className="w-full p-3 border rounded mt-1"
              onChange={(e) => setFormData({...formData, category: e.target.value})}
            >
              <option value="Development">Web Development</option>
              <option value="Design">Graphic Design</option>
              <option value="Marketing">Digital Marketing</option>
              <option value="Writing">Content Writing</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <textarea 
              rows="5" 
              className="w-full p-3 border rounded mt-1"
              placeholder="Describe the project details..."
              required
              onChange={(e) => setFormData({...formData, description: e.target.value})}
            ></textarea>
          </div>

          <button type="submit" className="w-full bg-primary text-white p-3 rounded font-bold hover:bg-blue-700 transition">
            Publish Job
          </button>
        </form>
      </div>
    </div>
  );
}