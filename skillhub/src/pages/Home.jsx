import { Link } from 'react-router-dom';
import { ArrowRight, Briefcase, Search, ShieldCheck, Users } from 'lucide-react';
import { useAuth } from '../lib/AuthContext';

export default function Home() {
  const { user } = useAuth();

  return (
    <div className="bg-white">
      
      {/* HERO SECTION */}
      <div className="relative bg-gradient-to-r from-blue-600 to-blue-800 text-white pt-24 pb-32 overflow-hidden">
        {/* Abstract Background Shapes */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-10">
          <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-white blur-3xl"></div>
          <div className="absolute top-1/2 right-0 w-80 h-80 rounded-full bg-white blur-3xl"></div>
        </div>

        <div className="container mx-auto px-6 relative z-10 text-center">
          <h1 className="text-5xl md:text-6xl font-extrabold mb-6 leading-tight">
            Find the perfect <span className="text-blue-200">freelance services</span><br /> for your business
          </h1>
          <p className="text-xl md:text-2xl mb-10 text-blue-100 max-w-3xl mx-auto">
            SkillHub connects you with top talent around the world. Secure, fast, and easy to use.
          </p>
          
          <div className="flex flex-col md:flex-row justify-center gap-4">
            {!user && (
              <>
                 <Link to="/register" className="bg-white text-blue-700 px-8 py-4 rounded-lg font-bold text-lg hover:bg-gray-100 transition shadow-lg">
                  Get Started
                </Link>
                <Link to="/jobs" className="border border-white text-white px-8 py-4 rounded-lg font-bold text-lg hover:bg-white/10 transition">
                  Browse Jobs
                </Link>
              </>
            )}
            {user && (
               <Link to="/dashboard" className="bg-white text-blue-700 px-8 py-4 rounded-lg font-bold text-lg hover:bg-gray-100 transition shadow-lg">
                  Go to Dashboard
               </Link>
            )}
          </div>
        </div>
      </div>

      {/* STATS SECTION */}
      <div className="bg-gray-50 border-b">
        <div className="container mx-auto px-6 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-gray-800 mb-1">10k+</div>
              <div className="text-gray-500 text-sm uppercase tracking-wide">Freelancers</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-gray-800 mb-1">5k+</div>
              <div className="text-gray-500 text-sm uppercase tracking-wide">Active Jobs</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-gray-800 mb-1">98%</div>
              <div className="text-gray-500 text-sm uppercase tracking-wide">Satisfaction</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-gray-800 mb-1">24/7</div>
              <div className="text-gray-500 text-sm uppercase tracking-wide">Support</div>
            </div>
          </div>
        </div>
      </div>

      {/* HOW IT WORKS */}
      <div className="py-20">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">How SkillHub Works</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">Whether you're looking for work or looking to hire, we make the process seamless.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-10">
            {/* Step 1 */}
            <div className="text-center p-6 border rounded-xl hover:shadow-xl transition group">
              <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition">
                <Search size={32} />
              </div>
              <h3 className="text-xl font-bold mb-3">1. Post or Search</h3>
              <p className="text-gray-500">Clients post jobs with detailed requirements. Freelancers browse listings to find their perfect match.</p>
            </div>

            {/* Step 2 */}
            <div className="text-center p-6 border rounded-xl hover:shadow-xl transition group">
              <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition">
                <Briefcase size={32} />
              </div>
              <h3 className="text-xl font-bold mb-3">2. Propose & Hire</h3>
              <p className="text-gray-500">Freelancers submit proposals. Clients review profiles, chat, and select the best candidate.</p>
            </div>

            {/* Step 3 */}
            <div className="text-center p-6 border rounded-xl hover:shadow-xl transition group">
              <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition">
                <ShieldCheck size={32} />
              </div>
              <h3 className="text-xl font-bold mb-3">3. Work Securely</h3>
              <p className="text-gray-500">Work begins! We ensure a secure environment for project management and delivery.</p>
            </div>
          </div>
        </div>
      </div>

      {/* CALL TO ACTION */}
      <div className="bg-gray-900 text-white py-20">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to get started?</h2>
          <p className="text-gray-400 mb-8 max-w-2xl mx-auto">Join thousands of businesses and freelancers today. It's free to sign up and explore.</p>
          <Link to="/register" className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-bold transition">
            Join SkillHub Now <ArrowRight size={20} />
          </Link>
        </div>
      </div>
      
    </div>
  );
}