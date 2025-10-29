import { NextRequest, NextResponse } from 'next/server';
import { readFile, mkdir } from 'fs/promises';
import path from 'path';
import { parseCopybook } from '@/utils/copybookParser';
import { parseExcel } from '@/utils/excelParser';
import { generateTextFile, writeTextFile } from '@/utils/textGenerator';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { copybookPath, excelFilePath, outputFileName, outputLocation, outputFormat } = body;

    if (!copybookPath || !excelFilePath || !outputFileName) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required parameters: copybookPath, excelFilePath, outputFileName'
        },
        { status: 400 }
      );
    }

    // Resolve file paths
    const projectRoot = process.cwd();
    const absoluteCopybookPath = path.join(projectRoot, copybookPath);
    const absoluteExcelFilePath = path.join(projectRoot, excelFilePath);

    // Read copybook
    const copybookContent = await readFile(absoluteCopybookPath, 'utf-8');

    // Parse copybook to get field definitions
    const fields = parseCopybook(copybookContent);

    if (fields.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Failed to parse copybook - no fields found' },
        { status: 400 }
      );
    }

    // Parse Excel file
    const records = await parseExcel(absoluteExcelFilePath);

    if (records.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No records found in Excel file' },
        { status: 400 }
      );
    }

    // Determine output format (default to fixed-length)
    const format = outputFormat === 'csv' ? 'csv' : 'fixed';

    // Generate text content
    const textContent = generateTextFile(records, fields, format);

    // Determine output path
    const outputDir = outputLocation
      ? path.join(projectRoot, outputLocation)
      : path.join(projectRoot, 'downloads');

    // Ensure output directory exists
    await mkdir(outputDir, { recursive: true });

    // Generate output file path
    const textFileName = outputFileName.endsWith('.txt')
      ? outputFileName
      : `${outputFileName}.txt`;
    const textFilePath = path.join(outputDir, textFileName);

    // Write text file
    await writeTextFile(textContent, textFilePath);

    // Return relative path
    const relativePath = path.relative(projectRoot, textFilePath);

    return NextResponse.json({
      success: true,
      message: `Successfully converted ${records.length} records to ${format} text file`,
      outputPath: relativePath,
      recordCount: records.length,
      fieldCount: fields.filter(f => f.name !== 'FILLER').length,
      format
    });
  } catch (error) {
    console.error('Reverse file conversion error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Reverse file conversion failed'
      },
      { status: 500 }
    );
  }
}
