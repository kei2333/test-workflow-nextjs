/**
 * Excel Parser
 * Parses Excel files and extracts data records
 */

export interface ExcelRecord {
  [fieldName: string]: string | number;
}

/**
 * Parse an Excel file and return records
 * @param filePath - Path to the Excel file
 * @returns Array of records from the first sheet
 */
export async function parseExcel(filePath: string): Promise<ExcelRecord[]> {
  // Dynamic import to avoid SSR issues
  const XLSX = await import('xlsx');
  const { readFile } = await import('fs/promises');

  // Read the Excel file
  const buffer = await readFile(filePath);
  const workbook = XLSX.read(buffer, { type: 'buffer' });

  // Get the first sheet
  const sheetName = workbook.SheetNames[0];
  if (!sheetName) {
    throw new Error('No sheets found in Excel file');
  }

  const worksheet = workbook.Sheets[sheetName];

  // Convert sheet to JSON
  const records = XLSX.utils.sheet_to_json(worksheet) as ExcelRecord[];

  if (records.length === 0) {
    throw new Error('No data found in Excel file');
  }

  return records;
}

/**
 * Parse an Excel file buffer (for uploaded files)
 * @param buffer - Buffer containing Excel file data
 * @returns Array of records from the first sheet
 */
export async function parseExcelBuffer(buffer: Buffer): Promise<ExcelRecord[]> {
  // Dynamic import to avoid SSR issues
  const XLSX = await import('xlsx');

  const workbook = XLSX.read(buffer, { type: 'buffer' });

  // Get the first sheet
  const sheetName = workbook.SheetNames[0];
  if (!sheetName) {
    throw new Error('No sheets found in Excel file');
  }

  const worksheet = workbook.Sheets[sheetName];

  // Convert sheet to JSON
  const records = XLSX.utils.sheet_to_json(worksheet) as ExcelRecord[];

  if (records.length === 0) {
    throw new Error('No data found in Excel file');
  }

  return records;
}
