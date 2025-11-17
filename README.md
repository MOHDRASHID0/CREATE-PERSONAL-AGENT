# CREATE-PERSONAL-AGENT
This is the basic project of my work 

YOU NEED TO BE SETUP YOUR PROJECT

/my-agent-app
  /client (React)
  /server (Node/Express)

# BASH FOR SERVER

cd server
npm init -y
npm install express mongoose cors dotenv openai

#BASH FOR CLIENT

cd ../client
npm create vite@latest . -- --template react
npm install axios lucide-react
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p

# RUN THE SERVER

node server.js (port****)

# RUN THE FRONTEND

npm run dev