# Stokify

Stokify is a full-stack web application with a Vue.js frontend and a Node.js + Express backend. The main idea behind this app is to use SSE (Server-Sent Events) to stream stock prices in real-time. Obviously, this is just a demo project and all the valeus of stock prices are randomly generated.

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

Node.js
npm (Node Package Manager)
Git (for cloning the repository)

## Steps to start the project

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
6. Start the frontend server in development mode
```bash
cd ../frontend
npm run serve
```
7. Open your browser and navigate to link given by frontend server. Usually it is http://localhost:5173/ 



