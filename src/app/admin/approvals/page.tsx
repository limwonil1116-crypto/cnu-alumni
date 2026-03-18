'use client';
import { useState } from 'react';
import { TopBar } from '@/components/TopBar';
import { Badge, Button } from '@/components/ui';
import { MOCK_CHANGE_REQUESTS } from '@/data/mock';
import type { ChangeRequest } from '@/types';

function ApprovalCard({ req, onApprove, onReject }: {
  req: ChangeRequest;
  onApprove: () => void;
  onReject: () => void;
}) {
  const [rejReason, setRejReason] = useState('');
  const [showReject, setShowReject] = useState(false);

  return (
    <div className="bg-white border border-[#D1D9E6] rounded-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-[#111827]">{req.alumniName}</span>
          <Badge variant="info">{req.field} 변경</Badge>
        </div>
        <span className="text-xs text-[#9CA3AF]">{req.requestedAt}</span>
      </div>

      {/* Before / After 비교 */}
      <div className="bg-[#F4F6FA] rounded-xl p-3 mb-3 space-y-2">
        <div className="flex gap-2 items-baseline">
          <span className="text-xs text-[#9CA3AF] w-8 flex-shrink-0">이전</span>
          <span className="text-sm text-[#DC2626] line-through">{req.oldValue}</span>
        </div>
        <div className="flex gap-2 items-baseline">
          <span className="text-xs text-[#9CA3AF] w-8 flex-shrink-0">변경</span>
          <span className="text-sm text-[#15803D] font-medium">{req.newValue}</span>
        </div>
      </div>

      {showReject ? (
        <div className="space-y-2">
          <textarea
            value={rejReason}
            onChange={e => setRejReason(e.target.value)}
            placeholder="반려 사유를 입력해 주세요 (필수)"
            rows={2}
            className="w-full px-3 py-2 border border-[#D1D9E6] rounded-xl text-sm outline-none focus:border-[#2A5BA8] resize-none"
          />
          <div className="flex gap-2">
            <button onClick={() => setShowReject(false)}
              className="flex-1 py-2 text-sm border border-[#D1D9E6] rounded-xl text-[#4B5563] hover:bg-[#F4F6FA]">
              취소
            </button>
            <button
              onClick={() => { if (rejReason.trim()) { onReject(); setShowReject(false); } else alert('반려 사유를 입력해 주세요.'); }}
              className="flex-1 py-2 text-sm bg-[#DC2626] text-white rounded-xl font-medium hover:bg-[#B91C1C]">
              반려 확인
            </button>
          </div>
        </div>
      ) : (
        <div className="flex gap-2">
          <button onClick={() => setShowReject(true)}
            className="flex-1 py-2.5 text-sm border-[1.5px] border-[#DC2626] text-[#DC2626] rounded-xl font-medium hover:bg-[#FEE2E2] transition-colors">
            반려
          </button>
          <button onClick={onApprove}
            className="flex-1 py-2.5 text-sm bg-[#15803D] text-white rounded-xl font-medium hover:bg-[#166534] transition-colors">
            승인
          </button>
        </div>
      )}
    </div>
  );
}

export default function ApprovalsPage() {
  const [requests, setRequests] = useState(MOCK_CHANGE_REQUESTS);
  const [toast, setToast] = useState('');

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 2500);
  };

  const approve = (id: string) => {
    setRequests(r => r.filter(x => x.id !== id));
    showToast('✓ 승인이 완료되었습니다');
  };

  const reject = (id: string) => {
    setRequests(r => r.filter(x => x.id !== id));
    showToast('반려 처리되었습니다');
  };

  return (
    <div className="flex flex-col min-h-dvh">
      <TopBar title="승인 대기 관리" showBack backHref="/admin/dashboard" variant="admin"
        rightElement={<Badge variant="warn" className="mr-1">{requests.length}건</Badge>} />

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-[#F4F6FA]">
        {requests.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 rounded-full bg-[#DCFCE7] flex items-center justify-center mb-4 text-2xl">✓</div>
            <p className="font-semibold text-[#111827] mb-1">모든 요청이 처리되었습니다</p>
            <p className="text-sm text-[#9CA3AF]">승인 대기 중인 요청이 없습니다</p>
          </div>
        ) : (
          requests.map(req => (
            <ApprovalCard key={req.id} req={req} onApprove={() => approve(req.id)} onReject={() => reject(req.id)} />
          ))
        )}
      </div>

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-[#111827] text-white px-5 py-3 rounded-full text-sm font-medium shadow-lg z-50 whitespace-nowrap">
          {toast}
        </div>
      )}
    </div>
  );
}
