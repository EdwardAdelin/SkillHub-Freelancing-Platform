import { useEffect, useState } from 'react';
import { useAuth } from '../lib/AuthContext';
import { db } from '../lib/firebase';
import { collection, query, where, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { Link } from 'react-router-dom';
import { Trash2, PlusCircle } from 'lucide-react';

export default function Dashboard() {
  const { user } = useAuth();
  const [myJobs, setMyJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch Jobs specific to this Client
  useEffect(() => {
    if (user && user.role === 'client') {
      const fetchMyJobs = async () => {
        const q = query(collection(db, "jobs"), where("clientId", "==", user.uid));
        const querySnapshot = await getDocs(q);
        const jobsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setMyJobs(jobsData);
        setLoading(false);
      };
      fetchMyJobs();
    } else {
      setLoading(false); // If freelancer, stop loading
    }
  }, [user]);

  // Handle Delete (FR4)
  const handleDelete = async (jobId) => {
    if (confirm("Are you sure you want to delete this job?")) {
      await deleteDoc(doc(db, "jobs", jobId));
      setMyJobs(myJobs.filter(job => job.id !== jobId)); // Update UI locally
    }
  };

  if (!user) return <div className="p-10">Please login.</div>;

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
      <p className="text-gray-600 mb-8">Welcome back, <span className="font-semibold text-primary">{user.displayName || user.email}</span></p>

      {/* CLIENT VIEW */}
      {user.role === 'client' && (
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold">My Posted Jobs</h2>
            <Link to="/post-job" className="bg-primary text-white px-4 py-2 rounded flex items-center gap-2 hover:bg-blue-700">
              <PlusCircle size={18} /> Post New Job
            </Link>
          </div>

          {loading ? <p>Loading jobs...</p> : (
            <div className="grid gap-4">
              {myJobs.length === 0 ? (
                <div className="bg-white p-6 rounded shadow text-center text-gray-500">
                  You haven't posted any jobs yet.
                </div>
              ) : (
                myJobs.map(job => (
                  <div key={job.id} className="bg-white p-6 rounded shadow-md border-l-4 border-primary flex justify-between items-center">
                    <div>
                      <h3 className="text-xl font-bold text-gray-800">{job.title}</h3>
                      <p className="text-gray-500 text-sm mt-1">Posted on: {job.postedAt?.toDate().toLocaleDateString()}</p>
                      <div className="flex gap-4 mt-2 text-sm font-medium text-gray-600">
                        <span>Budget: ${job.budget}</span>
                        <span>Status: <span className="text-green-600 capitalize">{job.status}</span></span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      {/* Link to see details (Using the dynamic route we set up) */}
                      <Link to={`/jobs/${job.id}`} className="text-primary hover:underline">View</Link>
                      
                      <button 
                        onClick={() => handleDelete(job.id)} 
                        className="text-red-500 hover:bg-red-50 p-2 rounded"
                        title="Delete Job"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      )}

      {/* FREELANCER VIEW (Placeholder for now) */}
      {user.role === 'freelancer' && (
        <div className="bg-white p-10 rounded shadow text-center">
          <h2 className="text-xl font-bold mb-4">Find Work</h2>
          <p className="text-gray-600 mb-6">You are registered as a freelancer. Start browsing jobs to submit proposals.</p>
          <Link to="/jobs" className="bg-primary text-white px-6 py-3 rounded font-bold hover:bg-blue-700">
            Browse Available Jobs
          </Link>
        </div>
      )}
    </div>
  );
}