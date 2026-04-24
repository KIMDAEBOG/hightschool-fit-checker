import React, { useEffect, useMemo, useRef, useState } from "react";

const PHONE = "042-825-1296";

const SCHOOLS = [
  { key: "jijok", name: "지족고", type: "공학 · 일반고", summary: "자기주도성과 선택형 학습이 잘 맞는 학생에게 유리", good: "자기주도성이 있고 계획 실행력이 있는 학생", caution: "누가 계속 끌어줘야 움직이는 학생은 주의", weights: { drive: 1.2, self: 1.35, stable: 0.95, compete: 1.05, support: 0.85, girls: 0.5 } },
  { key: "noeun", name: "노은고", type: "공학 · 일반고", summary: "학교 프로그램과 상향 목표를 잘 활용하는 학생에게 유리", good: "목표가 분명하고 경쟁을 동력으로 쓰는 학생", caution: "계획만 세우고 실행이 약하면 장점 체감이 약함", weights: { drive: 1.25, self: 1.2, stable: 0.9, compete: 1.15, support: 0.95, girls: 0.5 } },
  { key: "banseok", name: "반석고", type: "공학 · 일반고", summary: "안정적으로 내신을 관리하고 싶은 균형형 학생에게 적합", good: "기복을 줄이고 꾸준히 성적을 쌓고 싶은 학생", caution: "강한 경쟁 자극이 있어야 움직이는 학생은 아쉬울 수 있음", weights: { drive: 1.0, self: 1.05, stable: 1.25, compete: 0.95, support: 1.05, girls: 0.5 } },
  { key: "yuseongGirls", name: "유성여고", type: "여고 · 일반고", summary: "학업 루틴과 몰입 환경을 중요하게 보는 여학생에게 적합", good: "분위기 영향을 많이 받고, 집중 환경을 중요하게 보는 여학생", caution: "남학생은 지원 대상 아님", weights: { drive: 1.15, self: 1.15, stable: 1.0, compete: 1.1, support: 1.0, girls: 1.7 } },
  { key: "yuseong", name: "유성고", type: "공학 · 일반고", summary: "활동성과 학업을 함께 활용하고 싶은 학생에게 적합", good: "규모 있는 학교 자원을 활용하며 성장하고 싶은 학생", caution: "큰 집단 환경에서 쉽게 위축되는 학생은 주의", weights: { drive: 1.1, self: 1.05, stable: 0.95, compete: 1.1, support: 0.95, girls: 0.5 } },
];

const QUESTIONS = [
  { id: 1, category: "학업 목표", text: "상향 목표를 위해 꾸준히 밀어붙일 의지가 강하다.", dim: "drive" },
  { id: 2, category: "학업 목표", text: "현재 성적보다 한 단계 높은 결과를 위해 경쟁을 감수할 수 있다.", dim: "compete" },
  { id: 3, category: "학업 목표", text: "안정적인 내신 확보가 가장 중요하다.", dim: "stable" },
  { id: 4, category: "자기주도", text: "스스로 학습 계획을 세워 실행하는 편이다.", dim: "self" },
  { id: 5, category: "자기주도", text: "누가 검사하지 않아도 복습을 잘 챙긴다.", dim: "self" },
  { id: 6, category: "경쟁 적응", text: "주변 학생 수준이 높을수록 자극을 받는다.", dim: "compete" },
  { id: 7, category: "경쟁 적응", text: "지나친 경쟁은 오히려 불안감을 키운다.", dim: "stable", reverse: true },
  { id: 8, category: "학습 안정성", text: "매일 조금씩 누적하는 방식이 잘 맞는다.", dim: "stable" },
  { id: 9, category: "학습 안정성", text: "학교 분위기와 반 분위기의 영향을 많이 받는다.", dim: "support" },
  { id: 10, category: "관리 필요도", text: "주기적인 점검과 상담이 있어야 성적이 잘 오른다.", dim: "support" },
  { id: 11, category: "관리 필요도", text: "계획은 세우지만 실제 실행률은 들쑥날쑥한 편이다.", dim: "support" },
  { id: 12, category: "환경 선호", text: "단일 성별 환경이 더 편하고 집중이 잘 될 것 같다.", dim: "girls" },
];

const SCALE = [
  { value: 1, label: "전혀 아니다" },
  { value: 2, label: "아니다" },
  { value: 3, label: "보통" },
  { value: 4, label: "그렇다" },
  { value: 5, label: "매우 그렇다" },
];

function normalize(value, reverse = false) {
  const v = reverse ? 6 - value : value;
  return (v - 1) / 4;
}

