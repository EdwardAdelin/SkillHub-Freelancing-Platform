# SkillHub

## Setup Instructions
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

