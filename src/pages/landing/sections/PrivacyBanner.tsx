import { ButtonLongV2 } from '@/components/ui';
import { ROUTES } from '@/constants';

const PrivacyBanner = () => {
  return (
    <section id="privacy">
      <div className="bg-background-inverse rounded-3xl py-20 flex flex-col items-center gap-12">
        <div className="flex flex-col gap-7 items-center">
          <p className="text-xl font-semibold leading-7 tracking-tight text-text-inverse">
            보안 · 개인정보
          </p>
          <h2 className="text-4xl font-bold leading-11 tracking-tight text-text-inverse text-center max-w-3xl">
            사용자가 작성한 이메일은 서버에 저장하지 않습니다.
          </h2>
        </div>
        <ButtonLongV2
          href={ROUTES.PRIVACY}
          target="_blank"
          variant="secondary"
          layout="label-icon"
          className="max-w-34"
        >
          자세히 보기{' '}
        </ButtonLongV2>
      </div>
    </section>
  );
};

export default PrivacyBanner;
