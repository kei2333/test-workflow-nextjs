/**
 * File Name Validator
 * Validates mainframe dataset names and Windows file names
 */

export interface FileNameValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Validate mainframe dataset name
 * Rules:
 * - Maximum 44 characters
 * - 1-8 qualifiers separated by dots
 * - Each qualifier max 8 characters
 * - Can only contain: A-Z, 0-9, @, #, $
 * - First character must be A-Z, @, #, or $
 * - Cannot start or end with dot
 */
export function validateMainframeDatasetName(name: string): FileNameValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!name || name.trim().length === 0) {
    errors.push('Dataset name cannot be empty');
    return { isValid: false, errors, warnings };
  }

  const trimmedName = name.trim();

  // Check for spaces (MVS dataset names cannot contain spaces)
  if (trimmedName.includes(' ')) {
    errors.push('Dataset name cannot contain spaces');
  }

  // Check length
  if (trimmedName.length > 44) {
    errors.push(`Dataset name too long (${trimmedName.length} characters, max 44)`);
  }

  // Check for leading/trailing dots
  if (trimmedName.startsWith('.')) {
    errors.push('Dataset name cannot start with a dot');
  }
  if (trimmedName.endsWith('.')) {
    errors.push('Dataset name cannot end with a dot');
  }

  // Split into qualifiers
  const qualifiers = trimmedName.split('.');

  if (qualifiers.length > 22) {
    warnings.push(`Dataset has ${qualifiers.length} qualifiers. While allowed, this is unusually high.`);
  }

  // Validate each qualifier
  qualifiers.forEach((qualifier, index) => {
    // Check length
    if (qualifier.length === 0) {
      errors.push(`Qualifier ${index + 1} is empty (consecutive dots found)`);
      return;
    }

    if (qualifier.length > 8) {
      errors.push(`Qualifier ${index + 1} ('${qualifier}') exceeds 8 characters (${qualifier.length})`);
    }

    // Check first character (must be A-Z, @, #, or $)
    const firstChar = qualifier.charAt(0);
    if (!/[A-Z@#$]/i.test(firstChar)) {
      errors.push(`Qualifier ${index + 1} ('${qualifier}') must start with A-Z, @, #, or $`);
    }

    // Check all characters (must be A-Z, 0-9, @, #, or $)
    if (!/^[A-Z0-9@#$]+$/i.test(qualifier)) {
      errors.push(`Qualifier ${index + 1} ('${qualifier}') contains invalid characters. Only A-Z, 0-9, @, #, $ are allowed`);
    }
  });

  // Check for member name (in parentheses)
  const memberMatch = trimmedName.match(/^([A-Z0-9@#$.]+)\(([A-Z0-9@#$]+)\)$/i);
  if (memberMatch) {
    const [, , memberName] = memberMatch;

    if (memberName.length > 8) {
      errors.push(`Member name ('${memberName}') exceeds 8 characters (${memberName.length})`);
    }

    if (!/^[A-Z@#$]/i.test(memberName.charAt(0))) {
      errors.push(`Member name ('${memberName}') must start with A-Z, @, #, or $`);
    }

    if (!/^[A-Z0-9@#$]+$/i.test(memberName)) {
      errors.push(`Member name ('${memberName}') contains invalid characters`);
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Validate Windows file name
 * Rules:
 * - Cannot contain: \ / : * ? " < > |
 * - Cannot end with space or dot
 * - Cannot be reserved names: CON, PRN, AUX, NUL, COM1-9, LPT1-9
 * - Maximum 255 characters
 */
export function validateWindowsFileName(name: string): FileNameValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!name || name.trim().length === 0) {
    errors.push('File name cannot be empty');
    return { isValid: false, errors, warnings };
  }

  const trimmedName = name.trim();

  // Check length
  if (trimmedName.length > 255) {
    errors.push(`File name too long (${trimmedName.length} characters, max 255)`);
  }

  // Check for invalid characters
  const invalidChars = /[\\/:*?"<>|]/;
  if (invalidChars.test(trimmedName)) {
    const foundChars = trimmedName.match(invalidChars);
    errors.push(`File name contains invalid characters: ${foundChars?.join(', ')}`);
  }

  // Check for trailing space or dot
  if (trimmedName.endsWith(' ')) {
    errors.push('File name cannot end with a space');
  }
  if (trimmedName.endsWith('.')) {
    errors.push('File name cannot end with a dot');
  }

  // Check for reserved names
  const reservedNames = [
    'CON', 'PRN', 'AUX', 'NUL',
    'COM1', 'COM2', 'COM3', 'COM4', 'COM5', 'COM6', 'COM7', 'COM8', 'COM9',
    'LPT1', 'LPT2', 'LPT3', 'LPT4', 'LPT5', 'LPT6', 'LPT7', 'LPT8', 'LPT9'
  ];

  const baseNameWithoutExtension = trimmedName.split('.')[0].toUpperCase();
  if (reservedNames.includes(baseNameWithoutExtension)) {
    errors.push(`'${baseNameWithoutExtension}' is a reserved Windows file name`);
  }

  // Warnings
  if (trimmedName.includes('  ')) {
    warnings.push('File name contains multiple consecutive spaces');
  }

  if (trimmedName !== name) {
    warnings.push('File name has leading or trailing whitespace that will be trimmed');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Validate Windows file path
 * Validates both the path and the file name
 */
export function validateWindowsFilePath(path: string): FileNameValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!path || path.trim().length === 0) {
    errors.push('File path cannot be empty');
    return { isValid: false, errors, warnings };
  }

  // Extract file name from path
  const lastSlash = Math.max(path.lastIndexOf('/'), path.lastIndexOf('\\'));
  const fileName = lastSlash >= 0 ? path.substring(lastSlash + 1) : path;

  // Validate file name
  const fileNameValidation = validateWindowsFileName(fileName);
  errors.push(...fileNameValidation.errors);
  warnings.push(...fileNameValidation.warnings);

  // Check total path length (Windows has a 260 character limit)
  if (path.length > 260) {
    warnings.push(`Full path is very long (${path.length} characters). Windows has a 260 character limit for paths.`);
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}
