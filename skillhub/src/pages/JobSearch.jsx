import { useEffect, useState } from 'react';
import { db } from '../lib/firebase';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { Link } from 'react-router-dom';
import { Search, DollarSign, Briefcase, Clock } from 'lucide-react';

export default function JobSearch() {
  const [jobs, setJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [minBudget, setMinBudget] = useState('');

  // 1. Fetch ALL Open Jobs on Mount
  useEffect(() => {
    const fetchJobs = async () => {
      try {
        // Query: Get all jobs where status is 'open', sorted by date
        // Note: You might need to create an index in Firebase Console if console warns you
        const q = query(
          collection(db, "jobs"), 
          where("status", "==", "open")
        );
        
        const querySnapshot = await getDocs(q);
        const jobsData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        // Sort manually by date (newest first) to avoid complex index requirements for now
        jobsData.sort((a, b) => b.postedAt.seconds - a.postedAt.seconds);

        setJobs(jobsData);
        setFilteredJobs(jobsData);
      } catch (error) {
        console.error("Error fetching jobs:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, []);

  // 2. Real-time Filtering Logic (Matches SRS FR5)
  useEffect(() => {
    let result = jobs;

    // Filter by Category
    if (selectedCategory !== 'All') {
      result = result.filter(job => job.category === selectedCategory);
    }

    // Filter by Search Keyword (Title or Description)
    if (searchTerm) {
      const lowerTerm = searchTerm.toLowerCase();
      result = result.filter(job => 
        job.title.toLowerCase().includes(lowerTerm) || 
        job.description.toLowerCase().includes(lowerTerm)
      );
    }

    // Filter by Minimum Budget
    if (minBudget) {
      result = result.filter(job => job.budget >= Number(minBudget));
    }

    setFilteredJobs(result);
  }, [searchTerm, selectedCategory, minBudget, jobs]);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="container mx-auto max-w-5xl">
        
        {/* Header & Search Controls */}
        <div className="bg-white p-6 rounded-lg shadow-sm mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-6">Find Work</h1>
          
          <div className="grid md:grid-cols-4 gap-4">
            {/* Search Bar */}
            <div className="md:col-span-2 relative">
              <Search className="absolute left-3 top-3 text-gray-400" size={20} />
              <input 
                type="text" 
                placeholder="Search by keywords..." 
                className="w-full pl-10 p-2.5 border rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Category Filter */}
            <select 
              className="p-2.5 border rounded-lg bg-white"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="All">All Categories</option>
              <option value="Development">Web Development</option>
              <option value="Design">Graphic Design</option>
              <option value="Marketing">Digital Marketing</option>
              <option value="Writing">Content Writing</option>
            </select>

            {/* Budget Filter */}
            <div className="relative">
              <DollarSign className="absolute left-3 top-3 text-gray-400" size={18} />
              <input 
                type="number" 
                placeholder="Min Budget" 
                className="w-full pl-9 p-2.5 border rounded-lg"
                value={minBudget}
                onChange={(e) => setMinBudget(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Job List Results */}
        {loading ? (
          <div className="text-center py-20">Loading available jobs...</div>
        ) : (
          <div className="grid gap-4">
            {filteredJobs.length === 0 ? (
              <div className="text-center py-20 text-gray-500 bg-white rounded">
                No jobs found matching your criteria.
              </div>
            ) : (
              filteredJobs.map(job => (
                <div key={job.id} className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition border border-gray-100">
                  <div className="flex justify-between items-start">
                    <div>
                      <h2 className="text-xl font-bold text-primary mb-1">{job.title}</h2>
                      <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                        <span className="flex items-center gap-1">
                          <Briefcase size={16} /> {job.category}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock size={16} /> Posted {job.postedAt ? new Date(job.postedAt.seconds * 1000).toLocaleDateString() : 'Recently'}
                        </span>
                        <span className="flex items-center gap-1 text-green-600 font-semibold">
                          <DollarSign size={16} /> Budget: ${job.budget}
                        </span>
                      </div>
                      <p className="text-gray-600 line-clamp-2">{job.description}</p>
                    </div>
                    
                    <Link 
                      to={`/jobs/${job.id}`} 
                      className="bg-primary text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition whitespace-nowrap"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}