import { NextResponse, type NextRequest } from "next/server";

/**
 * Forward pathname for age-gate returnTo. Does not block crawlers or humans —
 * the AgeGate UI is decided in the storefront layout.
 */
export function middleware(request: NextRequest) {
  const headers = new Headers(request.headers);
  headers.set(
    "x-pathname",
    `${request.nextUrl.pathname}${request.nextUrl.search}`,
  );
  return NextResponse.next({
    request: { headers },
  });
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|branding/|products/|api/).*)",
  ],
};
