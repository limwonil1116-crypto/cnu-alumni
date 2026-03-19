'use client';
import { useState, useEffect } from 'react';
import { TopBar } from '@/components/TopBar';
import { Badge } from '@/components/ui';
import { supabase } from '@/lib/supabase';

interface PendingUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  auth_status: string;
  created_at: string;
}

export default function ApprovalsPage() {
  const [users, setUsers] = useState<PendingUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState('');

  // 승인 대기 목록 불러오기
  const fetchPending = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('alumni_master')
      .select('id, name, email, phone, auth_status, created_at')
      .eq('auth_status', 'pending')
      .order('created_at', { ascending: false });
    setUsers(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchPending(); }, []);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 2500);
  };

  // 승인
  const approve = async (id: string, email: string) => {
    if (!confirm('승인하시겠습니까?')) return;
    await supabase
      .from('alumni_master')
      .update({ auth_status: 'active' })
      .eq('id', id);
    setUsers(u => u.filter(x => x.id !== id));
    showToast('✓ 승인이 완료되었습니다');
  };

  // 반려
  const reject = async (id: string) => {
    const reason = prompt('반려 사유를 입력해 주세요:');
    if (!reason) return;
    await supabase
      .from('alumni_master')
      .update({ auth_status: 'rejected' })
      .eq('id', id);
    setUsers(u => u.filter(x => x.id !== id));
    showToast('반려 처리되었습니다');
  };

  return (
    <div className="flex flex-col min-h-dvh">
      <TopBar
        title="승인 대기 관리"
        showBack
        backHref="/admin/dashboard"
        variant="admin"
        rightElement={
          <Badge variant="warn" className="mr-1">{users.length}건</Badge>
        }
      />

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-[#F4F6FA]">
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-4 border-[#1B3F7B] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : users.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 rounded-full bg-[#DCFCE7] flex items-center justify-center mb-4 text-2xl">✓</div>
            <p className="font-semibold text-[#111827] mb-1">모든 요청이 처리되었습니다</p>
            <p className="text-sm text-[#9CA3AF]">승인 대기 중인 요청이 없습니다</p>
          </div>
        ) : (
          users.map(user => (
            <div key={user.id} className="bg-white border border-[#D1D9E6] rounded-xl p-4">
              {/* 사용자 정보 */}
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#1B3F7B] to-[#3B72D1] flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                  {user.name?.charAt(0) || '?'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-[#111827]">{user.name || '이름 없음'}</p>
                  <p className="text-xs text-[#9CA3AF] truncate">{user.email}</p>
                </div>
                <Badge variant="warn">승인대기</Badge>
              </div>

              {/* 상세 정보 */}
              <div className="bg-[#F4F6FA] rounded-xl p-3 mb-3 space-y-1.5">
                <div className="flex gap-2 text-sm">
                  <span className="text-[#9CA3AF] w-16 flex-shrink-0">연락처</span>
                  <span className="text-[#111827]">{user.phone || '-'}</span>
                </div>
                <div className="flex gap-2 text-sm">
                  <span className="text-[#9CA3AF] w-16 flex-shrink-0">신청일</span>
                  <span className="text-[#111827]">{new Date(user.created_at).toLocaleDateString('ko-KR')}</span>
                </div>
              </div>

              {/* 승인/반려 버튼 */}
              <div className="flex gap-2">
                <button
                  onClick={() => reject(user.id)}
                  className="flex-1 py-2.5 text-sm border-[1.5px] border-[#DC2626] text-[#DC2626] rounded-xl font-medium hover:bg-[#FEE2E2] transition-colors"
                >
                  반려
                </button>
                <button
                  onClick={() => approve(user.id, user.email)}
                  className="flex-1 py-2.5 text-sm bg-[#15803D] text-white rounded-xl font-medium hover:bg-[#166534] transition-colors"
                >
                  승인
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* 토스트 */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-[#111827] text-white px-5 py-3 rounded-full text-sm font-medium shadow-lg z-50 whitespace-nowrap">
          {toast}
        </div>
      )}
    </div>
  );
}