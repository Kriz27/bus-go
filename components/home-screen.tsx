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
  { label: 'Reserved', src: '/bus-go/images/reserved.png' },
  { label: 'Unreserved', src: '/bus-go/images/unreserved.png' },
  { label: 'Platform', src: '/bus-go/images/busstop.png' },
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
    icon: { src: '/bus-go/images/seat-layout.png' },
    color: 'text-blue-700',
    tile: 'bg-sky-100',
  },
  {
    label: 'Track Your Train',
    icon: { src: '/bus-go/images/track-bus.png' },
    color: 'text-amber-400',
    tile: 'bg-orange-50',
  },
  {
    label: 'Order Food',
    icon: { src: '/bus-go/images/order-food.svg' },
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
    icon: { src: '/bus-go/images/waves.png' },
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
  onManageStations: () => void;
};

export function HomeScreen({
  profileName,
  upcomingTicket,
  onViewTicket,
  onNavigateBookings,
  onOpenProfile,
  onManageStations,
}: HomeScreenProps) {
  return (
    <div className="flex h-full flex-col font-display">
      <header className="flex items-center justify-between px-5 pb-2 pt-5">
        <span className="text-blue-600" aria-label="Change language">
          <Languages className="size-6" />
        </span>
        <h1 className="relative h-9 w-32">
          <Image
            src="/bus-go/images/logo.jpg"
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
        <button
          type="button"
          onClick={onManageStations}
          className="flex flex-col items-center gap-1"
        >
          <Menu className="size-6 text-sky-200" />
          <span className="text-sm text-sky-100">Menu</span>
        </button>
      </nav>
    </div>
  );
}

function UpcomingJourneyCard({
  ticket,
  onView,
}: {
  ticket: TicketData;
  onView: () => void;
}) {
  return (
    <div className="mx-auto mt-4 w-[92%]">
      <article className="relative overflow-hidden rounded-xl border border-amber-300 bg-white text-slate-800 shadow-sm">
        <div className="h-2" style={{ backgroundColor: ticket.color }} />
        <div className="px-4 pb-3 pt-2.5">
          <p className="font-sans text-xs text-slate-500">
            {formatShortDate(ticket.bookedAt)}
          </p>
          <div className="mt-3 flex items-center justify-between gap-3 text-[13px] font-semibold uppercase">
            <span className="truncate">{ticket.from.name}</span>
            <span className="shrink-0 font-sans text-[11px] font-normal text-slate-400">
              {ticket.distanceKm} km
            </span>
            <span className="truncate text-right">{ticket.to.name}</span>
          </div>
        </div>
        <div className="relative border-t border-dashed border-amber-200">
          <span
            className="absolute -left-3 -top-3 size-6 rounded-full border border-amber-200 bg-white [clip-path:inset(0_0_0_50%)]"
            aria-hidden
          />
          <span
            className="absolute -right-3 -top-3 size-6 rounded-full border border-amber-200 bg-white [clip-path:inset(0_50%_0_0)]"
            aria-hidden
          />
        </div>
        <div className="flex items-center gap-2 px-3 py-2.5">
          <span className="mr-auto text-xs font-semibold text-green-700">
            Unreserved
          </span>
          <span className="whitespace-nowrap text-xs font-semibold text-blue-700">
            Book Again
          </span>
          <button
            type="button"
            onClick={onView}
            className="whitespace-nowrap rounded-md px-2 py-1 text-xs font-semibold text-blue-700 transition-colors hover:bg-blue-50 focus-visible:outline-2 focus-visible:outline-blue-600"
          >
            View Details
          </button>
        </div>
        <div className="h-2" style={{ backgroundColor: ticket.color }} />
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
