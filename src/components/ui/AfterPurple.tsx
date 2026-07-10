'use client';

import type { CSSProperties, ComponentType, ReactNode } from 'react';
import { ShaderGradient, ShaderGradientCanvas } from '@shadergradient/react';

// @shadergradient/react 타입이 React 18 기준이라 React 19와 충돌 — any 캐스팅으로 우회
const ShaderGradientAny = ShaderGradient as ComponentType<
  Record<string, unknown>
>;

type ToneFitPurpleAuroraHeroProps = {
  children?: ReactNode;
  className?: string;
  style?: CSSProperties;
  radius?: number | string;
  minHeight?: number | string;
};

export function ToneFitPurpleAuroraHero({
  children,
  className,
  style,
  radius = 32,
  minHeight = 420,
}: ToneFitPurpleAuroraHeroProps) {
  return (
    <section
      className={className}
      style={{
        position: 'relative',
        overflow: 'hidden',
        borderRadius: radius,
        minHeight,
        background: '#6D20FF',
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
          cAzimuthAngle={195}
          cDistance={5.07}
          cPolarAngle={88}
          cameraZoom={1}
          color1="#6D20FF"
          color2="#E3DAFF"
          color3="#8F6AFF"
          destination="onCanvas"
          embedMode="off"
          envPreset="city"
          format="gif"
          fov={30}
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
          uDensity={1}
          uFrequency={5.5}
          uSpeed={0.02}
          uStrength={4}
          uTime={0}
          wireframe={false}
        />
      </ShaderGradientCanvas>

      <div style={{ position: 'relative', zIndex: 1 }}>{children}</div>
    </section>
  );
}

export default ToneFitPurpleAuroraHero;
