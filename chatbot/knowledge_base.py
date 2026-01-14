# backend/knowledge_base.py
# delete from point 6 onwards to reduce halucination (but makes it less detailed)

PLATFORM_DOCS = """
WELCOME TO SKILLHUB USER GUIDE

1. HOW TO REGISTER
- Click the "Register" button in the top right.
- Select your role: "Client" (to post jobs) or "Freelancer" (to find work).

2. POSTING A JOB (CLIENTS ONLY)
- Go to your Dashboard.
- Click "Post New Job".
- Enter Title, Description, Budget, and Deadline.

3. HIRING A FREELANCER
- View proposals in "Job Details".
- Click "Hire Freelancer" to start the contract.

4. PAYMENTS
- Payment details shall be discussed between the client and freelancer This is enabled via email communication.

5. ACCOUNT & ROLES
- Tech Stack: Built with React (Frontend) and Firebase (Backend/Database).
- Roles: Users can sign up as "Client" (to hire) or "Freelancer" (to work).
- Authentication: Secure login/signup is handled via Firebase Authentication.
- Profile: Users can edit their basic profile details (Name, Skills, Bio).

6. JOBS (FOR CLIENTS)
- Posting: Clients can create job posts with a Title, Description, Budget, and Deadline.
- Visibility: Once posted, jobs are saved to the Firebase Realtime Database/Firestore and appear on the public Job Board.
- Management: Clients can view their posted jobs in their Dashboard.

7. PROPOSALS (FOR FREELANCERS)
- Browsing: Freelancers can browse the "Find Work" page to see active job listings.
- Applying: Freelancers can submit a proposal to a specific job. 
- Data: Proposals are linked to the specific Job ID in the database.

8. TECHNICAL SUPPORT
- Browser Issues: If the app is slow, try refreshing or clearing cache.
- ChatBot: This AI assistant runs on a Python backend (Flask) using the 'Hugging Face' API. The ChatBot helps answer questions about using SkillHub.
- Errors: If you see "Network Error," check your internet connection or verify the backend server is running.

9. CURRENT LIMITATIONS (MVP STATUS)
- Payments: Currently, payments are handled off-platform or manual agreement, you can talk about it via email.
- Disputes: Please contact the admin directly for issues.

"""