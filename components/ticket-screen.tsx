'use client';

import { useEffect, useState } from 'react';
import { ArrowLeft, Split } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import {
  formatLongDateTime,
  formatNumericDateTime,
  formatVia,
  type Profile,
  type Ticket,
} from '@/lib/tickets';

const PREVIEW_SECONDS = 5 * 60;
const GSTIN = 'IR:29AAAGM0289C1ZF';

const DIAMOND_COLUMNS = 9;
const DIAMOND_ROWS = 3;
const DIAMOND_SIZE = 100;
const PATTERN_WIDTH = 8.5 * DIAMOND_SIZE;
const PATTERN_HEIGHT = 2.5 * DIAMOND_SIZE;

const diamonds = Array.from(
  { length: DIAMOND_COLUMNS * DIAMOND_ROWS },
  (_, i) => {
    const cx = (i % DIAMOND_COLUMNS) * DIAMOND_SIZE + DIAMOND_SIZE / 2;
    const cy = Math.floor(i / DIAMOND_COLUMNS) * DIAMOND_SIZE;
    const h = DIAMOND_SIZE / 2;
    return `${cx},${cy - h} ${cx + h},${cy} ${cx},${cy + h} ${cx - h},${cy}`;
  },
);

const pad2 = (n: number) => String(n).padStart(2, '0');

type Props = {
  ticket: Ticket;
  profile: Profile;
  onBack: () => void;
};

