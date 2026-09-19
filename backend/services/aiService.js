const https = require('https');

const isAIAvailable = () => {
  return Boolean(process.env.GEMINI_API_KEY || process.env.OPENAI_API_KEY);
};

/**
 * Call Gemini API if GEMINI_API_KEY is configured
 */
const callGeminiAPI = async (prompt) => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
  const payload = JSON.stringify({
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: { temperature: 0.2, maxOutputTokens: 1000 },
  });

  return new Promise((resolve) => {
    const req = https.request(
      url,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(payload),
        },
        timeout: 5000,
      },
      (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => {
          try {
            const parsed = JSON.parse(data);
            const text = parsed?.candidates?.[0]?.content?.parts?.[0]?.text;
            resolve(text || null);
          } catch {
            resolve(null);
          }
        });
      }
    );

    req.on('error', () => resolve(null));
    req.on('timeout', () => {
      req.destroy();
      resolve(null);
    });

    req.write(payload);
    req.end();
  });
};

/**
 * Call OpenAI API if OPENAI_API_KEY is configured
 */
const callOpenAIAPI = async (prompt) => {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;

  const payload = JSON.stringify({
    model: 'gpt-3.5-turbo',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.3,
  });

  return new Promise((resolve) => {
    const req = https.request(
      'https://api.openai.com/v1/chat/completions',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
          'Content-Length': Buffer.byteLength(payload),
        },
        timeout: 5000,
      },
      (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => {
          try {
            const parsed = JSON.parse(data);
            const text = parsed?.choices?.[0]?.message?.content;
            resolve(text || null);
          } catch {
            resolve(null);
          }
        });
      }
    );

    req.on('error', () => resolve(null));
    req.on('timeout', () => {
      req.destroy();
      resolve(null);
    });

    req.write(payload);
    req.end();
  });
};

/**
 * Generate AI explanation for candidate match
 */
const generateAIExplanation = async (candidate, job) => {
  if (!isAIAvailable()) return null;

  const prompt = `You are a technical recruiter. Given this candidate profile and job posting, summarize in 2 sentences why the candidate matches and what is missing.
Candidate Skills: ${(candidate.skills || []).join(', ')}
Candidate Education: ${(candidate.education || []).map((e) => e.degree).join(', ')}
Job Title: ${job.title}
Job Required Skills: ${(job.skills || []).join(', ')}
Job Requirements: ${(job.requirements || []).join('; ')}
Respond concisely in plain text only.`;

  if (process.env.GEMINI_API_KEY) {
    return await callGeminiAPI(prompt);
  }
  if (process.env.OPENAI_API_KEY) {
    return await callOpenAIAPI(prompt);
  }
  return null;
};

module.exports = {
  isAIAvailable,
  callGeminiAPI,
  callOpenAIAPI,
  generateAIExplanation,
};
