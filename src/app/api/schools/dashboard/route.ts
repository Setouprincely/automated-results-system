import { NextRequest, NextResponse } from 'next/server';

// Mock data for dashboard
const mockData = {
  message: 'Dashboard endpoint is working',
  timestamp: new Date().toISOString(),
  status: 'operational'
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    return NextResponse.json({
      success: true,
      data: mockData,
      message: 'Dashboard retrieved successfully'
    });
  } catch (error) {
    console.error('dashboard API error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    return NextResponse.json({
      success: true,
      data: { ...mockData, ...body },
      message: 'Dashboard operation completed successfully'
    });
  } catch (error) {
    console.error('dashboard API error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
