import { useEffect, useState } from 'react';
import { useAuth } from '../lib/AuthContext';
import { db } from '../lib/firebase';
import { collection, query, where, getDocs, deleteDoc, doc, collectionGroup, getDoc, updateDoc } from 'firebase/firestore'; // Added updateDoc
import { Link } from 'react-router-dom';
import { Trash2, PlusCircle, Briefcase, Clock, FileText, CheckSquare, CheckCircle } from 'lucide-react';

export default function Dashboard() {
  const { user } = useAuth();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const fetchData = async () => {
      try {
        if (user.role === 'client') {
          // CLIENT FETCH
          const q = query(collection(db, "jobs"), where("clientId", "==", user.uid));
          const querySnapshot = await getDocs(q);
          setData(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        } 
        else if (user.role === 'freelancer') {
          // FREELANCER FETCH
          const q = query(collectionGroup(db, 'proposals'), where('freelancerId', '==', user.uid));
          const querySnapshot = await getDocs(q);
          
          const bids = await Promise.all(querySnapshot.docs.map(async (proposalDoc) => {
            const proposalData = proposalDoc.data();
            const jobDocRef = proposalDoc.ref.parent.parent; 
            let jobTitle = "Unknown Job";
            let jobStatus = "unknown";
            
            if (jobDocRef) {
              const jobSnap = await getDoc(jobDocRef);
              if (jobSnap.exists()) {
                 const jobData = jobSnap.data();
                 jobTitle = jobData.title;
                 jobStatus = jobData.status; // Get real job status
              }
            }
            return {
              id: proposalDoc.id,
              jobId: jobDocRef?.id,
              jobTitle,
              jobStatus,
              ...proposalData
            };
          }));
          setData(bids);
        }
      } catch (error) {
        console.error("Error loading dashboard:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  // Handle Delete (Client)
  const handleDelete = async (jobId) => {
    if (confirm("Are you sure you want to delete this job?")) {
      await deleteDoc(doc(db, "jobs", jobId));
      setData(data.filter(item => item.id !== jobId));
    }
  };

  // --- NEW FUNCTION: Mark Job as Finished (Freelancer) ---
  const handleFinishJob = async (jobId) => {
    if (!confirm("Are you sure you want to mark this job as completed?")) return;
    try {
      const jobRef = doc(db, "jobs", jobId);
      await updateDoc(jobRef, { status: 'completed' });
      
      // Update local state to reflect change immediately
      setData(data.map(item => item.jobId === jobId ? {...item, jobStatus: 'completed'} : item));
      
      alert("Great job! This project is now marked as completed.");
    } catch (error) {
      console.error("Error finishing job:", error);
      alert("Failed to update status.");
    }
  };

  if (!user) return <div className="p-10">Please login.</div>;

  return (
    <div className="container mx-auto p-6 min-h-screen">
      <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
      <p className="text-gray-600 mb-8">
        Welcome back, <span className="font-semibold text-primary">{user.displayName || user.email}</span>
        <span className="ml-2 bg-gray-200 text-xs px-2 py-1 rounded uppercase font-bold text-gray-600">{user.role}</span>
      </p>

      {/* --- CLIENT VIEW --- */}
      {user.role === 'client' && (
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold flex items-center gap-2"><Briefcase /> My Posted Jobs</h2>
            <Link to="/post-job" className="bg-primary text-white px-4 py-2 rounded flex items-center gap-2 hover:bg-blue-700 shadow">
              <PlusCircle size={18} /> Post New Job
            </Link>
          </div>

          {loading ? <p>Loading jobs...</p> : (
            <div className="grid gap-4">
              {data.map(job => (
                <div key={job.id} className={`bg-white p-6 rounded shadow-sm border-l-4 flex justify-between items-center
                  ${job.status === 'completed' ? 'border-gray-500 opacity-75' : job.status === 'in_progress' ? 'border-blue-500' : 'border-green-500'}`}>
                  
                  <div>
                    <h3 className="text-xl font-bold text-gray-800">{job.title}</h3>
                    <div className="flex gap-4 mt-2 text-sm text-gray-600">
                      <span className="font-medium text-green-700">Budget: ${job.budget}</span>
                      <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wide
                        ${job.status === 'open' ? 'bg-green-100 text-green-800' : 
                          job.status === 'in_progress' ? 'bg-blue-100 text-blue-800' : 'bg-gray-200 text-gray-700'}`}>
                        {job.status.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <Link to={`/jobs/${job.id}`} className="text-primary hover:underline font-medium">View Details</Link>
                    <button onClick={() => handleDelete(job.id)} className="text-red-500 hover:bg-red-50 p-2 rounded"><Trash2 size={20} /></button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* --- FREELANCER VIEW --- */}
      {user.role === 'freelancer' && (
        <div>
           <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold flex items-center gap-2"><FileText /> My Active Proposals</h2>
            <Link to="/jobs" className="bg-primary text-white px-4 py-2 rounded flex items-center gap-2 hover:bg-blue-700 shadow"><PlusCircle size={18} /> Find Work</Link>
          </div>

          {loading ? <p>Loading...</p> : (
            <div className="grid gap-4">
              {data.map(bid => (
                <div key={bid.id} className={`bg-white p-6 rounded shadow-sm border border-gray-100 hover:shadow-md transition
                  ${bid.jobStatus === 'completed' ? 'bg-gray-50' : ''}`}>
                  
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-bold text-gray-800 mb-1">
                         <Link to={`/jobs/${bid.jobId}`} className="hover:underline">{bid.jobTitle}</Link>
                      </h3>
                      
                      {/* STATUS BADGES */}
                      <div className="flex gap-2 mt-2">
                        {/* 1. Proposal Status */}
                        <span className={`px-2 py-1 rounded text-xs font-bold uppercase
                           ${bid.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                             bid.status === 'accepted' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                           Bid: {bid.status}
                        </span>

                        {/* 2. Job Progress Status (Only if accepted) */}
                        {bid.status === 'accepted' && (
                          <span className={`px-2 py-1 rounded text-xs font-bold uppercase
                            ${bid.jobStatus === 'completed' ? 'bg-gray-200 text-gray-600' : 'bg-blue-100 text-blue-800'}`}>
                            Project: {(bid.jobStatus || '').replace('_', ' ')}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* ACTION BUTTONS */}
                    <div className="text-right">
                       {/* If Bid is Accepted AND Job is NOT completed yet -> Show Finish Button */}
                       {bid.status === 'accepted' && bid.jobStatus !== 'completed' && (
                         <button 
                           onClick={() => handleFinishJob(bid.jobId)}
                           className="bg-blue-600 text-white px-4 py-2 rounded font-bold text-sm hover:bg-blue-700 flex items-center gap-2 shadow-sm"
                         >
                           <CheckSquare size={16} /> Mark Finished
                         </button>
                       )}
                       
                       {bid.jobStatus === 'completed' && (
                         <span className="text-gray-500 text-sm font-medium flex items-center gap-1">
                           <CheckCircle size={16} /> Completed
                         </span>
                       )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}