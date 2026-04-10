"use client";

import { useState } from "react";
import { useUser } from "@/contexts/UserContext";

export default function LoginSection() {
  const { setUser } = useUser();
  const [step, setStep] = useState<"participant" | "team" | "name">("participant");
  const [isParticipant, setIsParticipant] = useState(false);
  const [teamNumber, setTeamNumber] = useState<number | null>(null);
  const [name, setName] = useState("");

  function handleParticipant(val: boolean) {
    setIsParticipant(val);
    if (val) {
      setStep("team");
    } else {
      setStep("name");
    }
  }

  function handleTeamSelect(team: number) {
    setTeamNumber(team);
    setStep("name");
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setUser({
      name: name.trim(),
      isParticipant,
      teamNumber: isParticipant ? teamNumber : null,
    });
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6">
      <h2 className="text-xl font-bold text-gray-800 mb-5 text-center">
        참가자 확인
      </h2>

      {step === "participant" && (
        <div>
          <p className="text-gray-600 text-center mb-5">
            해커톤에 참여하시는 조원인가요?
          </p>
          <div className="flex gap-4">
            <button
              onClick={() => handleParticipant(true)}
              className="flex-1 py-4 rounded-xl bg-indigo-600 text-white font-semibold text-lg hover:bg-indigo-700 transition-colors"
            >
              예, 참여자입니다
            </button>
            <button
              onClick={() => handleParticipant(false)}
              className="flex-1 py-4 rounded-xl bg-gray-100 text-gray-700 font-semibold text-lg hover:bg-gray-200 transition-colors"
            >
              아니요
            </button>
          </div>
        </div>
      )}

      {step === "team" && (
        <div>
          <p className="text-gray-600 text-center mb-4">소속 조를 선택해 주세요</p>
          <div className="grid grid-cols-4 gap-3 mb-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((t) => (
              <button
                key={t}
                onClick={() => handleTeamSelect(t)}
                className="py-4 rounded-xl bg-indigo-50 text-indigo-700 font-bold text-xl hover:bg-indigo-600 hover:text-white transition-colors"
              >
                {t}조
              </button>
            ))}
          </div>
          <button
            onClick={() => setStep("participant")}
            className="text-sm text-gray-400 hover:text-gray-600 w-full text-center"
          >
            ← 이전
          </button>
        </div>
      )}

      {step === "name" && (
        <form onSubmit={handleSubmit}>
          <p className="text-gray-600 text-center mb-4">이름을 입력해 주세요</p>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="이름"
            className="w-full border border-gray-300 rounded-xl px-4 py-3 text-lg text-center mb-4 focus:outline-none focus:ring-2 focus:ring-indigo-400"
            autoFocus
          />
          <button
            type="submit"
            disabled={!name.trim()}
            className="w-full py-3 rounded-xl bg-indigo-600 text-white font-semibold text-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            입장하기
          </button>
          <button
            type="button"
            onClick={() => setStep(isParticipant ? "team" : "participant")}
            className="text-sm text-gray-400 hover:text-gray-600 w-full text-center mt-3"
          >
            ← 이전
          </button>
        </form>
      )}
    </div>
  );
}
