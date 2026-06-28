/**
 * Lansy.ai — PDF Download Proxy
 * Server-side route that forwards the PDF from the backend with proper headers.
 */

import { NextRequest, NextResponse } from 'next/server';

// Server-side: use internal Docker hostname; NEXT_PUBLIC_ vars are browser-only
const API_URL =
  process.env.INTERNAL_API_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  'http://localhost:8000';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  const { sessionId } = await params;
  
  // Try to get auth header or fallback to cookie (since iframes don't send Auth headers)
  let authHeader = request.headers.get('Authorization');
  if (!authHeader) {
    const cookieToken = request.cookies.get('sb-access-token')?.value;
    if (cookieToken) {
      authHeader = `Bearer ${cookieToken}`;
    }
  }

  console.log(`[PDF Proxy] sessionId=${sessionId}, API_URL=${API_URL}, hasAuth=${!!authHeader}`);

  if (!authHeader) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const targetUrl = `${API_URL}/api/v1/cv/${sessionId}/pdf`;
    console.log(`[PDF Proxy] Fetching: ${targetUrl}`);

    const backendRes = await fetch(targetUrl, {
      headers: { Authorization: authHeader },
    });

    console.log(`[PDF Proxy] Backend status: ${backendRes.status}`);

    if (!backendRes.ok) {
      const errorText = await backendRes.text().catch(() => 'unknown');
      console.error(`[PDF Proxy] Backend error: ${errorText}`);
      return NextResponse.json(
        { error: 'PDF generation failed', detail: errorText },
        { status: backendRes.status }
      );
    }

    const pdfBuffer = await backendRes.arrayBuffer();
    console.log(`[PDF Proxy] PDF size: ${pdfBuffer.byteLength} bytes`);

    const disposition =
      backendRes.headers.get('Content-Disposition') ||
      `attachment; filename="lansy_cv.pdf"`;

    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': disposition,
        'Content-Length': pdfBuffer.byteLength.toString(),
      },
    });
  } catch (error) {
    console.error('[PDF Proxy] Exception:', error);
    return NextResponse.json(
      { error: 'Internal server error', detail: String(error) },
      { status: 500 }
    );
  }
}
