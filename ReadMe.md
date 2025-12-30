# SkillHub

## 1 - About the Project
SkillHub is a job board application built with React and Firebase. It allows users to browse and search for job listings, view detailed job descriptions, and apply for jobs directly through the platform. The application features a clean and user-friendly interface, making it easy for job seekers to find relevant opportunities.

## How to Run the Project Locally
1. Clone the repository
```bash
git clone repository_url
```
2. Navigate into the project directory
```bash
cd skillhub
```
3. Install dependencies if you haven't already
```bash
npm install name of dependency (based on given errors in terminal)
```
4. Open another terminal and start the backend server
```bash
cd chatbot
````
5. Actiavate your virtual environment if you have one
```bash
source venv/bin/activate  # On Windows use `venv\Scripts\activate`
``` 
6. Install backend dependencies if you don't have them yet (see instructions in chatbot folder)

7. Start the backend server
```bash
python app.py
```

5. Go back to the 1st terminal & Start the development server
```bash
npm run dev
```

6. Open your browser and navigate to `http://localhost:5173` to view the application.

Make sure you have .env file set up with your Firebase configuration details. (in skillhub folder)
Make sure you have .env file set up in the chatbot folder with your HuggingFace API key. (in chatbot folder)

## 3 - How to create a similar project from scratch
1. Create the project using Vite (Standard modern React setup)
```bash 
npm create vite@latest skillhub -- --template react
```
2. Navigate into the project directory
```bash
cd skillhub
```
3. Install dependencies
react-router-dom: For navigating between our 8 pages
firebase: To connect to our backend
lucide-react: For icons (user, jobs, etc.)
```bash
npm install react-router-dom firebase lucide-react
```
4. Install & Init Tailwind CSS
```bash
npm install -D tailwindcss@3.4.17 postcss autoprefixer
```
You can try to use `npx tailwindcss init -p`. 
If `npx tailwindcss init -p` errors (newer Tailwind v4 removed the CLI bin), run this instead:
(this uses the v3 CLI to generate config files)
```bash
npx tailwindcss@3 init -p
```

