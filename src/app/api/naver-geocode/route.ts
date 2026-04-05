import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const query = req.nextUrl.searchParams.get('query');
  if (!query) return NextResponse.json({ error: 'query required' }, { status: 400 });

  const KAKAO_REST_KEY = '12babb99c59a306125430bc9976cc232';

  try {
    // 1차: 주소 검색
    const res = await fetch(
      `https://dapi.kakao.com/v2/local/search/address.json?query=${encodeURIComponent(query)}`,
      {
        headers: { Authorization: `KakaoAK ${KAKAO_REST_KEY}` },
        cache: 'no-store',
      }
    );
    const data = await res.json();

    if (data.documents?.length) {
      return NextResponse.json({ documents: data.documents });
    }

    // 2차: 키워드 검색으로 재시도
    const res2 = await fetch(
      `https://dapi.kakao.com/v2/local/search/keyword.json?query=${encodeURIComponent(query)}`,
      {
        headers: { Authorization: `KakaoAK ${KAKAO_REST_KEY}` },
        cache: 'no-store',
      }
    );
    const data2 = await res2.json();
    return NextResponse.json({ documents: data2.documents || [] });

  } catch (e) {
    console.error('지오코딩 오류:', e);
    return NextResponse.json({ documents: [] }, { status: 500 });
  }
}