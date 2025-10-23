/**
 * Text File Parser
 * Parses text files in both fixed-length and CSV formats
 */

import { CopybookField, extractFieldValue } from './copybookParser';

export interface ParsedRecord {
  [fieldName: string]: string;
}

/**
 * Detect if the text file is comma-separated or fixed-length
 */
export function detectFormat(textContent: string): 'csv' | 'fixed' {
  const firstLine = textContent.split('\n')[0];

  // If the line contains commas, it's likely CSV format
  if (firstLine && firstLine.includes(',')) {
    return 'csv';
  }

  return 'fixed';
}

/**
 * Parse a fixed-length text file using copybook field definitions
 */
export function parseFixedLengthText(
  textContent: string,
  fields: CopybookField[]
): ParsedRecord[] {
  if (!textContent || textContent.trim().length === 0) {
    throw new Error('Text file content is empty');
  }

  if (!fields || fields.length === 0) {
    throw new Error('No field definitions provided from copybook');
  }

  const records: ParsedRecord[] = [];
  const lines = textContent.split('\n').filter(line => line.trim());

  // Calculate expected record length
  const expectedLength = fields[fields.length - 1].endPosition;

  for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
    const line = lines[lineIndex];

    if (line.length < expectedLength) {
      console.warn(`Warning: Line ${lineIndex + 1} is shorter than expected (${line.length} < ${expectedLength}). Padding with spaces.`);
    }

    const record: ParsedRecord = {};

    for (const field of fields) {
      // Skip FILLER fields in the output
      if (field.name === 'FILLER') {
        continue;
      }

      try {
        const value = extractFieldValue(line, field);
        record[field.name] = value;
      } catch (error) {
        throw new Error(`Error extracting field '${field.name}' at line ${lineIndex + 1}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    records.push(record);
  }

  if (records.length === 0) {
    throw new Error('No records parsed from text file');
  }

  return records;
}

/**
 * Parse a CSV text file using copybook field definitions for field names
 */
export function parseCSVText(
  textContent: string,
  fields: CopybookField[]
): ParsedRecord[] {
  if (!textContent || textContent.trim().length === 0) {
    throw new Error('Text file content is empty');
  }

  if (!fields || fields.length === 0) {
    throw new Error('No field definitions provided from copybook');
  }

  const records: ParsedRecord[] = [];
  const lines = textContent.split('\n').filter(line => line.trim());

  // Get field names (excluding FILLER)
  const fieldNames = fields
    .filter(f => f.name !== 'FILLER')
    .map(f => f.name);

  if (fieldNames.length === 0) {
    throw new Error('No valid field names found in copybook (all fields are FILLER)');
  }

  for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
    const line = lines[lineIndex];
    const record: ParsedRecord = {};

    // Split by comma and trim each value
    const values = line.split(',').map(v => v.trim());

    if (values.length !== fieldNames.length) {
      console.warn(`Warning: Line ${lineIndex + 1} has ${values.length} values but expected ${fieldNames.length} fields`);
    }

    // Map values to field names
    fieldNames.forEach((fieldName, index) => {
      record[fieldName] = values[index] || '';
    });

    records.push(record);
  }

  if (records.length === 0) {
    throw new Error('No records parsed from CSV file');
  }

  return records;
}

/**
 * Parse text file (auto-detect format)
 */
export function parseTextFile(
  textContent: string,
  fields: CopybookField[]
): ParsedRecord[] {
  const format = detectFormat(textContent);

  if (format === 'csv') {
    return parseCSVText(textContent, fields);
  } else {
    return parseFixedLengthText(textContent, fields);
  }
}
