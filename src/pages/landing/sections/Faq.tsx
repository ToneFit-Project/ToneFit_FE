import { useState } from 'react';

const FAQ_ITEMS = [
  {
    q: 'ToneFit은 어떤 서비스인가요?',
    a: '비즈니스 이메일을 쓰는 바로 그 자리에서, 초안 작성부터 교정, 답장까지 도와주는 AI 글쓰기 도우미예요. 단순히 문장을 다듬는 데서 그치지 않고, "누구에게 어떤 목적으로 보내는 메일인지"를 먼저 파악해 상황에 맞는 격식과 톤을 잡아드립니다. \n처음 비즈니스 메일을 쓰는 신입부터 더 빠르고 정확하게 쓰고 싶은 경력자까지, 누구나 쓸 수 있습니다.',
  },
  {
    q: 'AI가 제 메일을 어떻게 교정하나요?',
    a: '맞춤법·띄어쓰기만 보는 게 아니라, 상대방과의 관계, 그리고 메일의 목적을 함께 고려해 표현을 점검합니다. 같은 내용이라도 상사에게 보낼 때, 고객에게 보낼 때, 동료에게 보낼 때 어울리는 말투가 다르니까요.\n중요한 건, ToneFit은 메일을 마음대로 바꿔놓지 않는다는 점이에요. 고칠 부분을 필수·권장·선택 등급으로 나누고, "왜 이렇게 고치면 좋은지" 이유와 함께 제안합니다. 받아들일지 말지는 언제나 사용자가 결정합니다. 고쳐주는 도구가 아니라, 곁에서 알려주는 코치에 가깝습니다.',
  },
  {
    q: '제가 쓴 메일 내용이 저장되나요? 안전한가요?',
    a: '메일 본문(원문)은 저장하지 않습니다. 교정이나 작성이 끝나면 입력하신 내용은 서버에 남기지 않아요.\n서비스 품질을 개선하기 위해, 동의하신 경우에 한해 메일 본문이 아닌 익명 처리된 사용 정보(예: 어떤 기능을 썼는지 같은 메타데이터)만 제한된 기간 동안 보관합니다. 동의는 언제든 철회할 수 있고, 어떤 경우에도 사용자의 내용을 제3자에게 판매하거나 광고에 활용하지 않습니다.',
  },
  {
    q: '무료인가요?',
    a: '네, 현재 베타 기간 동안 무료로 제공하며 사용 횟수 제한도 없습니다. 마음껏 써보세요. (서비스 안정성을 위한 기본적인 사용량 보호 장치는 적용됩니다.)\n정식 요금제가 도입될 때는 베타 사용자분들께 미리 안내해 드릴게요.',
  },
  {
    q: '어디서 사용할 수 있나요?',
    a: '브라우저 확장 프로그램을 설치하면 Gmail 작성창에서 바로 쓸 수 있고, 별도의 웹서비스에서도 이용할 수 있습니다.\n메일을 다른 창에 복사해 붙여넣을 필요 없이, 늘 쓰던 환경 그대로 자연스럽게 사용하시면 됩니다.',
  },
  {
    q: 'Grammarly 같은 문법 교정기와 뭐가 다른가요?',
    a: '문법 교정기는 주로 "문장이 맞느냐, 틀리느냐"를 봅니다. ToneFit은 한 걸음 더 나아가 "이 관계에서, 이 목적에 맞는 메일이냐"를 봅니다. 그래서 같은 문장도 받는 사람과 상황에 따라 다르게 제안해 드려요.\n또 하나, ToneFit은 그냥 고쳐주고 끝내지 않고 고친 이유를 함께 알려줍니다. 쓰면 쓸수록 "비즈니스 메일은 이렇게 쓰는 거구나"를 자연스럽게 익히게 되는 게 가장 큰 차이입니다.',
  },
];

const FaqItem = ({ q, a, index }: { q: string; a: string; index: number }) => {
  const [open, setOpen] = useState(index === 0);

  return (
    <div className="bg-background-surface border border-border-default rounded-[28px] shadow-[0px_4px_8px_rgba(124,77,255,0.14)] overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="w-full flex items-center gap-5 px-10 py-7 text-left"
      >
        <div className="bg-background-brand-subtle text-text-brand text-xl font-semibold leading-7 tracking-tight px-3 py-1.5 rounded-full min-w-13 text-center shrink-0">
          Q
        </div>
        <p className="flex-1 text-xl font-semibold leading-7 tracking-tight text-text-primary">
          {q}
        </p>
        <div
          className={`size-12 flex items-center justify-center shrink-0 transition-transform duration-200 ${open ? 'rotate-90' : ''}`}
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <path
              d="M9 6L15 12L9 18"
              stroke="var(--color-icon-tertiary, #9aa1b2)"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </button>

      {open && (
        <>
          <div className="h-px bg-[#e2e8f0] mx-10" />
          <div className="flex items-start gap-5 px-10 py-7">
            <div className="bg-background-brand text-text-inverse text-xl font-semibold leading-7 tracking-tight px-3 py-1.5 rounded-full min-w-13 text-center shrink-0">
              A
            </div>
            <p className="text-base font-normal leading-6 tracking-tight text-text-secondary whitespace-pre-line">
              {a}
            </p>
          </div>
        </>
      )}
    </div>
  );
};

const Faq = () => {
  return (
    <section id="faq" className="bg-background-surface rounded-4xl p-16">
      <div className="flex flex-col gap-18">
        <h2 className="text-4xl font-bold leading-11 tracking-tight text-text-primary">
          자주 묻는 질문
        </h2>
        <div className="flex flex-col gap-5">
          {FAQ_ITEMS.map((item, i) => (
            <FaqItem key={item.q} q={item.q} a={item.a} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Faq;
