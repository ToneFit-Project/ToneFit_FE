import { useEffect, useState } from 'react';

const CARDS = [
  {
    num: '01',
    layer: '필수',
    layerVariant: 'brand' as const,
    original: '안녕하세요',
    corrected: '안녕하십니까',
    reason: '비즈니스 메일에서는 하십시오체를 사용하는 것이 원칙입니다.',
  },
  {
    num: '02',
    layer: '권장',
    layerVariant: 'brand' as const,
    original: '확인해주세요',
    corrected: '확인 부탁드립니다',
    reason: '구어적인 요청을 업무 메일에 맞는 정중한 표현으로 다듬었습니다.',
  },
  {
    num: '03',
    layer: '선택',
    layerVariant: 'muted' as const,
    original: '답장 부탁드려요',
    corrected: '회신 부탁드립니다',
    reason: '친근한 느낌은 유지하되 비즈니스 메일 톤에 맞게 정리했습니다.',
  },
  {
    num: '04',
    layer: '필수',
    layerVariant: 'brand' as const,
    original: '꼭 처리해주세요',
    corrected: '처리 부탁드립니다',
    reason: '강압적인 표현 대신 부드럽고 격식 있는 요청으로 바꿨습니다.',
  },
  {
    num: '05',
    layer: '권장',
    layerVariant: 'brand' as const,
    original: '문제 있으면',
    corrected: '특이사항 있으면',
    reason: '공식 문서에 적합한 어휘로 교체했습니다.',
  },
];

const PRESS_DURATION = 500;
const HOLD_DURATION = 800;
const INTER_CARD_DELAY = 1200;
const END_PAUSE = 2500;

interface HeroCardCorrectProps {
  paused?: boolean;
}

