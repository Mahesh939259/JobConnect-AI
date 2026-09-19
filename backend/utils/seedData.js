const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

const { connectDB, disconnectDB } = require('../config/db');

// Models
const User = require('../models/User');
const StudentProfile = require('../models/StudentProfile');
const RecruiterProfile = require('../models/RecruiterProfile');
const Company = require('../models/Company');
const Job = require('../models/Job');
const Application = require('../models/Application');
const SavedJob = require('../models/SavedJob');
const Interview = require('../models/Interview');
const Notification = require('../models/Notification');

// Realistic Indian tech cities
const CITIES = ['Bangalore', 'Hyderabad', 'Pune', 'Chennai', 'Mumbai', 'Noida', 'Gurgaon', 'Delhi'];

// Companies dataset (15 major Indian tech leaders & high-growth startups)
const COMPANIES_DATA = [
  {
    name: 'Razorpay',
    industry: 'FinTech',
    location: 'Bangalore',
    website: 'https://razorpay.com',
    companySize: '1000-5000 employees',
    foundedYear: 2014,
    description: 'Razorpay is India’s leading full-stack financial solutions company powering seamless payments for millions of businesses.',
    logo: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=150&auto=format&fit=crop&q=80',
  },
  {
    name: 'Swiggy',
    industry: 'E-Commerce / FoodTech',
    location: 'Bangalore',
    website: 'https://swiggy.com',
    companySize: '5000+ employees',
    foundedYear: 2014,
    description: 'Swiggy is India’s leading on-demand convenience platform, connecting consumers to millions of restaurants and stores.',
    logo: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=150&auto=format&fit=crop&q=80',
  },
  {
    name: 'Tata Consultancy Services',
    industry: 'IT Services',
    location: 'Mumbai',
    website: 'https://tcs.com',
    companySize: '10000+ employees',
    foundedYear: 1968,
    description: 'TCS is a global leader in IT services, consulting, and business solutions with an agile, future-ready workforce.',
    logo: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=150&auto=format&fit=crop&q=80',
  },
  {
    name: 'Infosys',
    industry: 'IT Consulting & Services',
    location: 'Bangalore',
    website: 'https://infosys.com',
    companySize: '10000+ employees',
    foundedYear: 1981,
    description: 'Infosys is a global leader in next-generation digital services and consulting, enabling clients across 56 countries to navigate digital transformation.',
    logo: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=150&auto=format&fit=crop&q=80',
  },
  {
    name: 'Zoho Corporation',
    industry: 'Enterprise Software / SaaS',
    location: 'Chennai',
    website: 'https://zoho.com',
    companySize: '10000+ employees',
    foundedYear: 1996,
    description: 'Zoho offers beautifully smart software to help you grow your business. With over 100M+ users worldwide.',
    logo: 'https://images.unsplash.com/photo-1572021335469-31706a17aaef?w=150&auto=format&fit=crop&q=80',
  },
  {
    name: 'Flipkart',
    industry: 'E-Commerce',
    location: 'Bangalore',
    website: 'https://flipkart.com',
    companySize: '5000+ employees',
    foundedYear: 2007,
    description: 'Flipkart is one of India’s leading digital commerce entities, revolutionizing retail through technology.',
    logo: 'https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=150&auto=format&fit=crop&q=80',
  },
  {
    name: 'PhonePe',
    industry: 'Digital Payments / FinTech',
    location: 'Bangalore',
    website: 'https://phonepe.com',
    companySize: '1000-5000 employees',
    foundedYear: 2015,
    description: 'PhonePe is an Indian digital payments and financial services company trusted by over 500 million registered users.',
    logo: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=150&auto=format&fit=crop&q=80',
  },
  {
    name: 'Freshworks',
    industry: 'SaaS / Customer Experience',
    location: 'Chennai',
    website: 'https://freshworks.com',
    companySize: '1000-5000 employees',
    foundedYear: 2010,
    description: 'Freshworks makes modern, delightful enterprise software designed for IT, customer support, and sales teams.',
    logo: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=150&auto=format&fit=crop&q=80',
  },
  {
    name: 'Zomato',
    industry: 'FoodTech & Logistics',
    location: 'Gurgaon',
    website: 'https://zomato.com',
    companySize: '1000-5000 employees',
    foundedYear: 2008,
    description: 'Zomato is an Indian multinational restaurant aggregator and food delivery service driving culinary discovery.',
    logo: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=150&auto=format&fit=crop&q=80',
  },
  {
    name: 'Groww',
    industry: 'FinTech / Investment',
    location: 'Bangalore',
    website: 'https://groww.in',
    companySize: '500-1000 employees',
    foundedYear: 2016,
    description: 'Groww makes investing simple, transparent, and accessible to everyone in India with cutting-edge tech.',
    logo: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=150&auto=format&fit=crop&q=80',
  },
  {
    name: 'CRED',
    industry: 'FinTech / Rewards',
    location: 'Bangalore',
    website: 'https://cred.club',
    companySize: '500-1000 employees',
    foundedYear: 2018,
    description: 'CRED is a members-only club that rewards creditworthy individuals with exclusive perks and financial solutions.',
    logo: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=150&auto=format&fit=crop&q=80',
  },
  {
    name: 'Wipro Technologies',
    industry: 'IT Services & Consulting',
    location: 'Bangalore',
    website: 'https://wipro.com',
    companySize: '10000+ employees',
    foundedYear: 1945,
    description: 'Wipro is a leading technology services and consulting company focused on building innovative solutions.',
    logo: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=150&auto=format&fit=crop&q=80',
  },
  {
    name: 'InMobi',
    industry: 'AdTech / Mobile Marketing',
    location: 'Bangalore',
    website: 'https://inmobi.com',
    companySize: '1000-5000 employees',
    foundedYear: 2007,
    description: 'InMobi drives real connections between brands and consumers through intelligent mobile marketing technology.',
    logo: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=150&auto=format&fit=crop&q=80',
  },
  {
    name: 'Paytm',
    industry: 'Digital Payments / FinTech',
    location: 'Noida',
    website: 'https://paytm.com',
    companySize: '5000+ employees',
    foundedYear: 2010,
    description: 'Paytm is India’s leading payments app that enables millions of merchants and consumers to transact digitally.',
    logo: 'https://images.unsplash.com/photo-1556742049-0a67c5574f73?w=150&auto=format&fit=crop&q=80',
  },
  {
    name: 'Ola Cabs',
    industry: 'Mobility / EV',
    location: 'Bangalore',
    website: 'https://olacabs.com',
    companySize: '5000+ employees',
    foundedYear: 2010,
    description: 'Ola is one of the world’s largest ride-hailing companies and a pioneer in sustainable electric mobility.',
    logo: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=150&auto=format&fit=crop&q=80',
  },
];

