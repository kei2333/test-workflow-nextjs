import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    const configPath = path.join(process.cwd(), 'test-config.json');
    
    // Check if config file exists
    if (!fs.existsSync(configPath)) {
      return NextResponse.json(
        { error: 'Config file not found' },
        { status: 404 }
      );
    }

    // Read and parse config file
    const configData = fs.readFileSync(configPath, 'utf8');
    const config = JSON.parse(configData);

    return NextResponse.json(config);
  } catch (error) {
    console.error('Error reading config:', error);
    return NextResponse.json(
      { error: 'Failed to read config file' },
      { status: 500 }
    );
  }
}