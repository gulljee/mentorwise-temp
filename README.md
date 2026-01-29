# MentorWise - Student Mentorship Platform 🎓

**MentorWise** is a Final Year Project (FYP) developed for the Department of Computer Science at the **University of the Punjab (PUCIT)**. It is a dedicated platform designed to bridge the gap between **Mentees** (Juniors) and **Mentors** (Seniors), facilitating academic guidance, career counseling, and skill development.

---

## 📋 Project Details
* **Project Type:** Web Development (MERN Stack)
* **Goal:** SDG 4 - Quality Education
* **Institution:** Department of Computer Science, University of the Punjab
* **Session:** 2022-2026
* **Developed By:** Group BCSF22M (Muhammad Abdullah Gull & Team)

---

## ✅ Implemented Features (Phase I)

The following features have been successfully implemented in the current version:

### 1. Authentication & Security 🔐
* **Role-Based Access:** Distinct registration and dashboard workflows for **Mentors** and **Mentees**.
* **Secure Auth:** JWT-based authentication with encrypted passwords.
* **Google OAuth:** One-click login/signup using Google accounts.
* **Password Recovery:** Secure "Forgot Password" functionality via email links (Nodemailer).

### 2. Dashboard & Profile Management 👤
* **Mentor Dashboard:** View statistics on active students and manage incoming requests.
* **Mentee Dashboard:** Track sent requests and view connected mentors.
* **Profile Customization:** Mentors can update their **CGPA**, **Department**, **Batch**, and **Subjects/Skills**.

### 3. Search & Connectivity 🔍
* **Advanced Search:** Find mentors using filters like **Department** (CS, IT, SE, DS) and **CGPA**.
* **Connection System:** Mentees can send requests; Mentors can **Accept** or **Reject** them.
* **My Network:** View contact details of accepted connections.

### 4. UI/UX 🎨
* **Modern Interface:** Fully responsive Dark Mode design using Tailwind CSS.
* **Notifications:** Toast alerts for success and error messages.

---

## 🚀 Features Yet to Implement

The following features are planned for future development (Phase II) and are not yet available in the current codebase:

### 1. Communication Suite 💬
* **Real-time Chat:** Instant messaging between connected mentors and mentees (using Socket.io).
* **Video/Audio Calls:** Integrated video conferencing for virtual mentorship sessions (WebRTC).
* **File Sharing:** Ability to share assignments, roadmaps, and resources directly in chat.

### 2. Scheduling & Productivity 📅
* **Appointment Booking:** Mentees can view mentor availability and book specific time slots.
* **Meeting Scheduler:** Integration with Google Calendar to set up reminders.
* **Task Management:** Mentors can assign tasks/milestones to mentees and track progress.

### 3. Administration & Analytics 🛡️
* **Admin Panel:** A dedicated dashboard for administrators to manage users and report content.
* **User Verification:** Verification badges for high-rated mentors or official university seniors.
* **Platform Analytics:** detailed reports on user engagement and successful connections.

### 4. Feedback System ⭐
* **Reviews & Ratings:** Mentees can rate their experience with mentors after sessions.
* **Feedback Loop:** Anonymous feedback mechanism for platform improvement.

---

## 🛠️ Tech Stack

* **Frontend:** React.js (Vite), Tailwind CSS, React Router DOM
* **Backend:** Node.js, Express.js
* **Database:** MongoDB (Mongoose)
* **Authentication:** JWT & Google OAuth Library
* **Email Service:** Nodemailer (Gmail)