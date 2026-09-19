# JobConnect AI - Real Full-Stack AI Job Portal Platform

JobConnect AI is a production-ready, full-stack AI-powered recruitment web application built with **React**, **Vite**, **Tailwind CSS**, **Node.js**, **Express**, and **MongoDB**. It bridges job seekers, students, recruiters, and platform administrators with intelligent resume parsing, deterministic & LLM-assisted job matching, real-time status tracking, interview scheduling, and administrative moderation.

---

## 🚀 Key Features

### 👤 1. Three Distinct Roles & Strict Backend RBAC
- **Job Seeker / Student**: Profile builder with skills, education, experience, projects, resume parsing, application tracking, saved bookmarks, and AI recommendations.
- **Recruiter**: Job posting, pipeline dashboard with status distributions, AI candidate match ranking, candidate shortlisting, and interview scheduling.
- **Admin**: Moderation panel for platform health, suspending/activating accounts, verified company badges, and job oversight.

### 🧠 2. AI & Deterministic Matching Engine
- **Transparent Weighted Scoring Algorithm**:
  - **Skills Match**: 45%
  - **Experience Alignment**: 20%
  - **Project Relevance**: 15%
  - **Education Match**: 10%
  - **Job Relevance**: 10%
- Generates:
  - **Match Score (0–100%)**
  - **Matched Skills List**
  - **Growth Areas / Missing Skills**
  - **Contextual Reasoning** explaining why the candidate matches.
- **External AI Integration**: Automatically detects `GEMINI_API_KEY` or `OPENAI_API_KEY` in `.env` to elevate evaluations to external LLMs, with zero hardcoded keys.

### 📄 3. Resume Upload & Document Parsing
- Accepts **PDF**, **DOC**, and **DOCX** files with strict MIME validation and 5MB limits.
- Extracts raw text using `pdf-parse` and `mammoth`.
- Heuristically extracts candidate contact details, skills from a 50+ tech skill taxonomy, education degrees, work experience, and projects.
- **Candidate Confirmation Flow**: Displays extracted details in a review modal so candidates can selectively apply confirmed details to their MongoDB profile without blind overwrites.

### 📊 4. AI Resume Quality Diagnostic Tool (`/student/resume-analysis`)
- Comprehensive score from **0 to 100** across 7 dimensions: Skills, Experience, Projects, Education, Formatting, Keywords, and Achievements.
- Actionable, prioritized suggestions for maximizing ATS scores and recruiter callbacks.

### 🏢 5. Realistic Indian Tech Ecosystem Dataset
- **15 Top Tech Employers**: Razorpay, Swiggy, TCS, Infosys, Zoho, Flipkart, PhonePe, Freshworks, Zomato, Groww, CRED, Wipro, InMobi, Paytm, Ola Cabs.
- **50 Detailed Job Openings** across 8 Indian hubs (Bangalore, Hyderabad, Pune, Chennai, Mumbai, Delhi, Noida, Gurgaon).
- **10 Pre-configured Student Accounts** with diverse skills, college degrees, and projects.
- **5 Pre-configured Recruiter Accounts** and **1 Platform Admin**.

---

## 💻 Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18, Vite, Tailwind CSS, React Router v6, Axios, Lucide Icons |
| **Backend** | Node.js, Express.js REST API, Morgan |
| **Database** | MongoDB, Mongoose ODM *(Includes automatic in-memory fallback for zero-install setup)* |
| **Authentication** | JWT (JSON Web Tokens), bcryptjs password encryption |
| **File Handling** | Multer, pdf-parse, mammoth |
| **AI Layer** | Built-in weighted deterministic scoring + Gemini / OpenAI API pluggable |

---

## 🖥️ How to Run in VS Code

### Method 1: VS Code Integrated Terminal (Recommended)

1. **Open the Project in VS Code**:
   - Launch VS Code.
   - Click **File > Open Folder...** and select:
     `c:\Users\mahesh chinthala\Documents\Job Portal(Project)`

2. **Open the Integrated Terminal**:
   - Press `` Ctrl + ` `` (or select **Terminal > New Terminal** from the menu).

3. **Run Both Backend and Frontend in 2 Terminals**:

   **Terminal 1 (Backend Server):**
   ```bash
   cd backend
   npm run dev
   ```
   *The backend will boot on port `5000`. If you don't have MongoDB running locally, it will automatically spin up an embedded in-memory MongoDB and auto-seed the dataset!*

   **Terminal 2 (Frontend Client):**
   - Click the **`+`** icon in the terminal panel to open a second terminal tab.
   ```bash
   cd frontend
   npm run dev
   ```
   *Vite will start at `http://localhost:5173`.*

