import { describe, it, expect } from "vitest";
import { NextRequest } from 'next/server';
import * as prebuilt from '@/app/api/scrape/prebuilt/[brand]/route';

describe('/api', async () => {
    describe('[POST] /scrape/prebuilt/[brand]', () => {
      const headers = new Headers()
      headers.set('prebuilt-cron-secret', "supersecretcrontest")
      const params = Promise.resolve({ brand: 'nzxt' })
      it('should respond with 403 if not authorized', async () => {
        const req = new NextRequest('http://localhost:3000/api/scrape/prebuilt/nzxt', {
          method: 'POST',
          body: JSON.stringify({ key1: 'value1' })
        });

        const response = await prebuilt.POST(req, { params });
        expect(response?.status).toBe(403);
      })


      it('should throw 400 error if brand is not configured', async () => {
        const req = new NextRequest('http://localhost:3000/api/scrape/prebuilt/nzxt', {
          method: 'POST',
          body: JSON.stringify({ key1: 'value1' }),
          headers: headers
        });

        const response = await prebuilt.POST(req, { params });
        expect(response?.status).toBe(400);
        const data = await response?.json();
        expect(data.error).toBe('Brand not configured');
      })
      
      it('should throw 400 error if missing key', async () => {
        // test logic will go here
      })
    })
  })