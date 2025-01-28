// app/api/my-route/route.test.ts
import { describe, it, expect } from 'vitest';
import { POST } from '@/app/api/prebuilts/new/submit/route';
import { NextResponse } from 'next/server';

describe('POST /api/my-route', () => {
  it('handles a POST request and returns the correct response', async () => {
    // Create a mock request with a JSON body
    const request = new Request('http://localhost/api/my-route', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ data: 'Hello, world!' }),
    });

    // Call the POST function
    const response = await POST(request);

    // Check the response status and body
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data).toEqual({ message: 'Received: Hello, world!' });
  });
});