function calcScores(answers, studentType) {
  const dims = {};
  QUESTIONS.forEach((q) => {
    const score = normalize(answers[q.id] ?? 3, q.reverse);
    dims[q.dim] = dims[q.dim] || [];
    dims[q.dim].push(score);
  });
  const avgDims = Object.fromEntries(
    Object.entries(dims).map(([k, arr]) => [k, arr.reduce((a, b) => a + b, 0) / arr.length])
  );

  const ranking = SCHOOLS.map((school) => {
    let total = 0;
    Object.entries(school.weights).forEach(([dim, weight]) => {
      total += (avgDims[dim] ?? 0.5) * weight;
    });
    if (studentType === "male" && school.key === "yuseongGirls") total = -1;
    if (studentType === "female" && school.key === "yuseongGirls") total += 0.2;
    return { ...school, total, percent: Math.max(0, Math.min(100, Math.round((total / 6.5) * 100))) };
  }).sort((a, b) => b.total - a.total);

  return { avgDims, ranking };
}

export default function App() {
  const [intro, setIntro] = useState(true);
  const [musicOn, setMusicOn] = useState(false);
  const [studentName, setStudentName] = useState("");
  const [studentType, setStudentType] = useState("coed");
  const [answers, setAnswers] = useState(() => Object.fromEntries(QUESTIONS.map((q) => [q.id, 3])));

  const audioContextRef = useRef(null);
  const nodesRef = useRef([]);

  const stopMusic = () => {
    nodesRef.current.forEach((node) => {
      try { node.stop && node.stop(); } catch (_) {}
      try { node.disconnect && node.disconnect(); } catch (_) {}
    });
    nodesRef.current = [];
    setMusicOn(false);
  };

  const startMusic = async () => {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = audioContextRef.current || new AudioCtx();
      audioContextRef.current = ctx;
      if (ctx.state === "suspended") await ctx.resume();

      stopMusic();

      const master = ctx.createGain();
      master.gain.value = 0.03;
      master.connect(ctx.destination);

      const base = ctx.createOscillator();
      base.type = "sine";
      base.frequency.value = 220;
      const baseGain = ctx.createGain();
      baseGain.gain.value = 0.24;
      base.connect(baseGain).connect(master);

      const upper = ctx.createOscillator();
      upper.type = "triangle";
      upper.frequency.value = 329.63;
      const upperGain = ctx.createGain();
      upperGain.gain.value = 0.11;
      upper.connect(upperGain).connect(master);

      const lfo1 = ctx.createOscillator();
      lfo1.type = "sine";
      lfo1.frequency.value = 0.07;
      const depth1 = ctx.createGain();
      depth1.gain.value = 0.05;
      lfo1.connect(depth1).connect(baseGain.gain);

      const lfo2 = ctx.createOscillator();
      lfo2.type = "sine";
      lfo2.frequency.value = 0.11;
      const depth2 = ctx.createGain();
      depth2.gain.value = 0.03;
      lfo2.connect(depth2).connect(upperGain.gain);

      [base, upper, lfo1, lfo2].forEach((n) => n.start());
      nodesRef.current = [base, upper, lfo1, lfo2, master, baseGain, upperGain, depth1, depth2];
      setMusicOn(true);
    } catch (e) {
      console.error(e);
      setMusicOn(false);
    }
  };

  const toggleMusic = async () => {
    if (musicOn) stopMusic();
    else await startMusic();
  };

  useEffect(() => () => stopMusic(), []);

  const { avgDims, ranking } = useMemo(() => calcScores(answers, studentType), [answers, studentType]);

  const answeredAvg = useMemo(() => {
    const vals = Object.values(answers);
    return vals.reduce((a, b) => a + b, 0) / vals.length;
  }, [answers]);

  const tier = answeredAvg >= 4.4 ? "도전형 최상위" :
               answeredAvg >= 3.8 ? "상위권 성장형" :
               answeredAvg >= 3.2 ? "중상위 안정형" :
               answeredAvg >= 2.6 ? "중위권 관리형" : "기초체력 회복형";

  const resetAll = () => {
    setStudentName("");
    setStudentType("coed");
    setAnswers(Object.fromEntries(QUESTIONS.map((q) => [q.id, 3])));
  };

  const top3 = ranking.slice(0, 3);

  if (intro) {
    return (
      <div className="intro-page">
        <div className="intro-overlay" />
        <div className="intro-content">
          <div className="brand-pill">SENS MATH · HIGH SCHOOL FIT DIAGNOSIS</div>
          <h1>쎈수학지족학원{"\n"}중3 고등학교 성향 적합도 진단</h1>
          <p>
            학생 성향, 경쟁 적응력, 자기주도성, 안정성 선호, 관리 필요도를 바탕으로
            우리 아이에게 더 잘 맞는 고등학교 방향을 점검하는 상담용 진단 프로그램입니다.
          </p>
          <div className="phone-line">상담문의 {PHONE}</div>
          <div className="intro-actions">
            <button
              className="primary-btn"
              onClick={async () => {
                await startMusic();
                setIntro(false);
              }}
            >
              진단 시작하기
            </button>
            <button className="secondary-btn" onClick={toggleMusic}>
              {musicOn ? "배경음악 끄기" : "배경음악 켜기"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <header className="hero">
        <div>
          <div className="eyebrow">대전 유성권 일반고 성향 진단</div>
          <h2>고교 성향 매칭 체크리스트</h2>
          <p>
            학교 이름을 묻는 진단이 아니라 학생 성향을 먼저 점검하는 방식입니다.
            체크 결과를 바탕으로 5개 학교 적합도를 자동 정리합니다.
          </p>
        </div>
        <div className="hero-card">
          <div className="field-label">학생 이름 또는 메모</div>
          <input
            value={studentName}
            onChange={(e) => setStudentName(e.target.value)}
            placeholder="예: 김OO / 중3"
            className="text-input"
          />
          <div className="field-label">학생 유형</div>
          <select value={studentType} onChange={(e) => setStudentType(e.target.value)} className="select-input">
            <option value="coed">미정 / 테스트용</option>
            <option value="male">남학생</option>
            <option value="female">여학생</option>
          </select>
          <div className="chips">
            <span className="chip">예상 유형: {tier}</span>
            <span className="chip">문항 수: {QUESTIONS.length}</span>
          </div>
        </div>
      </header>

      <main className="main-grid">
        <section className="panel">
          <div className="panel-title">체크리스트</div>
          <div className="questions">
            {QUESTIONS.map((q) => (
              <div key={q.id} className="question-card">
                <div className="q-meta">{q.id}. {q.category}</div>
                <div className="q-text">{q.text}</div>
                <div className="scale-row">
                  {SCALE.map((s) => (
                    <button
                      key={s.value}
                      onClick={() => setAnswers((prev) => ({ ...prev, [q.id]: s.value }))}
                      className={answers[q.id] === s.value ? "scale-btn active" : "scale-btn"}
                    >
                      <strong>{s.value}</strong>
                      <span>{s.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        <aside className="panel">
          <div className="panel-title">추천 결과</div>
          <div className="summary-box">
            <div className="summary-title">{studentName ? `${studentName} 학생` : "현재 학생"} 기준 추천</div>
            <div className="summary-text">1순위부터 5순위까지 성향 적합도를 정리합니다.</div>
          </div>

          <div className="rank-list">
            {ranking.map((school, idx) => (
              <div key={school.key} className={idx === 0 ? "rank-card top" : "rank-card"}>
                <div className="rank-row">
                  <div>
                    <div className="rank-order">{idx + 1}순위</div>
                    <div className="school-name">{school.name}</div>
                    <div className="school-type">{school.type}</div>
                  </div>
                  <div className="percent">{school.percent}</div>
                </div>
                <div className="school-summary">{school.summary}</div>
                <div className="school-notes">
                  <div><strong>추천 학생</strong> {school.good}</div>
                  <div><strong>주의 학생</strong> {school.caution}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="mini-chart">
            <div className="chart-title">상위 3개 학교 적합도</div>
            {top3.map((school) => (
              <div key={school.key} className="bar-item">
                <div className="bar-label">{school.name}</div>
                <div className="bar-track">
                  <div className="bar-fill" style={{ width: `${school.percent}%` }} />
                </div>
                <div className="bar-value">{school.percent}</div>
              </div>
            ))}
          </div>

          <div className="mini-chart">
            <div className="chart-title">학생 성향 요약</div>
            {[
              ["목표 의지", avgDims.drive],
              ["자기주도", avgDims.self],
              ["안정 선호", avgDims.stable],
              ["경쟁 적응", avgDims.compete],
              ["관리 필요", avgDims.support],
            ].map(([label, value]) => (
              <div key={label} className="bar-item">
                <div className="bar-label">{label}</div>
                <div className="bar-track">
                  <div className="bar-fill soft" style={{ width: `${Math.round((value || 0) * 100)}%` }} />
                </div>
                <div className="bar-value">{Math.round((value || 0) * 100)}</div>
              </div>
            ))}
          </div>

          <div className="bottom-box">
            <div className="bottom-title">활용 안내</div>
            <ul>
              <li>학생과 학부모가 각각 체크하면 학교 선택 기준 차이를 상담하기 좋습니다.</li>
              <li>결과는 배치표가 아니라 성향 적합도입니다.</li>
              <li>성적, 통학, 실제 입결, 고등 수학 준비 상태를 함께 보셔야 정확합니다.</li>
            </ul>
          </div>

          <div className="cta-box">
            <div className="cta-title">상담 문의</div>
            <div className="cta-phone">{PHONE}</div>
            <div className="cta-sub">학생별 학교 선택 상담 · 고등 연계 수학 학습 상담</div>
            <div className="cta-actions">
              <button className="secondary-btn dark" onClick={resetAll}>초기화</button>
              <button className="secondary-btn dark" onClick={toggleMusic}>{musicOn ? "배경음악 끄기" : "배경음악 켜기"}</button>
            </div>
          </div>
        </aside>
      </main>
    </div>
  );
}
