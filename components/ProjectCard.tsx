"use client";

import { useState } from "react";
import ProjectForm from "./ProjectForm";

export interface Project {
  id: string;
  teamNumber: number;
  title: string;
  url: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  _count: { votes: number };
}

interface ProjectCardProps {
  project: Project;
  onUpdate: (updated: Project) => void;
  onDelete: (id: string) => void;
  showVoteCount?: boolean;
}

export default function ProjectCard({
  project,
  onUpdate,
  onDelete,
  showVoteCount,
}: ProjectCardProps) {
  const [editing, setEditing] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [deleteError, setDeleteError] = useState("");
  const [deleting, setDeleting] = useState(false);

  async function handleDelete(e: React.FormEvent) {
    e.preventDefault();
    setDeleting(true);
    setDeleteError("");
    try {
      const res = await fetch(`/api/projects/${project.id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: deletePassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        setDeleteError(data.error || "오류가 발생했습니다.");
      } else {
        onDelete(project.id);
      }
    } catch {
      setDeleteError("네트워크 오류가 발생했습니다.");
    } finally {
      setDeleting(false);
    }
  }

  if (editing) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-indigo-200 p-5">
        <h3 className="text-lg font-bold text-gray-800 mb-4">
          {project.teamNumber}조 수정
        </h3>
        <ProjectForm
          initial={project}
          onSuccess={(updated) => {
            onUpdate(updated as Project);
            setEditing(false);
          }}
          onCancel={() => setEditing(false)}
        />
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5 hover:shadow-md transition-shadow">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="bg-indigo-100 text-indigo-700 text-sm font-bold px-3 py-1 rounded-full">
              {project.teamNumber}조
            </span>
            {showVoteCount && (
              <span className="bg-orange-100 text-orange-600 text-sm font-bold px-3 py-1 rounded-full">
                {project._count.votes}표
              </span>
            )}
          </div>
          <div className="flex gap-2 shrink-0">
            <button
              onClick={() => setEditing(true)}
              className="text-xs text-gray-400 hover:text-indigo-600 px-2 py-1 rounded border border-gray-200 hover:border-indigo-300 transition-colors"
            >
              수정
            </button>
            <button
              onClick={() => setShowDeleteModal(true)}
              className="text-xs text-gray-400 hover:text-red-500 px-2 py-1 rounded border border-gray-200 hover:border-red-300 transition-colors"
            >
              삭제
            </button>
          </div>
        </div>

        <h3 className="text-xl font-bold text-gray-900 mb-1">{project.title}</h3>
        <a
          href={project.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-indigo-500 hover:text-indigo-700 text-sm break-all mb-3 block"
        >
          {project.url}
        </a>

        <button
          onClick={() => setExpanded(!expanded)}
          className="text-sm text-gray-500 hover:text-gray-700 mb-2"
        >
          {expanded ? "▲ 접기" : "▼ 상세 설명 보기"}
        </button>

        {expanded && (
          <div
            className="project-description text-gray-700 text-sm mt-2 pt-2 border-t border-gray-100"
            dangerouslySetInnerHTML={{ __html: project.description }}
          />
        )}
      </div>

      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl">
            <h2 className="text-xl font-bold mb-2 text-center text-red-600">삭제 확인</h2>
            <p className="text-gray-500 text-sm text-center mb-4">
              비밀번호를 입력하면 "{project.title}"이 삭제됩니다.
            </p>
            <form onSubmit={handleDelete}>
              <input
                type="password"
                value={deletePassword}
                onChange={(e) => setDeletePassword(e.target.value)}
                placeholder="비밀번호"
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-center mb-3 focus:outline-none focus:ring-2 focus:ring-red-400"
                autoFocus
              />
              {deleteError && (
                <p className="text-red-500 text-sm text-center mb-3">{deleteError}</p>
              )}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => { setShowDeleteModal(false); setDeletePassword(""); setDeleteError(""); }}
                  className="flex-1 py-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50"
                >
                  취소
                </button>
                <button
                  type="submit"
                  disabled={deleting || !deletePassword}
                  className="flex-1 py-2 rounded-lg bg-red-600 text-white font-semibold hover:bg-red-700 disabled:opacity-50"
                >
                  {deleting ? "삭제 중..." : "삭제"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
