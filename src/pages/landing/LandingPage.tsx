import LandingHeader from './sections/LandingHeader';
import Hero from './sections/Hero';
import PainPoint from './sections/PainPoint';
import FeatureList from './sections/FeatureList';
import FeatureSection from './sections/FeatureSection';
import DemoSection from './sections/DemoSection';
import PrivacyBanner from './sections/PrivacyBanner';
import Faq from './sections/Faq';
import Footer from '@/components/layout/Footer';

const LandingPage = () => {
  return (
    <div
      className="min-h-screen min-w-420"
      style={{
        background:
          'linear-gradient(140deg, #FFF 0%, #F1ECFF 90.7%), var(--color-background-page)',
      }}
    >
      <LandingHeader />
      <main className="px-3.5 pb-11 flex flex-col gap-18 max-w-480 mx-auto">
        <Hero />
        <PainPoint />
        <FeatureList />

        <FeatureSection />

        <DemoSection />

        <PrivacyBanner />

        <Faq />
      </main>
      <Footer />
    </div>
  );
};

export default LandingPage;
