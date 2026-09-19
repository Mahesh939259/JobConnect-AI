const { isAIAvailable, generateAIExplanation } = require('./aiService');

/**
 * Normalizes a skill string for comparison (e.g. "React.js" -> "react")
 */
const normalizeSkill = (s) =>
  s.toLowerCase().replace(/[\s\.\-_]/g, '');

/**
 * Match candidate with a specific job using weighted scoring
 */
const computeJobMatch = async (candidate, job) => {
  const candidateSkills = (candidate.skills || []).map((s) => s.trim());
  const jobSkills = (job.skills || []).map((s) => s.trim());
  const preferredSkills = (job.preferredSkills || []).map((s) => s.trim());

  // 1. Skill Score (Weight 45%)
  const matchedSkills = [];
  const missingSkills = [];
  const normalizedCandidateSkills = candidateSkills.map(normalizeSkill);

  jobSkills.forEach((jSkill) => {
    const normJ = normalizeSkill(jSkill);
    const found = normalizedCandidateSkills.some(
      (c) => c.includes(normJ) || normJ.includes(c)
    );
    if (found) {
      matchedSkills.push(jSkill);
    } else {
      missingSkills.push(jSkill);
    }
  });

  const baseSkillRatio =
    jobSkills.length > 0 ? matchedSkills.length / jobSkills.length : 1;
  
  // Bonus for preferred skills
  let bonus = 0;
  preferredSkills.forEach((pSkill) => {
    if (normalizedCandidateSkills.includes(normalizeSkill(pSkill))) {
      bonus += 0.05;
    }
  });

  const skillScore = Math.min(100, Math.round((baseSkillRatio + bonus) * 100));

  // 2. Experience Score (Weight 20%)
  const expYears = (candidate.experience || []).length * 1.2; // approx years
  const requiredMinExp = job.experienceMin || 0;
  const requiredMaxExp = job.experienceMax || 2;

  let expScore = 70; // baseline for freshers
  let experienceMatch = 'Entry-level alignment';

  if (expYears >= requiredMinExp && expYears <= requiredMaxExp + 2) {
    expScore = 95;
    experienceMatch = `Strong match: Candidate has ~${Math.round(expYears)} yrs experience, ideal for the ${requiredMinExp}-${requiredMaxExp} yrs requirement.`;
  } else if (expYears < requiredMinExp) {
    const gap = requiredMinExp - expYears;
    expScore = Math.max(40, Math.round(90 - gap * 20));
    experienceMatch = `Growth potential: Candidate has ~${Math.round(expYears)} yrs experience, aiming for ${requiredMinExp} yrs requirement.`;
  } else {
    expScore = 90;
    experienceMatch = `Experienced: Candidate exceeds minimum experience threshold.`;
  }

  // 3. Projects Score (Weight 15%)
  const projects = candidate.projects || [];
  let projScore = 50;
  if (projects.length >= 3) projScore = 95;
  else if (projects.length === 2) projScore = 80;
  else if (projects.length === 1) projScore = 65;

  // Check if project technologies match job skills
  let projectTechMatches = 0;
  projects.forEach((p) => {
    const tech = (p.technologies || []).map(normalizeSkill);
    if (jobSkills.some((js) => tech.includes(normalizeSkill(js)))) {
      projectTechMatches++;
    }
  });
  if (projectTechMatches > 0) {
    projScore = Math.min(100, projScore + 10);
  }

  // 4. Education Score (Weight 10%)
  const education = candidate.education || [];
  let eduScore = 75;
  let educationMatch = 'Graduate degree profile';

  const hasTechDegree = education.some((e) =>
    /b\.?tech|b\.?e\.?|m\.?tech|mca|bca|computer|science|it/i.test(
      `${e.degree || ''} ${e.fieldOfStudy || ''}`
    )
  );
  if (hasTechDegree) {
    eduScore = 95;
    educationMatch = 'Direct alignment: Holds relevant degree in Computer Science / Engineering.';
  } else if (education.length > 0) {
    eduScore = 80;
    educationMatch = 'Aligned: Relevant academic qualifications.';
  }

  // 5. Job Relevance / Title / Keyword Match (Weight 10%)
  let relevanceScore = 65;
  const titleLower = (job.title || '').toLowerCase();
  const headlineLower = (candidate.headline || '').toLowerCase();
  const bioLower = (candidate.bio || '').toLowerCase();

  const titleWords = titleLower.split(/\s+/).filter((w) => w.length > 3);
  const matchesTitle = titleWords.some(
    (w) => headlineLower.includes(w) || bioLower.includes(w)
  );

  if (matchesTitle) {
    relevanceScore = 95;
  } else if (matchedSkills.length > 0) {
    relevanceScore = 80;
  }

  // Overall Weighted Score calculation
  // Skills = 45%, Experience = 20%, Projects = 15%, Education = 10%, Relevance = 10%
  const totalScore = Math.min(
    99,
    Math.max(
      25,
      Math.round(
        skillScore * 0.45 +
          expScore * 0.2 +
          projScore * 0.15 +
          eduScore * 0.1 +
          relevanceScore * 0.1
      )
    )
  );

  // Formulate human-readable reason
  let reason = '';
  if (totalScore >= 85) {
    reason = `Exceptional match (${totalScore}%). Candidate possesses key required technologies (${matchedSkills.slice(0, 3).join(', ')}) with strong relevant project experience.`;
  } else if (totalScore >= 70) {
    reason = `Strong candidate (${totalScore}%). Core skills match well (${matchedSkills.slice(0, 3).join(', ')}). Could benefit from hands-on exposure to ${missingSkills.slice(0, 2).join(', ') || 'specialized tools'}.`;
  } else if (totalScore >= 50) {
    reason = `Moderate match (${totalScore}%). Candidate matches basic technical foundations but is missing key proficiencies in ${missingSkills.slice(0, 3).join(', ')}.`;
  } else {
    reason = `Early-stage fit (${totalScore}%). Meets educational fundamentals; would require training on required stack (${jobSkills.slice(0, 3).join(', ')}).`;
  }

  // If external AI LLM is configured, enrich the reasoning
  if (isAIAvailable()) {
    try {
      const aiReason = await generateAIExplanation(candidate, job);
      if (aiReason) {
        reason = aiReason.trim();
      }
    } catch {
      // safe fallback already in reason
    }
  }

  return {
    score: totalScore,
    matchedSkills,
    missingSkills,
    experienceMatch,
    educationMatch,
    reason,
    breakdown: {
      skills: skillScore,
      experience: expScore,
      projects: projScore,
      education: eduScore,
      relevance: relevanceScore,
    },
  };
};

