/**
 * Text File Generator
 * Generates fixed-length text files from data using copybook definitions
 */

import { CopybookField } from './copybookParser';
import { ExcelRecord } from './excelParser';

/**
 * Generate fixed-length text file from records using copybook layout
 * @param records - Array of data records
 * @param fields - Copybook field definitions
 * @param format - Output format ('fixed' or 'csv')
 * @returns Generated text content
 */
export function generateTextFile(
  records: ExcelRecord[],
  fields: CopybookField[],
  format: 'fixed' | 'csv' = 'fixed'
): string {
  if (!records || records.length === 0) {
    throw new Error('No records provided for text generation');
  }

  if (!fields || fields.length === 0) {
    throw new Error('No field definitions provided from copybook');
  }

  if (format === 'csv') {
    return generateCSVFile(records, fields);
  } else {
    return generateFixedLengthFile(records, fields);
  }
}

/**
 * Generate fixed-length text file
 */
function generateFixedLengthFile(
  records: ExcelRecord[],
  fields: CopybookField[]
): string {
  const lines: string[] = [];

  for (const record of records) {
    let line = '';

    for (const field of fields) {
      let value = '';

      // Handle FILLER fields
      if (field.name === 'FILLER') {
        value = ''.padEnd(field.length, ' ');
      } else {
        // Get value from record (try exact match first, then case-insensitive)
        const recordValue = record[field.name] ??
                           record[field.name.toLowerCase()] ??
                           record[field.name.toUpperCase()] ??
                           '';

        value = String(recordValue);

        // Format based on field type
        if (field.type === 'number') {
          // Right-align numbers, pad with zeros
          value = value.padStart(field.length, '0');
        } else {
          // Left-align strings, pad with spaces
          value = value.padEnd(field.length, ' ');
        }

        // Truncate if too long
        if (value.length > field.length) {
          value = value.substring(0, field.length);
        }
      }

      line += value;
    }

    lines.push(line);
  }

  return lines.join('\n');
}

/**
 * Generate CSV text file
 */
function generateCSVFile(
  records: ExcelRecord[],
  fields: CopybookField[]
): string {
  const lines: string[] = [];

  // Get non-FILLER field names
  const fieldNames = fields
    .filter(f => f.name !== 'FILLER')
    .map(f => f.name);

  // Add header row
  lines.push(fieldNames.join(','));

  // Add data rows
  for (const record of records) {
    const values = fieldNames.map(fieldName => {
      const value = record[fieldName] ??
                   record[fieldName.toLowerCase()] ??
                   record[fieldName.toUpperCase()] ??
                   '';

      // Escape commas and quotes in CSV
      const stringValue = String(value);
      if (stringValue.includes(',') || stringValue.includes('"')) {
        return `"${stringValue.replace(/"/g, '""')}"`;
      }
      return stringValue;
    });

    lines.push(values.join(','));
  }

  return lines.join('\n');
}

/**
 * Write text file to disk
 */
export async function writeTextFile(content: string, outputPath: string): Promise<void> {
  const { writeFile } = await import('fs/promises');
  await writeFile(outputPath, content, 'utf-8');
}
