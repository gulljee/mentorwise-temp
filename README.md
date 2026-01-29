# MentorWise - Student Mentorship Platform 🎓

**MentorWise** ek Final Year Project (FYP) hai jo **University of the Punjab (PUCIT)** ke Department of Computer Science ke students ke liye develop kiya ja raha hai. Yeh platform Mentees (Juniors) aur Mentors (Seniors) ke darmiyan ek bridge ka kaam karta hai taaki academic guidance aur career counseling aasaani se mil sake.

---

## 📋 Project Details
* **Project Type:** Web Development (MERN Stack)
* **Goal:** SDG 4 - Quality Education 📚
* **Institution:** Department of Computer Science, University of the Punjab
* **Session:** 2022-2026
* **Developed By:** Group BCSF22M (Muhammad Abdullah Gull & Team)

---

## ✅ Implemented Features (Jo Ban Chuke Hain)

Abhi tak ke **Phase-I** development mein yeh features complete ho chuke hain:

### 1. Authentication & Security 🔐
* **User Roles:** System mein **Mentor** aur **Mentee** ke liye alag registration process hai.
* **Sign Up & Login:** Secure Email/Password login (JWT Authentication ke saath).
* **Google OAuth:** "Continue with Google" ka feature jaldi login karne ke liye.
* **Forgot Password:** Email ke zariye secure password reset link bhejne ki suvidha.

### 2. Dashboard & Profiles 👤
* **Mentor Dashboard:** Active students aur pending requests ka real-time count dekhne ke liye.
* **Mentee Dashboard:** Connected mentors aur bheji gayi requests ka status track karne ke liye.
* **Profile Management:** Mentors apni details jaise **CGPA**, **Department**, **Batch**, aur **Subjects/Skills** add kar sakte hain.

### 3. Search & Connect 🔍
* **Find Mentor:** Students filters use karke sahi mentor dhoond sakte hain:
    * *Filter by Department:* (CS, IT, SE, DS)
    * *Filter by CGPA:* (e.g., 3.0+, 3.5+)
    * *Search:* Naam ya specific subject se search karein.
* **Connection System:** Mentees request bhej sakte hain aur Mentors unhe **Accept** ya **Reject** kar sakte hain.
* **My Network:** Connected students aur mentors ki list contact details ke saath available hai.

### 4. UI/UX 🎨
* **Dark Mode Interface:** Modern aur responsive design jo mobile aur desktop dono par chalta hai.
* **Toast Notifications:** Success aur error messages ke liye alerts.

---

## 🚧 Features Yet to Implement (Jo Abhi Baaki Hain)

Yeh features project ke **Phase-II** ya final version mein add kiye jayenge (Code mein abhi missing hain):

### 1. Communication Tools 💬
* **Real-time Chat:** Socket.io ka use karke Mentor aur Mentee ke beech live chatting.
* **Video/Audio Calls:** Virtual meetings ke liye in-app video calling feature (WebRTC).
* **File Sharing:** Assignments ya notes share karne ka option.

### 2. Scheduling & Management 📅
* **Appointment Booking:** Mentee calendar par mentor ka free slot book kar sake.
* **Meeting Scheduler:** Google Calendar integration meetings set karne ke liye.

### 3. Admin Panel 🛡️
* **User Management:** Admin spam users ya fake mentors ko block kar sake.
* **Analytics:** Platform ki usage reports aur success stories track karna.

### 4. Feedback & AI 🤖
* **Review & Rating:** Session ke baad Mentee apne Mentor ko rating de sake.
* **AI Recommendations:** Mentees ki interests ke base par AI dwara best Mentor suggest karna.
* **Skill Badges:** Verified mentors ke liye profile par badges.

---

## 🛠️ Tech Stack

* **Frontend:** React.js (Vite), Tailwind CSS
* **Backend:** Node.js, Express.js
* **Database:** MongoDB
* **Auth:** JWT & Google OAuth

---

## ⚙️ Installation Guide

1. **Clone Repo:** `git clone <repo-url>`
2. **Backend Setup:**
   ```bash
   cd backend
   npm install
   # .env file banayein (MONGO_URI, JWT_SECRET, etc.)
   npm start