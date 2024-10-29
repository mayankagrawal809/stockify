# Stokify

Stokify is a full-stack web application with a Vue.js frontend and a Node.js + Express backend. The main idea behind this app is to use SSE (Server-Sent Events) to stream stock prices in real-time. It uses Kafka as a message broker.
You can get real stock prices for US Stock market too. If you get a key from https://finnhub.io/register.
- System Design: [https://excalidraw.com/#json=hollRQ5FQVZ0-M7WUpUcs,GMoKSdkyZSbPKuRrRFkjiA](https://excalidraw.com/#json=70uSwlkAGwrktZX6pcJ7C,1OS8MUNkSGSZ-2G3Hfr17A)
- 🎥 [Demo on YouTube](https://www.youtube.com/watch?v=FQ1Vuyhfwts)







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

- Node.js, (Check this by running `node --version` in your terminal)
- npm (Check this by running `npm --version` in your terminal)
- Git (Check this by running `git --version` in your terminal)
- docker desktop is installed and open it.

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
4. Copy the .env.example file to .env file
- **(Linux/Mac)**
```bash
cd ../backend
cp .env.example .env
```
- **(Windows)**
```bash
cd ../backend
copy .env.example .env
```
5. Start the Docker app and run this command in terminal after navigating to the backend folder to start Kafka and Zookeeper.
```bash
docker-compose up -d
```

6. Create kafka topic
```bash
node admin.js
```

7. Start the backend server in development mode
```bash
npm run dev
```
8. Open a seperate terminal and go to stockify folder , don't close the previous terminal

9. Start the frontend server in development mode in the new terminal
```bash
cd frontend
npm run dev
```
10. Open your browser and navigate to link given by frontend server. Usually it is http://localhost:5173/ 

11. The username and passwords are given here for 3 users:
```bash
username: admin
password: admin

username: user1
password: password1

username: user2
password: password2
```

12. You can also get real stock prices for US Stock market too. If get a key from https://finnhub.io/register and add it to .env file in backend folder for e.g. FINNHUB_API_KEY= RandomKEy.

13. After that change code in `fetchStockUpdate.js` which is in the backend folder to `const USE_FAKE_WEBSOCKET = false`. around line number 6

14. Check the stock prices in the frontend. It should refelect the changes automatically since we are using nodemon. Please note: If US Stock market is closed then you will have to see 
the crypto prices only.

15. If its not working then, Restart both the backend and frontend server