/**
 * Comprehensive Resume Quality Analyzer
 * Generates Score (0-100), category breakdown, and actionable suggestions
 */
const analyzeResumeQuality = (profile, rawText = '') => {
  const skills = profile.skills || [];
  const experience = profile.experience || [];
  const projects = profile.projects || [];
  const education = profile.education || [];
  const links = profile.links || {};

  // 1. Skills Category (0-100)
  let skillsScore = Math.min(100, skills.length * 10);

  // 2. Experience Category (0-100)
  let experienceScore = 50;
  if (experience.length >= 2) experienceScore = 95;
  else if (experience.length === 1) experienceScore = 80;

  // 3. Projects Category (0-100)
  let projectsScore = 40;
  if (projects.length >= 3) projectsScore = 95;
  else if (projects.length === 2) projectsScore = 80;
  else if (projects.length === 1) projectsScore = 65;

  // 4. Education Category (0-100)
  let educationScore = education.length > 0 ? 90 : 40;

  // 5. Formatting Category (0-100)
  let formattingScore = 75;
  if (rawText && rawText.length > 500) formattingScore = 90;

  // 6. Keywords Category (0-100)
  let keywordsScore = Math.min(95, Math.max(40, skills.length * 8));

  // 7. Achievements Category (0-100)
  let achievementsScore = 60;
  const hasNumbersInProjects = projects.some((p) =>
    /\d+%|\d+k|\d+x|improved|reduced|optimized|built/i.test(p.description || '')
  );
  if (hasNumbersInProjects) achievementsScore = 90;

  // Overall Resume Score
  const overallScore = Math.round(
    skillsScore * 0.25 +
      experienceScore * 0.2 +
      projectsScore * 0.2 +
      educationScore * 0.1 +
      formattingScore * 0.1 +
      keywordsScore * 0.1 +
      achievementsScore * 0.05
  );

  // Actionable suggestions
  const suggestions = [];

  if (skills.length < 6) {
    suggestions.push({
      category: 'Skills',
      type: 'improvement',
      text: 'Add more relevant technical skills and tools to reach at least 8-10 keywords.',
    });
  }
  if (!skills.some((s) => /typescript|react|python|docker|aws/i.test(s))) {
    suggestions.push({
      category: 'Keywords',
      type: 'high_impact',
      text: 'Consider adding trending industry skills like TypeScript, Docker, or AWS to increase recruiter visibility.',
    });
  }
  if (projects.length < 2) {
    suggestions.push({
      category: 'Projects',
      type: 'high_impact',
      text: 'Add at least 2 in-depth full-stack or technical projects showcasing end-to-end implementation.',
    });
  }
  if (!hasNumbersInProjects) {
    suggestions.push({
      category: 'Achievements',
      type: 'tip',
      text: 'Add measurable metrics to your project descriptions (e.g. "reduced latency by 35%", "handled 1,000+ users").',
    });
  }
  if (!links.github && !links.portfolio) {
    suggestions.push({
      category: 'Online Presence',
      type: 'high_impact',
      text: 'Include active GitHub and live portfolio links so hiring managers can review your actual code.',
    });
  }
  if (!profile.bio || profile.bio.length < 50) {
    suggestions.push({
      category: 'Summary',
      type: 'tip',
      text: 'Write a compelling 2-3 sentence professional summary highlighting your career goals and core strengths.',
    });
  }

  return {
    score: overallScore,
    categoryScores: {
      skills: skillsScore,
      experience: experienceScore,
      projects: projectsScore,
      education: educationScore,
      formatting: formattingScore,
      keywords: keywordsScore,
      achievements: achievementsScore,
    },
    suggestions,
    analyzedAt: new Date(),
  };
};

module.exports = {
  computeJobMatch,
  analyzeResumeQuality,
};
