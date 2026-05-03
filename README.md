# MentorWise 🚀

MentorWise is a premium, full-stack mentorship platform designed to bridge the gap between experienced mentors and aspiring students (mentees). Built with a focus on modern aesthetics and seamless user experience, MentorWise provides a comprehensive environment for learning, task management, and professional growth.

---

## 🎨 Premium UI & Experience

MentorWise isn't just a functional tool; it's a visual experience.
*   **Modern Aesthetics:** Clean layouts, vibrant gradients, and a sleek "glassmorphism" design.
*   **Fully Responsive:** Optimized for desktop, tablet, and mobile screens.
*   **Interactive UX:** Smooth transitions, micro-animations, and intuitive navigation.
*   **Dynamic Dashboards:** Personalized views for both Mentors and Mentees.

---

## 🛠️ Technology Stack

### Core Frameworks
*   **Frontend:** [React.js](https://reactjs.org/) (built with [Vite](https://vitejs.dev/) for blazing fast performance).
*   **Backend:** [Node.js](https://nodejs.org/) & [Express.js](https://expressjs.com/).
*   **Database:** [MongoDB](https://www.mongodb.com/) (managed via [Mongoose](https://mongoosejs.com/)).

### Security & Authentication
*   **JWT (JSON Web Tokens):** Secure session management.
*   **Google OAuth:** Seamless one-tap login integration.
*   **Bcrypt.js:** Industry-standard password hashing.

### AI Integration
*   **Google Gemini AI:** An integrated AI Consultant/Mentor Assistant available 24/7 to provide instant guidance, code explanations, and study support.

### Key Tools & Libraries
*   **Styling:** [Tailwind CSS v4](https://tailwindcss.com/) for modern, utility-first styling.
*   **Icons:** [Lucide React](https://lucide.dev/) for beautiful, consistent iconography.
*   **File Handling:** [Multer](https://github.com/expressjs/multer) for managing document and image uploads.
*   **Communication:** [Nodemailer](https://nodemailer.com/) for automated email notifications and password resets.
*   **Markdown:** [React Markdown](https://github.com/remarkjs/react-markdown) for rich AI response formatting.

---

## ✨ Key Features

### 1. Intelligent Onboarding & Profiles
*   **Multi-Role System:** Distinct workflows for Mentors and Mentees.
*   **Rich Profiles:** Detailed university tracking (Batch, Department, Campus, CGPA).
*   **Secure Authentication:** Traditional email/password with hashed security or Google OAuth.

### 2. AI Consultant (Powered by Gemini)
*   **24/7 Support:** An AI assistant that understands your role (Mentor/Mentee) and provides tailored advice.
*   **Contextual Help:** From coding snippets to complex theoretical explanations.
*   **Chat History:** Persistent AI chat logs so you never lose a valuable insight.

### 3. Mentorship Connection Engine
*   **Request System:** Mentees can find and request mentors based on expertise.
*   **Management:** Accept, decline, or manage active connections through a dedicated interface.

### 4. Digital Classroom
*   **Task Management:** Mentors can create, assign, and track tasks for their mentees.
*   **Study Materials:** A centralized hub for uploading and sharing educational documents.
*   **Session Management:** Built-in capability to schedule and conduct online sessions for real-time guidance.
*   **Test Management:** Advanced assessment system supporting timed tests to evaluate student progress and learning outcomes.
*   **Submissions:** Mentees can submit work directly within the platform for review.

### 5. Interactive Communication
*   **Direct Messaging:** Real-time-style chat between connected users.
*   **Feedback & Ratings:** A rating system to ensure quality mentorship and help mentors build their reputation.

### 6. Security Features
*   **Password Recovery:** Secure "Forgot Password" flow with email-based reset tokens.
*   **Role-Based Access Control (RBAC):** Protected routes ensure that sensitive areas are only accessible to the authorized users.

---

## 📂 Project Structure

```bash
mentor-wise/
├── backend/            # Express server, API routes, and DB models
│   ├── controllers/    # Business logic for each feature
│   ├── models/         # Mongoose schemas
│   ├── routes/         # API endpoints
│   ├── uploads/        # Local storage for materials/tasks
│   └── server.js       # Main entry point
└── frontend/
    └── vite-project/   # React application
        ├── src/
        │   ├── components/ # Reusable UI elements
        │   ├── pages/      # Full-page views
        │   └── context/    # Global state management
```

---

Developed with ❤️ for PUCIT.