import { NextRequest, NextResponse } from 'next/server';
import { ussdService } from '@/lib/services/ussdService';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { SESSIONID, USERID, MSISDN, USERDATA, MSGTYPE, NETWORK } = body;

    console.log('USSD Request:', body);

    // Validate required fields
    if (!SESSIONID || !MSISDN) {
      return new NextResponse('Missing required fields', { status: 400 });
    }

    const response = await ussdService.processInput(
      SESSIONID,
      USERID || '',
      MSISDN,
      USERDATA || '',
      MSGTYPE || '',
      NETWORK || ''
    );

    console.log('USSD Response:', response);

    return new NextResponse(JSON.stringify(response), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('USSD processing error:', error);
    return new NextResponse('END System error', { status: 500 });
  }
}