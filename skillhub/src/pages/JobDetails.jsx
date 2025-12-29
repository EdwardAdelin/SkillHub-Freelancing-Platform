import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom'; // Added Link import
import { db } from '../lib/firebase';
import { doc, getDoc, collection, addDoc, query, getDocs, orderBy, where } from 'firebase/firestore';
import { useAuth } from '../lib/AuthContext';
import { Clock, DollarSign, Calendar, User, Send, Mail, CheckCircle } from 'lucide-react';

export default function JobDetails() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [proposals, setProposals] = useState([]);
  
  // New State: Track if freelancer already applied
  const [existingProposal, setExistingProposal] = useState(null); 

  const [bidAmount, setBidAmount] = useState('');
  const [deliveryTime, setDeliveryTime] = useState('');
  const [coverLetter, setCoverLetter] = useState('');

  useEffect(() => {
    const fetchJobData = async () => {
      try {
        const docRef = doc(db, "jobs", id);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          setJob({ id: docSnap.id, ...docSnap.data() });
          
          // LOGIC A: If Client (Owner) -> Fetch ALL proposals
          if (user && docSnap.data().clientId === user.uid) {
            fetchProposals();
          }

          // LOGIC B: If Freelancer -> Check if I ALREADY applied
          if (user && user.role === 'freelancer') {
            checkIfApplied();
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

  // Fetch all proposals (Client view)
  const fetchProposals = async () => {
    const q = query(collection(db, "jobs", id, "proposals"), orderBy("submittedAt", "desc"));
    const querySnapshot = await getDocs(q);
    const proposalsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setProposals(proposalsData);
  };

  // Check if current freelancer applied (Freelancer view)
  const checkIfApplied = async () => {
    const q = query(
      collection(db, "jobs", id, "proposals"), 
      where("freelancerId", "==", user.uid)
    );
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      // If found, save it to state so we can show it
      setExistingProposal(querySnapshot.docs[0].data());
    }
  };

  const handleSubmitProposal = async (e) => {
    e.preventDefault();
    if (!user) return alert("Please login");

    try {
      // Save proposal with Email
      await addDoc(collection(db, "jobs", id, "proposals"), {
        freelancerId: user.uid,
        freelancerName: user.displayName || user.email,
        freelancerEmail: user.email, // Important for messaging
        bidAmount: Number(bidAmount),
        deliveryTime: Number(deliveryTime),
        coverLetter: coverLetter,
        submittedAt: new Date(),
        status: 'pending'
      });

      alert("Proposal submitted successfully!");
      // Re-run check to immediately update UI to "Already Applied" state
      checkIfApplied(); 
      
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
        
        {/* Job Header */}
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

        {/* --- CLIENT VIEW: Received Proposals --- */}
        {isOwner && (
          <div className="bg-white p-8 rounded-lg shadow-sm">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <User size={24} /> Received Proposals ({proposals.length})
            </h2>
            
            {proposals.length === 0 ? (
              <p className="text-gray-500 italic">No proposals yet.</p>
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
                    
                    <div className="mt-3 flex gap-2">
                      {/* FIXED Message Button */}
                      <a 
                        href={`mailto:${prop.freelancerEmail}?subject=SkillHub: Proposal for ${job.title}`}
                        className="bg-primary text-white px-3 py-1 rounded text-sm hover:bg-blue-700 flex items-center gap-1"
                      >
                        <Mail size={14} /> Message
                      </a>
                      {/* FIXED Profile Button */}
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

        {/* --- FREELANCER VIEW --- */}
        {isFreelancer && (
          <>
            {/* CONDITION: If already applied, show Status Card. If NOT, show Form. */}
            {existingProposal ? (
              <div className="bg-green-50 border border-green-200 p-8 rounded-lg text-center">
                <div className="flex justify-center mb-4">
                  <CheckCircle size={48} className="text-green-600" />
                </div>
                <h2 className="text-2xl font-bold text-green-800 mb-2">Application Submitted</h2>
                <p className="text-green-700 mb-6">You have already submitted a proposal for this job.</p>
                
                <div className="bg-white p-4 rounded inline-block text-left shadow-sm max-w-md w-full">
                  <div className="flex justify-between border-b pb-2 mb-2">
                    <span className="text-gray-600">Your Bid:</span>
                    <span className="font-bold">${existingProposal.bidAmount}</span>
                  </div>
                  <div className="flex justify-between border-b pb-2 mb-2">
                    <span className="text-gray-600">Delivery:</span>
                    <span className="font-bold">{existingProposal.deliveryTime} Days</span>
                  </div>
                  <div>
                     <span className="text-gray-600 block mb-1">Cover Letter:</span>
                     <p className="text-sm text-gray-800 italic">"{existingProposal.coverLetter}"</p>
                  </div>
                </div>
                
                <div className="mt-6">
                  <button onClick={() => navigate('/dashboard')} className="text-green-700 font-semibold hover:underline">
                    Return to Dashboard
                  </button>
                </div>
              </div>
            ) : (
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
          </>
        )}
      </div>
    </div>
  );
}