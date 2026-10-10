'use client';

import { useEffect, useRef, useState } from 'react';

const SIZE = 232;
const CENTER = SIZE / 2;
const RADIUS = CENTER - 4;

type Props = {
  value: string;
  onChange: (color: string) => void;
};

export function ColorWheel({ value, onChange }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hoverColor, setHoverColor] = useState<string | null>(null);
  const previewColor = hoverColor ?? value;
  const { hue, saturation } = hexToHsl(previewColor);
  const radians = (hue * Math.PI) / 180;
  const markerX = CENTER + Math.cos(radians) * saturation * RADIUS;
  const markerY = CENTER - Math.sin(radians) * saturation * RADIUS;

  useEffect(() => {
    const context = canvasRef.current?.getContext('2d');
    if (!context) return;

    const image = context.createImageData(SIZE, SIZE);
    for (let y = 0; y < SIZE; y += 1) {
      for (let x = 0; x < SIZE; x += 1) {
        const dx = x - CENTER;
        const dy = CENTER - y;
        const distance = Math.hypot(dx, dy);
        if (distance > RADIUS) continue;

        const pointHue = ((Math.atan2(dy, dx) * 180) / Math.PI + 360) % 360;
        const pointSaturation = distance / RADIUS;
        const [red, green, blue] = hslToRgb(pointHue, pointSaturation);
        const offset = (y * SIZE + x) * 4;
        image.data[offset] = red;
        image.data[offset + 1] = green;
        image.data[offset + 2] = blue;
        image.data[offset + 3] = 255;
      }
    }

    context.putImageData(image, 0, 0);
  }, []);

  const colorAtPoint = (
    clientX: number,
    clientY: number,
    element: HTMLCanvasElement,
  ) => {
    const bounds = element.getBoundingClientRect();
    const x = ((clientX - bounds.left) / bounds.width) * SIZE;
    const y = ((clientY - bounds.top) / bounds.height) * SIZE;
    const dx = x - CENTER;
    const dy = CENTER - y;
    const distance = Math.hypot(dx, dy);
    const scale = distance > RADIUS ? RADIUS / distance : 1;
    const boundedX = dx * scale;
    const boundedY = dy * scale;
    const pickedHue =
      ((Math.atan2(boundedY, boundedX) * 180) / Math.PI + 360) % 360;
    const pickedSaturation = Math.min(distance, RADIUS) / RADIUS;
    return hslToHex(pickedHue, pickedSaturation);
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative size-56 shrink-0">
        <canvas
          ref={canvasRef}
          width={SIZE}
          height={SIZE}
          aria-label="Color wheel. Move over or drag to choose hue and saturation. Use left and right arrows for hue, up and down for saturation."
          className="size-full touch-none cursor-crosshair rounded-full"
          onPointerDown={(event) => {
            event.currentTarget.setPointerCapture(event.pointerId);
            const pickedColor = colorAtPoint(
              event.clientX,
              event.clientY,
              event.currentTarget,
            );
            setHoverColor(pickedColor);
            onChange(pickedColor);
          }}
          onPointerMove={(event) => {
            if (event.pointerType === 'mouse' || event.buttons > 0) {
              const pickedColor = colorAtPoint(
                event.clientX,
                event.clientY,
                event.currentTarget,
              );
              setHoverColor(pickedColor);
              if (event.buttons > 0) onChange(pickedColor);
            }
          }}
          onPointerLeave={() => setHoverColor(null)}
          onKeyDown={(event) => {
            if (!event.key.startsWith('Arrow')) return;
            event.preventDefault();
            const nextHue =
              (hue +
                (event.key === 'ArrowRight'
                  ? 5
                  : event.key === 'ArrowLeft'
                    ? -5
                    : 0) +
                360) %
              360;
            const nextSaturation = Math.max(
              0,
              Math.min(
                1,
                saturation +
                  (event.key === 'ArrowUp'
                    ? 0.05
                    : event.key === 'ArrowDown'
                      ? -0.05
                      : 0),
              ),
            );
            setHoverColor(null);
            onChange(hslToHex(nextHue, nextSaturation));
          }}
          tabIndex={0}
        />
        <span
          className="pointer-events-none absolute size-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow-[0_1px_4px_rgba(0,0,0,0.65)]"
          style={{
            left: `${(markerX / SIZE) * 100}%`,
            top: `${(markerY / SIZE) * 100}%`,
          }}
          aria-hidden
        />
      </div>
      <output className="font-mono text-xs uppercase text-slate-600">
        {previewColor}
      </output>
    </div>
  );
}

function hslToRgb(hue: number, saturation: number): [number, number, number] {
  const chroma = saturation;
  const intermediate = chroma * (1 - Math.abs(((hue / 60) % 2) - 1));
  const match = 0.5 - chroma / 2;
  let rgb: [number, number, number];

  if (hue < 60) rgb = [chroma, intermediate, 0];
  else if (hue < 120) rgb = [intermediate, chroma, 0];
  else if (hue < 180) rgb = [0, chroma, intermediate];
  else if (hue < 240) rgb = [0, intermediate, chroma];
  else if (hue < 300) rgb = [intermediate, 0, chroma];
  else rgb = [chroma, 0, intermediate];

  return rgb.map((channel) => Math.round((channel + match) * 255)) as [
    number,
    number,
    number,
  ];
}

function hslToHex(hue: number, saturation: number) {
  return `#${hslToRgb(hue, saturation)
    .map((channel) => channel.toString(16).padStart(2, '0'))
    .join('')}`;
}

function hexToHsl(hex: string) {
  const channels = hex
    .match(/[\da-f]{2}/gi)
    ?.map((channel) => parseInt(channel, 16) / 255);
  if (!channels || channels.length < 3) return { hue: 0, saturation: 0 };

  const [red, green, blue] = channels;
  const max = Math.max(red, green, blue);
  const min = Math.min(red, green, blue);
  const delta = max - min;
  let hue = 0;

  if (delta !== 0) {
    if (max === red) hue = 60 * (((green - blue) / delta) % 6);
    else if (max === green) hue = 60 * ((blue - red) / delta + 2);
    else hue = 60 * ((red - green) / delta + 4);
  }

  const lightness = (max + min) / 2;
  const saturation =
    delta === 0 ? 0 : delta / (1 - Math.abs(2 * lightness - 1));
  return { hue: (hue + 360) % 360, saturation };
}
