import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import AppError from '../utils/appError.js';

const ignoreFolders = new Set([
  'node_modules', 'bower_components', 'dist', 'build', '.git', '.svn',
  'coverage', '.cache', 'tmp', '.next', 'out', 'venv', 'env', 
  '.idea', '.vscode', 'tmp-clones'
]);

// Extract ZIP using built-in system 'tar' (failsafe on modern OS)
export const extractZipArchive = async (zipFilePath) => {
  const destDir = zipFilePath.replace('.zip', '_extracted');
  
  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
  }

  return new Promise((resolve, reject) => {
    // Windows and Unix universally support: tar -xf <archive> -C <target>
    const command = `tar -xf "${zipFilePath}" -C "${destDir}"`;
    
    exec(command, (error, stdout, stderr) => {
      if (error) {
        if (fs.existsSync(destDir)) {
          fs.rmSync(destDir, { recursive: true, force: true });
        }
        return reject(new AppError(`Failed to extract ZIP workspace: ${stderr || error.message}`, 400));
      }
      resolve(destDir);
    });
  });
};

// Scan codebase directory recursively
export const discoverFiles = (dirPath, fileList = []) => {
  if (!fs.existsSync(dirPath)) return fileList;

  const items = fs.readdirSync(dirPath, { withFileTypes: true });

  for (const item of items) {
    const fullPath = path.join(dirPath, item.name);
    
    // Ignore designated folders
    if (item.isDirectory()) {
      if (ignoreFolders.has(item.name)) continue;
      discoverFiles(fullPath, fileList);
    } else {
      const ext = path.extname(item.name).toLowerCase();
      const size = fs.statSync(fullPath).size;
      
      fileList.push({
        name: item.name,
        path: fullPath,
        relativePath: path.relative(dirPath, fullPath).replace(/\\/g, '/'),
        ext,
        size
      });
    }
  }

  return fileList;
};

// Reads file text contents safely
export const readFileText = (filePath) => {
  try {
    const size = fs.statSync(filePath).size;
    // Guard: Do not read files larger than 1.5MB to prevent memory out-of-bounds
    if (size > 1.5 * 1024 * 1024) return '';
    
    return fs.readFileSync(filePath, 'utf-8');
  } catch (error) {
    console.error(`[FS READ ERROR] Failed reading file: ${filePath}. ${error.message}`);
    return '';
  }
};
