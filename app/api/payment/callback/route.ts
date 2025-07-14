import { NextRequest, NextResponse } from 'next/server';
import { paymentService } from '@/lib/services/paymentService';

export async function POST(request: NextRequest) {
  try {
    const callbackData = await request.json();
    
    console.log('Payment callback received:', callbackData);

    await paymentService.handlePaymentCallback(callbackData);

    return NextResponse.json({ 
      status: 'success',
      message: 'Callback processed successfully' 
    });
  } catch (error) {
    console.error('Payment callback error:', error);
    return NextResponse.json(
      { 
        status: 'error',
        message: 'Callback processing failed' 
      },
      { status: 500 }
    );
  }
}