// 50 Job Postings Templates
const JOB_TITLES = [
  { title: 'Full Stack React & Node Developer', cat: 'Full Stack', skills: ['React', 'Node.js', 'Express', 'MongoDB', 'JavaScript', 'Tailwind CSS'] },
  { title: 'Senior Frontend Engineer (React / TypeScript)', cat: 'Frontend Development', skills: ['React', 'TypeScript', 'Redux', 'HTML5', 'CSS3', 'REST API'] },
  { title: 'Backend Systems Engineer (Node.js & Microservices)', cat: 'Backend Development', skills: ['Node.js', 'Express', 'Redis', 'Docker', 'MongoDB', 'PostgreSQL'] },
  { title: 'Java Spring Boot Developer', cat: 'Backend Development', skills: ['Java', 'Spring Boot', 'Microservices', 'MySQL', 'REST API', 'Docker'] },
  { title: 'Python Backend Engineer', cat: 'Backend Development', skills: ['Python', 'Django', 'FastAPI', 'PostgreSQL', 'Redis', 'Docker'] },
  { title: 'AI & Machine Learning Engineer', cat: 'AI/ML', skills: ['Python', 'TensorFlow', 'PyTorch', 'Scikit-Learn', 'Machine Learning', 'NLP'] },
  { title: 'Data Scientist / Analytics Specialist', cat: 'Data Science', skills: ['Python', 'Pandas', 'NumPy', 'Data Analysis', 'SQL', 'Machine Learning'] },
  { title: 'DevOps & Cloud Engineer (AWS / Kubernetes)', cat: 'DevOps', skills: ['AWS', 'Docker', 'Kubernetes', 'CI/CD', 'Terraform', 'Linux'] },
  { title: 'Cloud Infrastructure Engineer (Azure)', cat: 'Cloud Computing', skills: ['Azure', 'Docker', 'Kubernetes', 'Linux', 'Terraform', 'CI/CD'] },
  { title: 'Cybersecurity Analyst & Penetration Tester', cat: 'Cybersecurity', skills: ['Linux', 'Network Security', 'OWASP', 'Penetration Testing', 'Python'] },
  { title: 'UI/UX Product Designer', cat: 'UI/UX', skills: ['Figma', 'System Design', 'HTML5', 'CSS3', 'User Research', 'Prototyping'] },
  { title: 'Mobile App Developer (React Native)', cat: 'Software Development', skills: ['React Native', 'JavaScript', 'TypeScript', 'Redux', 'REST API'] },
  { title: 'Junior Frontend Developer (React)', cat: 'Frontend Development', skills: ['React', 'JavaScript', 'HTML5', 'CSS3', 'Git', 'Bootstrap'] },
  { title: 'Associate Software Engineer - Trainee', cat: 'Software Development', skills: ['Java', 'JavaScript', 'SQL', 'Data Structures', 'Algorithms'] },
  { title: 'Data Engineer (PySpark & Airflow)', cat: 'Data Science', skills: ['Python', 'SQL', 'Apache Spark', 'AWS', 'PostgreSQL', 'ETL'] },
];

