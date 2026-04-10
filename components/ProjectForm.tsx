"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";

const RichTextEditor = dynamic(() => import("./RichTextEditor"), { ssr: false });

interface Project {
  id: string;
  teamNumber: number;
  title: string;
  url: string;
  description: string;
}

interface ProjectFormProps {
  initial?: Project;
  onSuccess: (project: Project & { _count?: { votes: number } }) => void;
  onCancel: () => void;
}

export default function ProjectForm({ initial, onSuccess, onCancel }: ProjectFormProps) {
  const [teamNumber, setTeamNumber] = useState(initial?.teamNumber?.toString() ?? "");
  const [title, setTitle] = useState(initial?.title ?? "");
  const [url, setUrl] = useState(initial?.url ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const isEdit = !!initial;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!teamNumber || !title.trim() || !url.trim() || !description || !password) {
      setError("모든 필드를 입력해 주세요.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const body = isEdit
        ? { teamNumber, title, url, description, password, newPassword: newPassword || undefined }
        : { teamNumber, title, url, description, password };

      const res = await fetch(
        isEdit ? `/api/projects/${initial.id}` : "/api/projects",
        {
          method: isEdit ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        }
      );

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "오류가 발생했습니다.");
      } else {
        onSuccess(data);
      }
    } catch {
      setError("네트워크 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          조 번호 <span className="text-red-500">*</span>
        </label>
        <select
          value={teamNumber}
          onChange={(e) => setTeamNumber(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
          required
        >
          <option value="">조 선택</option>
          {[1, 2, 3, 4, 5, 6, 7, 8].map((t) => (
            <option key={t} value={t}>
              {t}조
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          제목 <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="서비스 제목"
          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          URL <span className="text-red-500">*</span>
        </label>
        <input
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://..."
          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          상세 설명 <span className="text-red-500">*</span>
          <span className="text-gray-400 text-xs ml-2">(5분 발표용)</span>
        </label>
        <RichTextEditor content={description} onChange={setDescription} />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {isEdit ? "현재 비밀번호" : "비밀번호"} <span className="text-red-500">*</span>
          <span className="text-gray-400 text-xs ml-2">(수정/삭제 시 필요)</span>
        </label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="비밀번호 설정"
          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
          required
        />
      </div>

      {isEdit && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            새 비밀번호 <span className="text-gray-400 text-xs ml-1">(변경 시에만 입력)</span>
          </label>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="새 비밀번호 (선택)"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />
        </div>
      )}

      {error && (
        <p className="text-red-500 text-sm bg-red-50 rounded-lg px-3 py-2">{error}</p>
      )}

      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 py-3 rounded-xl border border-gray-300 text-gray-700 font-medium hover:bg-gray-50"
        >
          취소
        </button>
        <button
          type="submit"
          disabled={loading}
          className="flex-1 py-3 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-700 disabled:opacity-50"
        >
          {loading ? "저장 중..." : isEdit ? "수정 완료" : "등록하기"}
        </button>
      </div>
    </form>
  );
}
