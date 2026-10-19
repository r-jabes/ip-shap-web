import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Edge middleware: block obvious enumeration paths and attach request id.
 * Authorisation still happens in Server Components / Actions / RLS.
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Do not expose source maps or env dumps if misconfigured.
  if (
    pathname.endsWith(".map") ||
    pathname === "/.env" ||
    pathname.startsWith("/.env.")
  ) {
    return new NextResponse(null, { status: 404 });
  }

  const response = NextResponse.next();
  response.headers.set(
    "x-request-id",
    request.headers.get("x-request-id") ?? crypto.randomUUID(),
  );
  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
