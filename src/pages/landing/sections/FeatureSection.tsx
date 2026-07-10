import { useEffect, useState } from 'react';
import FeatureCard, { CorrectionMockup, ReplyMockup } from './FeatureCard';
import { GmailMockup } from './DemoSection';
import {
  DraftGenerationAfterCard,
  CorrectionSuggestionAfterCard,
  ReplyGenerationAfterCard,
} from '@/components/ui/MotionCards';

// 총 사이클 8s
// 0~9%   (0~720ms):    대기
// 9~27%  (720~2160ms): 슬라이드 업 (1440ms — 천천히)
// 27~60% (2160~4800ms): 노출 — 타이핑 (· ·· ···, 500ms×3 = 1500ms) + 홀드
// 60~75% (4800~6000ms): 슬라이드 다운 (1200ms)
// 75~100% (6000~8000ms): 대기
const TOTAL_MS = 8000;
const DOTS_ON_MS = 2160; // 슬라이드 업 완료 직후 타이핑 시작
const DOTS_OFF_MS = 6200; // 슬라이드 다운 완료 후 (카드가 화면 밖으로 사라진 뒤)

function AnimatedMailMockup() {
  const [showDots, setShowDots] = useState(false);
  const [cycleKey, setCycleKey] = useState(0);

  useEffect(() => {
    let t1: ReturnType<typeof setTimeout>;
    let t2: ReturnType<typeof setTimeout>;
    let tRepeat: ReturnType<typeof setTimeout>;

    const runCycle = () => {
      setShowDots(false);
      setCycleKey((k) => k + 1);
      t1 = setTimeout(() => setShowDots(true), DOTS_ON_MS);
      t2 = setTimeout(() => setShowDots(false), DOTS_OFF_MS);
      tRepeat = setTimeout(runCycle, TOTAL_MS);
    };

    runCycle();
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(tRepeat);
    };
  }, []);

  return (
    <div className="relative overflow-hidden hidden lg:block h-full">
      <style>{`
        .amc-window {
          animation: amcSlide 8s linear infinite;
          will-change: transform;
        }
        @keyframes amcSlide {
          0%, 9%   { transform: translateY(108%); animation-timing-function: cubic-bezier(0.16, 1, 0.3, 1); }
          27%, 60% { transform: translateY(0%); animation-timing-function: cubic-bezier(0.7, 0, 0.84, 0); }
          75%, 100% { transform: translateY(108%); }
        }
        @media (prefers-reduced-motion: reduce) {
          .amc-window { animation: none; transform: translateY(0%); }
        }
      `}</style>
      <div className="amc-window absolute top-20 left-0 right-0 max-w-191 mx-auto">
        <GmailMockup key={cycleKey} animatedDots={showDots} />
      </div>
    </div>
  );
}

const FEATURES = [
  {
    id: 'feature-generate',
    label: '초안 생성',
    headline: '상사에게는 정중하게, 고객사에게는 명확하게',
    quote: '고객사에 거절해야 하는데,\n어떻게 써야 할지 막막했어요.',
    painPoints: [
      '거절을 해야하는데, 뭐부터 적어야 하지?',
      '너무 단호하게 말하면 계약이 끊기지 않을까?',
      '부드럽게 말하면 거절인지 모르실거 같은데...',
    ] as [string, string, string],
    afterHeadline:
      '수신자와 목적만 고르면,\n상황에 맞는 초안이\nGmail에 바로 채워져요.',
    afterDescription:
      '상대와 목적을 고르면 필요한 말의 뼈대가 잡히고,\n초안이 Gmail 작성창에 바로 채워져요.',
    beforeMockup: <AnimatedMailMockup />,
    afterMockup: <DraftGenerationAfterCard />,
  },
  {
    id: 'feature-correct',
    label: '교정 제안',
    headline: '문법은 국립국어원을 근거로, 표현은 상대에 맞게',
    quote:
      '메일을 다 써서 검토하는데,\nAI에 맡기면 내가 쓴 걸\n 통째로 바꿔놨어요.',
    painPoints: [
      '내가 쓴 글이랑 너무 달라졌는데?',
      '이게 왜 이렇게 바뀌었는지 알고 싶은데...',
      '이게 정말 더 나은 표현이 맞을까?',
    ] as [string, string, string],
    afterHeadline:
      '내가 쓴 글은 지키고,\n고치면 좋을 부분은\n이유와 함께 제안해줘요.',
    afterDescription:
      '국립국어원 기준으로 왜  고치면 좋은지 알려주니,\n이해하고 고칠 수 있어요.',
    beforeMockup: <CorrectionMockup />,
    afterMockup: <CorrectionSuggestionAfterCard />,
  },
  {
    id: 'feature-reply',
    label: '회신 생성',
    headline: '긴 메일은 3줄 요약으로, 답장은 질문 몇 개로',
    quote: '답장 한 번 쓰려고,\n긴 메일을 몇 번씩 다시 읽었어요.',
    painPoints: [
      '이 사람이랑 전에 무슨 얘길 했더라',
      '그래서 뭐에 대한 답을 해야 하는 거지?',
      '이걸 다 어떻게 정리해서 메일에 써야 하지?',
    ] as [string, string, string],
    afterHeadline: '이제 다시 읽지 않아도,\n몇 가지만 답하면 돼요.',
    afterDescription:
      '최근 3건의 대화를 요약하고, 답할 것만 질문으로 물어보니\n채우기만 하면 초안이 완성돼요',
    beforeMockup: <ReplyMockup />,
    afterMockup: <ReplyGenerationAfterCard />,
  },
];

const FeatureSection = () => (
  <section className="bg-background-surface rounded-4xl p-10 flex flex-col gap-25">
    {FEATURES.map((feature) => (
      <FeatureCard key={feature.id} {...feature} />
    ))}
  </section>
);

export default FeatureSection;
