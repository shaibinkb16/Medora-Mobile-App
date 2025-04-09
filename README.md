# 🩺 Medora — AI-Powered Health Management App

**Medora** is a full-featured, AI-powered, cross-platform mobile application built with **React Native** and **TypeScript** for health monitoring and wellness planning. It supports secure medical record management, OCR lab scanning, machine learning predictions, personalized diet/exercise plans, smart reminders, and an advanced web-based admin panel for system supervision.

> Empowering users to take charge of their health through AI, automation, and intelligent data visualization.

---

## ✨ Features Overview

### 🔐 Authentication & Security
- JWT-based secure login
- Google OAuth support
- Email verification & password reset
- Role-based access control (users vs. super admin)

### 📝 Medical Records Management
- Upload, store & delete lab reports
- Add doctor name, emergency tags, and notes
- View detailed metadata for each record

### 🔍 OCR Lab Report Scanning
- Extract health data using built-in OCR
- Automatically populate relevant health metrics

### 🧠 AI-Based ML Predictions
- Analyze lab reports for anomaly detection
- Generate health risk predictions using integrated ML models

### ♀️ Period Tracker
- Log and predict menstrual cycles & ovulation
- Cycle history with color-coded insights

### 🥗 AI Diet & Lifestyle Suggestions
- Generate personalized meal plans based on medical data
- Exercise & wellness recommendations with weekly goals
- Adaptive lifestyle tracking and motivation prompts

### ⏰ Smart Reminders
- Set custom notifications for:
  - Medications
  - Appointments
  - Lab checkups
  - Period cycles and wellness goals
- Expo push notifications with local + scheduled alerts

### 📬 Notification Center
- Real-time push alerts via Expo
- Admin-sent notifications: bulk, targeted, or scheduled
- View sent history and delivery status

### 📊 Charts & Analytics (Admin Dashboard)
- User growth line chart
- Gender distribution pie chart
- Records & predictions bar graph
- Recent activity & notification timeline

### 🧑‍💼 Admin Dashboard (Web Panel)
- Login as Super Admin (protected)
- View statistics for users, records, predictions, genders
- View, block, or delete users
- See recent signups with details
- Send & schedule push notifications
- View user feedback & reports
- Download/export data as CSV

---

## 🛠 Tech Stack

| Category        | Tools & Libraries                                                                 |
|----------------|-------------------------------------------------------------------------------------|
| **Frontend**    | React Native (Expo), TypeScript, React Navigation, Axios, AsyncStorage            |
| **Backend**     | Node.js, Express.js, MongoDB, Mongoose, JWT, Google OAuth, Nodemailer, Socket.IO  |
| **OCR & ML**    | Tesseract.js (OCR), Custom ML models (Python) for health prediction               |
| **Notifications** | Expo Push Notification SDK                                                       |
| **Admin Dashboard** | React + Vite, Ant Design, TypeScript, Recharts                                |
| **DevOps & Misc** | GitHub, Postman, Figma (design), ESLint + Prettier                              |

---

## 📸 Screenshots

> Screenshots are stored in the `screenshots/` folder.

### 📱 Mobile App

| Home & Records | OCR & Prediction | Diet & Period Tracker |
|----------------|------------------|------------------------|
| ![Home](screenshots/home.png) | ![OCR](screenshots/ocr.png) | ![Diet](screenshots/diet.png) |

| Reminders | Login/Register | Profile |
|----------|----------------|---------|
| ![Reminders](screenshots/reminders.png) | ![Login](screenshots/login.png) | ![Profile](screenshots/profile.png) |

### 🧑‍💼 Admin Panel

| Dashboard | Charts | User Management | Notifications |
|-----------|--------|------------------|----------------|
| ![Dashboard](screenshots/admin-dashboard.png) | ![Charts](screenshots/charts.png) | ![Users](screenshots/users.png) | ![Notify](screenshots/notifications.png) |

---

## 📂 Folder Structure

medora/ │ ├── client/ # Mobile app (React Native) │ ├── assets/ │ ├── src/ │ │ ├── components/ │ │ ├── screens/ │ │ ├── context/ │ │ ├── services/ │ │ └── utils/ │ └── App.tsx │ ├── admin/ # Admin dashboard (React + Vite) │ ├── pages/ │ ├── components/ │ └── App.tsx │ ├── server/ # Backend (Node.js + Express) │ ├── controllers/ │ ├── routes/ │ ├── models/ │ ├── middleware/ │ ├── utils/ │ └── index.ts │ ├── screenshots/ # App screenshots for README ├── .env.example # Sample env file └── README.md # Project documentation


## ⚙️ Installation

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/medora.git
cd medora
2. Setup Mobile App
cd frontend
npm install
npx expo start
Ensure you have expo-cli installed and a device/emulator ready.

3. Setup Admin Panel
cd admin
npm install
npm run dev


4. Setup Backend
cd backned
npm install
npm start

Add your .env file with the following:
PORT=5000
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
EXPO_ACCESS_TOKEN=your_expo_token
EMAIL_USER=your_email
EMAIL_PASS=your_email_password
etc...



✅ Upcoming Features


✅ Health PDF export and share
✅ Chatbot-based medical Q&A
✅ In-app medical glossary
✅ Google Fit / Apple HealthKit integration
✅ Emergency contact and SOS feature

🤝 Contributions
We welcome your contributions, feedback, and ideas!
Fork the repo, submit a PR, or open an issue.

📃 License
This project is licensed under the MIT License.

👩‍💻 Developed By
Crafted with ❤️ by a Master's student in Computer Applications.
Fueled by curiosity, driven by innovation, and powered by the belief that with the right tools, anything is possible.

