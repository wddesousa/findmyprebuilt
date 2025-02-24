import { NextRequest, NextResponse } from 'next/server';
import { apiAuthMiddleware } from '@/app/middlewares/api-auth';

export async function middleware(request: NextRequest) {
    if (request.nextUrl.pathname.startsWith('/api/scrape')) {
        return apiAuthMiddleware(request);
      }
      
    return NextResponse.next();

}

export const config = {
    matcher: '/api/scrape/:path*',
};
