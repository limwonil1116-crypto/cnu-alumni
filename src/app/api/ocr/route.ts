import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { imageBase64 } = await req.json();
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return NextResponse.json({ error: 'API 키 없음' }, { status: 500 });

    const base64Data = imageBase64.includes(',') ? imageBase64.split(',')[1] : imageBase64;

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-04-17:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [
              { inline_data: { mime_type: 'image/jpeg', data: base64Data } },
              { text: `이 명함 이미지에서 정보를 추출해서 아래 JSON 형식으로만 반환하세요. 없는 항목은 빈 문자열:
{
  "company": "회사명 또는 부서명",
  "job_title": "직책 또는 직위",
  "phone": "휴대폰번호 (010으로 시작, 하이픈 포함, 예: 010-1234-5678)",
  "office_phone": "사무실 전화번호 (010으로 시작하지 않는 것, 하이픈 포함, 예: 041-000-0000)",
  "fax": "팩스번호 (FAX 또는 F로 표시된 것, 하이픈 포함, 예: 041-000-0001)",
  "email": "이메일주소",
  "address": "주소"
}
반드시 JSON만 반환하고 다른 텍스트 없이.` }
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
    console.log('✨ Gemini 분석 결과:', parsed);
    return NextResponse.json(parsed);

  } catch (e) {
    console.error('OCR 오류:', e);
    return NextResponse.json({ error: '분석 실패' }, { status: 500 });
  }
}