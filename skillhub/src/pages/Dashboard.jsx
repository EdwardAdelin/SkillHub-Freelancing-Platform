import { useEffect, useState } from 'react';
import { useAuth } from '../lib/AuthContext';
import { db } from '../lib/firebase';
import { collection, query, where, getDocs, deleteDoc, doc, collectionGroup, getDoc } from 'firebase/firestore';
import { Link } from 'react-router-dom';
import { Trash2, PlusCircle, Briefcase, Clock, FileText } from 'lucide-react';

export default function Dashboard() {
  const { user } = useAuth();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      try {
        if (user.role === 'client') {
          // --- CLIENT: Fetch Jobs I Posted ---
          const q = query(collection(db, "jobs"), where("clientId", "==", user.uid));
          const querySnapshot = await getDocs(q);
          const jobsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          setData(jobsData);
        } 
        else if (user.role === 'freelancer') {
          // --- FREELANCER: Fetch Proposals I Submitted (Collection Group Query) ---
          // NOTE: If you get an error in Console, click the link provided to create an Index.
          const q = query(collectionGroup(db, 'proposals'), where('freelancerId', '==', user.uid));
          const querySnapshot = await getDocs(q);
          
          // We need to fetch the parent Job Title for each proposal to make it readable
          const bids = await Promise.all(querySnapshot.docs.map(async (proposalDoc) => {
            const proposalData = proposalDoc.data();
            
            // The proposal doc ref has a parent (proposals col) and a grandparent (job doc)
            const jobDocRef = proposalDoc.ref.parent.parent; 
            let jobTitle = "Unknown Job";
            
            if (jobDocRef) {
              const jobSnap = await getDoc(jobDocRef);
              if (jobSnap.exists()) jobTitle = jobSnap.data().title;
            }

            return {
              id: proposalDoc.id,
              jobId: jobDocRef?.id, // ID of the job
              jobTitle: jobTitle,
              ...proposalData
            };
          }));
          
          setData(bids);
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  // Handle Delete (Clients only)
  const handleDelete = async (jobId) => {
    if (confirm("Are you sure you want to delete this job?")) {
      await deleteDoc(doc(db, "jobs", jobId));
      setData(data.filter(item => item.id !== jobId));
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
              {data.length === 0 ? (
                <div className="bg-white p-8 rounded shadow text-center text-gray-500">
                  You haven't posted any jobs yet.
                </div>
              ) : (
                data.map(job => (
                  <div key={job.id} className="bg-white p-6 rounded shadow-sm border-l-4 border-primary flex justify-between items-center hover:shadow-md transition">
                    <div>
                      <h3 className="text-xl font-bold text-gray-800">{job.title}</h3>
                      <div className="flex gap-4 mt-2 text-sm text-gray-600">
                        <span className="flex items-center gap-1"><Clock size={14}/> Posted: {job.postedAt?.toDate().toLocaleDateString()}</span>
                        <span className="font-medium text-green-700">Budget: ${job.budget}</span>
                        <span className={`px-2 py-0.5 rounded text-xs font-bold capitalize ${job.status === 'open' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                          {job.status}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <Link to={`/jobs/${job.id}`} className="text-primary hover:underline font-medium">View Proposals</Link>
                      <button onClick={() => handleDelete(job.id)} className="text-red-500 hover:bg-red-50 p-2 rounded">
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

      {/* --- FREELANCER VIEW --- */}
      {user.role === 'freelancer' && (
        <div>
           <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold flex items-center gap-2"><FileText /> My Active Proposals</h2>
            <Link to="/jobs" className="bg-primary text-white px-4 py-2 rounded flex items-center gap-2 hover:bg-blue-700 shadow">
              <Search size={18} /> Find More Work
            </Link>
          </div>

          {loading ? <p>Loading your proposals...</p> : (
            <div className="grid gap-4">
              {data.length === 0 ? (
                <div className="bg-white p-8 rounded shadow text-center text-gray-500">
                  You haven't submitted any proposals yet.
                </div>
              ) : (
                data.map(bid => (
                  <div key={bid.id} className="bg-white p-6 rounded shadow-sm border border-gray-100 hover:shadow-md transition">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-lg font-bold text-gray-800 mb-1">
                          Application for: <Link to={`/jobs/${bid.jobId}`} className="text-primary hover:underline">{bid.jobTitle}</Link>
                        </h3>
                        <p className="text-sm text-gray-500 mb-3 line-clamp-1">{bid.coverLetter}</p>
                        
                        <div className="flex gap-4 text-sm">
                           <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded font-medium">My Bid: ${bid.bidAmount}</span>
                           <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded">Delivery: {bid.deliveryTime} Days</span>
                        </div>
                      </div>

                      <div className="text-right">
                         <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide
                           ${bid.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                             bid.status === 'accepted' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                           {bid.status}
                         </span>
                         <div className="text-xs text-gray-400 mt-2">
                           {bid.submittedAt?.toDate().toLocaleDateString()}
                         </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Helper component for Search Icon
function Search({ size = 24 }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8"></circle>
      <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
    </svg>
  );
}