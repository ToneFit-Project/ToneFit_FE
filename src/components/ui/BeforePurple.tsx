'use client';

import type { CSSProperties, ReactNode } from 'react';
import { ShaderGradient, ShaderGradientCanvas } from '@shadergradient/react';

type ToneFitSoftPurpleAuroraHeroProps = {
  children?: ReactNode;
  className?: string;
  style?: CSSProperties;
  radius?: number | string;
  minHeight?: number | string;
};

export function ToneFitSoftPurpleAuroraHero({
  children,
  className,
  style,
  radius = 32,
  minHeight = 420,
}: ToneFitSoftPurpleAuroraHeroProps) {
  return (
    <section
      className={className}
      style={{
        position: 'relative',
        overflow: 'hidden',
        borderRadius: radius,
        minHeight,
        background: '#F4F0FF',
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
        <ShaderGradient
          animate="on"
          axesHelper="off"
          brightness={1.2}
          cAzimuthAngle={-195}
          cDistance={5.07}
          cPolarAngle={102}
          cameraZoom={1}
          color1="#F4F0FF"
          color2="#E3DAFF"
          color3="#C2AFFF"
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

export default ToneFitSoftPurpleAuroraHero;
