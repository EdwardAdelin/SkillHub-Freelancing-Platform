import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { db } from '../lib/firebase';
import { doc, getDoc, collection, addDoc, query, getDocs, orderBy } from 'firebase/firestore';
import { useAuth } from '../lib/AuthContext';
import { Clock, DollarSign, Calendar, User, Send, Mail } from 'lucide-react';

export default function JobDetails() {
  const { id } = useParams(); // Get the job ID from the URL
  const { user } = useAuth();
  const navigate = useNavigate();

  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [proposals, setProposals] = useState([]);
  
  // Proposal Form State
  const [bidAmount, setBidAmount] = useState('');
  const [deliveryTime, setDeliveryTime] = useState('');
  const [coverLetter, setCoverLetter] = useState('');

  // 1. Fetch Job Details
  useEffect(() => {
    const fetchJobData = async () => {
      try {
        const docRef = doc(db, "jobs", id);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          setJob({ id: docSnap.id, ...docSnap.data() });
          
          // If the current user is the CLIENT who posted this, fetch the proposals
          if (user && docSnap.data().clientId === user.uid) {
            fetchProposals();
          }
        } else {
          alert("Job not found");
          navigate('/jobs');
        }
      } catch (error) {
        console.error("Error fetching job:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchJobData();
  }, [id, user, navigate]);

  // 2. Fetch Proposals (Sub-collection) - Only for the Job Owner
  const fetchProposals = async () => {
    const q = query(collection(db, "jobs", id, "proposals"), orderBy("submittedAt", "desc"));
    const querySnapshot = await getDocs(q);
    const proposalsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setProposals(proposalsData);
  };

  // 3. Handle Proposal Submission (FR6)
  const handleSubmitProposal = async (e) => {
    e.preventDefault();
    if (!user) return alert("Please login to submit a proposal");

    try {
      // Save to 'proposals' sub-collection inside this job
      await addDoc(collection(db, "jobs", id, "proposals"), {
      freelancerId: user.uid,
      freelancerName: user.displayName || user.email,
      freelancerEmail: user.email, // <--- ADD THIS LINE (Important for messaging)
      bidAmount: Number(bidAmount),
      deliveryTime: Number(deliveryTime),
      coverLetter: coverLetter,
      submittedAt: new Date(),
      status: 'pending' 
      });

      alert("Proposal submitted successfully!");
      navigate('/dashboard');
    } catch (error) {
      console.error("Error submitting proposal:", error);
      alert("Failed to submit proposal");
    }
  };

  if (loading) return <div className="p-10 text-center">Loading Job Details...</div>;
  if (!job) return null;

  const isOwner = user?.uid === job.clientId;
  const isFreelancer = user?.role === 'freelancer';

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="container mx-auto max-w-4xl">
        
        {/* Job Header Card */}
        <div className="bg-white p-8 rounded-lg shadow-sm mb-6 border-t-4 border-primary">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{job.title}</h1>
          <div className="flex flex-wrap gap-6 text-sm text-gray-600 mb-6">
             <span className="flex items-center gap-2 bg-blue-50 text-blue-700 px-3 py-1 rounded-full font-medium">
               {job.category}
             </span>
             <span className="flex items-center gap-1"><Clock size={18} /> Posted {job.postedAt?.toDate().toLocaleDateString()}</span>
             <span className="flex items-center gap-1 font-bold text-green-700"><DollarSign size={18} /> Budget: ${job.budget}</span>
             <span className="flex items-center gap-1"><Calendar size={18} /> Due: {job.deadline}</span>
          </div>
          
          <h3 className="text-lg font-bold mb-2">Description</h3>
          <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{job.description}</p>
        </div>

        {/* SECTION A: CLIENT VIEW (See Proposals) */}
        {isOwner && (
          <div className="bg-white p-8 rounded-lg shadow-sm">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <User size={24} /> Received Proposals ({proposals.length})
            </h2>
            
            {proposals.length === 0 ? (
              <p className="text-gray-500 italic">No proposals yet. Waiting for freelancers...</p>
            ) : (
              <div className="space-y-4">
                {proposals.map(prop => (
                  <div key={prop.id} className="border p-4 rounded hover:bg-gray-50 transition">
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-bold text-lg text-primary">{prop.freelancerName}</span>
                      <span className="text-green-700 font-bold text-lg">${prop.bidAmount}</span>
                    </div>
                    <div className="text-sm text-gray-500 mb-2">Delivery in {prop.deliveryTime} days</div>
                    <p className="text-gray-700 bg-gray-100 p-3 rounded text-sm">{prop.coverLetter}</p>
                    {/* Inside the Proposals Map function... */}
                    <div className="mt-3 flex gap-2">
                      {/* MESSAGE BUTTON: Opens default mail app */}
                      <a 
                        href={`mailto:${prop.freelancerEmail}?subject=Regarding your proposal for: ${job.title}`}
                        className="bg-primary text-white px-3 py-1 rounded text-sm hover:bg-blue-700 flex items-center gap-1"
                      >
                        <Mail size={14} /> Message
                      </a>

                      {/* VIEW PROFILE BUTTON: Links to our new dynamic route */}
                      <Link 
                        to={`/profile/${prop.freelancerId}`}
                        className="border border-gray-300 px-3 py-1 rounded text-sm hover:bg-gray-200 text-gray-700 flex items-center gap-1"
                      >
                        <User size={14} /> View Profile
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* SECTION B: FREELANCER VIEW (Submit Proposal) */}
        {isFreelancer && (
          <div className="bg-white p-8 rounded-lg shadow-sm">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <Send size={24} /> Submit Your Proposal
            </h2>
            <form onSubmit={handleSubmitProposal} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Your Bid Price ($)</label>
                  <input 
                    type="number" 
                    required 
                    className="w-full p-2 border rounded mt-1"
                    value={bidAmount}
                    onChange={(e) => setBidAmount(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Delivery Time (Days)</label>
                  <input 
                    type="number" 
                    required 
                    className="w-full p-2 border rounded mt-1"
                    value={deliveryTime}
                    onChange={(e) => setDeliveryTime(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Cover Letter</label>
                <textarea 
                  rows="4" 
                  required 
                  className="w-full p-2 border rounded mt-1"
                  placeholder="Why are you the best fit for this job?"
                  value={coverLetter}
                  onChange={(e) => setCoverLetter(e.target.value)}
                ></textarea>
              </div>

              <button type="submit" className="w-full bg-green-600 text-white p-3 rounded font-bold hover:bg-green-700 shadow-lg transform transition hover:-translate-y-1">
                Submit Proposal
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}