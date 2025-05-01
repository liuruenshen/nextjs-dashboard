import { NextRequest, NextResponse } from 'next/server';
import { createHmac } from 'node:crypto';

export async function POST(request: NextRequest) {
  try {
    const data = await request.formData();

    const { email, user, salt } = Object.fromEntries(data);

    if (typeof salt !== 'string') {
      throw new Error('Salt is not a string');
    }

    const result = createHmac('sha256', salt)
      .update(`${email}_${user}`)
      .digest('hex');

    return NextResponse.json({ result });
  } catch (e) {
    const response = new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : '' }),
      {
        status: 400,
        statusText: 'Bad Request',
      },
    );
    response.headers.set('Content-Type', 'application/json');

    return response;
  }
}
