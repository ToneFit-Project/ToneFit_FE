import {
  DraftGenerationIcon,
  CorrectionSuggestionIcon,
  ReplyGenerationIcon,
} from '@/components/ui/MotionIcons';

const cards = [
  {
    id: 'generate',
    label: '초안 생성',
    headline: '무슨 말로 시작할 지  막막할 때',
    desc: '받는 사람과 목적만 고르면, 첫 문장부터 채워드려요.',
    icon: <DraftGenerationIcon />,
    scrollTarget: 'feature-generate',
  },
  {
    id: 'correct',
    label: '교정 제안',
    headline: '이대로 보내도 될지 망설여질 때',
    desc: '보내기 전에 고칠 곳과 그 이유까지 짚어드려요.',
    icon: <CorrectionSuggestionIcon />,
    scrollTarget: 'feature-correct',
  },
  {
    id: 'reply',
    label: '회신 생성',
    headline: '긴 메일에 뭐라 답할지 막힐 때',
    desc: '받은 메일을 대신 읽고, 답할 거리를 뽑아드려요.',
    icon: <ReplyGenerationIcon />,
    scrollTarget: 'feature-reply',
  },
];

const FeatureList = () => {
  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section id="features">
      <div className="max-w-410 mx-auto py-15 flex flex-col gap-20">
        <h2 className="text-4xl font-bold leading-11 tracking-tight text-text-primary text-center">
          메일을 쓰다 멈칫하는 순간, ToneFit이 옆에서 도울게요
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {cards.map((card, i) => (
            <div
              key={card.id}
              className="bg-background-surface rounded-2xl px-10 py-9 aspect-square flex flex-col justify-between shadow-[0px_8px_24px_-2px_rgba(124,77,255,0.16)]"
              data-aos="fade-up"
              data-aos-delay={i * 150}
            >
              {/* Top: Label + Headline */}
              <div className="flex flex-col gap-4">
                <p className="text-base font-semibold leading-6 tracking-tight text-text-brand">
                  {card.label}
                </p>
                <div className="flex flex-col gap-1.5">
                  <p className="text-3xl-plus font-bold leading-10 tracking-tight text-text-secondary">
                    {card.headline}
                  </p>
                  <p className="text-lg font-normal leading-7 tracking-tight text-text-secondary">
                    {card.desc}
                  </p>
                </div>
              </div>

              {/* Icon */}
              <div className="flex justify-center">{card.icon}</div>

              {/* More link */}
              <button
                type="button"
                onClick={() => scrollTo(card.scrollTarget)}
                className="text-base font-semibold leading-6 tracking-tight text-text-brand text-left cursor-pointer"
              >
                더 알아보기 →
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeatureList;
