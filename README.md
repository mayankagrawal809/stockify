# Stokify

Stokify is a full-stack web application with a Vue.js frontend and a Node.js + Express backend. The main idea behind this app is to use SSE (Server-Sent Events) to stream stock prices in real-time. Obviously, this is just a demo project and all the valeus of stock prices are randomly generated.
Also note that there isn't any db connected to this project for now. All values are stored locally.


## Project Structure

```bash
stokify/
│
├── frontend/       # Vue.js app
├── backend/        # Node.js + Express app
├── README.md       
└── .gitignore
```
## Prerequisites
Before you begin, ensure you have the following installed on your machine:

Node.js, (Check this by running `node --version` in your terminal)
npm (Check this by running `npm --version` in your terminal)
Git (Check this by running `git --version` in your terminal)

## Steps to start the project

0. Install Nodemon globally (Skip if already installed)
```bash
npm install -g nodemon
```

1. Clone the repository
```bash
git clone https://github.com/mayankagrawal809/stockify.git
```
2. Change the directory
```bash
cd stockify
```
3. Install the frontend dependencies
```bash
cd frontend
npm install
```
4. install the backend dependencies
```bash
cd ../backend
npm install
```
5. Start the backend server in development mode
```bash
npm run dev
```
6. Open a seperate terminal and go to stockify folder , don't close the previous terminal

7. Start the frontend server in development mode in the new terminal
```bash
cd frontend
npm run dev
```
8. Open your browser and navigate to link given by frontend server. Usually it is http://localhost:5173/ 
9. The username and passwords are given here for 3 users:
```bash
username: admin
password: admin

username: user1
password: password1

username: user2
password: password2
```

