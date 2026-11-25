/**
 * FocusLearn - PSG College of Technology Student Email Validator
 * Enforces official college email format and authorized registration number ranges:
 * - Batch 1: 26mx101 to 26mx130
 * - Batch 2: 26mx201 to 26mx230
 * - Batch 3: 26mx301 to 26mx360
 * - Domain: exactly @psgtech.ac.in
 */

const STUDENT_EMAIL_REGEX = /^26mx(\d{3})@psgtech\.ac\.in$/;

// HTML5 pattern for client-side input validation (case-insensitive in browser)
const HTML5_STUDENT_EMAIL_PATTERN = '(?i)^26mx(1(0[1-9]|[1-2][0-9]|30)|2(0[1-9]|[1-2][0-9]|30)|3(0[1-9]|[1-5][0-9]|60))@psgtech\\.ac\\.in$';

/**
 * Validates whether an email belongs to an authorized PSG Tech MCA student
 * @param {string} email
 * @returns {boolean}
 */
function isValidStudentEmail(email) {
  if (!email || typeof email !== 'string') return false;

  const normalized = email.trim().toLowerCase();
  const match = normalized.match(STUDENT_EMAIL_REGEX);
  if (!match) return false;

  const rollNumber = parseInt(match[1], 10);

  const isBatch1 = rollNumber >= 101 && rollNumber <= 130;
  const isBatch2 = rollNumber >= 201 && rollNumber <= 230;
  const isBatch3 = rollNumber >= 301 && rollNumber <= 360;

  return isBatch1 || isBatch2 || isBatch3;
}

/**
 * Detailed validation with specific error messages for user feedback
 * @param {string} email
 * @returns {{ isValid: boolean, message?: string, rollNo?: string }}
 */
function validateStudentEmail(email) {
  if (!email || typeof email !== 'string' || !email.trim()) {
    return {
      isValid: false,
      message: 'Please provide your official college email address.'
    };
  }

  const normalized = email.trim().toLowerCase();

  // Check personal email domains
  if (/@(gmail|yahoo|outlook|hotmail|icloud|protonmail)\.com$/i.test(normalized)) {
    return {
      isValid: false,
      message: 'Personal email addresses (Gmail, Yahoo, Outlook, etc.) are not permitted. Please use your official PSG Tech college email.'
    };
  }

  // Check domain
  if (!normalized.endsWith('@psgtech.ac.in')) {
    return {
      isValid: false,
      message: 'Email domain must be exactly @psgtech.ac.in.'
    };
  }

  // Check prefix format 26mx...
  const match = normalized.match(STUDENT_EMAIL_REGEX);
  if (!match) {
    return {
      isValid: false,
      message: 'Email must match the student format: 26mx<rollno>@psgtech.ac.in (e.g., 26mx219@psgtech.ac.in).'
    };
  }

  const rollNumber = parseInt(match[1], 10);
  const isBatch1 = rollNumber >= 101 && rollNumber <= 130;
  const isBatch2 = rollNumber >= 201 && rollNumber <= 230;
  const isBatch3 = rollNumber >= 301 && rollNumber <= 360;

  if (!isBatch1 && !isBatch2 && !isBatch3) {
    return {
      isValid: false,
      message: `Registration number 26mx${match[1]} is not in the authorized student batches (26mx101–130, 26mx201–230, 26mx301–360).`
    };
  }

  return {
    isValid: true,
    rollNo: `26mx${match[1]}`
  };
}

module.exports = {
  STUDENT_EMAIL_REGEX,
  HTML5_STUDENT_EMAIL_PATTERN,
  isValidStudentEmail,
  validateStudentEmail
};
