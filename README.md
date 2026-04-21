# MentorWise 🚀

Welcome to MentorWise! This is a complete web platform designed to connect students (Mentees) with Mentors for proper guidance, learning, and task management. 

## 💻 Technologies Used

This project is built using the MERN stack along with some modern tools:

* **Frontend:** React.js created with Vite for fast loading.
* **Styling:** Tailwind CSS is used for making the design beautiful and responsive.
* **Icons:** `lucide-react` is used for adding nice icons in the UI.
* **Backend:** Node.js with the Express.js framework.
* **Database:** MongoDB is used to save data, managed through Mongoose.
* **Authentication:** JSON Web Tokens (JWT) and Google OAuth.
* **File Uploads:** `multer` is used to handle files and documents.
* **Emails:** `nodemailer` is used to send automated emails.

---

## ✨ Features Implemented & How They Work

### 1. User Login and Registration
* **Feature:** Users can create an account using their email and password, or simply login with their Google account.
* **Implementation:** When a user signs up normally, we use the `bcryptjs` library to securely hash (hide) their password before saving it in MongoDB. For login sessions, we generate a token using `jsonwebtoken`. For Google login, the frontend uses `@react-oauth/google` to get the Google profile, and the backend verifies it using `google-auth-library`.

### 2. Role-Based Dashboards
* **Feature:** There are two main roles in the system: Mentor and Mentee. Each role sees a totally different dashboard and classroom screen.
* **Implementation:** In our React Router (`App.jsx`), we created a special `<RoleRoute>` component. This component checks the user's role. If a Mentee tries to open the Mentor dashboard, the route stops them and keeps the app secure.

### 3. Forgot & Reset Password
* **Feature:** If someone forgets their password, they can easily get a reset link on their email to make a new password.
* **Implementation:** In the backend `User` model, we use Node's `crypto` module to generate a random `resetPasswordToken` and an expiry time limit. Then, `nodemailer` takes this token and sends a reset link to the user's email.

### 4. Detailed University Profiles
* **Feature:** Users can save their complete university details like Batch (F22, F23, etc.), Department (CS, IT, SE, DS), Campus (New or Old), and even their CGPA.
* **Implementation:** The Mongoose database schema uses `enum` arrays. This is like a strict rule that makes sure users can only select from the allowed departments and batches, keeping our database clean and free of wrong entries.

### 5. Mentorship Connections
* **Feature:** Users can send, accept, or manage connection requests with each other.
* **Implementation:** We made a separate `/api/connections` route in Express. This talks to the database to update the connection status between two people.

### 6. Classroom and Task Management
* **Feature:** Mentors can assign tasks to their Mentees in a dedicated Classroom area.
* **Implementation:** The frontend has separate UI pages like `/classroom/mentor/detail`. The backend uses the `/api/tasks` route to save task details. If a task has a document file attached, we save that file in our local `/uploads` folder using the `multer` middleware.

### 7. Chat Messages & Ratings
* **Feature:** Connected users can message each other, and they can also give ratings to show how good their mentorship experience was.
* **Implementation:** We have created `/api/messages` to save chat history and `/api/ratings` to handle the feedback scores. 

---

## 🚧 Project Status

Please note that this project is currently a work in progress. Some features are still missing, but until now, **about 75% of the project has been fully implemented** and is working perfectly. We will be adding the remaining features very soon!