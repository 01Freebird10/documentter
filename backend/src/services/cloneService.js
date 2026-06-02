import { exec } from 'child_process';
import path from 'path';
import fs from 'fs';
import AppError from '../utils/appError.js';

const cloneDir = './src/uploads/tmp-clones';
if (!fs.existsSync(cloneDir)) {
  fs.mkdirSync(cloneDir, { recursive: true });
}

export const cloneGithubRepo = async (githubUrl, token = null) => {
  const uniqueName = `git-${Date.now()}-${Math.round(Math.random() * 1e9)}`;
  const destPath = path.join(cloneDir, uniqueName);

  return new Promise((resolve, reject) => {
    // Basic shell injection protection: ensure URL matches secure regex
    const gitReg = /^(https?:\/\/)?(www\.)?github\.com\/[\w-]+\/[\w.-]+\/?$/;
    if (!gitReg.test(githubUrl)) {
      return reject(new AppError('Format rejected. Invalid GitHub URL pattern.', 400));
    }

    // Append .git if missing
    let repoUrl = githubUrl;
    if (!repoUrl.endsWith('.git')) {
      repoUrl = `${repoUrl}.git`;
    }

    if (token) {
      // Secure token injection: https://<token>@github.com/owner/repo.git
      repoUrl = repoUrl.replace('https://', `https://${token}@`);
    }

    // Force depth=1 to optimize download speed and disk usage
    const command = `git clone --depth 1 ${repoUrl} "${destPath}"`;
    
    // Set 1 minute timeout
    exec(command, { timeout: 60000 }, (error, stdout, stderr) => {
      if (error) {
        // Clean up partial folder if clone failed midway
        if (fs.existsSync(destPath)) {
          fs.rmSync(destPath, { recursive: true, force: true });
        }
        return reject(new AppError(`Git clone failed: ${stderr || error.message}`, 400));
      }
      
      resolve({
        path: destPath,
        repoName: githubUrl.split('/').pop().replace('.git', '')
      });
    });
  });
};
