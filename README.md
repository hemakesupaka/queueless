QueueLess 🚀

Smart Queue Management System

QueueLess is a web-based smart queue management system that allows customers to join a queue digitally, track their queue position, estimated waiting time, and current status. Administrators can manage the queue through an admin dashboard.

🎯 Problem Statement

Traditional queue systems require people to physically wait in line without knowing their exact position or how long they may need to wait.

This can lead to:

• Long waiting times
• Crowded waiting areas
• Lack of queue information
• Poor user experience


💡 Solution

QueueLess provides a digital queue management system where customers can join a queue and monitor their queue status without continuously waiting in a physical line.

Administrators can manage customers, call the next customer, and complete queue requests through the admin dashboard.


✨ Features

👤 Customer Features

• Join a queue digitally
• Automatic queue number generation
• View people ahead
• Estimated waiting time
• View current queue status
• Leave the queue

👨‍💼 Admin Features

• Admin login
• Admin dashboard
• View waiting customers
• Call the next customer
• Mark customers as completed
• Monitor queue status
• Manage queues for different businesses
• Admin logout

⚙️ System Features

• REST API
• SQLite database
• Automatic queue status updates
• Business-specific queues
• Session-based admin authentication
• Password hashing


🏗️ System Architecture

Customer / Admin
       ↓
HTML + CSS + JavaScript
       ↓
Flask REST API
       ↓
SQLite Database


🔄 How It Works

Customer
   ↓
Select Business
   ↓
Join Queue
   ↓
Receive Queue Number
   ↓
View People Ahead
   ↓
View Estimated Waiting Time
   ↓
Monitor Queue Status
   ↓
Admin Calls Next Customer
   ↓
Serving
   ↓
Completed


🛠️ Technologies Used

Frontend

• HTML
• CSS
• JavaScript

Backend

• Python
• Flask
• Flask-CORS

Database

• SQLite

Authentication

• Flask Sessions
• Werkzeug Password Hashing


📁 Project Structure

QueueLess/
│
├── index.html
├── style.css
├── script.js
├── README.md
├── .gitignore
│
└── backend/
    ├── app.py
    ├── database.py
    └── requirements.txt


▶️ How to Run

1. Clone the Repository

git clone https://github.com/hemakesupaka/queueless.git

2. Open the Project

cd queueless

3. Install Backend Dependencies

cd backend
pip install -r requirements.txt

4. Create the Database

python database.py

5. Start the Flask Backend

python app.py

The backend will run at:

http://127.0.0.1:5000

6. Run the Frontend

Open index.html using VS Code Live Server.


🔐 Demo Admin Login

Username: admin
Password: admin123

This login is intended for local/demo use only.


📸 Screenshots

Screenshots of the application will be added here.


🔮 Future Enhancements

• SMS queue notifications
• Email notifications
• QR-based queue joining
• Online appointment booking
• Queue analytics
• Cloud deployment
• Mobile application


🎯 Project Goal

The goal of QueueLess is to provide a simple and practical digital queue management solution that reduces physical waiting time and gives customers better visibility into queue progress.


👩‍💻 Author

Hema Kesupaka

GitHub: https://github.com/hemakesupaka
