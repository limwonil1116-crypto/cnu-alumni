import { NextRequest, NextResponse } from 'next/server';

const KAKAO_REST_KEY = '12babb99c59a306125430bc9976cc232';

async function kakaoGeocode(query: string) {
  // 1차: 주소 검색
  const res1 = await fetch(
    `https://dapi.kakao.com/v2/local/search/address.json?query=${encodeURIComponent(query)}&analyze_type=similar`,
    { headers: { Authorization: `KakaoAK ${KAKAO_REST_KEY}` }, cache: 'no-store' }
  );
  const data1 = await res1.json();
  if (data1.documents?.length) return data1.documents;

  // 2차: 키워드 검색
  const res2 = await fetch(
    `https://dapi.kakao.com/v2/local/search/keyword.json?query=${encodeURIComponent(query)}`,
    { headers: { Authorization: `KakaoAK ${KAKAO_REST_KEY}` }, cache: 'no-store' }
  );
  const data2 = await res2.json();
  if (data2.documents?.length) return data2.documents;

  return [];
}

export async function GET(req: NextRequest) {
  const query = req.nextUrl.searchParams.get('query');
  if (!query) return NextResponse.json({ error: 'query required' }, { status: 400 });

  console.log('지오코딩 요청:', query);

  try {
    // 1차 시도: 원본 주소
    let docs = await kakaoGeocode(query);
    console.log('1차 결과:', docs.length, '건');

    // 2차 시도: 앞 부분 자르기 (도로명 이후만)
    if (!docs.length) {
      // "충청남도 홍성군 홍북읍 충남대로 60" → "홍성군 홍북읍 충남대로 60"
      const parts = query.split(' ');
      if (parts.length > 2) {
        const shorter = parts.slice(1).join(' ');
        docs = await kakaoGeocode(shorter);
        console.log('2차 결과 (앞 제거):', docs.length, '건', shorter);
      }
    }

    // 3차 시도: 시/군/구 + 도로명 + 번호만
    if (!docs.length) {
      const parts = query.split(' ');
      if (parts.length >= 3) {
        const shorter = parts.slice(-3).join(' ');
        docs = await kakaoGeocode(shorter);
        console.log('3차 결과 (뒤 3개):', docs.length, '건', shorter);
      }
    }

    console.log('최종 결과:', docs.length, '건', docs[0] ? `${docs[0].y},${docs[0].x}` : '없음');
    return NextResponse.json({ documents: docs });

  } catch (e) {
    console.error('지오코딩 오류:', e);
    return NextResponse.json({ documents: [] }, { status: 500 });
  }
}