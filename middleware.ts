import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protect admin routes - check will be done in the page component
  // since we need to check database for admin status
  if (pathname.startsWith("/admin")) {
    // Allow the request through - admin check happens in page component
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
  ],
};