const seedDatabase = async () => {
  try {
    if (mongoose.connection.readyState === 0) {
      await connectDB();
    }

    // Clear existing data
    console.log('[JobConnect AI] Clearing old records...');
    await Promise.all([
      User.deleteMany({}),
      StudentProfile.deleteMany({}),
      RecruiterProfile.deleteMany({}),
      Company.deleteMany({}),
      Job.deleteMany({}),
      Application.deleteMany({}),
      SavedJob.deleteMany({}),
      Interview.deleteMany({}),
      Notification.deleteMany({}),
    ]);

    // 1. Create Admin Account
    console.log('[JobConnect AI] Creating Platform Admin account...');
    const adminPasswordHash = await bcrypt.hash('Password@123', 10);
    const adminUser = await User.create({
      name: 'System Administrator',
      email: 'admin@jobconnect.ai',
      password: 'Password@123',
      role: 'admin',
      phone: '+91 98765 00001',
      location: 'Hyderabad',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    });

    // 2. Create 5 Recruiter Accounts
    console.log('[JobConnect AI] Creating 5 Recruiter accounts...');
    const recruitersData = [
      { name: 'Vikram Mehta', email: 'recruiter.razorpay@jobconnect.ai', company: 'Razorpay', location: 'Bangalore' },
      { name: 'Neha Sharma', email: 'recruiter.swiggy@jobconnect.ai', company: 'Swiggy', location: 'Bangalore' },
      { name: 'Sanjay Deshmukh', email: 'recruiter.tcs@jobconnect.ai', company: 'Tata Consultancy Services', location: 'Mumbai' },
      { name: 'Kavita Rao', email: 'recruiter.zoho@jobconnect.ai', company: 'Zoho Corporation', location: 'Chennai' },
      { name: 'Amit Verma', email: 'recruiter.flipkart@jobconnect.ai', company: 'Flipkart', location: 'Bangalore' },
    ];

    const recruiterUsers = [];
    for (const r of recruitersData) {
      const u = await User.create({
        name: r.name,
        email: r.email,
        password: 'Password@123',
        role: 'recruiter',
        phone: '+91 98765 ' + Math.floor(10000 + Math.random() * 90000),
        location: r.location,
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      });
      recruiterUsers.push({ user: u, companyName: r.company });
    }

    // 3. Create 15 Companies
    console.log('[JobConnect AI] Creating 15 Tech Companies...');
    const createdCompanies = [];
    for (let i = 0; i < COMPANIES_DATA.length; i++) {
      const c = COMPANIES_DATA[i];
      // Assign to one of the recruiter users
      const assignedRecruiter = recruiterUsers[i % recruiterUsers.length].user;
      const comp = await Company.create({
        ...c,
        createdBy: assignedRecruiter._id,
        isVerified: true,
      });
      createdCompanies.push(comp);

      // Link to recruiter profile if primary
      if (i < recruiterUsers.length) {
        await RecruiterProfile.create({
          userId: recruiterUsers[i].user._id,
          companyId: comp._id,
          companyName: comp.name,
          designation: 'Head of Technical Talent Acquisition',
          department: 'Engineering Hiring',
          workPhone: '+91 80 4000 1234',
          about: `Leading talent acquisition across tech and product teams at ${comp.name}.`,
        });
      }
    }

    // 4. Create 50 Jobs across Indian Tech Hubs
    console.log('[JobConnect AI] Creating 50 Jobs across Indian Hubs...');
    const createdJobs = [];
    for (let i = 0; i < 50; i++) {
      const template = JOB_TITLES[i % JOB_TITLES.length];
      const comp = createdCompanies[i % createdCompanies.length];
      const assignedRecruiter = recruiterUsers[i % recruiterUsers.length].user;
      const city = CITIES[i % CITIES.length];

      const minExp = i % 4 === 0 ? 0 : i % 3 === 0 ? 1 : 2;
      const maxExp = minExp + (i % 2 === 0 ? 2 : 3);
      const minSal = (6 + (i % 8) * 2) * 100000; // in INR e.g. 6 LPA to 22 LPA
      const maxSal = minSal + (3 + (i % 5)) * 100000;

      const jobTypes = ['Full Time', 'Full Time', 'Full Time', 'Internship', 'Contract'];
      const workModes = ['Remote', 'Hybrid', 'On-site'];

      const job = await Job.create({
        title: template.title,
        company: comp.name,
        companyId: comp._id,
        description: `We are looking for an exceptional ${template.title} to join our high-performing technology team at ${comp.name} in ${city}. You will architect, build, and deploy reliable software products that impact millions of users across India.`,
        responsibilities: [
          'Design and implement scalable, secure, and resilient software features.',
          'Collaborate closely with product managers, UX designers, and senior engineers.',
          'Write unit, integration, and end-to-end tests to guarantee high code quality.',
          'Participate in design reviews, sprint planning, and agile standups.',
        ],
        requirements: [
          `Strong proficiency with ${(template.skills || []).slice(0, 3).join(', ')}.`,
          `Hands-on experience with version control (Git) and RESTful architecture.`,
          `Solid understanding of computer science fundamentals, data structures, and algorithms.`,
          `Bachelor's or Master's degree in Computer Science or equivalent practical experience.`,
        ],
        preferredSkills: ['Docker', 'AWS', 'System Design', 'CI/CD Pipelines'],
        qualifications: ['B.Tech / B.E. / MCA / M.Tech in CS, IT, or related fields.'],
        skills: template.skills,
        location: city,
        salaryMin: minSal,
        salaryMax: maxSal,
        experienceMin: minExp,
        experienceMax: maxExp,
        jobType: jobTypes[i % jobTypes.length],
        workMode: workModes[i % workModes.length],
        industry: comp.industry,
        benefits: [
          'Comprehensive Health & Medical Insurance',
          'Flexible Work Hours & Hybrid Culture',
          'Annual Learning & Development Allowance',
          'Generous Paid Time Off & Wellness Days',
          'Performance-based Annual Bonus & ESOPs',
        ],
        applicationDeadline: new Date(Date.now() + (20 + (i % 30)) * 24 * 60 * 60 * 1000),
        status: 'Active',
        createdBy: assignedRecruiter._id,
      });

      createdJobs.push(job);
    }

    // 5. Create 10 Realistic Student Accounts
    console.log('[JobConnect AI] Creating 10 Student accounts with profiles...');
    const studentsSeed = [
      {
        name: 'Rahul Sharma',
        email: 'rahul.sharma@gmail.com',
        location: 'Hyderabad',
        headline: 'Full Stack Developer | React, Node.js & Cloud Computing',
        skills: ['React', 'JavaScript', 'Node.js', 'Express', 'MongoDB', 'Tailwind CSS', 'Git', 'REST API'],
        degree: 'B.Tech in Computer Science',
        college: 'IIT Hyderabad',
        gradYear: '2025',
      },
      {
        name: 'Priya Patel',
        email: 'priya.patel@gmail.com',
        location: 'Bangalore',
        headline: 'Frontend Engineer | React, TypeScript & Design Systems',
        skills: ['React', 'TypeScript', 'JavaScript', 'HTML5', 'CSS3', 'Redux', 'Tailwind CSS', 'Figma'],
        degree: 'B.Tech in Information Technology',
        college: 'NIT Surathkal',
        gradYear: '2024',
      },
      {
        name: 'Arjun Reddy',
        email: 'arjun.reddy@gmail.com',
        location: 'Hyderabad',
        headline: 'Backend & Cloud Specialist | Java, Spring Boot, AWS',
        skills: ['Java', 'Spring Boot', 'MySQL', 'Docker', 'AWS', 'Microservices', 'REST API', 'Linux'],
        degree: 'B.Tech in Computer Engineering',
        college: 'IIIT Hyderabad',
        gradYear: '2025',
      },
      {
        name: 'Sneha Kulkarni',
        email: 'sneha.kulkarni@gmail.com',
        location: 'Pune',
        headline: 'AI / ML Engineer & Data Scientist | Python, TensorFlow',
        skills: ['Python', 'Machine Learning', 'TensorFlow', 'PyTorch', 'Pandas', 'NumPy', 'SQL', 'NLP'],
        degree: 'M.Tech in Artificial Intelligence',
        college: 'COEP Pune',
        gradYear: '2024',
      },
      {
        name: 'Vivek Kumar',
        email: 'vivek.kumar@gmail.com',
        location: 'Delhi',
        headline: 'DevOps & Cloud Infrastructure Engineer | Kubernetes & CI/CD',
        skills: ['Linux', 'Docker', 'Kubernetes', 'AWS', 'CI/CD', 'Terraform', 'Python', 'Git'],
        degree: 'B.Tech in Computer Science',
        college: 'DTU Delhi',
        gradYear: '2025',
      },
      {
        name: 'Ananya Iyer',
        email: 'ananya.iyer@gmail.com',
        location: 'Chennai',
        headline: 'UI/UX Designer & Frontend Developer | Figma & React',
        skills: ['Figma', 'UI/UX', 'HTML5', 'CSS3', 'JavaScript', 'React', 'Tailwind CSS'],
        degree: 'B.Des & Technology',
        college: 'Anna University Chennai',
        gradYear: '2025',
      },
      {
        name: 'Rohan Gupta',
        email: 'rohan.gupta@gmail.com',
        location: 'Gurgaon',
        headline: 'Python Backend Developer | Django, FastAPI & PostgreSQL',
        skills: ['Python', 'Django', 'FastAPI', 'PostgreSQL', 'Redis', 'Docker', 'Git'],
        degree: 'B.Tech in Computer Science',
        college: 'NSUT Delhi',
        gradYear: '2024',
      },
      {
        name: 'Meera Nair',
        email: 'meera.nair@gmail.com',
        location: 'Bangalore',
        headline: 'Mobile App Developer | React Native & Flutter',
        skills: ['React Native', 'JavaScript', 'TypeScript', 'React', 'Redux', 'REST API'],
        degree: 'B.E. in Computer Science',
        college: 'RV College of Engineering Bangalore',
        gradYear: '2025',
      },
      {
        name: 'Aditya Joshi',
        email: 'aditya.joshi@gmail.com',
        location: 'Mumbai',
        headline: 'Cybersecurity Analyst & Systems Engineer',
        skills: ['Linux', 'Network Security', 'OWASP', 'Penetration Testing', 'Python', 'Git'],
        degree: 'B.Tech in Information Security',
        college: 'VJTI Mumbai',
        gradYear: '2024',
      },
      {
        name: 'Karthik Raja',
        email: 'karthik.raja@gmail.com',
        location: 'Chennai',
        headline: 'Full Stack MERN Developer & Open Source Contributor',
        skills: ['React', 'Node.js', 'Express', 'MongoDB', 'JavaScript', 'REST API', 'Git'],
        degree: 'B.Tech in Information Technology',
        college: 'PSG Tech Coimbatore',
        gradYear: '2025',
      },
    ];

    const studentUsers = [];
    for (const s of studentsSeed) {
      const studentUser = await User.create({
        name: s.name,
        email: s.email,
        password: 'Password@123',
        role: 'student',
        phone: '+91 98765 ' + Math.floor(10000 + Math.random() * 90000),
        location: s.location,
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
      });

      const profile = await StudentProfile.create({
        userId: studentUser._id,
        headline: s.headline,
        bio: `Passionate engineer motivated to build impactful, scalable software. Experienced in modern full-stack workflows, clean code principles, and collaborative problem solving.`,
        skills: s.skills,
        education: [
          {
            degree: s.degree,
            college: s.college,
            fieldOfStudy: 'Computer Science & Engineering',
            graduationYear: s.gradYear,
            cgpa: '8.8',
            description: 'Core coursework in Algorithms, Operating Systems, Database Management, and Web Technologies.',
          },
        ],
        experience: [
          {
            company: 'Tech Innovators India',
            position: 'Software Developer Intern',
            startDate: 'Jan 2024',
            endDate: 'Jun 2024',
            current: false,
            description: 'Engineered RESTful APIs, optimized database queries reducing latency by 35%, and built responsive frontend dashboards.',
          },
        ],
        projects: [
          {
            title: 'JobConnect AI Platform',
            description: 'Full-stack AI-assisted recruitment platform with automated resume parsing and intelligent job-candidate matching.',
            technologies: ['React', 'Node.js', 'Express', 'MongoDB', 'Tailwind CSS'],
            githubUrl: 'https://github.com/example/jobconnect-ai',
            liveUrl: 'https://jobconnect.ai',
          },
          {
            title: 'Cloud DevOps CI/CD Pipeline',
            description: 'Automated deployment pipeline leveraging Docker containers and cloud infrastructure with zero-downtime rolling updates.',
            technologies: ['Docker', 'AWS', 'Linux', 'Git'],
            githubUrl: 'https://github.com/example/devops-pipeline',
            liveUrl: '',
          },
        ],
        certifications: [
          {
            name: 'AWS Certified Cloud Practitioner',
            organization: 'Amazon Web Services',
            issueDate: '2024',
            credentialUrl: 'https://aws.amazon.com',
          },
        ],
        links: {
          linkedin: 'https://linkedin.com/in/' + s.name.toLowerCase().replace(' ', ''),
          github: 'https://github.com/' + s.name.toLowerCase().replace(' ', ''),
          portfolio: 'https://' + s.name.toLowerCase().replace(' ', '') + '.dev',
        },
        resumeUrl: '/uploads/resumes/sample_resume.pdf',
        resumeOriginalName: `${s.name.replace(' ', '_')}_Resume.pdf`,
        resumeScore: 88,
        profileCompletion: 95,
      });

      studentUsers.push({ user: studentUser, profile });
    }

    // 6. Create Initial Applications, Saved Jobs, and Interviews
    console.log('[JobConnect AI] Seeding initial Applications, Saved Jobs, and Interviews...');
    const primaryStudent = studentUsers[0]; // Rahul Sharma

    // Rahul applies to 3 jobs
    const appliedJobs = [createdJobs[0], createdJobs[1], createdJobs[2]];
    const statuses = ['Interview', 'Shortlisted', 'Applied'];

    for (let i = 0; i < appliedJobs.length; i++) {
      const j = appliedJobs[i];
      const app = await Application.create({
        studentId: primaryStudent.user._id,
        jobId: j._id,
        recruiterId: j.createdBy,
        resumeUrl: primaryStudent.profile.resumeUrl,
        coverLetter: `Dear Hiring Team at ${j.company},\n\nI am thrilled to apply for the ${j.title} role. My hands-on background in full-stack web development with React and Node.js aligns directly with your technology requirements. Looking forward to contributing to your engineering goals.`,
        portfolio: primaryStudent.profile.links.portfolio,
        linkedin: primaryStudent.profile.links.linkedin,
        github: primaryStudent.profile.links.github,
        status: statuses[i],
        aiMatch: {
          score: 94 - i * 5,
          matchedSkills: ['React', 'Node.js', 'Express', 'MongoDB'],
          missingSkills: ['Docker'],
          experienceMatch: 'Strong match: Ideal experience for entry/mid level',
          educationMatch: 'Direct alignment: Holds B.Tech in CS',
          reason: `High compatibility with core tech stack (${j.title}). Strong project portfolio demonstrating full-stack competencies.`,
          breakdown: { skills: 92, experience: 85, projects: 95, education: 95, relevance: 90 },
        },
      });

      // Update job applicants counter
      await Job.findByIdAndUpdate(j._id, { $inc: { applicantsCount: 1 } });

      // If status is Interview, schedule an interview!
      if (statuses[i] === 'Interview') {
        await Interview.create({
          applicationId: app._id,
          candidateId: primaryStudent.user._id,
          recruiterId: j.createdBy,
          jobId: j._id,
          date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // in 3 days
          time: '03:00 PM IST',
          type: 'Online',
          meetingLink: 'https://meet.google.com/abc-jobc-xyz',
          notes: 'Technical discussion on React architecture, state management, and backend REST APIs.',
          status: 'Scheduled',
        });

        await Notification.create({
          userId: primaryStudent.user._id,
          type: 'interview_scheduled',
          title: 'Technical Interview Scheduled!',
          message: `Your technical round for ${j.title} at ${j.company} is scheduled on Google Meet.`,
          link: '/student/dashboard',
        });
      }
    }

    // Save a couple of jobs for Rahul
    await SavedJob.create({ studentId: primaryStudent.user._id, jobId: createdJobs[3]._id });
    await SavedJob.create({ studentId: primaryStudent.user._id, jobId: createdJobs[4]._id });

    // Seed notifications for primary student
    await Notification.create({
      userId: primaryStudent.user._id,
      type: 'status_changed',
      title: 'Application Shortlisted!',
      message: `Congratulations! Your application for ${appliedJobs[1].title} at ${appliedJobs[1].company} was shortlisted.`,
      link: '/student/applications',
    });

    // Seed recruiter notifications
    await Notification.create({
      userId: recruiterUsers[0].user._id,
      type: 'new_applicant',
      title: 'New High-Match Applicant',
      message: `Rahul Sharma (94% Match) applied for ${createdJobs[0].title}.`,
      link: `/recruiter/jobs/${createdJobs[0]._id}/applicants`,
    });

    console.log('[JobConnect AI] ==========================================');
    console.log('[JobConnect AI] DATABASE SEEDING COMPLETE SUCCESSFULLY!');
    console.log('[JobConnect AI] ==========================================');
    console.log('[JobConnect AI] Demo Accounts:');
    console.log('   Admin:      admin@jobconnect.ai          / Password@123');
    console.log('   Recruiter:  recruiter.razorpay@jobconnect.ai / Password@123');
    console.log('   Student:    rahul.sharma@gmail.com       / Password@123');
    console.log('   Student 2:  priya.patel@gmail.com        / Password@123');
    console.log(`[JobConnect AI] Seeded: 1 Admin, 5 Recruiters, 15 Companies, 50 Jobs, 10 Students.`);
    console.log('[JobConnect AI] ==========================================');

    if (require.main === module) {
      await disconnectDB();
      process.exit(0);
    }
  } catch (err) {
    console.error('[JobConnect AI] Database seeding failed:', err);
    if (require.main === module) {
      await disconnectDB();
      process.exit(1);
    }
  }
};

if (require.main === module) {
  seedDatabase();
}

module.exports = { seedDatabase };
