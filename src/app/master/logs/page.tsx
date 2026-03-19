'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

interface LogEntry {
  id: string;
  email: string;
  name?: string;
  created_at: string;
  provider?: string;
}

export default function MasterLogsPage() {
  const router = useRouter();
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      // 접속한 사용자 목록 (alumni_master 기준)
      const { data } = await supabase
        .from('alumni_master')
        .select('id, name, email, auth_status, created_at, updated_at')
        .order('updated_at', { ascending: false });

      setLogs((data || []).map((d: any) => ({
        id: d.id,
        email: d.email || '-',
        name: d.name,
        created_at: d.updated_at || d.created_at,
      })));
      setLoading(false);
    };
    fetchLogs();
  }, [router]);

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return `${d.getFullYear()}.${String(d.getMonth()+1).padStart(2,'0')}.${String(d.getDate()).padStart(2,'0')} ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;
  };

  return (
    <div className="flex flex-col min-h-dvh bg-[#F5F7FA]">
      {/* 헤더 */}
      <div className="px-4 pt-4 pb-3 bg-[#F5F7FA] flex items-center gap-3 sticky top-0 z-40">
        <button
          onClick={() => router.back()}
          className="w-9 h-9 rounded-full bg-white border border-[#E5EAF2] flex items-center justify-center shadow-sm"
        >
          <span className="text-[#1B3F7B] text-lg">←</span>
        </button>
        <div className="flex-1">
          <p className="font-bold text-[#111827]">접속 로그</p>
          <p className="text-xs text-[#9CA3AF]">총 {logs.length}명</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-2 space-y-2">
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-4 border-[#1B3F7B] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : logs.length === 0 ? (
          <div className="text-center py-20 text-[#9CA3AF]">
            <p>접속 기록이 없습니다</p>
          </div>
        ) : (
          logs.map((log, i) => (
            <div key={log.id} className="bg-white rounded-2xl p-4 shadow-sm border border-[#E5EAF2] flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#1B3F7B] to-[#2A5BA8] flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                {log.name?.charAt(0) || '?'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-[#111827] text-sm">{log.name || '이름 없음'}</p>
                <p className="text-xs text-[#9CA3AF] truncate">{log.email}</p>
              </div>
              <p className="text-xs text-[#9CA3AF] flex-shrink-0">{formatDate(log.created_at)}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}