"use client";

import { useState, useEffect, useCallback } from "react";

const ADMIN_PASSWORD = "0417";

interface VoteInfo {
  id: string;
  voterName: string;
  voterTeam: number | null;
  isParticipant: boolean;
  createdAt: string;
}

interface ProjectStat {
  id: string;
  teamNumber: number;
  title: string;
  voteCount: number;
  votes: VoteInfo[];
}

interface Stats {
  projects: ProjectStat[];
  totalVotes: number;
  votingState: { status: string } | null;
  teams: Record<string, { voters: VoteInfo[] }>;
}

export default function AdminPage() {
  const [authenticated, setAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [authError, setAuthError] = useState("");

  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(false);
  const [topic, setTopic] = useState("");
  const [topicSaving, setTopicSaving] = useState(false);
  const [topicSaved, setTopicSaved] = useState(false);
  const [resetConfirm, setResetConfirm] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [resetMessage, setResetMessage] = useState("");
  const [activeTab, setActiveTab] = useState<"results" | "participants" | "topic">("results");

  const fetchStats = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/stats?adminPassword=${ADMIN_PASSWORD}`);
      if (res.ok) setStats(await res.json());
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchTopic = useCallback(async () => {
    const res = await fetch("/api/topic");
    if (res.ok) {
      const data = await res.json();
      setTopic(data.content);
    }
  }, []);

  useEffect(() => {
    if (authenticated) {
      fetchStats();
      fetchTopic();
    }
  }, [authenticated, fetchStats, fetchTopic]);

  function handleAuth(e: React.FormEvent) {
    e.preventDefault();
    if (passwordInput === ADMIN_PASSWORD) {
      setAuthenticated(true);
    } else {
      setAuthError("비밀번호가 올바르지 않습니다.");
    }
  }

  async function handleSaveTopic() {
    setTopicSaving(true);
    try {
      await fetch("/api/topic", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: topic }),
      });
      setTopicSaved(true);
      setTimeout(() => setTopicSaved(false), 2000);
    } finally {
      setTopicSaving(false);
    }
  }

  async function handleReset() {
    setResetting(true);
    setResetMessage("");
    try {
      const res = await fetch("/api/admin/reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adminPassword: ADMIN_PASSWORD }),
      });
      if (res.ok) {
        setResetMessage("투표가 초기화되었습니다.");
        setResetConfirm(false);
        fetchStats();
      }
    } finally {
      setResetting(false);
    }
  }

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-8 w-full max-w-sm shadow-lg">
          <h1 className="text-2xl font-bold text-center mb-2">관리자</h1>
          <p className="text-gray-400 text-center text-sm mb-6">비밀번호를 입력해 주세요</p>
          <form onSubmit={handleAuth}>
            <input
              type="password"
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
              placeholder="비밀번호"
              className="w-full border border-gray-300 rounded-xl px-4 py-3 text-center text-xl tracking-widest mb-3 focus:outline-none focus:ring-2 focus:ring-indigo-400"
              autoFocus
            />
            {authError && (
              <p className="text-red-500 text-sm text-center mb-3">{authError}</p>
            )}
            <button
              type="submit"
              className="w-full py-3 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700"
            >
              입장
            </button>
          </form>
        </div>
      </div>
    );
  }

  const sortedProjects = stats?.projects
    ? [...stats.projects].sort((a, b) => b.voteCount - a.voteCount)
    : [];

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <h1 className="text-lg font-bold">⚙️ 관리자 페이지</h1>
          <a href="/" className="text-sm text-indigo-600 hover:underline">
            메인으로
          </a>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 py-6">
        {/* Status card */}
        {stats && (
          <div className="bg-white rounded-2xl border border-gray-200 p-5 mb-5 flex flex-wrap gap-4 items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">현재 상태</p>
              <p className="text-xl font-bold text-gray-900">
                {stats.votingState?.status === "not_started"
                  ? "🕐 투표 전"
                  : stats.votingState?.status === "active"
                  ? "🗳️ 투표 진행 중"
                  : "✅ 투표 종료"}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">총 투표수</p>
              <p className="text-3xl font-black text-indigo-600">{stats.totalVotes}</p>
            </div>
            <div className="w-full flex items-center gap-3">
              {resetConfirm ? (
                <div className="flex gap-3 w-full items-center">
                  <span className="text-sm text-red-600 flex-1">정말 초기화하시겠습니까? 모든 투표가 삭제됩니다.</span>
                  <button
                    onClick={handleReset}
                    disabled={resetting}
                    className="px-4 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 disabled:opacity-50"
                  >
                    {resetting ? "초기화 중..." : "확인"}
                  </button>
                  <button
                    onClick={() => setResetConfirm(false)}
                    className="px-4 py-2 border border-gray-300 text-gray-600 text-sm rounded-lg hover:bg-gray-50"
                  >
                    취소
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setResetConfirm(true)}
                  className="text-sm text-red-400 hover:text-red-600 border border-red-200 hover:border-red-400 px-3 py-1.5 rounded-lg transition-colors"
                >
                  투표 초기화
                </button>
              )}
              {resetMessage && (
                <span className="text-green-600 text-sm">{resetMessage}</span>
              )}
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-2 mb-5">
          {(["results", "participants", "topic"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                activeTab === tab
                  ? "bg-indigo-600 text-white"
                  : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
              }`}
            >
              {tab === "results" ? "📊 투표 결과" : tab === "participants" ? "👥 참여자 현황" : "📝 주제 설정"}
            </button>
          ))}
        </div>

        {loading && (
          <div className="text-center py-12 text-gray-400">불러오는 중...</div>
        )}

        {/* Results tab */}
        {!loading && activeTab === "results" && stats && (
          <div className="space-y-4">
            {sortedProjects.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-2xl border border-gray-200 text-gray-400">
                등록된 프로젝트가 없습니다.
              </div>
            ) : (
              sortedProjects.map((project, idx) => (
                <div
                  key={project.id}
                  className="bg-white rounded-2xl border border-gray-200 p-5"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      {idx === 0 && stats.totalVotes > 0 && (
                        <span className="text-xl">🥇</span>
                      )}
                      {idx === 1 && stats.totalVotes > 0 && (
                        <span className="text-xl">🥈</span>
                      )}
                      {idx === 2 && stats.totalVotes > 0 && (
                        <span className="text-xl">🥉</span>
                      )}
                      <span className="bg-indigo-100 text-indigo-700 text-sm font-bold px-3 py-1 rounded-full">
                        {project.teamNumber}조
                      </span>
                      <span className="font-semibold text-gray-900">{project.title}</span>
                    </div>
                    <span className="text-2xl font-black text-indigo-600">
                      {project.voteCount}표
                    </span>
                  </div>

                  {/* Vote bar */}
                  <div className="h-2 bg-gray-100 rounded-full mb-3 overflow-hidden">
                    <div
                      className="h-full bg-indigo-500 rounded-full transition-all"
                      style={{
                        width: stats.totalVotes > 0
                          ? `${(project.voteCount / stats.totalVotes) * 100}%`
                          : "0%",
                      }}
                    />
                  </div>

                  {project.votes.length > 0 && (
                    <div>
                      <p className="text-xs text-gray-400 mb-2">투표자</p>
                      <div className="flex flex-wrap gap-1">
                        {project.votes.map((v) => (
                          <span
                            key={v.id}
                            className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full"
                          >
                            {v.voterName}
                            {v.voterTeam ? ` (${v.voterTeam}조)` : " (외부)"}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {/* Participants tab */}
        {!loading && activeTab === "participants" && stats && (
          <div className="space-y-4">
            {Array.from({ length: 8 }, (_, i) => i + 1).map((teamNum) => {
              const teamVoters = stats.teams[teamNum]?.voters ?? [];
              return (
                <div key={teamNum} className="bg-white rounded-2xl border border-gray-200 p-5">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-bold text-gray-900">{teamNum}조</h3>
                    <span className="text-sm text-gray-500">
                      투표 완료: <strong className="text-indigo-600">{teamVoters.length}</strong>명
                    </span>
                  </div>
                  {teamVoters.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {teamVoters.map((v) => (
                        <span
                          key={v.id}
                          className="flex items-center gap-1 bg-green-50 border border-green-200 text-green-700 text-sm px-3 py-1 rounded-full"
                        >
                          ✓ {v.voterName}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-400">아직 투표한 참여자가 없습니다.</p>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Topic tab */}
        {activeTab === "topic" && (
          <div className="bg-white rounded-2xl border border-gray-200 p-5">
            <h3 className="font-bold text-gray-900 mb-4">오늘의 주제 설정</h3>
            <textarea
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="오늘의 주제를 입력하세요..."
              className="w-full border border-gray-300 rounded-xl px-4 py-3 min-h-[120px] text-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none"
            />
            <button
              onClick={handleSaveTopic}
              disabled={topicSaving}
              className="mt-3 px-6 py-2.5 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 disabled:opacity-50 transition-colors"
            >
              {topicSaving ? "저장 중..." : topicSaved ? "✓ 저장됨" : "저장"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