const HeroCardCorrect = ({ paused = false }: HeroCardCorrectProps) => {
  const [acceptedCount, setAcceptedCount] = useState(0);
  const [pressingIdx, setPressingIdx] = useState(-1);

  useEffect(() => {
    if (paused) return;
    const timers: ReturnType<typeof setTimeout>[] = [];
    let cancelled = false;

    const runCycle = () => {
      if (cancelled) return;
      setAcceptedCount(0);
      setPressingIdx(-1);

      let offset = 1000;

      for (let i = 0; i < CARDS.length; i++) {
        const cardIdx = i;
        const pressStart = offset;
        const acceptAt = pressStart + PRESS_DURATION + HOLD_DURATION;
        const nextStart = acceptAt + INTER_CARD_DELAY;

        timers.push(
          setTimeout(() => {
            if (!cancelled) setPressingIdx(cardIdx);
          }, pressStart)
        );

        timers.push(
          setTimeout(() => {
            if (!cancelled) {
              setPressingIdx(-1);
              setAcceptedCount(cardIdx + 1);
            }
          }, acceptAt)
        );

        offset = nextStart;
      }

      timers.push(
        setTimeout(() => {
          if (!cancelled) runCycle();
        }, offset + END_PAUSE)
      );
    };

    runCycle();
    return () => {
      cancelled = true;
      timers.forEach(clearTimeout);
    };
  }, [paused]);

  const fillPct = (acceptedCount / CARDS.length) * 100;

  return (
    <div className="relative flex flex-col gap-3.5 overflow-hidden h-full px-3 py-1">
      {/* 헤더 */}
      <div className="flex flex-col gap-3.5">
        {/* 진행 바 */}
        <div className="h-4 w-full rounded-sm overflow-hidden bg-background-brand-subtle relative">
          <div
            className="absolute left-0 inset-y-0 bg-background-brand rounded-sm transition-all duration-500"
            style={{ width: `${fillPct}%` }}
          />
        </div>

        {/* 타이틀 */}
        <div className="flex items-center gap-3.5 py-3.5">
          <span className="text-2xl font-semibold leading-7 tracking-tight text-text-primary">
            교정 내역
          </span>
          <span className="text-2xl font-semibold leading-7 tracking-tight text-text-brand">
            5건
          </span>
        </div>

        {/* 수락/거절/미검토 카운트 */}
        <div className="flex items-center py-3 gap-5.5 text-xl font-semibold leading-5 tracking-tight text-text-placeholder">
          <span className="transition-all duration-300">
            수락 {acceptedCount}
          </span>
          <span>거절 0</span>
          <span className="transition-all duration-300">
            미검토 {CARDS.length - acceptedCount}
          </span>
        </div>
      </div>

      {/* 카드 목록 */}
      <div className="py-7 overflow-hidden">
        {CARDS.map((card, idx) => {
          const accepted = idx < acceptedCount;
          const pressing = pressingIdx === idx;

          return (
            <div
              key={card.num}
              className="bg-background-surface rounded-xl overflow-hidden mb-3.5"
              style={{ boxShadow: '0px 2px 8px rgba(0,0,0,0.08)' }}
            >
              {/* 항상 표시되는 헤더 행 */}
              <div className="p-4 flex items-center gap-2">
                <span className="bg-background-brand text-text-inverse text-xl font-semibold px-2.5 py-0.5 rounded-full shrink-0">
                  {card.num}
                </span>
                <span
                  className={`text-base font-semibold px-2.5 py-0.5 rounded-full border shrink-0 ${
                    card.layerVariant === 'brand'
                      ? 'border-border-brand text-text-brand bg-background-surface'
                      : 'border-border-strong text-text-tertiary bg-background-surface'
                  }`}
                >
                  {card.layer}
                </span>
                {accepted && (
                  <span className="text-base font-semibold leading-4 tracking-tight text-text-secondary truncate">
                    {card.corrected}
                  </span>
                )}
                <span
                  className={`ml-auto text-sm font-semibold px-3 py-0.5 rounded-full shrink-0 transition-all duration-300 ${
                    accepted
                      ? 'text-text-brand bg-background-brand-subtle'
                      : 'text-text-placeholder bg-background-muted'
                  }`}
                >
                  {accepted ? '수락됨' : '대기중'}
                </span>
              </div>

              {/* 상세 내용 — grid 트릭으로 접기/펼치기 */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateRows: accepted ? '0fr' : '1fr',
                  transition: 'grid-template-rows 500ms ease',
                }}
              >
                <div className="overflow-hidden">
                  <div className="px-4 pt-2.5 pb-4 flex flex-col gap-5.5">
                    {/* 원문 → 교정안 */}
                    <div className="bg-background-subtle border border-border-subtle rounded-xl p-5 flex flex-col gap-2">
                      <div className="flex flex-col gap-1.5">
                        <span className="text-base font-semibold leading-4 tracking-tight text-text-tertiary">
                          원문
                        </span>
                        <span className="text-base leading-5 tracking-tight text-text-tertiary">
                          {card.original}
                        </span>
                      </div>
                      <div className="border-t border-border-subtle" />
                      <div className="flex flex-col gap-1.5">
                        <span className="text-base font-semibold leading-4 tracking-tight text-text-tertiary">
                          교정안
                        </span>
                        <span className="text-xl font-semibold leading-5 tracking-tight text-text-primary">
                          {card.corrected}
                        </span>
                      </div>
                    </div>

                    {/* 이유 */}
                    <div className="flex gap-4 items-start text-base leading-5 tracking-tight text-text-secondary">
                      <span className="bg-background-muted text-text-secondary font-semibold px-2 py-0.5 rounded shrink-0">
                        이유
                      </span>
                      <span>{card.reason}</span>
                    </div>

                    {/* 버튼 */}
                    <div className="flex gap-2">
                      <button
                        type="button"
                        className="flex-1 py-2 text-base font-semibold text-text-secondary border border-border-default rounded-lg bg-background-surface"
                      >
                        거절
                      </button>
                      <button
                        type="button"
                        className="flex-1 py-2 text-base font-semibold text-text-inverse bg-background-brand rounded-lg transition-all duration-200"
                        style={{
                          transform: pressing ? 'scale(0.95)' : undefined,
                          boxShadow: pressing
                            ? '0 0 14px rgba(124,77,255,0.5)'
                            : undefined,
                          opacity: pressing ? 0.85 : undefined,
                        }}
                      >
                        수락
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default HeroCardCorrect;
