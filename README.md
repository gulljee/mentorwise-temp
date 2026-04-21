# MentorWise - Student Mentorship Platform 🎓

**MentorWise** is a Final Year Project (FYP) developed for the Department of Computer Science at the **University of the Punjab (PUCIT)**. It is a dedicated platform designed to bridge the gap between **Mentees** (Juniors) and **Mentors** (Seniors), facilitating academic guidance, career counseling, and skill development.

---

## 📋 Project Details

| Field | Details |
|---|---|
| **Project Type** | Web Application (MERN Stack) |
| **Goal** | SDG 4 — Quality Education |
| **Institution** | Department of Computer Science, University of the Punjab (PUCIT) |
| **Session** | 2022–2026 |
| **Developed By** | Group BCSF22M — Muhammad Abdullah Gull & Team |

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 19 (Vite), Tailwind CSS v4, React Router DOM v7 |
| **Backend** | Node.js, Express.js v5 |
| **Database** | MongoDB (Mongoose v9) |
| **Authentication** | JWT, Google OAuth (`@react-oauth/google`, `google-auth-library`) |
| **File Uploads** | Multer |
| **Email Service** | Nodemailer (Gmail SMTP) |

---

## 📁 Project Structure

```
mentorwise-temp/
├── backend/
│   ├── controllers/        # Route handler logic
│   ├── middleware/         # Auth & request middleware
│   ├── models/             # Mongoose schemas (User, ConnectionRequest, Message, Task, Rating)
│   ├── routes/             # Express route definitions
│   │   ├── authRoutes.js
│   │   ├── connectionRoutes.js
│   │   ├── messageRoutes.js
│   │   ├── profileRoutes.js
│   │   ├── ratingRoutes.js
│   │   ├── taskRoutes.js
│   │   └── userRoutes.js
│   ├── uploads/            # Uploaded profile images (served statically)
│   ├── utils/
│   │   └── emailService.js # Nodemailer email helper
│   └── server.js           # Express app entry point
│
└── frontend/
    └── vite-project/
        ├── public/
        └── src/
            ├── components/     # Reusable UI components
            │   ├── GoogleOnboarding.jsx
            │   ├── ProfileTab.jsx
            │   ├── ProtectedRoute.jsx
            │   ├── RoleRoute.jsx
            │   ├── StarRating.jsx
            │   └── UserRatingBadge.jsx
            ├── pages/          # Page-level components
            │   ├── LandingPage.jsx
            │   ├── LoginPage.jsx
            │   ├── SignupFormMentor.jsx
            │   ├── ForgotPassword.jsx
            │   ├── ResetPassword.jsx
            │   ├── Dashboard.jsx
            │   ├── MentorDashboard.jsx
            │   ├── MenteeDashboard.jsx
            │   ├── FindMentor.jsx
            │   ├── Classroom.jsx
            │   └── ClassroomDetail.jsx
            ├── App.jsx
            └── main.jsx
```

---

## ✅ Implemented Features (Phase I)

### 1. Authentication & Security 🔐
* **Role-Based Access:** Separate registration and dashboard workflows for **Mentors** and **Mentees**.
* **Secure Auth:** JWT-based authentication with bcrypt-hashed passwords.
* **Google OAuth:** One-click sign-in/sign-up via Google accounts.
* **Password Recovery:** "Forgot Password" flow with secure email reset links (Nodemailer).

### 2. Dashboard & Profile Management 👤
* **Mentor Dashboard:** View active student statistics and manage incoming connection requests.
* **Mentee Dashboard:** Track sent requests and view connected mentors.
* **Profile Customization:** Update CGPA, department, batch, about section, and subjects/skills.
* **Avatar Uploads:** Profile picture uploads handled via Multer.

### 3. Search & Connectivity 🔍
* **Advanced Search:** Filter mentors by **Department** (CS, IT, SE, DS) and minimum **CGPA**.
* **Connection System:** Mentees send requests; Mentors accept or reject them.
* **My Network:** Access contact details of accepted connections.

