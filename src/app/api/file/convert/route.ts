import { NextRequest, NextResponse } from 'next/server';
import { readFile, mkdir } from 'fs/promises';
import path from 'path';
import { parseCopybook } from '@/utils/copybookParser';
import { parseTextFile } from '@/utils/textParser';
import { generateExcel } from '@/utils/excelGenerator';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { copybookPath, textFilePath, outputFileName, outputLocation } = body;

    if (!copybookPath || !textFilePath || !outputFileName) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required parameters: copybookPath, textFilePath, outputFileName'
        },
        { status: 400 }
      );
    }

    // Resolve file paths
    const projectRoot = process.cwd();
    const absoluteCopybookPath = path.join(projectRoot, copybookPath);
    const absoluteTextFilePath = path.join(projectRoot, textFilePath);

    // Read files
    const copybookContent = await readFile(absoluteCopybookPath, 'utf-8');
    const textContent = await readFile(absoluteTextFilePath, 'utf-8');

    // Parse copybook to get field definitions
    const fields = parseCopybook(copybookContent);

    if (fields.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Failed to parse copybook - no fields found' },
        { status: 400 }
      );
    }

    // Parse text file using copybook definitions
    const records = parseTextFile(textContent, fields);

    if (records.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No records found in text file' },
        { status: 400 }
      );
    }

    // Determine output path
    const outputDir = outputLocation
      ? path.join(projectRoot, outputLocation)
      : path.join(projectRoot, 'downloads');

    // Ensure output directory exists
    await mkdir(outputDir, { recursive: true });

    // Generate output file path
    const excelFileName = outputFileName.endsWith('.xlsx')
      ? outputFileName
      : `${outputFileName}.xlsx`;
    const excelFilePath = path.join(outputDir, excelFileName);

    // Generate Excel file
    await generateExcel(records, excelFilePath);

    // Return relative path
    const relativePath = path.relative(projectRoot, excelFilePath);

    return NextResponse.json({
      success: true,
      message: `Successfully converted ${records.length} records to Excel`,
      outputPath: relativePath,
      recordCount: records.length,
      fieldCount: fields.filter(f => f.name !== 'FILLER').length
    });
  } catch (error) {
    console.error('File conversion error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'File conversion failed'
      },
      { status: 500 }
    );
  }
}
