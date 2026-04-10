"use client";

import { useState, useEffect } from "react";

const TOPIC_PASSWORD = "0407";

export default function TopicSection() {
  const [revealed, setRevealed] = useState(false);
  const [content, setContent] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [input, setInput] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const stored = localStorage.getItem("topicRevealed");
    if (stored === "true") {
      setRevealed(true);
      fetchTopic();
    }
  }, []);

  async function fetchTopic() {
    const res = await fetch("/api/topic");
    if (res.ok) {
      const data = await res.json();
      setContent(data.content);
    }
  }

  function handleClick() {
    if (!revealed) setShowModal(true);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (input === TOPIC_PASSWORD) {
      setRevealed(true);
      setShowModal(false);
      setInput("");
      setError("");
      localStorage.setItem("topicRevealed", "true");
      fetchTopic();
    } else {
      setError("비밀번호가 올바르지 않습니다.");
    }
  }

  return (
    <>
      <div
        onClick={handleClick}
        className={`w-full rounded-2xl p-6 md:p-8 mb-6 text-center cursor-pointer transition-all duration-300 ${
          revealed
            ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white"
            : "bg-gradient-to-r from-gray-700 to-gray-900 text-white hover:from-gray-600 hover:to-gray-800"
        }`}
      >
        {revealed ? (
          <div>
            <p className="text-sm font-medium opacity-80 mb-2">오늘의 주제</p>
            <p className="text-2xl md:text-3xl font-bold whitespace-pre-wrap">
              {content || "주제가 설정되지 않았습니다."}
            </p>
          </div>
        ) : (
          <div>
            <p className="text-2xl md:text-3xl font-bold">🔒 오늘의 주제는?</p>
            <p className="text-sm opacity-70 mt-2">클릭하여 확인</p>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl">
            <h2 className="text-xl font-bold mb-4 text-center">비밀번호 입력</h2>
            <form onSubmit={handleSubmit}>
              <input
                type="password"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="비밀번호"
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-center text-lg tracking-widest mb-3 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                autoFocus
              />
              {error && (
                <p className="text-red-500 text-sm text-center mb-3">{error}</p>
              )}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => { setShowModal(false); setInput(""); setError(""); }}
                  className="flex-1 py-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-700"
                >
                  확인
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
