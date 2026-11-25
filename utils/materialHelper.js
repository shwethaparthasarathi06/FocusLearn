const path = require('path');
const fs = require('fs');
const formidable = require('formidable');

/**
 * Validate YouTube URLs
 */
function isValidYouTubeUrl(url) {
  if (!url || typeof url !== 'string') return false;
  try {
    const parsed = new URL(url.trim());
    const host = parsed.hostname.replace(/^www\./, '');
    const validHosts = ['youtube.com', 'm.youtube.com', 'youtu.be', 'youtube-nocookie.com'];
    if (!validHosts.includes(host)) return false;

    let videoId = '';
    if (host === 'youtu.be') {
      videoId = parsed.pathname.replace(/^\//, '').split('/')[0];
    } else if (parsed.pathname === '/watch') {
      videoId = parsed.searchParams.get('v');
    } else {
      const match = parsed.pathname.match(/^\/(embed|shorts)\/([^/]+)/);
      if (match) videoId = match[2];
    }

    return Boolean(videoId && /^[a-zA-Z0-9_-]{11}$/.test(videoId));
  } catch {
    return false;
  }
}

/**
 * Extract YouTube embed URL
 */
function getYouTubeEmbedUrl(url) {
  if (!url || typeof url !== 'string') return null;

  try {
    const parsed = new URL(url.trim());
    const host = parsed.hostname.replace(/^www\./, '');

    let videoId = '';

    if (host === 'youtu.be') {
      videoId = parsed.pathname.replace(/^\//, '').split('/')[0];
    } else if (
      host === 'youtube.com' ||
      host === 'm.youtube.com' ||
      host === 'youtube-nocookie.com'
    ) {
      if (parsed.pathname === '/watch') {
        videoId = parsed.searchParams.get('v');
      } else {
        const match = parsed.pathname.match(/^\/(embed|shorts)\/([^/]+)/);
        if (match) {
          videoId = match[2];
        }
      }
    }

    if (!videoId || !/^[a-zA-Z0-9_-]{11}$/.test(videoId)) {
      return null;
    }

    return `https://www.youtube.com/embed/${videoId}`;
  } catch {
    return null;
  }
}

/**
 * Parse multipart form data with file uploads for study materials
 * Validates file types: .pdf, .ppt, .pptx
 * Max size: 50MB
 * Compatible with formidable v2 and v3
 */
function parseMaterialUpload(req) {
  return new Promise((resolve, reject) => {
    const uploadDir = path.join(__dirname, '..', 'public', 'materials');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // Support both formidable v2 (IncomingForm) and v3 (formidable function / Formidable class)
    let form;
    try {
      if (typeof formidable === 'function') {
        // formidable v3: formidable(options) or new formidable.Formidable(options)
        form = formidable({
          uploadDir,
          keepExtensions: true,
          maxFileSize: 50 * 1024 * 1024, // 50MB
          multiples: false,
          allowEmptyFiles: true,
          minFileSize: 0
        });
      } else if (formidable.IncomingForm) {
        // formidable v2 fallback
        form = new formidable.IncomingForm({
          uploadDir,
          keepExtensions: true,
          maxFileSize: 50 * 1024 * 1024,
          multiples: false
        });
      } else {
        return reject(new Error('Unsupported formidable version'));
      }
    } catch (initErr) {
      return reject(initErr);
    }

    form.parse(req, (err, fields, files) => {
      if (err) {
        // Allow empty-file errors (user didn't upload a file - that's OK)
        if (err.code === 1016 || (err.message && err.message.includes('smaller than'))) {
          // Just no file uploaded — that's fine
          const normalizedFields = {};
          Object.keys(fields || {}).forEach(key => {
            normalizedFields[key] = Array.isArray(fields[key]) ? fields[key][0] : fields[key];
          });
          return resolve({ fields: normalizedFields, file: null });
        }
        return reject(err);
      }

      // Normalize fields (formidable v2/v3 can return single string or array)
      const normalizedFields = {};
      Object.keys(fields).forEach(key => {
        normalizedFields[key] = Array.isArray(fields[key]) ? fields[key][0] : fields[key];
      });

      // Normalize uploaded file — formidable v3 uses 'filepath', v2 uses 'path'
      let uploadedFile = null;
      if (files && files.materialFile) {
        uploadedFile = Array.isArray(files.materialFile) ? files.materialFile[0] : files.materialFile;
        // Normalize property names between formidable versions
        if (uploadedFile) {
          if (!uploadedFile.filepath && uploadedFile.path) {
            uploadedFile.filepath = uploadedFile.path;
          }
          if (!uploadedFile.originalFilename && uploadedFile.name) {
            uploadedFile.originalFilename = uploadedFile.name;
          }
          if (!uploadedFile.newFilename && uploadedFile.newFilename === undefined) {
            uploadedFile.newFilename = uploadedFile.originalFilename || 'material';
          }
          // Skip empty files (user didn't choose a file)
          const fileSize = uploadedFile.size || 0;
          if (fileSize === 0) {
            uploadedFile = null;
          }
        }
      }

      resolve({ fields: normalizedFields, file: uploadedFile });
    });
  });
}

/**
 * Validate material file extension
 */
function isValidMaterialExtension(filename, allowedExtensions = ['.pdf', '.ppt', '.pptx']) {
  if (!filename) return false;
  const ext = path.extname(filename).toLowerCase();
  return allowedExtensions.includes(ext);
}

module.exports = {
  isValidYouTubeUrl,
  getYouTubeEmbedUrl,
  parseMaterialUpload,
  isValidMaterialExtension
};

/**
 * Validate material file extension
 */
function isValidMaterialExtension(filename, allowedExtensions = ['.pdf', '.ppt', '.pptx']) {
  if (!filename) return false;
  const ext = path.extname(filename).toLowerCase();
  return allowedExtensions.includes(ext);
}

module.exports = {
  isValidYouTubeUrl,
  getYouTubeEmbedUrl,
  parseMaterialUpload,
  isValidMaterialExtension
};