export function TicketScreen({ ticket, profile, onBack }: Props) {
  const [remaining, setRemaining] = useState(PREVIEW_SECONDS);

  useEffect(() => {
    const id = setInterval(
      () => setRemaining((s) => (s > 0 ? s - 1 : 0)),
      1000,
    );
    return () => clearInterval(id);
  }, []);

  const previous =
    remaining < PREVIEW_SECONDS && remaining > 0 ? remaining + 1 : remaining;
  const progress = ((PREVIEW_SECONDS - remaining) / PREVIEW_SECONDS) * 100;
  const validTill = new Date(ticket.bookedAt.getTime() + 3 * 60 * 60 * 1000);
  const passengers = `${ticket.adults} Adult, ${ticket.children} Child`;
  const fareLine = `SECOND | ${
    ticket.serviceType
  } | JOURNEY | ₹${ticket.amount.toFixed(2)}`;
  const via = formatVia(ticket.via);
  const qrValue = [
    ticket.id,
    ticket.serviceCode,
    `${ticket.from.name}(${ticket.from.code})`,
    `${ticket.to.name}(${ticket.to.code})`,
    via,
    passengers,
    fareLine,
    formatNumericDateTime(ticket.bookedAt),
    formatNumericDateTime(validTill),
    profile.phone,
    GSTIN,
  ].join('|');

  return (
    <div className="flex h-full flex-col font-display">
      <header className="flex items-center gap-4 bg-blue-600 px-5 py-3 text-white">
        <button
          type="button"
          onClick={onBack}
          aria-label="Back"
          className="flex size-10 items-center justify-center rounded-full border-2 border-white"
        >
          <ArrowLeft className="size-5" />
        </button>
        <div>
          <h1 className="text-xl font-bold leading-tight">Booking Details</h1>
          <p className="font-sans text-sm text-sky-100">{`Mobile: ${profile.phone}`}</p>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto bg-gray-200">
        <p className="bg-white px-6 py-4 font-sans text-sm text-slate-400">{`Thank You ${profile.name}, Happy Journey !`}</p>

        <article className="relative mx-3 mt-4 rounded-xl bg-white shadow-[0_1px_6px_rgba(15,23,42,0.08)]">
          <div
            className="h-3 rounded-t-xl"
            style={{ backgroundColor: ticket.color }}
            aria-hidden
          />

          <section
            aria-label="Dynamic ticket preview"
            className="relative flex bg-[#1c1c1c] text-white"
          >
            <svg
              className="pointer-events-none absolute inset-0 size-full"
              viewBox={`0 0 ${PATTERN_WIDTH} ${PATTERN_HEIGHT}`}
              preserveAspectRatio="none"
              aria-hidden
            >
              {diamonds.map((points) => (
                <polygon
                  key={points}
                  points={points}
                  fill="rgba(255,255,255,0.03)"
                />
              ))}
            </svg>
            <SideBrand text="INDIAN RAILWAYS" side="left" />
            <div className="relative flex min-w-0 flex-1 flex-col items-center px-1 py-1.5 text-center leading-tight">
              <p className="text-base font-semibold pb-1.5">
                Dynamic preview will close in
              </p>
              <p
                className="grid grid-cols-[2.5ch_0.55ch_2.5ch] justify-center text-[2.6rem] font-bold leading-none tabular-nums text-[#ff2a1a]"
                aria-label={`${pad2(Math.floor(remaining / 60))} minutes ${pad2(
                  remaining % 60,
                )} seconds`}
              >
                <RollingDigits
                  value={pad2(Math.floor(remaining / 60))}
                  previous={pad2(Math.floor(previous / 60))}
                />
                <span className="text-center" aria-hidden>
                  :
                </span>
                <RollingDigits
                  value={pad2(remaining % 60)}
                  previous={pad2(previous % 60)}
                />
              </p>
              <p className="mt-1 text-gray-400 text-[13px] mb-1">
                Ticket Booking Date &amp; Time
              </p>
              <p className="text-[28px] font-semibold text-[#fc870a]">
                {formatLongDateTime(ticket.bookedAt)}
              </p>
              <p className="text-[13px] pt-1">{ticket.serviceCode}</p>
              <p className="text-[13px] pt-1">Ticket is Non-Transferable</p>
            </div>
            <SideBrand text="भारतीय रेल" side="right" hindi />
          </section>

          <div
            role="progressbar"
            aria-label="Dynamic preview time remaining"
            aria-valuemin={0}
            aria-valuemax={PREVIEW_SECONDS}
            aria-valuenow={remaining}
            className="h-1 w-full bg-slate-100"
          >
            <div
              className="h-full transition-[width] duration-1000 ease-linear"
              style={{ width: `${progress}%`, backgroundColor: ticket.color }}
            />
          </div>

          {ticket.active ? (
            <ActiveDetails ticket={ticket} via={via} passengers={passengers} />
          ) : (
            <InactiveDetails
              ticket={ticket}
              via={via}
              passengers={passengers}
              fareLine={fareLine}
              validTill={validTill}
            />
          )}

          <div className="relative mt-4 h-6" aria-hidden>
            <span className="absolute -left-3 top-0 size-6 rounded-full bg-gray-200 shadow-[inset_-2px_0_3px_rgba(15,23,42,0.08)]" />
            {ticket.active && (
              <span className="absolute inset-x-4 top-1/2 border-t border-dashed border-slate-100" />
            )}
            <span className="absolute -right-3 top-0 size-6 rounded-full bg-gray-200 shadow-[inset_2px_0_3px_rgba(15,23,42,0.08)]" />
          </div>

          <p className="px-3 pb-4 pt-1 text-xs text-slate-800">
            *Valid for start of journey within 3 hour or until departure of the
            first train.
          </p>

          <div
            className="h-4 rounded-b-xl"
            style={{ backgroundColor: ticket.color }}
            aria-hidden
          />
        </article>

        <p className="mx-3 mt-5 rounded-xl bg-rose-50 px-3 py-1 text-center font-sans text-[12px] text-red-500">
          Note: This ticket is non refundable. Ticket is stored locally on the
          device. Please do not change your handset or perform factory reset.
        </p>

        <div className="px-4 py-6">
          <button
            type="button"
            className="w-full rounded-full border border-blue-700 bg-white py-3.5 font-medium text-blue-800"
          >
            Book Connecting Journey
          </button>
        </div>

        <div className="flex justify-center bg-white py-8">
          <QRCodeSVG
            value={qrValue}
            size={230}
            level="H"
            marginSize={0}
            title={`QR code for ticket ${ticket.id}`}
          />
        </div>

        <section
          aria-labelledby="do-you-know"
          className="mt-6 bg-white px-6 pb-10 pt-6"
        >
          <h2 id="do-you-know" className="text-lg font-semibold text-slate-900">
            Do you know?
          </h2>
          <div className="mt-1 flex flex-col gap-2  leading-relaxed text-slate-500 text-[14px]">
            <p>IR recovers only 57% of cost of travel on an average.</p>
            <p>
              This ticket is booked on a personal user ID. It's sale/purchase is
              an offence u/s 143 of the Railways Act,1989
            </p>
            <p>For enquiry and integrated bus helpline, please dial 139.</p>
          </div>
        </section>
      </main>
    </div>
  );
}

function RollingDigits({
  value,
  previous,
}: {
  value: string;
  previous: string;
}) {
  const changed = value !== previous;
  return (
    <span
      className="relative block h-[1.05em] w-[2.5ch] overflow-hidden text-center"
      aria-hidden
    >
      <span
        key={`in-${value}`}
        className={`block ${changed ? 'animate-roll-in' : ''}`}
      >
        {value}
      </span>
      {changed && (
        <span
          key={`out-${previous}`}
          className="absolute inset-0 block animate-roll-out"
        >
          {previous}
        </span>
      )}
    </span>
  );
}

type DetailsProps = {
  ticket: Ticket;
  via: string;
  passengers: string;
};