4. **Open in Browser**:
   - Navigate to [http://localhost:5173](http://localhost:5173).

---

### Method 2: VS Code Tasks (One-Click)

1. Press `Ctrl + Shift + P` in VS Code to open the Command Palette.
2. Type **`Tasks: Run Task`** and press Enter.
3. Select:
   - **`Start Backend Server`**
   - Then open another task and select **`Start Frontend Client`**.

---

### Method 3: Run Automated Verification Tests

To verify that all 10 API endpoints, role authorizations, and database operations pass:
```bash
cd backend
npm test
```

---

## 🔑 Demo Login Accounts

All test accounts use the password: **`Password@123`**

| Role | Email | Password | Details |
|---|---|---|---|
| **Student** | `rahul.sharma@gmail.com` | `Password@123` | Full Stack React/Node profile with applications |
| **Student 2** | `priya.patel@gmail.com` | `Password@123` | Frontend TypeScript / Design Systems candidate |
| **Recruiter** | `recruiter.razorpay@jobconnect.ai` | `Password@123` | Razorpay talent manager with active postings |
| **Recruiter 2**| `recruiter.swiggy@jobconnect.ai` | `Password@123` | Swiggy hiring team |
| **Admin** | `admin@jobconnect.ai` | `Password@123` | Platform Administrator console |

> **Tip**: The login page (`/login`) includes a **1-Click Demo Logins** bar that automatically fills in credentials for instant testing!

---

## ⚙️ Environment Variables

Create or review `backend/.env`:

```env
PORT=5000
NODE_ENV=development

# MongoDB Connection String:
# Default points to local MongoDB. If connection is refused, an embedded in-memory instance is auto-started.
MONGODB_URI=mongodb://127.0.0.1:27017/jobconnect-ai

# JWT Secret
JWT_SECRET=jobconnect_super_secret_jwt_key_998877_dev_production
JWT_EXPIRES_IN=7d

# Client URL for CORS
CLIENT_URL=http://localhost:5173

# Optional: Pluggable External AI API Key (Leave empty to use built-in matching engine)
GEMINI_API_KEY=
OPENAI_API_KEY=
```

---

## 📡 REST API Reference Summary

### Authentication (`/api/auth`)
- `POST /api/auth/register`: Register student or recruiter.
- `POST /api/auth/login`: Login and receive JWT.
- `GET /api/auth/me`: Get current authenticated profile.
- `POST /api/auth/forgot-password`: Request password reset token.
- `POST /api/auth/reset-password`: Reset password with token.

### Jobs (`/api/jobs`)
- `GET /api/jobs`: Search, filter by salary/exp/mode/location, sort, and paginate.
- `GET /api/jobs/:id`: Single job details with similar jobs.
- `POST /api/jobs`: Post a new job (Recruiter/Admin).
- `PUT /api/jobs/:id`: Update job (Owner/Admin).
- `DELETE /api/jobs/:id`: Delete job (Owner/Admin).

### Applications (`/api/applications`)
- `POST /api/applications/:jobId`: Apply with AI match evaluation.
- `GET /api/applications/my`: Student's applied jobs history.
- `GET /api/applications/:id`: Application inspection.
- `PUT /api/applications/:id/status`: Update status (Shortlist, Reject, Interview).

### AI & Resumes (`/api/resumes`, `/api/student`)
- `POST /api/resumes/upload`: Upload and extract document text.
- `POST /api/resumes/confirm`: Commit confirmed parsed data to profile.
- `GET /api/student/recommended-jobs`: Jobs ranked by AI match score.
- `GET /api/student/resume-analysis`: 7-dimension resume diagnostic.

### Interviews & Notifications (`/api/interviews`, `/api/notifications`)
- `POST /api/interviews`: Schedule interview with meeting link.
- `GET /api/interviews/recruiter`: Recruiter's interview schedule.
- `GET /api/interviews/my`: Candidate's upcoming rounds.
- `GET /api/notifications`: Real-time notification inbox.

### Admin (`/api/admin`)
- `GET /api/admin/stats`: Platform analytics.
- `GET /api/admin/users`: User directory with search and role filters.
- `PUT /api/admin/users/:id/suspend`: Account suspension toggle.
- `PUT /api/admin/companies/:id/verify`: Company verification toggle.

---

## 🛡️ Security Features
- **Strict Role-Based Authorization**: `authenticateUser` and `requireRole` middleware applied to all private endpoints.
- **bcrypt Password Hashing**: Passwords are never stored in plain text.
- **Duplicate Prevention**: Compound unique indexes on `{ studentId, jobId }` prevent duplicate applications and duplicate bookmarks.
- **Sanitized Uploads**: Filenames sanitized with unique timestamps and restricted to safe MIME types.
- **CORS & Helmet**: Secure headers configured for multi-origin access.
