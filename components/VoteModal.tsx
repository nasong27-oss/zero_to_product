"use client";

import { useState } from "react";
import { useUser } from "@/contexts/UserContext";
import { Project } from "./ProjectCard";

interface VoteModalProps {
  projects: Project[];
  onClose: () => void;
  onVoted: () => void;
}

export default function VoteModal({ projects, onClose, onVoted }: VoteModalProps) {
  const { user } = useUser();
  const [selected, setSelected] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [teamError, setTeamError] = useState("");

  function handleSelect(project: Project) {
    setTeamError("");
    setError("");
    if (user?.isParticipant && user.teamNumber && project.teamNumber === user.teamNumber) {
      setTeamError("자신이 속한 조의 서비스는 투표할 수 없습니다.");
      return;
    }
    setSelected(project.id);
  }

  async function handleVote() {
    if (!selected || !user) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/votes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          voterName: user.name,
          voterTeam: user.teamNumber,
          isParticipant: user.isParticipant,
          projectId: selected,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "투표에 실패했습니다.");
      } else {
        onVoted();
      }
    } catch {
      setError("네트워크 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-start justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl my-8">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-900 text-center">
            투표
          </h2>
          <p className="text-gray-500 text-sm text-center mt-1">
            가장 마음에 드는 서비스를 선택해 주세요
          </p>
        </div>

        <div className="p-4 space-y-3 max-h-[60vh] overflow-y-auto">
          {projects.map((project) => {
            const isOwnTeam = user?.isParticipant && user.teamNumber === project.teamNumber;
            const isSelected = selected === project.id;

            return (
              <button
                key={project.id}
                onClick={() => handleSelect(project)}
                disabled={!!isOwnTeam}
                className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                  isOwnTeam
                    ? "border-gray-200 bg-gray-50 opacity-50 cursor-not-allowed"
                    : isSelected
                    ? "border-indigo-500 bg-indigo-50"
                    : "border-gray-200 hover:border-indigo-300 hover:bg-indigo-50/30"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <span className="bg-indigo-100 text-indigo-700 text-xs font-bold px-2 py-0.5 rounded-full mr-2">
                      {project.teamNumber}조
                    </span>
                    <span className="font-semibold text-gray-900">{project.title}</span>
                  </div>
                  {isSelected && (
                    <span className="text-indigo-600 font-bold text-lg">✓</span>
                  )}
                  {isOwnTeam && (
                    <span className="text-xs text-gray-400">내 팀</span>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {teamError && (
          <div className="mx-4 bg-orange-50 border border-orange-200 rounded-xl p-3">
            <p className="text-orange-600 text-sm text-center">{teamError}</p>
          </div>
        )}

        {error && (
          <div className="mx-4 bg-red-50 border border-red-200 rounded-xl p-3">
            <p className="text-red-600 text-sm text-center">{error}</p>
          </div>
        )}

        <div className="p-4 flex gap-3 border-t border-gray-100">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-xl border border-gray-300 text-gray-700 font-medium hover:bg-gray-50"
          >
            취소
          </button>
          <button
            onClick={handleVote}
            disabled={!selected || loading}
            className="flex-1 py-3 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "투표 중..." : "투표하기"}
          </button>
        </div>
      </div>
    </div>
  );
}
