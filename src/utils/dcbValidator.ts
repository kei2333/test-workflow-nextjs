/**
 * DCB (Data Control Block) Validator
 * Validates mainframe dataset DCB parameters
 */

export interface DCBParameters {
  recfm?: string;  // Record Format: F, FB, V, VB, U
  lrecl?: number;  // Logical Record Length
  blksize?: number; // Block Size
}

export interface DCBValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Valid RECFM values
 */
const VALID_RECFM = ['F', 'FB', 'FBA', 'FBM', 'FBS', 'V', 'VB', 'VBA', 'VBM', 'VBS', 'U'];

/**
 * Validate DCB parameters
 */
export function validateDCB(dcb: DCBParameters): DCBValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Validate RECFM
  if (dcb.recfm) {
    const recfmUpper = dcb.recfm.toUpperCase();
    if (!VALID_RECFM.includes(recfmUpper)) {
      errors.push(`Invalid RECFM '${dcb.recfm}'. Valid values: ${VALID_RECFM.join(', ')}`);
    }
  }

  // Validate LRECL
  if (dcb.lrecl !== undefined) {
    if (dcb.lrecl <= 0) {
      errors.push(`LRECL must be greater than 0 (got ${dcb.lrecl})`);
    }
    if (dcb.lrecl > 32760) {
      errors.push(`LRECL cannot exceed 32760 (got ${dcb.lrecl})`);
    }
  }

  // Validate BLKSIZE
  if (dcb.blksize !== undefined) {
    if (dcb.blksize <= 0) {
      errors.push(`BLKSIZE must be greater than 0 (got ${dcb.blksize})`);
    }
    if (dcb.blksize > 32760) {
      errors.push(`BLKSIZE cannot exceed 32760 (got ${dcb.blksize})`);
    }
  }

  // Cross-validation: BLKSIZE should be >= LRECL for Fixed format
  if (dcb.recfm && dcb.lrecl && dcb.blksize) {
    const recfmUpper = dcb.recfm.toUpperCase();
    if (recfmUpper.startsWith('F')) {
      // Fixed format
      if (dcb.blksize < dcb.lrecl) {
        errors.push(`BLKSIZE (${dcb.blksize}) must be >= LRECL (${dcb.lrecl}) for fixed format`);
      }

      // BLKSIZE should be a multiple of LRECL for blocked formats
      if (recfmUpper.includes('B') && dcb.blksize % dcb.lrecl !== 0) {
        warnings.push(`BLKSIZE (${dcb.blksize}) is not a multiple of LRECL (${dcb.lrecl}). This may cause inefficient space utilization.`);
      }
    } else if (recfmUpper.startsWith('V')) {
      // Variable format - BLKSIZE should be at least LRECL + 4
      if (dcb.blksize < dcb.lrecl + 4) {
        errors.push(`BLKSIZE (${dcb.blksize}) must be at least LRECL + 4 (${dcb.lrecl + 4}) for variable format`);
      }
    }
  }

  // Optimization warnings
  if (dcb.blksize && dcb.blksize < 4096) {
    warnings.push(`BLKSIZE (${dcb.blksize}) is less than 4096. Consider using larger block size for better performance.`);
  }

  if (dcb.blksize && dcb.blksize > 27920 && dcb.blksize < 32760) {
    warnings.push(`BLKSIZE (${dcb.blksize}) is not optimized. Consider using half-track (27920) or full-track (32760) blocking.`);
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Format DCB parameters as a string for display
 */
export function formatDCB(dcb: DCBParameters): string {
  const parts: string[] = [];

  if (dcb.recfm) {
    parts.push(`RECFM=${dcb.recfm.toUpperCase()}`);
  }
  if (dcb.lrecl) {
    parts.push(`LRECL=${dcb.lrecl}`);
  }
  if (dcb.blksize) {
    parts.push(`BLKSIZE=${dcb.blksize}`);
  }

  return parts.join(', ');
}

/**
 * Parse DCB parameters from input strings
 */
export function parseDCB(inputs: Record<string, string>): DCBParameters {
  const dcb: DCBParameters = {};

  if (inputs['RECFM']) {
    dcb.recfm = inputs['RECFM'].trim().toUpperCase();
  }

  if (inputs['LRECL']) {
    const lrecl = parseInt(inputs['LRECL'], 10);
    if (!isNaN(lrecl)) {
      dcb.lrecl = lrecl;
    }
  }

  if (inputs['BLKSIZE']) {
    const blksize = parseInt(inputs['BLKSIZE'], 10);
    if (!isNaN(blksize)) {
      dcb.blksize = blksize;
    }
  }

  return dcb;
}
