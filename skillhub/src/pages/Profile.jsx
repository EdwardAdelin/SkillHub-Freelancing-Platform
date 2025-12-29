import { useState, useEffect } from 'react';
import { useAuth } from '../lib/AuthContext';
import { db } from '../lib/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { useParams } from 'react-router-dom'; // Import useParams
import { User, MapPin, Mail, Briefcase, Edit2, Save, X } from 'lucide-react';

export default function Profile() {
  const { user } = useAuth(); 
  const { id } = useParams(); // Get ID from URL (if visiting someone else)
  
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState(null);

  // Determine whose profile we are looking at
  // If "id" is in the URL, use that. Otherwise, use the logged-in user's UID.
  const targetUserId = id || user?.uid;
  const isOwnProfile = user?.uid === targetUserId;

  useEffect(() => {
    const fetchProfile = async () => {
      if (targetUserId) {
        const docRef = doc(db, "users", targetUserId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setProfileData({
            displayName: data.displayName || '',
            title: data.title || '',
            description: data.description || '',
            location: data.location || '',
            skills: data.skills ? data.skills.join(', ') : '', 
            contactEmail: data.contactEmail || data.email // Fallback to login email
          });
        }
      }
      setLoading(false);
    };
    fetchProfile();
  }, [targetUserId]);

  const handleSave = async () => {
    try {
      const docRef = doc(db, "users", user.uid);
      const skillsArray = profileData.skills.split(',').map(s => s.trim()).filter(s => s.length > 0);
      await updateDoc(docRef, { ...profileData, skills: skillsArray });
      setIsEditing(false);
      alert("Profile updated!");
    } catch (error) {
      alert("Failed to save.");
    }
  };

  if (loading) return <div className="p-10 text-center">Loading Profile...</div>;
  if (!profileData) return <div className="p-10 text-center">User not found.</div>;

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        {/* Header */}
        <div className="bg-primary h-32 relative">
          <div className="absolute -bottom-12 left-8">
            <div className="bg-white p-2 rounded-full">
              <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center text-gray-500">
                <User size={48} />
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons (ONLY show Edit if it's YOUR profile) */}
        <div className="flex justify-end p-4 pt-4 h-16">
          {isOwnProfile && (
            isEditing ? (
              <div className="space-x-2">
                <button onClick={() => setIsEditing(false)} className="px-4 py-2 border rounded text-gray-600 hover:bg-gray-50">Cancel</button>
                <button onClick={handleSave} className="px-4 py-2 bg-primary text-white rounded hover:bg-blue-700">Save Changes</button>
              </div>
            ) : (
              <button onClick={() => setIsEditing(true)} className="px-4 py-2 border border-primary text-primary rounded flex items-center gap-2 hover:bg-blue-50">
                <Edit2 size={16} /> Edit Profile
              </button>
            )
          )}
        </div>

        {/* Main Content */}
        <div className="px-8 pb-8 pt-6">
          <div className="mb-6">
            {isEditing ? (
              <div className="space-y-4">
                <input type="text" className="w-full p-2 border rounded font-bold" value={profileData.displayName} onChange={(e) => setProfileData({...profileData, displayName: e.target.value})} placeholder="Full Name" />
                <input type="text" className="w-full p-2 border rounded" value={profileData.title} onChange={(e) => setProfileData({...profileData, title: e.target.value})} placeholder="Title (e.g. Developer)" />
              </div>
            ) : (
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{profileData.displayName || "Anonymous User"}</h1>
                <p className="text-xl text-gray-600">{profileData.title || "No Title Set"}</p>
                <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                  <span className="flex items-center gap-1"><MapPin size={16} /> {profileData.location || "Remote"}</span>
                  {/* Only show email if viewing OWN profile or if it's set public */}
                  {isOwnProfile && <span className="flex items-center gap-1"><Mail size={16} /> {profileData.contactEmail}</span>}
                </div>
              </div>
            )}
          </div>

          <hr className="my-6" />

          <div className="grid md:grid-cols-3 gap-8">
            <div className="md:col-span-2">
              <h3 className="text-lg font-bold mb-3">About</h3>
              {isEditing ? (
                <textarea rows="6" className="w-full p-2 border rounded" value={profileData.description} onChange={(e) => setProfileData({...profileData, description: e.target.value})}></textarea>
              ) : (
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{profileData.description || "No bio available."}</p>
              )}
            </div>

            <div>
              <h3 className="text-lg font-bold mb-3">Skills</h3>
              {isEditing ? (
                <input type="text" className="w-full p-2 border rounded" value={profileData.skills} onChange={(e) => setProfileData({...profileData, skills: e.target.value})} />
              ) : (
                <div className="flex flex-wrap gap-2">
                  {profileData.skills && profileData.skills.length > 0 ? (
                    profileData.skills.split(',').map((skill, index) => (
                      <span key={index} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">{skill.trim()}</span>
                    ))
                  ) : <span className="text-gray-400">No skills listed</span>}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}