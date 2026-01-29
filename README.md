# MentorWise - Student Mentorship Platform 🎓

**MentorWise** is a full-stack web application designed to bridge the gap between university students (Mentees) and experienced seniors (Mentors). The platform facilitates academic guidance, career advice, and skill development by allowing students to find and connect with the right mentors.

---

## 🚀 Key Features

This project includes the following core functionalities:

### 1. Authentication & Security
* **Secure Signup/Login:** Traditional email/password registration using JWT (JSON Web Tokens) for security.
* **Google OAuth:** Seamless "Sign up with Google" integration for quick onboarding.
* **Role-Based Access:** Distinct registration flows and dashboards for **Mentors** and **Mentees**.
* **Forgot Password:** Secure password reset flow via email using Nodemailer.

### 2. Mentor Features
* **Profile Management:** Mentors can customize their profiles by adding an "About" section, CGPA, and specific subjects/skills.
* **Dashboard Statistics:** View real-time stats on active students and pending requests.
* **Request Management:** Accept or Reject incoming connection requests from students.
* **Student List:** Access a list of connected students with their contact details.

### 3. Mentee Features
* **Find Mentor:** Advanced search functionality with filters:
    * *Filter by Department:* (CS, IT, SE, DS)
    * *Filter by CGPA:* (e.g., 3.0+, 3.5+)
    * *Search by Keyword:* Find mentors by specific names or subjects.
* **Connection Requests:** Send connection requests to preferred mentors.
* **Request Tracking:** Monitor the status of sent requests (Pending, Accepted, or Rejected).
* **My Mentors:** View details of currently connected mentors.

### 4. UI/UX Design
* **Modern Dark Theme:** A visually appealing dark mode interface using Tailwind CSS.
* **Responsive Design:** Fully responsive layout optimized for both mobile and desktop devices.
* **Interactive Elements:** Includes toast notifications for success/error feedback and smooth animations.

---

## 🛠️ Tech Stack

This project is built using the **MERN Stack**:

* **Frontend:** React.js (Vite), Tailwind CSS, React Router DOM.
* **Backend:** Node.js, Express.js.
* **Database:** MongoDB (Mongoose ODM).
* **Authentication:** JSON Web Tokens (JWT), Google Auth Library.
* **Email Service:** Nodemailer (Gmail integration).

---

## ⚙️ Installation & Setup

Follow these steps to run the project locally:

### Prerequisites
* Node.js installed.
* MongoDB installed locally or a MongoDB Atlas account.

### 1. Clone the Repository
```bash
git clone [https://github.com/your-username/mentorwise.git](https://github.com/your-username/mentorwise.git)
cd mentorwise