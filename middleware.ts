import { NextRequest, NextResponse } from "next/server";

const PUBLIC_AUTH_PATHS = ["/auth/sign-in"];

function isAuthPath(pathname: string) {
  return PUBLIC_AUTH_PATHS.some((p) => pathname.startsWith(p));
}

function isPublicAsset(pathname: string) {
  return (
    pathname.startsWith("/_next") ||
    pathname === "/favicon.ico" ||
    pathname.startsWith("/images") ||
    pathname.startsWith("/public") ||
    pathname.startsWith("/logo") ||
    pathname.startsWith("/api")
  );
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (isPublicAsset(pathname)) {
    return NextResponse.next();
  }

  const token = req.cookies.get("sof_admin_session")?.value;
  const expectedToken = process.env.ADMIN_SESSION_SECRET || "fallback_secret_token_123!";
  const isAuthenticated = token === expectedToken;

  if (isAuthPath(pathname)) {
    if (isAuthenticated) {
      return NextResponse.redirect(new URL("/", req.url));
    }
    return NextResponse.next();
  }

  if (!isAuthenticated) {
    return NextResponse.redirect(new URL("/auth/sign-in", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};