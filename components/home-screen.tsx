import Image from 'next/image';
import {
  Bell,
  Languages,
  Route,
  ScanLine,
  ReceiptText,
  HeartHandshake,
  House,
  Ticket,
  User,
  Menu,
  type LucideIcon,
} from 'lucide-react';
import { formatShortDate, type Ticket as TicketData } from '@/lib/tickets';

const planner = [
  { label: 'Reserved', src: '/busgo/images/reserved.png' },
  { label: 'Unreserved', src: '/busgo/images/unreserved.png' },
  { label: 'Platform', src: '/busgo/images/busstop.png' },
];

type Offering = {
  label: string;
  icon: LucideIcon | { src: string };
  color: string;
  tile?: string;
};

const offerings: Offering[] = [
  {
    label: 'Search Trains',
    icon: Route,
    color: 'text-pink-500',
    tile: 'bg-pink-100',
  },
  {
    label: 'PNR Status',
    icon: ScanLine,
    color: 'text-green-700',
    tile: 'bg-green-100',
  },
  {
    label: 'Seat Layout',
    icon: { src: '/busgo/images/seat-layout.png' },
    color: 'text-blue-700',
    tile: 'bg-sky-100',
  },
  {
    label: 'Track Your Train',
    icon: { src: '/busgo/images/track-bus.png' },
    color: 'text-amber-400',
    tile: 'bg-orange-50',
  },
  {
    label: 'Order Food',
    icon: { src: '/busgo/images/order-food.svg' },
    color: 'text-indigo-700',
    tile: 'bg-indigo-100',
  },
  {
    label: 'File Refund',
    icon: ReceiptText,
    color: 'text-slate-900',
    tile: 'bg-slate-200',
  },
  {
    label: 'Bus Help',
    icon: HeartHandshake,
    color: 'text-red-500',
    tile: 'bg-red-100',
  },
  {
    label: 'Go To Offers',
    icon: { src: '/busgo/images/waves.png' },
    color: 'text-white',
    tile: 'bg-gray-500',
  },
];

function OfferingIcon({ icon, color }: Pick<Offering, 'icon' | 'color'>) {
  if ('src' in icon) {
    const mask = `url(${icon.src}) center / contain no-repeat`;
    return (
      <span
        aria-hidden
        className={`size-9 bg-current ${color}`}
        style={{ mask, WebkitMask: mask }}
      />
    );
  }
  const Icon = icon;
  return <Icon className={`size-8 ${color}`} strokeWidth={2} />;
}

type HomeScreenProps = {
  profileName: string;
  upcomingTicket: TicketData | null;
  onViewTicket: (ticket: TicketData) => void;
  onNavigateBookings: () => void;
  onOpenProfile: () => void;
};

