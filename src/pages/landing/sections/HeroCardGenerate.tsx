import { useEffect, useRef, useState } from 'react';

const RECIPIENTS = ['상사', '동료', '고객사', '협력사'];
const PURPOSES = ['보고', '요청', '안내', '감사', '사과', '거절'];

const pickRandom = <T,>(arr: T[], exclude?: T): T => {
  const candidates =
    exclude !== undefined ? arr.filter((v) => v !== exclude) : arr;
  return candidates[Math.floor(Math.random() * candidates.length)];
};

interface HeroCardGenerateProps {
  paused?: boolean;
}

const HeroCardGenerate = ({ paused = false }: HeroCardGenerateProps) => {
  const [recipient, setRecipient] = useState<string | null>(null);
  const [purpose, setPurpose] = useState<string | null>(null);
  const prevRecipientRef = useRef<string | undefined>(undefined);
  const prevPurposeRef = useRef<string | undefined>(undefined);

  useEffect(() => {
    if (paused) return;
    const timers: ReturnType<typeof setTimeout>[] = [];

    const cycle = () => {
      setRecipient(null);
      setPurpose(null);

      timers.push(
        setTimeout(() => {
          const nextR = pickRandom(RECIPIENTS, prevRecipientRef.current);
          prevRecipientRef.current = nextR;
          setRecipient(nextR);

          timers.push(
            setTimeout(() => {
              const nextP = pickRandom(PURPOSES, prevPurposeRef.current);
              prevPurposeRef.current = nextP;
              setPurpose(nextP);
            }, 1000)
          );
        }, 600)
      );

      timers.push(setTimeout(cycle, 4500));
    };

    timers.push(setTimeout(cycle, 800));
    return () => timers.forEach(clearTimeout);
  }, [paused]);

  return (
    <div className="flex flex-col gap-5.5">
      {/* 탭 */}
      <div className="flex bg-background-muted rounded-2xl p-1.5 gap-1.5 text-sm font-semibold">
        <div className="flex-1 p-3.5 text-center   text-text-brand bg-background-surface rounded-xl">
          생성하기
        </div>
        <div className="flex-1 p-3.5 text-center  text-text-placeholder rounded-xl">
          교정하기
        </div>
      </div>

      {/* 콘텐츠 */}
      <div className="flex flex-col gap-14 p-3">
        {/* 수신자 유형 */}
        <div className="flex flex-col gap-5.5">
          <p className="text-base font-semibold leading-5 tracking-tight text-text-primary">
            수신자 유형 선택
          </p>
          <div className="grid grid-cols-2 gap-1.5">
            {RECIPIENTS.map((item) => (
              <div
                key={item}
                className={`flex items-center justify-center py-3.75 rounded-full border text-sm font-semibold transition-all duration-300 ${
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

        {/* 목적 선택 */}
        <div className="flex flex-col gap-5.5">
          <p className="text-base font-semibold leading-5 tracking-tight text-text-primary">
            목적 선택
          </p>
          <div className="grid grid-cols-2 gap-1.5">
            {PURPOSES.map((item) => (
              <div
                key={item}
                className={`flex items-center justify-center py-3.75 rounded-full border text-sm font-semibold transition-all duration-300 ${
                  item === purpose
                    ? 'bg-background-selected border-border-brand text-text-brand'
                    : 'bg-background-surface border-border-default text-text-secondary'
                }`}
              >
                {item}
              </div>
            ))}
          </div>
        </div>

        {/* 메일 상황 입력 */}
        <div className="flex flex-col gap-5.5">
          <div className="flex items-baseline gap-13">
            <p className="text-base font-semibold leading-5 tracking-tight text-text-primary">
              메일 상황 입력
            </p>
            <p className="text-xs leading-4 tracking-tight text-text-placeholder">
              *최소 10자 이상 입력해 주세요.
            </p>
          </div>
          <div>
            <div className="bg-background-surface border border-border-brand rounded-xl p-4.5 h-70">
              <p className="text-sm leading-5.5 tracking-tight text-text-primary">
                김민성 팀장님에게 마케팅 2팀 하반기 실적 보고서와 함께 메일을
                전달드리고 싶어
              </p>
            </div>
            <p className="text-right text-xs leading-4 tracking-tight text-text-brand">
              44 / 200자
            </p>
          </div>
        </div>

        {/* CTA */}
        <div className="flex flex-col gap-2">
          <button
            type="button"
            className="bg-background-brand text-text-inverse text-sm font-semibold leading-6 tracking-tight py-4 rounded-lg w-full"
            style={{ boxShadow: '0px 2.8px 5.6px rgba(0,0,0,0.08)' }}
          >
            초안 생성하기
          </button>
          <p className="text-xs leading-4.5 tracking-tight text-text-placeholder text-center">
            초안은 Gmail 작성칸에 채워지고, 보내기 전 수정할 수 있어요.
          </p>
        </div>
      </div>
    </div>
  );
};

export default HeroCardGenerate;