function ActiveDetails({ ticket, via, passengers }: DetailsProps) {
  const rows: [string, string, string, string][] = [
    ['Source', ticket.from.name, 'Destination', ticket.to.name],
    ['Distance', `${ticket.distanceKm} km`, 'Passenger', passengers],
    ['Ticket Type', 'JOURNEY', 'Train Types', ticket.serviceType],
    ['Class', 'SECOND', 'Fare', `₹${ticket.amount.toFixed(2)}`],
  ];

  return (
    <div className="px-2.5 pt-2 font-roboto text-slate-800">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[12px] font-medium tracking-wide text-slate-500">
            Journey Ticket
          </p>
          <p className="text-[13px] text-base font-bold tracking-wide">
            {ticket.id}
          </p>
        </div>
        <span className="mt-1 inline-flex items-center gap-1.5 rounded-full bg-green-100 px-3 py-1 text-[12px] font-bold tracking-wide text-green-600">
          <span className="size-1.5 rounded-full bg-green-500" aria-hidden />
          ACTIVE
        </span>
      </div>

      <dl className="mt-2 flex flex-col gap-2">
        {rows.map(([leftLabel, leftValue, rightLabel, rightValue]) => (
          <div key={leftLabel} className="flex justify-between gap-3">
            <div className="min-w-0">
              <dt className="text-[12px] font-medium tracking-wide text-slate-500">
                {leftLabel}
              </dt>
              <dd className="text-[13px] text-base font-bold">{leftValue}</dd>
            </div>
            <div className="min-w-0 text-right">
              <dt className="text-[12px] font-medium tracking-wide text-slate-500">
                {rightLabel}
              </dt>
              <dd className="text-[13px] text-base font-bold">{rightValue}</dd>
            </div>
          </div>
        ))}
      </dl>

      <div className="mt-3 flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50/60 px-4 py-2.5 text-[12px] font-medium">
        <Split className="size-4 rotate-90 text-slate-700" aria-hidden />
        <span>{`Via: ${via}`}</span>
      </div>

      <p className="mt-3 font-display text-[12px]">{GSTIN}</p>
    </div>
  );
}

function InactiveDetails({
  ticket,
  via,
  passengers,
  fareLine,
  validTill,
}: DetailsProps & { fareLine: string; validTill: Date }) {
  return (
    <div className="px-3.5 pt-3 text-[13px] leading-snug text-slate-800">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-medium">Journey Ticket</h2>
        <span className="text-sm font-bold tracking-wide">{ticket.id}</span>
      </div>

      <div className="mt-3.5 flex items-center justify-between gap-1.5 whitespace-nowrap font-medium">
        <span>{ticket.from.name}</span>
        <span className="shrink-0 font-sans text-[11px] text-slate-500">{`—${ticket.distanceKm} km—`}</span>
        <span className="text-right">{ticket.to.name}</span>
      </div>

      <div className="mt-2.5 flex justify-between">
        <div>
          <p className="font-medium text-slate-500">Via</p>
          <p className="font-semibold">{via}</p>
        </div>
        <div className="text-right">
          <p className="font-medium text-slate-500">Passenger</p>
          <p className="font-semibold">{passengers}</p>
        </div>
      </div>

      <div className="mt-2.5 flex justify-between">
        <div>
          <p className="font-medium text-slate-500">Booked on</p>
          <p className="font-semibold">
            {formatNumericDateTime(ticket.bookedAt)}
          </p>
        </div>
        <div className="text-right">
          <p className="font-medium text-slate-500">*Valid Till</p>
          <p className="font-semibold">{formatNumericDateTime(validTill)}</p>
        </div>
      </div>

      <p className="mt-2.5 whitespace-nowrap text-[12.5px] font-semibold">
        {fareLine}
      </p>
      <p className="font-medium">{GSTIN}</p>
    </div>
  );
}

/*function SideBrand({ text, side }: { text: string; side: 'left' | 'right' }) {
  return (
    <div
      className={`relative flex w-7 shrink-0 items-center justify-center border-dashed border-white/80  ${
        side === 'left' ? 'border-r-2' : 'border-l-2'
      }`}
    >
      <span className="rotate-180 whitespace-nowrap text-[13px] font-bold tracking-wider text-neutral-300 [writing-mode:vertical-rl]">
        {text}
      </span>
    </div>
  );
}
*/
function SideBrand({
  text,
  side,
  hindi = false,
}: {
  text: string;
  side: 'left' | 'right';
  hindi?: boolean;
}) {
  return (
    <div className="relative flex w-7 shrink-0 items-center justify-center">
      <span
        className={`absolute inset-y-0 w-[2px] ${
          side === 'left' ? 'right-0' : 'left-0'
        }`}
        style={{
          backgroundImage:
            'repeating-linear-gradient(to bottom, rgba(255,255,255,.8) 0 4px, transparent 4px 8px)',
        }}
        aria-hidden
      />
      <span
        className={`rotate-180 whitespace-nowrap font-bold text-gray-500 [writing-mode:vertical-rl] ${
          hindi
            ? `font-hindi text-[17px] leading-normal tracking-normal ${
                side === 'right' ? 'ml-1.5' : 'mr-1.5'
              }`
            : 'text-[13px] leading-none tracking-wider'
        }`}
      >
        {text}
      </span>
    </div>
  );
}