export function HomeScreen({
  profileName,
  upcomingTicket,
  onViewTicket,
  onNavigateBookings,
  onOpenProfile,
}: HomeScreenProps) {
  return (
    <div className="flex h-full flex-col font-display">
      <header className="flex items-center justify-between px-5 pb-2 pt-5">
        <span className="text-blue-600" aria-label="Change language">
          <Languages className="size-6" />
        </span>
        <h1 className="relative h-9 w-32">
          <Image
            src="/busgo/images/logo.jpg"
            alt="Your App Name"
            fill
            sizes="128px"
            priority
            className="object-contain"
          />
        </h1>

        <span className="relative text-slate-600" aria-label="6 notifications">
          <Bell className="size-6" />
          <span className="absolute -right-1.5 -top-1.5 flex size-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
            6
          </span>
        </span>
      </header>

      <main className="flex-1 overflow-y-auto px-3 pb-6">
        <p className="mt-4 font-sans text-sm text-slate-800">{`Hi, ${profileName}!`}</p>

        <h2 className="mt-4 text-lg font-bold text-blue-950">
          Journey Planner
        </h2>
        <div className="mt-2 grid grid-cols-3 gap-3">
          {planner.map((item) => (
            <div key={item.label} className="flex flex-col items-center gap-1">
              <div className="relative aspect-[6/5] w-full overflow-hidden rounded-2xl shadow-sm">
                <Image
                  src={item.src}
                  alt=""
                  fill
                  sizes="130px"
                  className="object-cover"
                />
              </div>
              <span className="font-sans text-[15px] text-slate-600">
                {item.label}
              </span>
            </div>
          ))}
        </div>

        <h2 className="mt-5 text-lg font-bold text-blue-950">More Offerings</h2>
        <div className="mt-4 grid grid-cols-4 gap-y-5">
          {offerings.map(({ label, icon, color, tile }) => (
            <div
              key={label}
              className="flex flex-col items-center gap-2 text-center"
            >
              <div
                className={`flex aspect-[7/6] w-[74%] items-center justify-center rounded-2xl ${
                  tile ?? ''
                }`}
              >
                <OfferingIcon icon={icon} color={color} />
              </div>
              <span className="w-full font-sans text-sm leading-tight text-slate-700">
                {label}
              </span>
            </div>
          ))}
        </div>

        <h2 className="mt-7 text-lg font-bold text-blue-950">
          Upcoming Journey
        </h2>
        {upcomingTicket ? (
          <UpcomingJourneyCard
            ticket={upcomingTicket}
            onView={() => onViewTicket(upcomingTicket)}
          />
        ) : (
          <p className="mt-4 text-center text-sm text-slate-400">
            No upcoming journeys.
          </p>
        )}
      </main>

      <nav
        className="grid grid-cols-4 bg-blue-600 pb-4 pt-3 text-white"
        aria-label="Main"
      >
        <TabItem icon={House} label="Home" active />
        <button
          type="button"
          onClick={onNavigateBookings}
          className="flex flex-col items-center gap-1"
        >
          <Ticket className="size-6 text-sky-200" />
          <span className="text-sm text-sky-100">My Bookings</span>
        </button>
        <button
          type="button"
          onClick={onOpenProfile}
          className="flex flex-col items-center gap-1"
        >
          <User className="size-6 text-sky-200" />
          <span className="text-sm text-sky-100">You</span>
        </button>
        <TabItem icon={Menu} label="Menu" />
      </nav>
    </div>
  );
}

const TICKET_NOTCH_MASK =
  'radial-gradient(circle 10px at calc(100% - 4.75rem) 0, transparent 9.5px, #000 10px), radial-gradient(circle 10px at calc(100% - 4.75rem) 100%, transparent 9.5px, #000 10px)';

function UpcomingJourneyCard({
  ticket,
  onView,
}: {
  ticket: TicketData;
  onView: () => void;
}) {
  return (
    <div className="mx-auto mt-4 w-[88%] drop-shadow-[0_6px_10px_rgba(88,60,200,0.25)]">
      <article
        className="rounded-2xl bg-[linear-gradient(100deg,#3b45dc_0%,#6a4be6_40%,#b46ae2_75%,#efa3e8_100%)] px-3 pb-4 pt-5 text-white"
        style={{
          mask: TICKET_NOTCH_MASK,
          WebkitMask: TICKET_NOTCH_MASK,
          maskComposite: 'intersect',
          WebkitMaskComposite: 'source-in',
        }}
      >
        <p className="text-xs">{formatShortDate(ticket.bookedAt)}</p>
        <div className="mb-2.5 mt-3 h-px bg-white/60" />
        <div className="flex justify-between gap-3 text-[11px] uppercase">
          <span className="truncate">{ticket.from.name}</span>
          <span className="truncate text-right">{ticket.to.name}</span>
        </div>
        <div className="mb-2.5 mt-2.5 h-px bg-white/60" />
        <div className="flex items-center gap-1 whitespace-nowrap">
          <span className="mr-auto text-[13px] font-semibold text-green-300">
            Unreserved
          </span>
          <span className="rounded-full border-[1.5px] border-white bg-[#b952d9] px-2 py-0.5 text-[10px] ">
            Book Again
          </span>
          <button
            type="button"
            onClick={onView}
            className="rounded-full border-[1.5px] border-white bg-[#3a2b9e] px-2.5 py-0.5 text-[10px] transition-colors hover:bg-[#2d217d] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            View Details
          </button>
        </div>
      </article>
    </div>
  );
}

function TabItem({
  icon: Icon,
  label,
  active,
}: {
  icon: LucideIcon;
  label: string;
  active?: boolean;
}) {
  return (
    <div
      className="flex flex-col items-center gap-1"
      aria-current={active ? 'page' : undefined}
    >
      <Icon className={`size-6 ${active ? 'text-white' : 'text-sky-200'}`} />
      <span className={`text-sm ${active ? 'font-bold' : 'text-sky-100'}`}>
        {label}
      </span>
    </div>
  );
}
