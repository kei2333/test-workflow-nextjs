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
  const records: ParsedRecord[] = [];
  const lines = textContent.split('\n').filter(line => line.trim());

  for (const line of lines) {
    const record: ParsedRecord = {};

    for (const field of fields) {
      // Skip FILLER fields in the output
      if (field.name === 'FILLER') {
        continue;
      }

      const value = extractFieldValue(line, field);
      record[field.name] = value;
    }

    records.push(record);
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
  const records: ParsedRecord[] = [];
  const lines = textContent.split('\n').filter(line => line.trim());

  // Get field names (excluding FILLER)
  const fieldNames = fields
    .filter(f => f.name !== 'FILLER')
    .map(f => f.name);

  for (const line of lines) {
    const record: ParsedRecord = {};

    // Split by comma and trim each value
    const values = line.split(',').map(v => v.trim());

    // Map values to field names
    fieldNames.forEach((fieldName, index) => {
      record[fieldName] = values[index] || '';
    });

    records.push(record);
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
