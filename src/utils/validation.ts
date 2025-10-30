export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: string) => boolean;
}

export interface ValidationError {
  field: string;
  message: string;
}

export const sanitizeInput = (input: string): string => {
  return input
    .trim()
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove script tags
    .replace(/[<>]/g, '') // Remove < and > characters
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, ''); // Remove event handlers like onclick=
};

export const validateField = (
  value: string, 
  rules: ValidationRule, 
  fieldName: string
): ValidationError | null => {
  const sanitizedValue = sanitizeInput(value);
  
  if (rules.required && (!sanitizedValue || sanitizedValue.length === 0)) {
    return {
      field: fieldName,
      message: `${fieldName} is required`
    };
  }

  if (rules.minLength && sanitizedValue.length < rules.minLength) {
    return {
      field: fieldName,
      message: `${fieldName} must be at least ${rules.minLength} characters long`
    };
  }

  if (rules.maxLength && sanitizedValue.length > rules.maxLength) {
    return {
      field: fieldName,
      message: `${fieldName} must be no more than ${rules.maxLength} characters long`
    };
  }

  if (rules.pattern && !rules.pattern.test(sanitizedValue)) {
    return {
      field: fieldName,
      message: `${fieldName} format is invalid`
    };
  }

  if (rules.custom && !rules.custom(sanitizedValue)) {
    return {
      field: fieldName,
      message: `${fieldName} is invalid`
    };
  }

  return null;
};

export const validateForm = (
  formData: Record<string, string>, 
  validationRules: Record<string, ValidationRule>
): ValidationError[] => {
  const errors: ValidationError[] = [];

  Object.keys(validationRules).forEach(fieldName => {
    const value = formData[fieldName] || '';
    const rules = validationRules[fieldName];
    const error = validateField(value, rules, fieldName);
    
    if (error) {
      errors.push(error);
    }
  });

  return errors;
};

export const functionIdPattern = /^[a-zA-Z][a-zA-Z0-9_-]*$/;
export const functionNamePattern = /^[a-zA-Z0-9\s_-]+$/;

export const functionValidationRules = {
  id: {
    required: true,
    minLength: 2,
    maxLength: 50,
    pattern: functionIdPattern
  },
  name: {
    required: true,
    minLength: 2,
    maxLength: 100,
    pattern: functionNamePattern
  },
  description: {
    required: false,
    maxLength: 500
  }
};

/**
 * Validate numeric input
 */
export function validateNumber(value: string, min?: number, max?: number): { isValid: boolean; error?: string } {
  const num = parseFloat(value);

  if (isNaN(num)) {
    return { isValid: false, error: 'Must be a valid number' };
  }

  if (min !== undefined && num < min) {
    return { isValid: false, error: `Must be at least ${min}` };
  }

  if (max !== undefined && num > max) {
    return { isValid: false, error: `Must be at most ${max}` };
  }

  return { isValid: true };
}

/**
 * Validate integer input
 */
export function validateInteger(value: string, min?: number, max?: number): { isValid: boolean; error?: string } {
  const num = parseInt(value, 10);

  if (isNaN(num) || !Number.isInteger(num)) {
    return { isValid: false, error: 'Must be a valid integer' };
  }

  if (min !== undefined && num < min) {
    return { isValid: false, error: `Must be at least ${min}` };
  }

  if (max !== undefined && num > max) {
    return { isValid: false, error: `Must be at most ${max}` };
  }

  return { isValid: true };
}

/**
 * Validate port number (1-65535)
 */
export function validatePort(value: string): { isValid: boolean; error?: string } {
  const result = validateInteger(value, 1, 65535);
  if (!result.isValid) {
    return { isValid: false, error: 'Port must be between 1 and 65535' };
  }
  return { isValid: true };
}

/**
 * Validate hostname (domain name or IP address)
 */
export function validateHostname(value: string): { isValid: boolean; error?: string } {
  if (!value || value.trim().length === 0) {
    return { isValid: false, error: 'Hostname cannot be empty' };
  }

  const trimmed = value.trim();

  // Check for IP address (simple validation)
  const ipPattern = /^(\d{1,3}\.){3}\d{1,3}$/;
  if (ipPattern.test(trimmed)) {
    const parts = trimmed.split('.');
    for (const part of parts) {
      const num = parseInt(part, 10);
      if (num < 0 || num > 255) {
        return { isValid: false, error: 'Invalid IP address' };
      }
    }
    return { isValid: true };
  }

  // Check for domain name
  const domainPattern = /^[a-zA-Z0-9][a-zA-Z0-9-_.]*[a-zA-Z0-9]$/;
  if (!domainPattern.test(trimmed)) {
    return { isValid: false, error: 'Invalid hostname format' };
  }

  if (trimmed.length > 253) {
    return { isValid: false, error: 'Hostname too long (max 253 characters)' };
  }

  return { isValid: true };
}

/**
 * Validate email address
 */
export function validateEmail(value: string): { isValid: boolean; error?: string } {
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailPattern.test(value)) {
    return { isValid: false, error: 'Invalid email address format' };
  }
  return { isValid: true };
}

/**
 * Validate URL
 */
export function validateURL(value: string): { isValid: boolean; error?: string } {
  try {
    const url = new URL(value);
    if (!['http:', 'https:', 'ftp:'].includes(url.protocol)) {
      return { isValid: false, error: 'URL must use http, https, or ftp protocol' };
    }
    return { isValid: true };
  } catch {
    return { isValid: false, error: 'Invalid URL format' };
  }
}

/**
 * Validate non-empty string
 */
export function validateNonEmpty(value: string, fieldName: string): { isValid: boolean; error?: string } {
  if (!value || value.trim().length === 0) {
    return { isValid: false, error: `${fieldName} cannot be empty` };
  }
  return { isValid: true };
}

/**
 * Validate string length
 */
export function validateLength(
  value: string,
  min: number,
  max: number,
  fieldName: string
): { isValid: boolean; error?: string } {
  const length = value.length;

  if (length < min) {
    return { isValid: false, error: `${fieldName} must be at least ${min} characters` };
  }

  if (length > max) {
    return { isValid: false, error: `${fieldName} must be at most ${max} characters` };
  }

  return { isValid: true };
}