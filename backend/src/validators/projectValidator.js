import fs from 'fs';
import AppError from '../utils/appError.js';

export const validateGithubProject = (req, res, next) => {
  const { githubUrl, projectName } = req.body;

  if (!projectName || !projectName.trim()) {
    return next(new AppError('Project designation is required', 400));
  }

  if (!githubUrl || !githubUrl.trim()) {
    return next(new AppError('GitHub URL endpoint is required', 400));
  }

  // Phishing/Abuse protection: ensure it starts with standard safe github subdomains
  const gitReg = /^https:\/\/(www\.)?github\.com\/[a-zA-Z0-9_-]+\/[a-zA-Z0-9_\.-]+\/?$/;
  if (!gitReg.test(githubUrl.trim())) {
    return next(new AppError('Malicious or invalid GitHub URL pattern. Ensure the domain is strictly "https://github.com/owner/repo" and contains no query parameters, command parameters, or space characters.', 400));
  }

  // Command injection checks
  if (githubUrl.includes(';') || githubUrl.includes('&&') || githubUrl.includes('||') || githubUrl.includes('`') || githubUrl.includes('$')) {
    return next(new AppError('Security violation: Command injection tokens detected in repository parameter.', 400));
  }

  next();
};

export const validateZipProject = (req, res, next) => {
  const user = req.user;
  const file = req.file;

  if (!file) {
    return next(new AppError('Repository zip file archive is required.', 400));
  }

  // Enforce tier file size quotas
  const fileSize = file.size;
  let maxAllowed = 15 * 1024 * 1024; // Free gets 15MB
  let tierLabel = 'Free';

  if (user) {
    if (user.plan === 'pro') {
      maxAllowed = 50 * 1024 * 1024; // Pro gets 50MB
      tierLabel = 'Pro';
    } else if (user.plan === 'team' || user.plan === 'enterprise') {
      maxAllowed = 100 * 1024 * 1024; // Team/Enterprise gets 100MB
      tierLabel = 'Team/Enterprise';
    }
  }

  if (fileSize > maxAllowed) {
    if (file.path && fs.existsSync(file.path)) {
      try {
        fs.unlinkSync(file.path);
      } catch (err) {
        // ignore delete fail
      }
    }
    return next(new AppError(`SaaS Quota Exceeded: Your plan (${tierLabel}) permits uploads up to ${maxAllowed / (1024 * 1024)}MB. This repository is ${(fileSize / (1024 * 1024)).toFixed(2)}MB. Upgrade your workspace plan for higher limits!`, 403));
  }

  next();
};
