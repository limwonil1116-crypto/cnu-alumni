import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File
    const mode = formData.get('mode') as string

    if (!file) {
      return NextResponse.json({ error: '파일이 없습니다' }, { status: 400 })
    }

    const text = await file.text()
    const lines = text.split('\n').filter(line => line.trim())
    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, '').replace(/\r/g, ''))

    const results = {
      total: 0, success: 0, duplicate: 0, error: 0,
      errors: [] as { row: number; reason: string }[]
    }

    const idx = {
      name: headers.indexOf('이름'),
      dept: headers.indexOf('학과'),
      admissionYear: headers.indexOf('입학년도'),
      graduationYear: headers.indexOf('졸업년도'),
      phone: headers.indexOf('연락처'),
      email: headers.indexOf('이메일'),
      company: headers.indexOf('회사명'),
      jobTitle: headers.indexOf('직무'),
      region: headers.indexOf('지역'),
    }

    if (idx.name === -1) {
      return NextResponse.json({ error: '필수 컬럼(이름)이 없습니다' }, { status: 400 })
    }

    if (mode === 'replace') {
      await supabase.from('alumni_profiles').delete().neq('id', '00000000-0000-0000-0000-000000000000')
      await supabase.from('alumni_master').delete().neq('id', '00000000-0000-0000-0000-000000000000')
    }

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].replace(/\r/g, '')
      if (!line.trim()) continue

      results.total++
      const cols = line.split(',').map(c => c.trim().replace(/"/g, ''))

      const name = cols[idx.name] || ''
      const email = idx.email >= 0 ? cols[idx.email] || '' : ''
      const phone = idx.phone >= 0 ? cols[idx.phone] || '' : ''
      const deptName = idx.dept >= 0 ? cols[idx.dept] || '' : ''
      const admissionYear = idx.admissionYear >= 0 && cols[idx.admissionYear] ? parseInt(cols[idx.admissionYear]) : null
      const graduationYear = idx.graduationYear >= 0 && cols[idx.graduationYear] ? parseInt(cols[idx.graduationYear]) : null
      const company = idx.company >= 0 ? cols[idx.company] || '' : ''
      const jobTitle = idx.jobTitle >= 0 ? cols[idx.jobTitle] || '' : ''
      const region = idx.region >= 0 ? cols[idx.region] || '' : ''

      if (!name) {
        results.error++
        results.errors.push({ row: i + 1, reason: '이름 누락' })
        continue
      }

      // 중복 확인 (이름 + 입학년도)
      if (name && admissionYear) {
        const { data: existing } = await supabase
          .from('alumni_master')
          .select('id')
          .eq('name', name)
          .eq('admission_year', admissionYear)
          .single()

        if (existing) {
          results.duplicate++
          results.errors.push({ row: i + 1, reason: `중복 (${name}, ${admissionYear})` })
          continue
        }
      }

      // alumni_master 삽입 (department_name 직접 저장)
      const { data: newAlumni, error: insertError } = await supabase
        .from('alumni_master')
        .insert({
          name,
          email: email || null,
          phone: phone || null,
          department_name: deptName || null,
          admission_year: admissionYear,
          graduation_year: graduationYear,
          auth_status: 'active'
        })
        .select()
        .single()

      if (insertError || !newAlumni) {
        results.error++
        results.errors.push({ row: i + 1, reason: `저장 실패: ${insertError?.message || '오류'}` })
        continue
      }

      // alumni_profiles 삽입
      if (company || jobTitle || region) {
        await supabase.from('alumni_profiles').insert({
          alumni_id: newAlumni.id,
          company: company || null,
          job_title: jobTitle || null,
          region: region || null,
        })
      }

      results.success++
    }

    return NextResponse.json(results)

  } catch (err) {
    console.error('Upload error:', err)
    return NextResponse.json({ error: '서버 오류가 발생했습니다' }, { status: 500 })
  }
}