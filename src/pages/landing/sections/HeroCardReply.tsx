import { useEffect, useRef, useState } from 'react';

const RECIPIENTS = ['상사', '동료', '고객사', '협력사'];

const BULLET_POINTS = [
  '하반기 실적 보고서 전달 일정이 지연된 상황입니다.',
  '지연 사유와 새 제출 일정을 함께 안내해야 합니다.',
  '간단한 사과와 후속 조치를 포함하는 것이 좋겠습니다.',
];

const SKELETON_LINES = [{ widthPct: 92 }, { widthPct: 68 }, { widthPct: 80 }];

const pickRandom = <T,>(arr: T[], exclude?: T): T => {
  const candidates =
    exclude !== undefined ? arr.filter((v) => v !== exclude) : arr;
  return candidates[Math.floor(Math.random() * candidates.length)];
};

interface HeroCardReplyProps {
  paused?: boolean;
}

const HeroCardReply = ({ paused = false }: HeroCardReplyProps) => {
  const [skeletonStep, setSkeletonStep] = useState(0);
  const [contentVisible, setContentVisible] = useState(false);
  const [q1Typed, setQ1Typed] = useState(false);
  const [q2Typed, setQ2Typed] = useState(false);
  const [recipient, setRecipient] = useState<string | null>(null);
  const prevRecipientRef = useRef<string | undefined>(undefined);

  useEffect(() => {
    if (paused) return;

    const timers: ReturnType<typeof setTimeout>[] = [];
    let skeletonInterval: ReturnType<typeof setInterval> | null = null;
    let cancelled = false;

    const runCycle = () => {
      if (cancelled) return;

      if (skeletonInterval) {
        clearInterval(skeletonInterval);
        skeletonInterval = null;
      }

      // 초기화
      setSkeletonStep(0);
      setContentVisible(false);
      setQ1Typed(false);
      setQ2Typed(false);
      setRecipient(null);

      // 스켈레톤 라인 순환
      let step = 0;
      skeletonInterval = setInterval(() => {
        if (cancelled) return;
        step = (step + 1) % SKELETON_LINES.length;
        setSkeletonStep(step);
      }, 420);

      // t=2200: 스켈레톤 → 실제 내용 + 수신자 랜덤 선택
      timers.push(
        setTimeout(() => {
          if (cancelled) return;
          if (skeletonInterval) {
            clearInterval(skeletonInterval);
            skeletonInterval = null;
          }
          setContentVisible(true);
          const nextR = pickRandom(RECIPIENTS, prevRecipientRef.current);
          prevRecipientRef.current = nextR;
          setRecipient(nextR);
        }, 2200)
      );

      // t=3400: Q1 입력됨
      timers.push(
        setTimeout(() => {
          if (!cancelled) setQ1Typed(true);
        }, 3400)
      );

      // t=4900: Q2 입력됨
      timers.push(
        setTimeout(() => {
          if (!cancelled) setQ2Typed(true);
        }, 4900)
      );

      // t=7500: 루프 재시작
      timers.push(setTimeout(runCycle, 7500));
    };

    runCycle();
    return () => {
      cancelled = true;
      if (skeletonInterval) clearInterval(skeletonInterval);
      timers.forEach(clearTimeout);
    };
  }, [paused]);

  return (
    <div className="relative">
      <div className="px-2.5 py-4 flex flex-col gap-9">
        {/* 헤더 */}
        <div className="p-3.5">
          <p className="text-2xl-plus font-bold leading-10 tracking-tight text-text-primary">
            받은 메일을 읽고,
            <br />
            답장에 필요한 질문을 추렸어요
          </p>
        </div>

        <div className="flex flex-col gap-9">
          {/* 메일 요약 카드 */}
          <div
            className="bg-background-surface rounded-2xl p-5 flex flex-col gap-3.5 overflow-hidden"
            style={{ boxShadow: '0px 1.4px 2.8px rgba(124,77,255,0.1)' }}
          >
            <div className="flex items-center justify-between shrink-0">
              <span className="text-xl-plus font-semibold leading-9 tracking-tight text-text-primary">
                메일 요약
              </span>
              <span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="13"
                  viewBox="0 0 18 13"
                  fill="none"
                >
                  <path
                    d="M7.3644 12.3581C7.92157 13.1541 9.10039 13.1541 9.65757 12.3581L16.7666 2.20241C17.4159 1.2748 16.7523 0.000217438 15.62 0.000217438H1.40199C0.269692 0.000217438 -0.393924 1.2748 0.255406 2.20242L7.3644 12.3581Z"
                    fill="#D2D6E1"
                  />
                </svg>
              </span>
            </div>
            <div className="border-t border-border-subtle" />

            {/* 스켈레톤 → 실제 내용 전환 */}
            {!contentVisible ? (
              <div className="flex flex-col gap-2.5 pt-1">
                {SKELETON_LINES.map((line, i) => (
                  <div
                    key={i}
                    className="h-6 rounded-sm bg-background-muted"
                    style={{
                      width: `${line.widthPct}%`,
                      opacity: i === skeletonStep ? 1 : 0.08,
                      transition: 'opacity 0.3s ease-in-out',
                    }}
                  />
                ))}
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {BULLET_POINTS.map((point) => (
                  <div
                    key={point}
                    className="flex items-start gap-1.5 py-1 px-2"
                  >
                    <span className="mt-0.5">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="13"
                        height="13"
                        viewBox="0 0 13 13"
                        fill="none"
                      >
                        <path
                          d="M7.40855 0.317857C7.07543 0.110124 6.69072 0 6.29814 0C5.86006 -0.000262898 5.43288 0.136587 5.07649 0.39136C4.72011 0.646134 4.4524 1.00606 4.3109 1.42066L3.57644 3.57578L1.42342 4.31024L1.1758 4.41097C0.802612 4.59366 0.492058 4.88303 0.283498 5.2424C0.0749373 5.60178 -0.0222407 6.01498 0.00427968 6.42964C0.0308001 6.8443 0.179824 7.24176 0.432467 7.57163C0.685109 7.90151 1.03 8.14896 1.42342 8.28263L3.57854 9.01709L4.313 11.1701L4.41372 11.4156C4.59623 11.7889 4.88543 12.0995 5.24468 12.3083C5.60392 12.517 6.01705 12.6144 6.43169 12.5881C6.84634 12.5618 7.24385 12.413 7.57385 12.1606C7.90385 11.9081 8.15149 11.5634 8.28539 11.1701L9.01985 9.01499L11.1729 8.28053L11.4205 8.1798C11.7937 7.99711 12.1042 7.70774 12.3128 7.34836C12.5214 6.98899 12.6185 6.57579 12.592 6.16112C12.5655 5.74646 12.4165 5.34901 12.1638 5.01913C11.9112 4.68925 11.5663 4.4418 11.1729 4.30814L9.01775 3.57368L8.28329 1.42066L8.18256 1.17514C8.00983 0.822602 7.74166 0.525591 7.40855 0.317857Z"
                          fill="#7C4DFF"
                        />
                      </svg>
                    </span>
                    <p className="text-base leading-5 tracking-tight text-text-secondary">
                      {point}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 수신자 유형 */}
          <div className="flex flex-col gap-3.5">
            <div className="flex items-center gap-3.5 px-4">
              <span className="text-xl-plus font-semibold leading-8 tracking-tight text-text-primary shrink-0">
                수신자 유형 선택
              </span>
              <span className="text-base leading-4 tracking-tight text-text-placeholder">
                *AI가 미리 골라뒀어요
              </span>
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              {RECIPIENTS.map((item) => (
                <div
                  key={item}
                  className={`flex items-center justify-center py-3 rounded-full border text-xl font-semibold transition-all duration-300 ${
                    item === recipient
                      ? 'bg-background-selected border-border-brand text-text-brand'
                      : 'bg-background-surface border-border-default text-text-secondary'
                  }`}
                >
                  {item}
                </div>
              ))}
            </div>
          </div>

          {/* 회신에 필요한 정보 */}
          <div className="flex flex-col gap-3">
            <span className="text-xl-plus font-semibold leading-8 tracking-tight text-text-primary px-4">
              회신에 필요한 정보
            </span>
            <div
              className="bg-background-surface rounded-2xl p-5 flex flex-col gap-6"
              style={{ boxShadow: '0px 1.4px 2.8px rgba(124,77,255,0.1)' }}
            >
              {/* Q1 */}
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-2.5">
                  <span className="bg-background-brand text-text-inverse text-xs font-semibold px-3 py-0.5 rounded-full">
                    Q1
                  </span>
                  <span className="text-base font-semibold leading-5.5 tracking-tight text-text-primary">
                    지연 사유에 대해 어떻게 설명을 할까요?
                  </span>
                </div>
                <div className="relative bg-background-subtle border border-border-default rounded-xl px-5 py-4 min-h-14 flex items-start">
                  {q1Typed ? (
                    <>
                      <div
                        className="absolute left-5 top-4 h-2 rounded"
                        style={{
                          width: '72%',
                          background: 'rgba(124,77,255,0.28)',
                        }}
                      />
                      <div
                        className="absolute left-5 top-7 h-2 rounded"
                        style={{
                          width: '52%',
                          background: 'rgba(124,77,255,0.28)',
                        }}
                      />
                    </>
                  ) : (
                    <span className="text-sm leading-5.5 tracking-tight text-text-placeholder">
                      답변을 작성해주세요.
                    </span>
                  )}
                </div>
              </div>

              <div className="border-t border-border-subtle" />

              {/* Q2 */}
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-2.5">
                  <span className="bg-background-brand text-text-inverse text-xs font-semibold px-3 py-0.5 rounded-full">
                    Q2
                  </span>
                  <span className="text-sm font-semibold leading-5.5 tracking-tight text-text-primary">
                    새 일정은 언제로 안내할까요?
                  </span>
                </div>
                <div className="relative bg-background-subtle border border-border-default rounded-xl px-5 py-4 min-h-14 flex items-start">
                  {q2Typed ? (
                    <>
                      <div
                        className="absolute left-5 top-4 h-2 rounded"
                        style={{
                          width: '60%',
                          background: 'rgba(124,77,255,0.28)',
                        }}
                      />
                      <div
                        className="absolute left-5 top-7 h-2 rounded"
                        style={{
                          width: '40%',
                          background: 'rgba(124,77,255,0.28)',
                        }}
                      />
                    </>
                  ) : (
                    <span className="text-sm leading-5.5 tracking-tight text-text-placeholder">
                      새로운 일정을 알려주세요
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* 추가로 전할 말 */}
          <div className="flex flex-col gap-3">
            <span className="text-sm font-semibold leading-5 tracking-tight text-text-primary px-4">
              추가로 전할 말 (선택)
            </span>
            <div className="bg-background-surface border border-border-default rounded-2xl px-5 py-4 h-20 flex items-start">
              <span className="text-xs leading-5 tracking-tight text-text-placeholder">
                내용을 입력해주세요
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroCardReply;
