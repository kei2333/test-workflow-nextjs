import { NextRequest, NextResponse } from 'next/server';
import { FunctionExecutor } from '@/services/functionExecutor';
import { WorkflowItem } from '@/types/workflow';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { workflowItems } = body;

    if (!workflowItems || !Array.isArray(workflowItems)) {
      return NextResponse.json(
        { error: 'Invalid workflow items' },
        { status: 400 }
      );
    }

    // Validate workflow items
    const validatedItems: WorkflowItem[] = workflowItems.map((item: any) => ({
      id: item.id || crypto.randomUUID(),
      functionId: item.functionId,
      name: item.name,
      inputs: item.inputs || {}
    }));

    // Execute workflow
    const results = await FunctionExecutor.executeWorkflow(validatedItems);

    return NextResponse.json({
      success: true,
      results
    });

  } catch (error) {
    console.error('Workflow execution error:', error);
    return NextResponse.json(
      {
        error: 'Workflow execution failed',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Workflow execution API endpoint',
    methods: ['POST'],
    description: 'Execute a workflow with the provided items'
  });
}