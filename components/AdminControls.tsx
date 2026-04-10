"use client";

import { useState } from "react";

const ADMIN_PASSWORD = "0417";

interface AdminControlsProps {
  status: string;
  onStatusChange: (newStatus: string) => void;
  onShowWinner: () => void;
}

export default function AdminControls({
  status,
  onStatusChange,
  onShowWinner,
}: AdminControlsProps) {
  const [showModal, setShowModal] = useState(false);
  const [pendingStatus, setPendingStatus] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function openModal(nextStatus: string) {
    setPendingStatus(nextStatus);
    setShowModal(true);
    setInput("");
    setError("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (input !== ADMIN_PASSWORD) {
      setError("비밀번호가 올바르지 않습니다.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/voting-state", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: pendingStatus, adminPassword: input }),
      });
      if (res.ok) {
        onStatusChange(pendingStatus!);
        setShowModal(false);
      } else {
        const data = await res.json();
        setError(data.error || "오류가 발생했습니다.");
      }
    } catch {
      setError("네트워크 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <div className="flex flex-wrap gap-2 justify-end mt-4">
        {status === "not_started" && (
          <button
            onClick={() => openModal("active")}
            className="text-xs text-gray-400 hover:text-green-600 border border-gray-200 hover:border-green-300 px-3 py-1.5 rounded-lg transition-colors"
          >
            투표 개시
          </button>
        )}
        {status === "active" && (
          <button
            onClick={() => openModal("ended")}
            className="text-xs text-gray-400 hover:text-red-500 border border-gray-200 hover:border-red-300 px-3 py-1.5 rounded-lg transition-colors"
          >
            투표 종료
          </button>
        )}
        {status === "ended" && (
          <button
            onClick={onShowWinner}
            className="text-xs text-gray-400 hover:text-purple-600 border border-gray-200 hover:border-purple-300 px-3 py-1.5 rounded-lg transition-colors"
          >
            🏆 Winner
          </button>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl">
            <h2 className="text-lg font-bold mb-2 text-center">관리자 인증</h2>
            <p className="text-gray-500 text-sm text-center mb-4">
              {pendingStatus === "active"
                ? "투표를 개시합니다."
                : "투표를 종료합니다."}
            </p>
            <form onSubmit={handleSubmit}>
              <input
                type="password"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="관리자 비밀번호"
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-center tracking-widest mb-3 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                autoFocus
              />
              {error && (
                <p className="text-red-500 text-sm text-center mb-3">{error}</p>
              )}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50"
                >
                  취소
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-2 rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-700 disabled:opacity-50"
                >
                  {loading ? "처리 중..." : "확인"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
