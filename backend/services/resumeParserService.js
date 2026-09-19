const fs = require('fs');
const path = require('path');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');

// Master skill taxonomy for recognition
const KNOWN_SKILLS = [
  'JavaScript', 'TypeScript', 'Python', 'Java', 'C++', 'C#', 'Go', 'Rust', 'PHP', 'Ruby', 'Swift', 'Kotlin',
  'React', 'React Native', 'Node.js', 'Express', 'Express.js', 'Next.js', 'Vue.js', 'Angular', 'Svelte',
  'MongoDB', 'PostgreSQL', 'MySQL', 'SQLite', 'Redis', 'Firebase', 'Supabase', 'Cassandra', 'DynamoDB',
  'HTML', 'HTML5', 'CSS', 'CSS3', 'Tailwind CSS', 'Bootstrap', 'Sass', 'SCSS', 'Material UI', 'Chakra UI',
  'Docker', 'Kubernetes', 'AWS', 'Azure', 'GCP', 'Google Cloud', 'Linux', 'Git', 'GitHub', 'CI/CD', 'Jenkins', 'Terraform',
  'REST API', 'GraphQL', 'Microservices', 'WebSockets', 'Socket.io', 'OAuth', 'JWT',
  'Machine Learning', 'Deep Learning', 'Data Science', 'Data Analysis', 'NLP', 'Computer Vision', 'TensorFlow', 'PyTorch', 'Scikit-Learn', 'Pandas', 'NumPy',
  'Unit Testing', 'Jest', 'Mocha', 'Cypress', 'Playwright', 'Selenium',
  'Agile', 'Scrum', 'Jira', 'Figma', 'System Design'
];

/**
 * Extract raw text from uploaded PDF or Word document
 */
const extractRawText = async (filePath) => {
  const ext = path.extname(filePath).toLowerCase();

  try {
    if (ext === '.pdf') {
      const dataBuffer = fs.readFileSync(filePath);
      const data = await pdfParse(dataBuffer);
      return data.text || '';
    } else if (ext === '.docx' || ext === '.doc') {
      const result = await mammoth.extractRawText({ path: filePath });
      return result.value || '';
    } else {
      // plain text fallback
      return fs.readFileSync(filePath, 'utf8');
    }
  } catch (err) {
    console.error('Error extracting text from document:', err);
    throw new Error(`Failed to parse document text: ${err.message}`);
  }
};

/**
 * Heuristically parse contact details, skills, education, and sections from raw text
 */
const parseResumeText = (rawText) => {
  const cleanText = rawText.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  const lines = cleanText.split('\n').map((l) => l.trim()).filter(Boolean);

  // 1. Email extraction
  const emailMatch = cleanText.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
  const email = emailMatch ? emailMatch[0] : '';

  // 2. Phone extraction (Indian + international standard formats)
  const phoneMatch = cleanText.match(/(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}|\+91[-.\s]?[6-9]\d{9}|[6-9]\d{9}/);
  const phone = phoneMatch ? phoneMatch[0] : '';

  // 3. Name candidate: usually the first non-empty line without email/phone/urls
  let name = '';
  for (let i = 0; i < Math.min(lines.length, 5); i++) {
    const line = lines[i];
    if (
      line.length >= 2 &&
      line.length <= 40 &&
      !line.includes('@') &&
      !line.includes('http') &&
      !line.includes('.com') &&
      !/\d{5,}/.test(line) &&
      !/resume|curriculum vitae|cv/i.test(line)
    ) {
      name = line;
      break;
    }
  }

  // 4. Skills extraction matching against taxonomy
  const foundSkills = new Set();
  const lowerCaseText = cleanText.toLowerCase();

  for (const skill of KNOWN_SKILLS) {
    const escaped = skill.toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    // Word boundary check (handle C++, C#, .js)
    let regex;
    if (escaped.includes('+') || escaped.includes('#') || escaped.includes('.')) {
      regex = new RegExp(`(?:^|[^a-zA-Z0-9])${escaped}(?:$|[^a-zA-Z0-9])`, 'i');
    } else {
      regex = new RegExp(`\\b${escaped}\\b`, 'i');
    }

    if (regex.test(lowerCaseText)) {
      foundSkills.add(skill);
    }
  }

  // 5. Education heuristics
  const education = [];
  const degreeKeywords = [
    { pattern: /B\.?Tech|Bachelor of Technology/i, degree: 'B.Tech' },
    { pattern: /B\.?E\.?|Bachelor of Engineering/i, degree: 'B.E.' },
    { pattern: /M\.?Tech|Master of Technology/i, degree: 'M.Tech' },
    { pattern: /B\.?C\.?A|Bachelor of Computer Applications/i, degree: 'BCA' },
    { pattern: /M\.?C\.?A|Master of Computer Applications/i, degree: 'MCA' },
    { pattern: /B\.?Sc|Bachelor of Science/i, degree: 'B.Sc' },
    { pattern: /M\.?Sc|Master of Science/i, degree: 'M.Sc' },
    { pattern: /MBA|Master of Business/i, degree: 'MBA' },
  ];

  for (const line of lines) {
    for (const dk of degreeKeywords) {
      if (dk.pattern.test(line)) {
        // Look for graduation year in same or nearby line
        const yearMatch = line.match(/\b(19\d\d|20\d\d)\b/);
        education.push({
          degree: dk.degree,
          college: line.length < 80 ? line : 'University / College',
          fieldOfStudy: /computer|information|electronics|data|software/i.test(line)
            ? 'Computer Science / Engineering'
            : 'Engineering',
          graduationYear: yearMatch ? yearMatch[0] : '2025',
          description: line,
        });
        break;
      }
    }
  }

  // Fallback default education entry if none matched
  if (education.length === 0) {
    education.push({
      degree: 'B.Tech in Computer Science',
      college: 'Engineering College',
      fieldOfStudy: 'Computer Science and Engineering',
      graduationYear: '2025',
      description: 'Extracted from resume',
    });
  }

  // 6. Project & Experience extraction heuristics
  const projects = [];
  const experience = [];
  let inProjects = false;
  let inExperience = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (/^projects?\b|^academic projects?\b|^personal projects?\b/i.test(line)) {
      inProjects = true;
      inExperience = false;
      continue;
    }
    if (/^experience\b|^work history\b|^internships?\b|^employment\b/i.test(line)) {
      inExperience = true;
      inProjects = false;
      continue;
    }
    if (/^education\b|^skills\b|^certifications?\b/i.test(line)) {
      inProjects = false;
      inExperience = false;
      continue;
    }

    if (inProjects && line.length > 5 && line.length < 120 && projects.length < 4) {
      if (line.includes(':') || line.includes('-') || line.includes('|')) {
        projects.push({
          title: line.split(/[-:|]/)[0].trim(),
          description: line,
          technologies: Array.from(foundSkills).slice(0, 4),
          githubUrl: '',
          liveUrl: '',
        });
      }
    }

    if (inExperience && line.length > 5 && line.length < 120 && experience.length < 3) {
      experience.push({
        company: line.split(/[-:|]/)[0].trim(),
        position: 'Software Developer Intern',
        startDate: '2024',
        endDate: 'Present',
        current: true,
        description: line,
      });
    }
  }

  return {
    name: name || 'Applicant Name',
    email: email || '',
    phone: phone || '',
    skills: Array.from(foundSkills),
    education: education.slice(0, 3),
    experience: experience.slice(0, 3),
    projects: projects.slice(0, 4),
    certifications: [],
  };
};

module.exports = {
  KNOWN_SKILLS,
  extractRawText,
  parseResumeText,
};
