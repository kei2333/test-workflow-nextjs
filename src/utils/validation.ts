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