import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-static';

const FUNCTIONS_FILE = path.join(process.cwd(), 'data', 'functions.json');

export interface FunctionInput {
  name: string;
  placeholder: string;
}

export interface FunctionData {
  id: string;
  name: string;
  description: string;
  inputs: FunctionInput[];
}

// GET - 获取所有函数
export async function GET() {
  try {
    const data = fs.readFileSync(FUNCTIONS_FILE, 'utf-8');
    const functions = JSON.parse(data);
    return NextResponse.json(functions);
  } catch (error) {
    console.error('Error reading functions:', error);
    return NextResponse.json({ error: 'Failed to read functions' }, { status: 500 });
  }
}

// POST - 添加新函数
export async function POST(request: NextRequest) {
  try {
    const newFunction: FunctionData = await request.json();
    
    // 读取现有函数
    const data = fs.readFileSync(FUNCTIONS_FILE, 'utf-8');
    const functions: FunctionData[] = JSON.parse(data);
    
    // 检查ID是否已存在
    if (functions.some(func => func.id === newFunction.id)) {
      return NextResponse.json({ error: 'Function with this ID already exists' }, { status: 400 });
    }
    
    // 添加新函数
    functions.push(newFunction);
    
    // 写入文件
    fs.writeFileSync(FUNCTIONS_FILE, JSON.stringify(functions, null, 2));
    
    return NextResponse.json({ message: 'Function added successfully', function: newFunction });
  } catch (error) {
    console.error('Error adding function:', error);
    return NextResponse.json({ error: 'Failed to add function' }, { status: 500 });
  }
}

// PUT - 更新函数
export async function PUT(request: NextRequest) {
  try {
    const updatedFunction: FunctionData = await request.json();
    
    // 读取现有函数
    const data = fs.readFileSync(FUNCTIONS_FILE, 'utf-8');
    const functions: FunctionData[] = JSON.parse(data);
    
    // 查找并更新函数
    const functionIndex = functions.findIndex(func => func.id === updatedFunction.id);
    if (functionIndex === -1) {
      return NextResponse.json({ error: 'Function not found' }, { status: 404 });
    }
    
    functions[functionIndex] = updatedFunction;
    
    // 写入文件
    fs.writeFileSync(FUNCTIONS_FILE, JSON.stringify(functions, null, 2));
    
    return NextResponse.json({ message: 'Function updated successfully', function: updatedFunction });
  } catch (error) {
    console.error('Error updating function:', error);
    return NextResponse.json({ error: 'Failed to update function' }, { status: 500 });
  }
}

// DELETE - 删除函数
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const functionId = searchParams.get('id');
    
    if (!functionId) {
      return NextResponse.json({ error: 'Function ID is required' }, { status: 400 });
    }
    
    // 读取现有函数
    const data = fs.readFileSync(FUNCTIONS_FILE, 'utf-8');
    const functions: FunctionData[] = JSON.parse(data);
    
    // 过滤掉要删除的函数
    const filteredFunctions = functions.filter(func => func.id !== functionId);
    
    if (filteredFunctions.length === functions.length) {
      return NextResponse.json({ error: 'Function not found' }, { status: 404 });
    }
    
    // 写入文件
    fs.writeFileSync(FUNCTIONS_FILE, JSON.stringify(filteredFunctions, null, 2));
    
    return NextResponse.json({ message: 'Function deleted successfully' });
  } catch (error) {
    console.error('Error deleting function:', error);
    return NextResponse.json({ error: 'Failed to delete function' }, { status: 500 });
  }
}