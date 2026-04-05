import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const query = req.nextUrl.searchParams.get('query');

  if (!query) {
    return NextResponse.json(
      { error: 'query is required' },
      { status: 400 }
    );
  }

  const keyId = process.env.NAVER_MAPS_API_KEY_ID;
  const key = process.env.NAVER_MAPS_API_KEY;

  if (!keyId || !key) {
    return NextResponse.json(
      { error: 'NAVER_MAPS_API_KEY_ID / NAVER_MAPS_API_KEY missing' },
      { status: 500 }
    );
  }

  const url =
    `https://maps.apigw.ntruss.com/map-geocode/v2/geocode?query=${encodeURIComponent(query)}`;

  const res = await fetch(url, {
    method: 'GET',
    headers: {
      'x-ncp-apigw-api-key-id': keyId,
      'x-ncp-apigw-api-key': key,
      Accept: 'application/json',
    },
    cache: 'no-store',
  });

  const text = await res.text();

  return new NextResponse(text, {
    status: res.status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
    },
  });
}