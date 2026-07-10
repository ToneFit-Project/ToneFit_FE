import type { CSSProperties, ComponentType, ReactNode } from 'react';
import { ShaderGradient, ShaderGradientCanvas } from '@shadergradient/react';

// @shadergradient/react 타입이 React 18 기준이라 React 19와 충돌 — any 캐스팅으로 우회
const ShaderGradientAny = ShaderGradient as ComponentType<
  Record<string, unknown>
>;

export { ToneFitSoftPurpleAuroraHero as FeatureBeforeBg } from './BeforePurple';
export { ToneFitPurpleAuroraHero as FeatureAfterBg } from './AfterPurple';

export type MotionBackgroundTheme = 'purple' | 'blue' | 'yellow';

interface MotionBackgroundProps {
  theme?: MotionBackgroundTheme;
  children?: ReactNode;
  className?: string;
  style?: CSSProperties;
  radius?: CSSProperties['borderRadius'];
  minHeight?: CSSProperties['minHeight'];
}

const THEME_COLORS: Record<
  MotionBackgroundTheme,
  { bg: string; color1: string; color2: string; color3: string }
> = {
  purple: {
    bg: '#6D20FF',
    color1: '#6D20FF',
    color2: '#E3DAFF',
    color3: '#8F6AFF',
  },
  blue: {
    bg: '#76C8FF',
    color1: '#76C8FF',
    color2: '#DCF5FF',
    color3: '#2FADFF',
  },
  yellow: {
    bg: '#FFD075',
    color1: '#FFD075',
    color2: '#FFFBDE',
    color3: '#FFC64F',
  },
};

const MotionBackground = ({
  theme = 'purple',
  children,
  className,
  style,
  radius = 32,
  minHeight = 360,
}: MotionBackgroundProps) => {
  const { bg, color1, color2, color3 } = THEME_COLORS[theme];

  return (
    <div
      className={className}
      style={{
        overflow: 'hidden',
        width: '100%',
        minHeight,
        borderRadius: radius,
        background: bg,
        ...style,
      }}
    >
      <ShaderGradientCanvas
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
        }}
      >
        <ShaderGradientAny
          animate="on"
          brightness={1.2}
          cAzimuthAngle={180}
          cDistance={3.08}
          cPolarAngle={90}
          cameraZoom={1}
          color1={color1}
          color2={color2}
          color3={color3}
          destination="onCanvas"
          embedMode="off"
          envPreset="city"
          format="gif"
          fov={45}
          frameRate={10}
          gizmoHelper="hide"
          grain="off"
          lightType="3d"
          pixelDensity={1}
          positionX={-1.4}
          positionY={0}
          positionZ={0}
          range="disabled"
          rangeEnd={40}
          rangeStart={0}
          reflection={0.1}
          rotationX={0}
          rotationY={10}
          rotationZ={50}
          shader="defaults"
          type="waterPlane"
          uAmplitude={1}
          uDensity={1.3}
          uFrequency={5.5}
          uSpeed={0.1}
          uStrength={4}
          uTime={0}
          wireframe={false}
        />
      </ShaderGradientCanvas>

      <div style={{ position: 'relative', zIndex: 1 }}>{children}</div>
    </div>
  );
};

export default MotionBackground;
