import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { imageBase64 } = await req.json();
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return NextResponse.json({ error: 'API 키 없음' }, { status: 500 });

    const base64Data = imageBase64.includes(',') ? imageBase64.split(',')[1] : imageBase64;

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [
              { inline_data: { mime_type: 'image/jpeg', data: base64Data } },
              { text: `이 명함 이미지에서 정보를 추출해서 아래 JSON 형식으로만 반환하세요. 없는 항목은 빈 문자열:
{
  "company": "회사명 또는 부서명 (예: 충남지역본부 기반사업부)",
  "job_title": "직책 또는 직위 (예: 과장, 대리, 팀장)",
  "phone": "휴대폰번호 - 반드시 010으로 시작하는 번호만, 하이픈 포함 (예: 010-1234-5678)",
  "office_phone": "사무실 직통 전화번호 - TEL 또는 T로 표시된 번호 중 010으로 시작하지 않는 것, 하이픈 포함 (예: 041-330-0000)",
  "fax": "팩스번호 - FAX 또는 F로 표시된 번호, 하이픈 포함 (예: 041-330-0001)",
  "email": "이메일주소 - @ 포함된 전체 주소 (예: hong@ekr.or.kr)",
  "address": "도로명주소만 - 우편번호(5자리 숫자) 제외, 숫자로 시작하는 우편번호는 절대 포함하지 말 것 (예: 충청남도 홍성군 홍북읍 충남대로 60)"
}
주의사항:
- phone은 반드시 010으로 시작하는 휴대폰 번호만
- office_phone은 TEL/T 표시된 사무실 번호 (010 제외)
- fax는 FAX/F 표시된 번호
- email은 반드시 @가 포함된 주소 전체
- address는 우편번호(5자리 숫자) 절대 포함 금지, 도로명주소만
- 반드시 JSON만 반환하고 다른 텍스트 없이` }
            ]
          }]
        })
      }
    );

    if (!res.ok) {
      const err = await res.json();
      console.error('Gemini 오류:', err);
      return NextResponse.json({ error: 'Gemini API 오류' }, { status: 500 });
    }

    const data = await res.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
    const clean = text.replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(clean);

    // 주소에서 우편번호 패턴 제거 (혹시 포함됐을 경우 대비)
    if (parsed.address) {
      parsed.address = parsed.address.replace(/^\d{5}\s*/, '').trim();
    }

    console.log('✨ Gemini 분석 결과:', parsed);
    return NextResponse.json(parsed);

  } catch (e) {
    console.error('OCR 오류:', e);
    return NextResponse.json({ error: '분석 실패' }, { status: 500 });
  }
}