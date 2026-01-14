import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { db } from '../lib/firebase';
import { doc, getDoc, collection, addDoc, query, getDocs, orderBy, where, updateDoc } from 'firebase/firestore'; // Added updateDoc
import { useAuth } from '../lib/AuthContext';
import { Clock, DollarSign, Calendar, User, Send, Mail, CheckCircle, Briefcase } from 'lucide-react';

export default function JobDetails() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [proposals, setProposals] = useState([]);
  const [existingProposal, setExistingProposal] = useState(null); 
  
  // Form State
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
          
          if (user && docSnap.data().clientId === user.uid) {
            fetchProposals();
          }
          if (user && user.role === 'freelancer') {
            checkIfApplied();
          }
        } else {
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

  const fetchProposals = async () => {
    const q = query(collection(db, "jobs", id, "proposals"), orderBy("submittedAt", "desc"));
    const querySnapshot = await getDocs(q);
    const proposalsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setProposals(proposalsData);
  };

  const checkIfApplied = async () => {
    const q = query(collection(db, "jobs", id, "proposals"), where("freelancerId", "==", user.uid));
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      setExistingProposal(querySnapshot.docs[0].data());
    }
  };

  // --- NEW FUNCTION: Handle Accepting a Proposal ---
  const handleAcceptProposal = async (proposalId, freelancerName) => {
    if (!confirm(`Are you sure you want to hire ${freelancerName}? This will close the job to other applicants.`)) return;

    try {
      // 1. Update the Proposal Status to 'accepted'
      const proposalRef = doc(db, "jobs", id, "proposals", proposalId);
      await updateDoc(proposalRef, { status: 'accepted' });

      // 2. Update the Job Status to 'in_progress' (Hides it from public search)
      const jobRef = doc(db, "jobs", id);
      await updateDoc(jobRef, { status: 'in_progress' });

      alert(`Success! You have hired ${freelancerName}.`);
      
      // Reload page data to reflect changes
      window.location.reload();

    } catch (error) {
      console.error("Error accepting proposal:", error);
      alert("Failed to accept proposal.");
    }
  };

  const handleSubmitProposal = async (e) => {
    e.preventDefault();
    if (!user) return alert("Please login");

    try {
      await addDoc(collection(db, "jobs", id, "proposals"), {
        freelancerId: user.uid,
        freelancerName: user.displayName || user.email,
        freelancerEmail: user.email,
        bidAmount: Number(bidAmount),
        deliveryTime: Number(deliveryTime),
        coverLetter: coverLetter,
        submittedAt: new Date(),
        status: 'pending'
      });
      alert("Proposal submitted successfully!");
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
  const isJobOpen = job.status === 'open'; // Check if job is still open

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="container mx-auto max-w-4xl">
        
        {/* Job Header */}
        <div className="bg-white p-8 rounded-lg shadow-sm mb-6 border-t-4 border-primary">
          <div className="flex justify-between items-start">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{job.title}</h1>
            {/* Status Badge */}
            <span className={`px-3 py-1 rounded-full text-sm font-bold uppercase tracking-wide
              ${job.status === 'open' ? 'bg-green-100 text-green-800' : 
                job.status === 'in_progress' ? 'bg-blue-100 text-blue-800' : 'bg-gray-200 text-gray-700'}`}>
              {job.status.replace('_', ' ')}
            </span>
          </div>

          <div className="flex flex-wrap gap-6 text-sm text-gray-600 mb-6 mt-2">
             <span className="flex items-center gap-2 bg-blue-50 text-blue-700 px-3 py-1 rounded-full font-medium">{job.category}</span>
             <span className="flex items-center gap-1 font-bold text-green-700"><DollarSign size={18} /> Budget: ${job.budget}</span>
             <span className="flex items-center gap-1"><Calendar size={18} /> Due: {job.deadline}</span>
          </div>
          <h3 className="text-lg font-bold mb-2">Description</h3>
          <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{job.description}</p>
        </div>

        {/* --- CLIENT VIEW --- */}
        {isOwner && (
          <div className="bg-white p-8 rounded-lg shadow-sm">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <User size={24} /> Received Proposals ({proposals.length})
            </h2>
            
            {proposals.length === 0 ? <p className="text-gray-500 italic">No proposals yet.</p> : (
              <div className="space-y-4">
                {proposals.map(prop => (
                  <div key={prop.id} className={`border p-4 rounded transition ${prop.status === 'accepted' ? 'border-green-500 bg-green-50' : 'hover:bg-gray-50'}`}>
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-bold text-lg text-primary">{prop.freelancerName}</span>
                      <span className="text-green-700 font-bold text-lg">${prop.bidAmount}</span>
                    </div>
                    <div className="text-sm text-gray-500 mb-2">Delivery in {prop.deliveryTime} days</div>
                    <p className="text-gray-700 bg-gray-100 p-3 rounded text-sm mb-3">{prop.coverLetter}</p>
                    
                    <div className="flex gap-2 items-center">
                      <a href={`mailto:${prop.freelancerEmail}`} className="bg-primary text-white px-3 py-1 rounded text-sm hover:bg-blue-700 flex items-center gap-1"><Mail size={14} /> Message</a>
                      <Link to={`/profile/${prop.freelancerId}`} className="border border-gray-300 px-3 py-1 rounded text-sm hover:bg-gray-200 text-gray-700 flex items-center gap-1"><User size={14} /> View Profile</Link>
                      
                      {/* ACCEPT BUTTON Logic */}
                      {isJobOpen && prop.status === 'pending' && (
                        <button 
                          onClick={() => handleAcceptProposal(prop.id, prop.freelancerName)}
                          className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 flex items-center gap-1 ml-auto"
                        >
                          <CheckCircle size={14} /> Hire Freelancer
                        </button>
                      )}
                      
                      {prop.status === 'accepted' && (
                        <span className="ml-auto flex items-center gap-1 text-green-700 font-bold text-sm">
                          <Briefcase size={14} /> Hired
                        </span>
                      )}
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
            {/* If Job is NOT Open (In Progress or Completed) AND you didn't apply, show Closed message */}
            {!isJobOpen && !existingProposal && (
               <div className="bg-gray-100 p-8 rounded-lg text-center text-gray-500 font-bold">
                 This job is no longer accepting proposals.
               </div>
            )}

            {/* If Job is Open AND you haven't applied */}
            {isJobOpen && !existingProposal && (
              <div className="bg-white p-8 rounded-lg shadow-sm">
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2"><Send size={24} /> Submit Your Proposal</h2>
                <form onSubmit={handleSubmitProposal} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div><label className="block text-sm font-medium">Your Bid ($)</label><input type="number" required className="w-full p-2 border rounded" value={bidAmount} onChange={e => setBidAmount(e.target.value)} /></div>
                    <div><label className="block text-sm font-medium">Delivery (Days)</label><input type="number" required className="w-full p-2 border rounded" value={deliveryTime} onChange={e => setDeliveryTime(e.target.value)} /></div>
                  </div>
                  <div><label className="block text-sm font-medium">Cover Letter</label><textarea rows="4" required className="w-full p-2 border rounded" value={coverLetter} onChange={e => setCoverLetter(e.target.value)} /></div>
                  <button type="submit" className="w-full bg-green-600 text-white p-3 rounded font-bold hover:bg-green-700">Submit Proposal</button>
                </form>
              </div>
            )}

            {/* If you already applied */}
            {existingProposal && (
              <div className={`p-8 rounded-lg text-center border ${existingProposal.status === 'accepted' ? 'bg-blue-50 border-blue-200' : 'bg-green-50 border-green-200'}`}>
                <div className="flex justify-center mb-4">
                  {existingProposal.status === 'accepted' ? <Briefcase size={48} className="text-blue-600" /> : <CheckCircle size={48} className="text-green-600" />}
                </div>
                <h2 className="text-2xl font-bold mb-2 text-gray-800">
                  {existingProposal.status === 'accepted' ? "Congratulations! You're Hired!" : "Application Submitted"}
                </h2>
                <p className="text-gray-600 mb-6">
                  {existingProposal.status === 'accepted' ? "Go to your dashboard to manage this job." : "You have submitted a proposal for this job."}
                </p>
                {existingProposal.status === 'accepted' && (
                   <button onClick={() => navigate('/dashboard')} className="bg-blue-600 text-white px-6 py-2 rounded font-bold hover:bg-blue-700">Go to Dashboard</button>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}