### 4. Classroom & Tasks 📚
* **Classroom View:** Mentors and mentees can view their shared classroom space.
* **Task Management:** Mentors can assign tasks/milestones to their mentees.

### 5. Ratings & Feedback ⭐
* **Star Ratings:** Mentees can rate mentors after sessions.
* **Rating Badges:** Visual rating indicators displayed on mentor profiles.

### 6. UI/UX 🎨
* **Responsive Dark Mode:** Modern interface built with Tailwind CSS v4.
* **Toast Notifications:** Success and error alerts throughout the app.

---

## 🚀 Planned Features (Phase II)

### Communication Suite 💬
* Real-time chat between connected users (Socket.io)
* Video/audio calls for virtual mentorship sessions (WebRTC)
* File sharing in chat (assignments, roadmaps, resources)

### Scheduling 📅
* Appointment booking with mentor availability slots
* Google Calendar integration for meeting reminders

### Administration & Analytics 🛡️
* Admin panel to manage users and reported content
* Verification badges for high-rated or official university mentors
* Platform engagement analytics

---

## ⚙️ Prerequisites

Make sure the following are installed on your machine:

* [Node.js](https://nodejs.org/) v18 or later
* [npm](https://www.npmjs.com/) v9 or later
* A running [MongoDB](https://www.mongodb.com/) instance (local or [MongoDB Atlas](https://www.mongodb.com/cloud/atlas))
* A Gmail account for Nodemailer (or any SMTP provider)
* A [Google Cloud](https://console.cloud.google.com/) project with OAuth 2.0 credentials (for Google Sign-In)

---

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/gulljee/mentorwise-temp.git
cd mentorwise-temp
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in the `backend/` directory:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/mentorwise

JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=7d

GOOGLE_CLIENT_ID=your_google_client_id

EMAIL_USER=your_gmail_address@gmail.com
EMAIL_PASS=your_gmail_app_password

FRONTEND_URL=http://localhost:5173
```

> **Note:** Use a [Gmail App Password](https://support.google.com/accounts/answer/185833) rather than your regular Gmail password.

Start the backend server:

```bash
# Development (auto-restart on file changes)
npm run dev

# Production
npm start
```

The API will be available at `http://localhost:5000`.

### 3. Frontend Setup

```bash
cd frontend/vite-project
npm install
```

Create a `.env` file in the `frontend/vite-project/` directory:

```env
VITE_API_BASE_URL=http://localhost:5000
VITE_GOOGLE_CLIENT_ID=your_google_client_id
```

Start the frontend dev server:

```bash
npm run dev
```

The app will be available at `http://localhost:5173`.

---

## 📡 API Overview

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/auth/register` | Register a new user |
| `POST` | `/api/auth/login` | Log in with email & password |
| `POST` | `/api/auth/google` | Sign in with Google |
| `POST` | `/api/auth/forgot-password` | Request a password reset email |
| `POST` | `/api/auth/reset-password/:token` | Reset password using token |
| `GET` | `/api/profile/:id` | Get user profile |
| `PUT` | `/api/profile/update` | Update authenticated user's profile |
| `GET` | `/api/user/mentors` | Search/filter mentors |
| `POST` | `/api/connections/request` | Send a connection request |
| `PUT` | `/api/connections/:id` | Accept or reject a request |
| `GET` | `/api/connections/my-network` | Get accepted connections |
| `GET` | `/api/messages/:connectionId` | Get messages for a connection |
| `POST` | `/api/messages` | Send a message |
| `GET` | `/api/tasks` | Get tasks |
| `POST` | `/api/tasks` | Create a task |
| `POST` | `/api/ratings` | Submit a rating |
| `GET` | `/api/ratings/:mentorId` | Get ratings for a mentor |

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature-name`
3. Commit your changes: `git commit -m "feat: add your feature"`
4. Push to the branch: `git push origin feature/your-feature-name`
5. Open a Pull Request

---

## 📄 License

This project is developed for academic purposes as part of a Final Year Project at the University of the Punjab (PUCIT). All rights reserved by the authors.