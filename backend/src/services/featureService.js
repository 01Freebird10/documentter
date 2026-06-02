import { readFileText } from './parserService.js';

export const scanCodebaseFeatures = (files) => {
  const detectedFeatures = [];
  const codeFiles = files.filter(f => f.ext === '.js' || f.ext === '.ts' || f.ext === '.py' || f.ext === '.jsx' || f.ext === '.tsx');

  // Accumulate full code content (up to a safe length) for broad scan
  let accumulatedCode = '';
  for (const file of codeFiles.slice(0, 100)) { // Scan first 100 code files
    accumulatedCode += `\n// File: ${file.name}\n` + readFileText(file.path);
    if (accumulatedCode.length > 500000) break; // Maximum 500KB accumulated
  }

  // ==========================================
  // FEATURE EVALUATOR RULES
  // ==========================================

  const evalFeature = (name, patterns, description) => {
    for (const pattern of patterns) {
      if (pattern.test(accumulatedCode)) {
        detectedFeatures.push({
          name,
          description,
          evidence: `Reference detected: "${pattern.toString()}" in code scripts.`
        });
        return;
      }
    }
  };

  evalFeature(
    'Authentication',
    [/jwt/i, /bcrypt/i, /login/i, /register/i, /signup/i, /clerk/i],
    'Handles user account onboardings, credential hashes, and token authorization sessions.'
  );

  evalFeature(
    'CRUD Actions',
    [/\.save\(/, /\.create\(/, /\.find\(/, /\.deleteMany\(/, /db\.query\(/],
    'Performs basic Create, Read, Update, and Delete operations against database collections.'
  );

  evalFeature(
    'File Uploads',
    [/multer/i, /s3/i, /fs\.writeFileSync/, /upload/i, /formidable/i],
    'Saves binary content uploads (ZIP directories, user avatars, documents) to local or cloud nodes.'
  );

  evalFeature(
    'Payments & Subscriptions',
    [/stripe/i, /paypal/i, /checkout/i, /billing/i, /subscription/i],
    'Coordinates checkout transactions, pricing plan subscriptions, and billing Visas.'
  );

  evalFeature(
    'Real-time Chats',
    [/socket\.io/i, /websocket/i, /ws\.on\(/, /pusher/i, /io\.emit/],
    'Maintains active websocket pipelines to synchronize microservice operations instantly.'
  );

  evalFeature(
    'AI Integrations',
    [/openai/i, /gemini/i, /langchain/i, /generative-ai/i, /model\./i, /tensorflow/i],
    'Leverages advanced large language model frameworks or machine learning pipelines.'
  );

  evalFeature(
    'Notifications & Mailers',
    [/nodemailer/i, /sendgrid/i, /twilio/i, /mail/i, /notification/i],
    'Sends out email logs digests, verification tokens, or push message signals.'
  );

  evalFeature(
    'Admin Panels & Dashboards',
    [/admin/i, /role.*admin/i, /is_admin/i, /dashboard/i],
    'Restricts sensitive operations routes specifically to administrative plans.'
  );

  // Fallback defaults
  if (detectedFeatures.length === 0) {
    detectedFeatures.push(
      { name: 'Authentication', description: 'Handles session authorization.', evidence: 'Seeded default feature.' },
      { name: 'CRUD Actions', description: 'Performs DB queries.', evidence: 'Seeded default CRUD.' }
    );
  }

  return detectedFeatures;
};
