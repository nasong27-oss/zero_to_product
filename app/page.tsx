"use client";

import { useState, useEffect, useCallback } from "react";
import dynamic from "next/dynamic";
import TopicSection from "@/components/TopicSection";
import LoginSection from "@/components/LoginSection";
import ProjectCard, { Project } from "@/components/ProjectCard";
import ProjectForm from "@/components/ProjectForm";
import VoteModal from "@/components/VoteModal";
import AdminControls from "@/components/AdminControls";
import WinnerOverlay from "@/components/WinnerOverlay";
import { useUser } from "@/contexts/UserContext";

const QRCodeDisplay = dynamic(() => import("@/components/QRCodeDisplay"), { ssr: false });

export default function Home() {
  const { user, logout } = useUser();
  const [projects, setProjects] = useState<Project[]>([]);
  const [votingStatus, setVotingStatus] = useState("not_started");
  const [showRegisterForm, setShowRegisterForm] = useState(false);
  const [showVoteModal, setShowVoteModal] = useState(false);
  const [showWinner, setShowWinner] = useState(false);
  const [hasVoted, setHasVoted] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const [projRes, stateRes] = await Promise.all([
        fetch("/api/projects"),
        fetch("/api/voting-state"),
      ]);
      if (projRes.ok) setProjects(await projRes.json());
      if (stateRes.ok) {
        const state = await stateRes.json();
        setVotingStatus(state.status);
      }
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [fetchData]);

  // Check if user already voted
  useEffect(() => {
    if (user) {
      const key = `voted_${user.name}_${user.teamNumber ?? "guest"}`;
      setHasVoted(!!localStorage.getItem(key));
    }
  }, [user]);

  function handleVoted() {
    if (user) {
      const key = `voted_${user.name}_${user.teamNumber ?? "guest"}`;
      localStorage.setItem(key, "true");
      setHasVoted(true);
    }
    setShowVoteModal(false);
    fetchData();
  }

  function handleProjectAdded(project: Project) {
    setProjects((prev) => [...prev, project]);
    setShowRegisterForm(false);
  }

  function handleProjectUpdated(updated: Project) {
    setProjects((prev) =>
      prev.map((p) => (p.id === updated.id ? updated : p))
    );
  }

  function handleProjectDeleted(id: string) {
    setProjects((prev) => prev.filter((p) => p.id !== id));
  }

  const winner = projects.length
    ? [...projects].sort((a, b) => b._count.votes - a._count.votes)[0]
    : null;
  const totalVotes = projects.reduce((sum, p) => sum + p._count.votes, 0);

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <h1 className="text-lg font-bold text-gray-900">⚡ 바이브코딩 해커톤</h1>
          {user && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">
                {user.isParticipant ? `${user.teamNumber}조 ` : ""}
                <strong>{user.name}</strong>
              </span>
              <button
                onClick={logout}
                className="text-xs text-gray-400 hover:text-gray-600 border border-gray-200 px-2 py-1 rounded-lg"
              >
                로그아웃
              </button>
            </div>
          )}
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* Topic */}
        <TopicSection />

        {/* Login or main content */}
        {!user ? (
          <LoginSection />
        ) : (
          <>
            {/* Voting Active Banner */}
            {votingStatus === "active" && (
              <div className="bg-gradient-to-r from-orange-500 to-pink-600 rounded-2xl p-6 mb-6 text-center text-white shadow-lg">
                <p className="text-lg font-bold mb-4">🗳️ 투표가 진행 중입니다!</p>
                {!hasVoted ? (
                  <button
                    onClick={() => setShowVoteModal(true)}
                    className="w-full py-4 bg-white text-orange-600 font-bold text-lg rounded-xl hover:bg-orange-50 transition-colors shadow-md"
                  >
                    가장 마음에 드는 서비스를 선택해 주세요
                  </button>
                ) : (
                  <p className="bg-white/20 rounded-xl py-3 font-medium">
                    ✅ 투표에 참여하셨습니다. 감사합니다!
                  </p>
                )}
                <QRCodeDisplay />
              </div>
            )}

            {/* Projects header */}
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">
                등록된 결과물
                <span className="text-sm font-normal text-gray-400 ml-2">
                  {projects.length}개
                </span>
              </h2>
              {!showRegisterForm && (
                <button
                  onClick={() => setShowRegisterForm(true)}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-colors"
                >
                  + 등록
                </button>
              )}
            </div>

            {/* Register form */}
            {showRegisterForm && (
              <div className="bg-white rounded-2xl shadow-sm border border-indigo-200 p-5 mb-4">
                <h3 className="text-lg font-bold text-gray-800 mb-4">결과물 등록</h3>
                <ProjectForm
                  onSuccess={(p) => handleProjectAdded(p as Project)}
                  onCancel={() => setShowRegisterForm(false)}
                />
              </div>
            )}

            {/* Project list */}
            {loading ? (
              <div className="text-center py-12 text-gray-400">불러오는 중...</div>
            ) : projects.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-2xl border border-gray-200 text-gray-400">
                아직 등록된 결과물이 없습니다.
              </div>
            ) : (
              <div className="space-y-4">
                {projects.map((project) => (
                  <ProjectCard
                    key={project.id}
                    project={project}
                    onUpdate={handleProjectUpdated}
                    onDelete={handleProjectDeleted}
                    showVoteCount={votingStatus === "ended"}
                  />
                ))}
              </div>
            )}

            {/* Admin controls */}
            <AdminControls
              status={votingStatus}
              onStatusChange={(s) => {
                setVotingStatus(s);
                fetchData();
              }}
              onShowWinner={() => setShowWinner(true)}
            />
          </>
        )}
      </div>

      {/* Vote modal */}
      {showVoteModal && (
        <VoteModal
          projects={projects}
          onClose={() => setShowVoteModal(false)}
          onVoted={handleVoted}
        />
      )}

      {/* Winner overlay */}
      {showWinner && winner && (
        <WinnerOverlay
          winner={winner}
          totalVotes={totalVotes}
          onClose={() => setShowWinner(false)}
        />
      )}
    </main>
  );
}
