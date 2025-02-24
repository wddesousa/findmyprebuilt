import { NextRequest, NextResponse } from "next/server";
import { describe, expect, it } from "vitest";
import { middleware } from "@/app/middleware";

describe("apiAuthMiddleware", async () => {
  it("returns unathorized", async () => {
    // Mock the request with a valid Authorization header
    const mockRequest = {
      nextUrl: new URL("http://localhost/api/scrape"),
      headers: {
        get: (header: string) =>
          header === "Authorization" ? "Bearer valid-token" : "",
      },
    } as unknown as NextRequest;

    // Call the middleware
    const response = await middleware(mockRequest);
    expect(response.status).toBe(401);
  });

  it("allows authorized users", async () => {
    // Mock the request with a valid Authorization header
    const mockRequest = {
      nextUrl: new URL("http://localhost/api/scrape"),
      headers: {
        get: (header: string) =>
          header === "prebuilt-cron-secret" ? "supersecretcrontest" : "",
      },
    } as unknown as NextRequest;

    // Call the middleware
    const response = await middleware(mockRequest);
    expect(response.status).toBe(200);
  });
});
