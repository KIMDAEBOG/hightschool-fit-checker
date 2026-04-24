import React, { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts'
import { CheckCircle2, RotateCcw, School, SlidersHorizontal, Trophy, UserRound } from 'lucide-react'

const SCHOOLS = {
  jijok: {
    name: '지족고',
    short: '지족',
    type: '공학 · 일반고',
    summary: '선택형 교육과정과 자기주도성이 잘 맞는 편',
    caution: '스스로 계획을 세우고 꾸준히 실행하는 힘이 약하면 효율이 떨어질 수 있음',
    weights: { academicDrive: 1.2, selfDirected: 1.35, competition: 1.05, stability: 0.95, courseChoice: 1.35, mentoringNeed: 0.85, stressCare: 0.9, writing: 1.0, mathPush: 1.1, commuteSensitivity: 1.0, socialFit: 1.0, girlsPreference: 0.5 },
    success: ['자기주도성이 있는 학생', '선택과목 설계를 잘 활용하는 학생', '중상위권에서 상향을 노리는 학생'],
    fail: ['누가 계속 끌어줘야 움직이는 학생', '복습 루틴 없이 선행만 하는 학생'],
  },
  noeun: {
    name: '노은고',
    short: '노은',
    type: '공학 · 일반고',
    summary: '학교 프로그램과 진학 설계를 적극 활용하는 학생에게 유리한 편',
    caution: '학교 시스템을 활용하지 못하면 체감 장점이 줄어들 수 있음',
    weights: { academicDrive: 1.2, selfDirected: 1.2, competition: 1.15, stability: 0.9, courseChoice: 1.2, mentoringNeed: 0.95, stressCare: 0.9, writing: 1.05, mathPush: 1.15, commuteSensitivity: 1.0, socialFit: 1.0, girlsPreference: 0.5 },
    success: ['상향 목표가 분명한 학생', '학교 프로그램과 비교과를 챙길 학생', '경쟁을 동력으로 쓰는 학생'],
    fail: ['계획만 세우고 실행이 약한 학생', '환경만 바뀌면 성적이 오를 거라 기대하는 학생'],
  },
  banseok: {
    name: '반석고',
    short: '반석',
    type: '공학 · 일반고',
    summary: '균형형 학생에게 무난하며 안정적으로 관리하기 좋은 편',
    caution: '폭발적인 상승보다 꾸준한 관리형 접근이 더 잘 맞는 편',
    weights: { academicDrive: 1.0, selfDirected: 1.05, competition: 0.95, stability: 1.25, courseChoice: 1.0, mentoringNeed: 1.0, stressCare: 1.15, writing: 1.0, mathPush: 1.0, commuteSensitivity: 1.05, socialFit: 1.0, girlsPreference: 0.5 },
    success: ['기복을 줄이고 안정적으로 내신을 쌓고 싶은 학생', '균형감 있게 공부하는 학생'],
    fail: ['강한 경쟁 자극이 있어야만 움직이는 학생', '극단적 상향 환경만 원하는 학생'],
  },
  yuseongGirls: {
    name: '유성여고',
    short: '유성여',
    type: '여고 · 일반고',
    summary: '여학생 중 집중도와 학업 루틴을 중요하게 보는 학생에게 잘 맞을 수 있음',
    caution: '남학생은 지원 대상이 아니며, 여학생도 단일성별 환경 선호가 갈릴 수 있음',
    weights: { academicDrive: 1.15, selfDirected: 1.15, competition: 1.1, stability: 1.0, courseChoice: 1.0, mentoringNeed: 1.0, stressCare: 1.0, writing: 1.1, mathPush: 1.05, commuteSensitivity: 1.0, socialFit: 1.15, girlsPreference: 1.6 },
    success: ['여학생 중 학업 몰입과 생활 리듬을 중요하게 보는 학생', '분위기 영향을 많이 받는 학생'],
    fail: ['이성 혼합 환경을 강하게 선호하는 학생', '관계 스트레스에 매우 민감하지만 도움 요청은 잘 못하는 학생'],
  },
  yuseong: {
    name: '유성고',
    short: '유성',
    type: '공학 · 일반고',
    summary: '규모와 전통, 비교적 다양한 학교 활동을 활용하고 싶은 학생에게 맞을 수 있음',
    caution: '학생 수가 상대적으로 많은 환경이 부담이면 적응에 시간이 걸릴 수 있음',
    weights: { academicDrive: 1.1, selfDirected: 1.05, competition: 1.1, stability: 0.95, courseChoice: 1.1, mentoringNeed: 0.95, stressCare: 0.9, writing: 1.0, mathPush: 1.1, commuteSensitivity: 1.0, socialFit: 1.05, girlsPreference: 0.5 },
    success: ['규모 있는 학교에서 자원을 활용할 학생', '활동성과 학업을 같이 가져가고 싶은 학생'],
    fail: ['세밀한 밀착 관리가 없으면 바로 무너지는 학생', '큰 집단 환경에서 쉽게 위축되는 학생'],
  },
}

const QUESTIONS = [
  { id: 1, category: '학업 목표', text: '상위권 대학이나 학과를 목표로 꾸준히 밀어붙일 의지가 강하다.', dimension: 'academicDrive', reverse: false },
  { id: 2, category: '학업 목표', text: '현재 성적보다 한 단계 이상 높은 결과를 위해 경쟁을 감수할 수 있다.', dimension: 'competition', reverse: false },
  { id: 3, category: '학업 목표', text: '안정적인 내신 확보가 최우선이고, 무리한 상향은 피하고 싶다.', dimension: 'stability', reverse: false },
  { id: 4, category: '학업 목표', text: '학교 수업 외에도 스스로 추가 학습 계획을 세워 실천할 수 있다.', dimension: 'selfDirected', reverse: false },
  { id: 5, category: '학업 목표', text: '진로가 비교적 분명해서 학교의 과목 선택을 전략적으로 활용하고 싶다.', dimension: 'courseChoice', reverse: false },
  { id: 6, category: '학습 습관', text: '숙제나 복습을 누가 검사하지 않아도 스스로 챙기는 편이다.', dimension: 'selfDirected', reverse: false },
  { id: 7, category: '학습 습관', text: '시험 범위를 쪼개서 장기 계획표로 관리하는 것이 익숙하다.', dimension: 'selfDirected', reverse: false },
  { id: 8, category: '학습 습관', text: '한 번 흔들리면 다시 루틴을 회복하는 데 시간이 오래 걸린다.', dimension: 'mentoringNeed', reverse: false },
  { id: 9, category: '학습 습관', text: '계획은 잘 세우지만 실제 실행률은 들쑥날쑥한 편이다.', dimension: 'mentoringNeed', reverse: false },
  { id: 10, category: '학습 습관', text: '매일 조금씩 누적하는 공부가 잘 맞는다.', dimension: 'stability', reverse: false },
  { id: 11, category: '경쟁/스트레스', text: '주변 학생 수준이 높을수록 오히려 더 자극을 받는다.', dimension: 'competition', reverse: false },
  { id: 12, category: '경쟁/스트레스', text: '경쟁이 심하면 동기보다 불안이 더 커지는 편이다.', dimension: 'stressCare', reverse: false },
  { id: 13, category: '경쟁/스트레스', text: '등수나 등급이 바로 드러나는 환경에서도 크게 흔들리지 않는다.', dimension: 'competition', reverse: false },
  { id: 14, category: '경쟁/스트레스', text: '분위기에 쉽게 휩쓸려 공부 리듬이 무너지는 편이다.', dimension: 'stressCare', reverse: false },
  { id: 15, category: '경쟁/스트레스', text: '너무 치열한 분위기보다는 안정적으로 성장하는 환경이 낫다.', dimension: 'stability', reverse: false },
  { id: 16, category: '수학/과목 성향', text: '수학은 현재 조금 힘들어도 꾸준히 밀어붙일 의향이 있다.', dimension: 'mathPush', reverse: false },
  { id: 17, category: '수학/과목 성향', text: '서술형이나 풀이 정리가 점수에 큰 영향을 준다.', dimension: 'writing', reverse: false },
  { id: 18, category: '수학/과목 성향', text: '개념은 아는데 시험장에서 흔들리는 경우가 잦다.', dimension: 'mentoringNeed', reverse: false },
  { id: 19, category: '수학/과목 성향', text: '문제 수가 많고 속도 압박이 있어도 끝까지 버티는 편이다.', dimension: 'competition', reverse: false },
  { id: 20, category: '수학/과목 성향', text: '모르는 것을 바로 질문하고 피드백을 받는 구조가 꼭 필요하다.', dimension: 'mentoringNeed', reverse: false },
  { id: 21, category: '학교생활 스타일', text: '학교 프로그램이나 활동을 적극적으로 활용할 생각이 있다.', dimension: 'courseChoice', reverse: false },
  { id: 22, category: '학교생활 스타일', text: '학업 외 활동이 너무 많으면 오히려 집중이 흐트러질 수 있다.', dimension: 'stability', reverse: false },
  { id: 23, category: '학교생활 스타일', text: '비교과나 진로활동도 어느 정도 챙기면서 학교생활을 하고 싶다.', dimension: 'courseChoice', reverse: false },
  { id: 24, category: '학교생활 스타일', text: '학업 분위기가 나와 잘 맞는지가 학교 선택에서 아주 중요하다.', dimension: 'socialFit', reverse: false },
  { id: 25, category: '학교생활 스타일', text: '사람이 많은 큰 집단에서도 비교적 잘 적응하는 편이다.', dimension: 'socialFit', reverse: false },
  { id: 26, category: '관리 필요도', text: '누군가 학습 상태를 주기적으로 점검해주면 성적이 더 잘 오른다.', dimension: 'mentoringNeed', reverse: false },
  { id: 27, category: '관리 필요도', text: '시험 직전보다 평소 관리 체계가 더 중요한 학생이다.', dimension: 'stability', reverse: false },
  { id: 28, category: '관리 필요도', text: '학원이나 학교에서 주는 시스템을 적극적으로 따라가는 편이다.', dimension: 'mentoringNeed', reverse: false },
  { id: 29, category: '관리 필요도', text: '혼자 결정할 수 있는 자유가 많을수록 더 잘한다.', dimension: 'selfDirected', reverse: false },
  { id: 30, category: '관리 필요도', text: '주기적인 상담이나 방향 점검이 없으면 목표가 흐려진다.', dimension: 'mentoringNeed', reverse: false },
  { id: 31, category: '진로/선택과목', text: '선택과목 폭과 진로 맞춤형 수업 기회가 중요하다.', dimension: 'courseChoice', reverse: false },
  { id: 32, category: '진로/선택과목', text: '학교 안에서 진학 정보나 설명회, 자료 활용을 많이 하고 싶다.', dimension: 'courseChoice', reverse: false },
  { id: 33, category: '진로/선택과목', text: '학교가 제공하는 다양한 자원을 찾아 쓰는 편이다.', dimension: 'courseChoice', reverse: false },
  { id: 34, category: '진로/선택과목', text: '아직 진로가 뚜렷하지 않아도 안정적으로 공부 기반을 만들고 싶다.', dimension: 'stability', reverse: false },
  { id: 35, category: '진로/선택과목', text: '입시 전략을 세울 때 학교의 시스템 활용도가 중요하다고 생각한다.', dimension: 'courseChoice', reverse: false },
  { id: 36, category: '성향/환경', text: '너무 자유로운 분위기보다 적당한 긴장감이 있는 환경이 좋다.', dimension: 'competition', reverse: false },
  { id: 37, category: '성향/환경', text: '분위기가 안정적이고 예측 가능해야 실수가 줄어든다.', dimension: 'stability', reverse: false },
  { id: 38, category: '성향/환경', text: '학교 친구 분위기나 반 분위기의 영향을 많이 받는다.', dimension: 'socialFit', reverse: false },
  { id: 39, category: '성향/환경', text: '낯선 환경에서도 첫 학기 적응이 빠른 편이다.', dimension: 'socialFit', reverse: false },
  { id: 40, category: '성향/환경', text: '한 번 정한 방식대로 꾸준히 가는 것이 잘 맞는다.', dimension: 'stability', reverse: false },
  { id: 41, category: '생활 조건', text: '통학 시간이 길어지면 공부 체력이 크게 떨어진다.', dimension: 'commuteSensitivity', reverse: false },
  { id: 42, category: '생활 조건', text: '학교 생활 리듬이 무너지면 학원 학습까지 연쇄적으로 흔들린다.', dimension: 'stability', reverse: false },
  { id: 43, category: '생활 조건', text: '큰 학교의 다양한 분위기가 오히려 선택지를 넓혀준다고 느낀다.', dimension: 'socialFit', reverse: false },
  { id: 44, category: '생활 조건', text: '조용하고 집중되는 분위기가 더 중요하다.', dimension: 'stressCare', reverse: false },
  { id: 45, category: '생활 조건', text: '학교 선택에서 인간관계 스트레스 가능성을 꽤 중요하게 본다.', dimension: 'stressCare', reverse: false },
  { id: 46, category: '환경 선호', text: '단일 성별 환경이 더 편하고 집중이 잘 될 것 같다.', dimension: 'girlsPreference', reverse: false },
  { id: 47, category: '환경 선호', text: '남녀가 함께 있는 환경이 더 자연스럽고 편하다.', dimension: 'girlsPreference', reverse: true },
  { id: 48, category: '환경 선호', text: '학업 분위기만 좋다면 학교의 전통이나 규모도 의미가 있다고 본다.', dimension: 'socialFit', reverse: false },
  { id: 49, category: '환경 선호', text: '내가 잘할 수 있는 무대를 찾는 것이, 무조건 센 곳에 가는 것보다 중요하다.', dimension: 'stability', reverse: false },
  { id: 50, category: '환경 선호', text: '학교를 고를 때 내 성향과 맞는지부터 보아야 한다고 생각한다.', dimension: 'socialFit', reverse: false },
]

const SCALE = [
  { value: 1, label: '전혀 아니다' },
  { value: 2, label: '아니다' },
  { value: 3, label: '보통' },
  { value: 4, label: '그렇다' },
  { value: 5, label: '매우 그렇다' },
]

const GROUPS = [[1, 10], [11, 20], [21, 30], [31, 40], [41, 50]]

function Button({ children, className = '', variant = 'solid', ...props }) {
  const base = 'inline-flex items-center justify-center rounded-2xl px-4 py-3 font-semibold transition'
  const styles = variant === 'outline' ? 'border border-slate-300 bg-white hover:bg-slate-50' : 'bg-slate-900 text-white hover:bg-slate-800'
  return <button className={`${base} ${styles} ${className}`} {...props}>{children}</button>
}

function Card({ children, className = '' }) {
  return <div className={`rounded-3xl bg-white shadow-md ${className}`}>{children}</div>
}

function CardHeader({ children, className = '' }) {
  return <div className={`p-6 ${className}`}>{children}</div>
}

function CardContent({ children, className = '' }) {
  return <div className={`px-6 pb-6 ${className}`}>{children}</div>
}

function CardTitle({ children, className = '' }) {
  return <h2 className={`text-xl font-bold ${className}`}>{children}</h2>
}

function CardDescription({ children, className = '' }) {
  return <p className={`mt-2 text-sm leading-6 text-slate-600 ${className}`}>{children}</p>
}

function Badge({ children, className = '' }) {
  return <span className={`inline-flex items-center rounded-full border border-slate-200 px-3 py-1 text-sm ${className}`}>{children}</span>
}

function normalizeAnswer(value, reverse = false) {
  const v = reverse ? 6 - value : value
  return (v - 1) / 4
}

function getDimensionScores(answers) {
  const bucket = {}
  QUESTIONS.forEach((q) => {
    const raw = answers[q.id] ?? 3
    const score = normalizeAnswer(raw, q.reverse)
    if (!bucket[q.dimension]) bucket[q.dimension] = []
    bucket[q.dimension].push(score)
  })
  const result = {}
  Object.entries(bucket).forEach(([k, arr]) => {
    result[k] = arr.reduce((a, b) => a + b, 0) / arr.length
  })
  return result
}

function getSchoolRanking(answers, studentType) {
  const dim = getDimensionScores(answers)
  const results = Object.entries(SCHOOLS).map(([key, school]) => {
    let score = 0
    Object.entries(school.weights).forEach(([dimension, weight]) => {
      score += (dim[dimension] ?? 0.5) * weight
    })
    if (studentType === 'male' && key === 'yuseongGirls') score = -1
    if (studentType === 'female' && key === 'yuseongGirls') score += 0.2
    const percent = Math.max(0, Math.min(100, Math.round((score / 12) * 100)))
    return { key, ...school, score, percent }
  })
  return results.sort((a, b) => b.score - a.score)
}

function getTopReasons(school, dimensions) {
  const pairs = Object.entries(school.weights).map(([k, weight]) => ({ key: k, value: (dimensions[k] ?? 0.5) * weight })).sort((a, b) => b.value - a.value).slice(0, 3)
  const labelMap = {
    academicDrive: '상향 목표 성향', selfDirected: '자기주도 학습력', competition: '경쟁 적응력', stability: '안정형 학습 선호', courseChoice: '과목 선택/학교 자원 활용 성향', mentoringNeed: '관리 필요도', stressCare: '분위기·스트레스 민감도', writing: '서술형/정리력', mathPush: '수학 밀어붙이는 힘', commuteSensitivity: '통학 민감도', socialFit: '학교 분위기 적응력', girlsPreference: '환경 선호도'
  }
  return pairs.map((p) => labelMap[p.key])
}

function studentTierLabel(avg) {
  if (avg >= 4.4) return '도전형 최상위'
  if (avg >= 3.9) return '상위권 성장형'
  if (avg >= 3.3) return '중상위 안정형'
  if (avg >= 2.7) return '중위권 관리형'
  return '기초체력 회복형'
}

export default function App() {
  const [showIntro, setShowIntro] = useState(true)
  const [tab, setTab] = useState('questions')
  const [studentName, setStudentName] = useState('')
  const [studentType, setStudentType] = useState('coed')
  const [answers, setAnswers] = useState(Object.fromEntries(QUESTIONS.map((q) => [q.id, 3])))

  const answeredAvg = useMemo(() => {
    const vals = Object.values(answers)
    return vals.reduce((a, b) => a + b, 0) / vals.length
  }, [answers])

  const dimensions = useMemo(() => getDimensionScores(answers), [answers])
  const ranking = useMemo(() => getSchoolRanking(answers, studentType), [answers, studentType])

  const radarData = [
    { subject: '목표', value: Math.round((dimensions.academicDrive ?? 0) * 100) },
    { subject: '자기주도', value: Math.round((dimensions.selfDirected ?? 0) * 100) },
    { subject: '경쟁적응', value: Math.round((dimensions.competition ?? 0) * 100) },
    { subject: '안정선호', value: Math.round((dimensions.stability ?? 0) * 100) },
    { subject: '자원활용', value: Math.round((dimensions.courseChoice ?? 0) * 100) },
    { subject: '관리필요', value: Math.round((dimensions.mentoringNeed ?? 0) * 100) },
  ]

  const barData = ranking.map((r) => ({ school: r.short, 점수: r.percent }))

  const setAnswer = (id, value) => setAnswers((prev) => ({ ...prev, [id]: value }))
  const resetAll = () => {
    setStudentName('')
    setStudentType('coed')
    setAnswers(Object.fromEntries(QUESTIONS.map((q) => [q.id, 3])))
    setTab('questions')
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {showIntro ? (
        <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 px-6 text-white">
          <motion.div initial={{ opacity: 0, scale: 1.2 }} animate={{ opacity: 0.18, scale: 1 }} transition={{ duration: 1.8 }} className="absolute inset-0 bg-[radial-gradient(circle_at_center,white_0%,transparent_55%)]" />
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9 }} className="relative mx-auto max-w-4xl text-center">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.8 }} className="mb-4 inline-flex items-center rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm tracking-[0.2em] text-white/80 backdrop-blur">SENS MATH · HIGH SCHOOL FIT ANALYZER</motion.div>
            <motion.h1 initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35, duration: 0.9 }} className="whitespace-pre-line text-3xl font-bold leading-tight md:text-6xl">{'쎈수학지족학원\n중3 고등학교 성향 적합도 진단프로그램'}</motion.h1>
            <motion.p initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55, duration: 0.9 }} className="mx-auto mt-6 max-w-2xl text-sm leading-7 text-white/75 md:text-lg">학생 성향, 경쟁 적응력, 자기주도성, 안정성 선호, 관리 필요도를 바탕으로 고등학교 적합도를 1순위부터 5순위까지 분석하는 상담용 진단 프로그램입니다.</motion.p>
            <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8, duration: 0.9 }} className="mt-10 flex flex-col items-center justify-center gap-4">
              <Button onClick={() => setShowIntro(false)} className="px-8 py-4 text-base">진단 시작하기</Button>
              <div className="text-xs tracking-[0.2em] text-white/50">FOR PARENTS · STUDENTS · COUNSELING</div>
            </motion.div>
          </motion.div>
        </div>
      ) : (
        <div className="mx-auto max-w-7xl p-6 md:p-10">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-8 grid gap-4 md:grid-cols-[1.4fr_1fr]">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2 text-sm text-slate-500"><School className="h-4 w-4" /> 대전 유성권 일반고 적합도 체크</div>
                <CardTitle className="text-3xl">고교 성향 매칭 체크리스트 앱</CardTitle>
                <CardDescription className="text-base leading-7">문항에는 학교 이름이 드러나지 않도록 설계했습니다. 학생·학부모가 50개 항목을 체크하면, 성향 점수를 바탕으로 5개 학교의 적합도를 1순위부터 5순위까지 자동 정리합니다.</CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl"><UserRound className="h-5 w-5" /> 기본 정보</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <input className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:ring-2 focus:ring-slate-300" placeholder="학생 이름 또는 식별용 메모" value={studentName} onChange={(e) => setStudentName(e.target.value)} />
                <select className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:ring-2 focus:ring-slate-300" value={studentType} onChange={(e) => setStudentType(e.target.value)}>
                  <option value="male">남학생</option>
                  <option value="female">여학생</option>
                  <option value="coed">미정/테스트용</option>
                </select>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm text-slate-600"><span>체크 진행도</span><span>100%</span></div>
                  <div className="h-2 rounded-full bg-slate-200"><div className="h-2 w-full rounded-full bg-slate-900" /></div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Badge>예상 유형: {studentTierLabel(answeredAvg)}</Badge>
                  <Badge>문항 수: 50</Badge>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <div className="mb-6 grid grid-cols-3 rounded-2xl bg-white p-1 shadow-sm">
            {[
              ['questions', '체크리스트'],
              ['results', '추천 결과'],
              ['method', '활용 방법'],
            ].map(([key, label]) => (
              <button key={key} onClick={() => setTab(key)} className={`rounded-2xl px-4 py-3 font-semibold ${tab === key ? 'bg-slate-900 text-white' : 'text-slate-700'}`}>{label}</button>
            ))}
          </div>

          {tab === 'questions' && (
            <div className="space-y-6">
              {GROUPS.map(([start, end], idx) => {
                const items = QUESTIONS.filter((q) => q.id >= start && q.id <= end)
                return (
                  <Card key={idx}>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-xl"><SlidersHorizontal className="h-5 w-5" /> {idx + 1}구간 · {items[0].category} ~ {items[items.length - 1].category}</CardTitle>
                      <CardDescription>{start}번부터 {end}번까지 체크해 주세요.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-5">
                      {items.map((q) => (
                        <div key={q.id} className="rounded-2xl border border-slate-200 p-4">
                          <div className="mb-3 flex items-start gap-3">
                            <Badge>{q.id}</Badge>
                            <div>
                              <div className="text-xs text-slate-500">{q.category}</div>
                              <div className="text-base leading-7">{q.text}</div>
                            </div>
                          </div>
                          <div className="grid grid-cols-5 gap-2">
                            {SCALE.map((s) => (
                              <button key={s.value} onClick={() => setAnswer(q.id, s.value)} className={`rounded-2xl border px-3 py-3 text-sm transition ${answers[q.id] === s.value ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-200 bg-white hover:bg-slate-50'}`}>
                                <div className="font-semibold">{s.value}</div>
                                <div className="mt-1 text-[11px] leading-4 opacity-80">{s.label}</div>
                              </button>
                            ))}
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}

          {tab === 'results' && (
            <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><Trophy className="h-5 w-5" /> 학교 추천 순위</CardTitle>
                  <CardDescription>{studentName ? `${studentName} 학생` : '현재 학생'}의 체크 결과를 바탕으로 한 적합도 순위입니다.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {ranking.map((school, idx) => (
                    <div key={school.key} className={`rounded-3xl border p-5 ${idx === 0 ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-200 bg-white'}`}>
                      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                        <div>
                          <div className="text-sm opacity-80">{idx + 1}순위</div>
                          <div className="text-2xl font-bold">{school.name}</div>
                          <div className="mt-1 text-sm opacity-80">{school.type} · {school.summary}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm opacity-80">적합도</div>
                          <div className="text-3xl font-bold">{school.percent}</div>
                        </div>
                      </div>
                      <div className="mt-4 grid gap-2 md:grid-cols-2">
                        <div className="rounded-2xl bg-black/5 p-3">
                          <div className="mb-1 text-sm font-semibold">맞는 이유</div>
                          <div className="text-sm leading-6">{getTopReasons(school, dimensions).join(' · ')}</div>
                        </div>
                        <div className="rounded-2xl bg-black/5 p-3">
                          <div className="mb-1 text-sm font-semibold">주의 포인트</div>
                          <div className="text-sm leading-6">{school.caution}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
              <div className="space-y-6">
                <Card>
                  <CardHeader><CardTitle>성향 프로필</CardTitle></CardHeader>
                  <CardContent className="h-[340px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart data={radarData}>
                        <PolarGrid />
                        <PolarAngleAxis dataKey="subject" />
                        <PolarRadiusAxis domain={[0, 100]} />
                        <Radar name="성향" dataKey="value" fill="#0f172a" fillOpacity={0.5} stroke="#0f172a" />
                      </RadarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader><CardTitle>학교별 적합도 비교</CardTitle></CardHeader>
                  <CardContent className="h-[320px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={barData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="school" />
                        <YAxis domain={[0, 100]} />
                        <Tooltip />
                        <Bar dataKey="점수" fill="#0f172a" radius={[10, 10, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {tab === 'method' && (
            <div className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <Card>
                  <CardHeader><CardTitle>상담실에서 쓰는 방법</CardTitle></CardHeader>
                  <CardContent className="space-y-3 text-sm leading-7 text-slate-700">
                    <div>1. 학생과 학부모가 각각 체크합니다.</div>
                    <div>2. 결과 순위가 다르면, 학교 선택 기준이 서로 다른 지점을 상담합니다.</div>
                    <div>3. 1순위 학교만 보지 말고 1~3순위 공통 특징을 먼저 읽습니다.</div>
                    <div>4. 결과는 배치표가 아니라 성향 적합도입니다. 성적, 통학, 실제 입결은 별도 확인이 필요합니다.</div>
                    <div>5. 체크 결과를 바탕으로 여름방학 학습 전략과 고1 첫 학기 관리 방향까지 연결하면 활용도가 높습니다.</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader><CardTitle>결과 해석 기준</CardTitle></CardHeader>
                  <CardContent className="space-y-3 text-sm leading-7 text-slate-700">
                    <div><CheckCircle2 className="mr-2 inline h-4 w-4" /> 1순위와 2순위 점수 차가 작으면 두 학교를 함께 검토합니다.</div>
                    <div><CheckCircle2 className="mr-2 inline h-4 w-4" /> 관리 필요도가 높은데 경쟁 적응이 낮으면, 학교 선택보다 학습 시스템 구축이 먼저입니다.</div>
                    <div><CheckCircle2 className="mr-2 inline h-4 w-4" /> 안정 선호가 높으면 내신 유지 전략 중심으로, 경쟁 적응이 높으면 상향 도전 전략 중심으로 봅니다.</div>
                    <div><CheckCircle2 className="mr-2 inline h-4 w-4" /> 여학생이면서 단일 성별 환경 선호가 높으면 유성여고 점수가 상대적으로 올라갈 수 있습니다.</div>
                    <div><CheckCircle2 className="mr-2 inline h-4 w-4" /> 남학생은 여고가 자동 제외되도록 설정했습니다.</div>
                  </CardContent>
                </Card>
              </div>
              <Card>
                <CardHeader>
                  <CardTitle>이 앱의 설계 원리</CardTitle>
                  <CardDescription>학교 이름을 숨긴 50개 문항 → 성향 점수 계산 → 학교별 가중치 매칭 → 1~5순위 추천</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 text-sm leading-7 text-slate-700">
                  <div>문항은 공통 성향, 경쟁 적응, 자기주도성, 안정성 선호, 관리 필요도, 과목 선택 활용도, 환경 선호도 등을 묻도록 구성했습니다.</div>
                  <div>따라서 이 앱은 절대적인 정답보다 상담을 시작하기 위한 구조화된 진단 도구로 쓰는 것이 가장 좋습니다.</div>
                  <div className="flex gap-3 pt-2"><Button onClick={resetAll} variant="outline"><RotateCcw className="mr-2 h-4 w-4" /> 초기화</Button></div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
