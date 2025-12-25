import { useState, useEffect } from 'react';
import { useAuth } from '../lib/AuthContext';
import { db } from '../lib/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { User, MapPin, Mail, Briefcase, Edit2, Save, X } from 'lucide-react';

export default function Profile() {
  const { user } = useAuth(); // Get current logged-in user
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);

  // Form State (Matches SDD Profile Entity: Name, Description, Location, Skills)
  const [formData, setFormData] = useState({
    displayName: '',
    title: '', // e.g., "Senior Web Developer"
    description: '',
    location: '',
    skills: '', // We will handle this as a comma-separated string for simplicity
    contactEmail: ''
  });

  // 1. Fetch Latest Data from Firestore
  useEffect(() => {
    const fetchProfile = async () => {
      if (user?.uid) {
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setFormData({
            displayName: data.displayName || '',
            title: data.title || '',
            description: data.description || '',
            location: data.location || '',
            // Join array back to string for editing, or empty string
            skills: data.skills ? data.skills.join(', ') : '', 
            contactEmail: data.contactEmail || user.email
          });
        }
      }
      setLoading(false);
    };
    fetchProfile();
  }, [user]);

  // 2. Handle Save (FR2: Edit Profile)
  const handleSave = async () => {
    try {
      const docRef = doc(db, "users", user.uid);
      
      // Convert comma string back to array for storage
      const skillsArray = formData.skills.split(',').map(s => s.trim()).filter(s => s.length > 0);

      await updateDoc(docRef, {
        ...formData,
        skills: skillsArray
      });

      setIsEditing(false);
      alert("Profile updated successfully!");
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Failed to save profile.");
    }
  };

  if (loading) return <div className="p-10 text-center">Loading Profile...</div>;

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        
        {/* Header / Cover Area */}
        <div className="bg-primary h-32 relative">
          <div className="absolute -bottom-12 left-8">
            <div className="bg-white p-2 rounded-full">
              <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center text-gray-500">
                <User size={48} />
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end p-4 pt-4">
          {isEditing ? (
            <div className="space-x-2">
              <button 
                onClick={() => setIsEditing(false)} 
                className="px-4 py-2 border border-gray-300 rounded text-gray-600 flex items-center gap-2 hover:bg-gray-50"
              >
                <X size={16} /> Cancel
              </button>
              <button 
                onClick={handleSave} 
                className="px-4 py-2 bg-primary text-white rounded flex items-center gap-2 hover:bg-blue-700"
              >
                <Save size={16} /> Save Changes
              </button>
            </div>
          ) : (
            <button 
              onClick={() => setIsEditing(true)} 
              className="px-4 py-2 border border-primary text-primary rounded flex items-center gap-2 hover:bg-blue-50"
            >
              <Edit2 size={16} /> Edit Profile
            </button>
          )}
        </div>

        {/* Main Content */}
        <div className="px-8 pb-8 pt-10">
          
          {/* Section 1: Basic Info */}
          <div className="mb-6">
            {isEditing ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Full Name</label>
                  <input 
                    type="text" 
                    className="w-full p-2 border rounded mt-1"
                    value={formData.displayName}
                    onChange={(e) => setFormData({...formData, displayName: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Professional Title</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Senior React Developer"
                    className="w-full p-2 border rounded mt-1"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                  />
                </div>
              </div>
            ) : (
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{formData.displayName || "Anonymous User"}</h1>
                <p className="text-xl text-gray-600">{formData.title || "No Title Set"}</p>
                <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                  <span className="flex items-center gap-1"><MapPin size={16} /> {formData.location || "Remote"}</span>
                  <span className="flex items-center gap-1"><Mail size={16} /> {formData.contactEmail}</span>
                </div>
              </div>
            )}
          </div>

          <hr className="my-6" />

          {/* Section 2: About & Skills */}
          <div className="grid md:grid-cols-3 gap-8">
            
            {/* Left Column: Description */}
            <div className="md:col-span-2">
              <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
                <User size={20} /> About Me
              </h3>
              {isEditing ? (
                <textarea 
                  rows="6"
                  className="w-full p-2 border rounded"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                ></textarea>
              ) : (
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {formData.description || "This user hasn't written a bio yet."}
                </p>
              )}
            </div>

            {/* Right Column: Skills */}
            <div>
              <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
                <Briefcase size={20} /> Skills
              </h3>
              
              {isEditing ? (
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Separate with commas (e.g. React, CSS, Java)</label>
                  <input 
                    type="text" 
                    className="w-full p-2 border rounded"
                    value={formData.skills}
                    onChange={(e) => setFormData({...formData, skills: e.target.value})}
                  />
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {formData.skills && formData.skills.length > 0 ? (
                    formData.skills.split(',').map((skill, index) => (
                      <span key={index} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                        {skill.trim()}
                      </span>
                    ))
                  ) : (
                    <span className="text-gray-400 text-sm">No skills listed</span>
                  )}
                </div>
              )}

              {isEditing && (
                <div className="mt-6">
                  <label className="block text-sm font-medium text-gray-700">Location</label>
                  <input 
                    type="text" 
                    className="w-full p-2 border rounded mt-1"
                    value={formData.location}
                    onChange={(e) => setFormData({...formData, location: e.target.value})}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}