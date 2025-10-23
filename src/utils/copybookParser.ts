/**
 * Copybook Parser
 * Parses COBOL copybook files to extract field definitions
 */

export interface CopybookField {
  name: string;
  type: 'string' | 'number';
  length: number;
  startPosition: number;
  endPosition: number;
}

/**
 * Parse a COBOL copybook file to extract field definitions
 * Supports PIC X(n) for strings and PIC 9(n) for numbers
 */
export function parseCopybook(copybookContent: string): CopybookField[] {
  if (!copybookContent || copybookContent.trim().length === 0) {
    throw new Error('Copybook content is empty or invalid');
  }

  const fields: CopybookField[] = [];
  const lines = copybookContent.split('\n');
  let currentPosition = 0;
  let processedLines = 0;

  for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
    const line = lines[lineIndex];
    const trimmedLine = line.trim();

    // Skip empty lines and comments
    if (!trimmedLine || trimmedLine.startsWith('*')) {
      continue;
    }

    // Match field definition: 05 FIELD-NAME PIC X(16) or 05 FIELD-NAME PIC 9(8)
    // Also handle: 05 FILLER PIC X(50)
    const fieldMatch = trimmedLine.match(/^\d+\s+([A-Z0-9\-]+)\s+PIC\s+([X9])\((\d+)\)/i);

    if (fieldMatch) {
      const [, rawFieldName, picType, lengthStr] = fieldMatch;
      const length = parseInt(lengthStr, 10);

      if (isNaN(length) || length <= 0) {
        throw new Error(`Invalid field length at line ${lineIndex + 1}: ${trimmedLine}`);
      }

      // Convert COBOL field name to more readable format
      // I-POLICY-ID -> Policy ID
      // FILLER will be skipped in display but counted in position
      let fieldName = rawFieldName;
      if (rawFieldName !== 'FILLER') {
        fieldName = rawFieldName
          .replace(/^I-/, '') // Remove I- prefix
          .split('-')
          .map(word => word.charAt(0) + word.slice(1).toLowerCase())
          .join(' ');
      }

      fields.push({
        name: fieldName,
        type: picType.toUpperCase() === 'X' ? 'string' : 'number',
        length,
        startPosition: currentPosition,
        endPosition: currentPosition + length
      });

      currentPosition += length;
      processedLines++;
    }
  }

  if (fields.length === 0) {
    throw new Error('No valid field definitions found in copybook. Please check the copybook format.');
  }

  return fields;
}

/**
 * Extract a field value from a fixed-length record
 */
export function extractFieldValue(
  record: string,
  field: CopybookField,
  trim: boolean = true
): string {
  const value = record.substring(field.startPosition, field.endPosition);
  return trim ? value.trim() : value;
}
