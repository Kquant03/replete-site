import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const response = NextResponse.next();
  response.headers.append('Access-Control-Allow-Origin', '*');
  response.headers.append('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  response.headers.append('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  return response;
}

export const config = {
  matcher: '/api/:path*',
};