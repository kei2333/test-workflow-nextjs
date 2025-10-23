/**
 * Excel Generator
 * Generates Excel files from parsed data
 */

import { ParsedRecord } from './textParser';

/**
 * Generate an Excel file from parsed records
 * @param records - Array of parsed records
 * @param outputPath - Output file path for the Excel file
 */
export async function generateExcel(records: ParsedRecord[], outputPath: string): Promise<void> {
  if (records.length === 0) {
    throw new Error('No data to convert to Excel');
  }

  // Dynamic import to avoid SSR issues
  const XLSX = await import('xlsx');
  const { writeFile } = await import('fs/promises');

  // Create a new workbook
  const workbook = XLSX.utils.book_new();

  // Convert records to worksheet
  const worksheet = XLSX.utils.json_to_sheet(records);

  // Add the worksheet to the workbook
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Data');

  // Write the workbook to buffer first
  const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

  // Write buffer to file using fs/promises
  await writeFile(outputPath, Buffer.from(buffer));
}

/**
 * Generate an Excel file buffer from parsed records (for API response)
 * @param records - Array of parsed records
 * @returns Buffer containing the Excel file
 */
export async function generateExcelBuffer(records: ParsedRecord[]): Promise<Buffer> {
  if (records.length === 0) {
    throw new Error('No data to convert to Excel');
  }

  // Dynamic import to avoid SSR issues
  const XLSX = await import('xlsx');

  // Create a new workbook
  const workbook = XLSX.utils.book_new();

  // Convert records to worksheet
  const worksheet = XLSX.utils.json_to_sheet(records);

  // Add the worksheet to the workbook
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Data');

  // Write the workbook to buffer
  const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

  return Buffer.from(buffer);
}
