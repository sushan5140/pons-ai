import {
  BedDouble,
  MapPin,
  Images,
  Plane,
  Receipt,
  ShoppingBag,
  TrainFront,
  UtensilsCrossed,
} from "lucide-react";
import { cn } from "@/lib/utils";

export type ScreenshotKind =
  | "flight"
  | "hotel"
  | "train"
  | "restaurant"
  | "shopping"
  | "maps"
  | "receipt"
  | "photos";

export interface ScreenshotDetail {
  route?: string;
  gate?: string;
  seat?: string;
  dates?: string;
  room?: string;
  items?: { name: string; price: string }[];
  total?: string;
  meta?: string;
}

const KIND_ICON: Record<ScreenshotKind, typeof Plane> = {
  flight: Plane,
  hotel: BedDouble,
  train: TrainFront,
  restaurant: UtensilsCrossed,
  shopping: ShoppingBag,
  maps: MapPin,
  receipt: Receipt,
  photos: Images,
};

function FlightBody({ route, gate, seat }: { route: string; gate: string; seat: string }) {
  return (
    <div className="px-3 py-2.5">
      <div className="flex items-center justify-between">
        <span className="font-mono text-[13px] font-semibold text-ink">{route}</span>
        <Plane className="h-3 w-3 text-accent-hover" strokeWidth={2} />
      </div>
      <div className="mt-2 flex items-center gap-2 text-[10px] text-secondary">
        <span>Gate {gate}</span>
        <span className="text-ink/20">·</span>
        <span>Seat {seat}</span>
      </div>
      <div className="mt-2 flex gap-0.5">
        {Array.from({ length: 14 }).map((_, i) => (
          <span
            key={i}
            className="h-2.5 w-[2px] shrink-0 bg-ink/15"
            style={{ opacity: i % 3 === 0 ? 0.35 : 0.15 }}
          />
        ))}
      </div>
    </div>
  );
}

function HotelBody({ dates, room }: { dates: string; room: string }) {
  return (
    <div className="px-3 py-2.5">
      <span className="text-[12px] font-semibold text-ink">{room}</span>
      <div className="mt-1.5 font-mono text-[10.5px] text-secondary">{dates}</div>
      <div className="mt-2 h-1.5 w-2/3 rounded-full bg-ink/10" />
    </div>
  );
}

function TrainBody({ route, seat }: { route: string; seat: string }) {
  return (
    <div className="px-3 py-2.5">
      <span className="font-mono text-[13px] font-semibold text-ink">{route}</span>
      <div className="mt-1.5 text-[10.5px] text-secondary">{seat}</div>
      <div className="mt-2 flex gap-1">
        <span className="h-1 w-4 rounded-full bg-accent-hover/50" />
        <span className="h-1 w-4 rounded-full bg-ink/10" />
        <span className="h-1 w-4 rounded-full bg-ink/10" />
      </div>
    </div>
  );
}

function ItemRows({ items, total }: { items: { name: string; price: string }[]; total: string }) {
  return (
    <div className="px-3 py-2.5">
      <ul className="space-y-1">
        {items.map((item) => (
          <li key={item.name} className="flex items-center justify-between gap-2 text-[10.5px]">
            <span className="truncate text-ink/60">{item.name}</span>
            <span className="shrink-0 font-mono text-ink/70">{item.price}</span>
          </li>
        ))}
      </ul>
      <div className="mt-1.5 flex items-center justify-between border-t border-hairline pt-1.5 text-[11px] font-semibold">
        <span className="text-ink/80">Total</span>
        <span className="font-mono text-ink">{total}</span>
      </div>
    </div>
  );
}

function MapsBody({ meta }: { meta: string }) {
  return (
    <div className="px-3 py-2.5">
      <div className="relative h-9 w-full overflow-hidden rounded-[6px] bg-[linear-gradient(135deg,#E7EEF2_0%,#DCE6EC_100%)]">
        <svg viewBox="0 0 100 36" className="absolute inset-0 h-full w-full opacity-40">
          <path
            d="M4 30 Q30 6 96 14"
            stroke="#5F7285"
            strokeWidth="1.4"
            fill="none"
            strokeDasharray="2 3"
          />
        </svg>
        <MapPin
          className="absolute right-3 top-1.5 h-3.5 w-3.5 text-ink/70"
          strokeWidth={2}
          fill="currentColor"
          fillOpacity={0.15}
        />
      </div>
      <div className="mt-2 text-[10px] text-secondary">{meta}</div>
    </div>
  );
}

function PhotosBody() {
  const tones = ["#DCE6EC", "#E4E9ED", "#C9D8E0", "#E9EDEF", "#D3E0E7", "#EFF2F3"];
  return (
    <div className="grid grid-cols-3 gap-1 p-2">
      {tones.map((tone, i) => (
        <div key={i} className="aspect-square rounded-[4px]" style={{ backgroundColor: tone }} />
      ))}
    </div>
  );
}

export function MiniScreenshot({
  title,
  tag,
  kind,
  detail,
  className,
}: {
  title: string;
  tag?: string;
  kind?: ScreenshotKind;
  detail?: ScreenshotDetail;
  className?: string;
}) {
  const Icon = kind ? KIND_ICON[kind] : null;

  return (
    <div
      className={cn(
        "overflow-hidden rounded-[12px] border border-hairline bg-white/80",
        className
      )}
    >
      <div className="flex items-center justify-between border-b border-hairline bg-canvas/60 px-3 py-2">
        <span className="flex min-w-0 items-center gap-1.5">
          {Icon && <Icon className="h-3 w-3 shrink-0 text-ink/50" strokeWidth={1.75} />}
          <span className="truncate text-[12px] font-medium text-ink/85">{title}</span>
        </span>
        {tag && <span className="shrink-0 font-mono text-[10.5px] text-secondary">{tag}</span>}
      </div>

      {kind === "flight" && detail?.route && detail.gate && detail.seat && (
        <FlightBody route={detail.route} gate={detail.gate} seat={detail.seat} />
      )}
      {kind === "hotel" && detail?.dates && detail.room && (
        <HotelBody dates={detail.dates} room={detail.room} />
      )}
      {kind === "train" && detail?.route && detail.seat && (
        <TrainBody route={detail.route} seat={detail.seat} />
      )}
      {(kind === "restaurant" || kind === "shopping" || kind === "receipt") &&
        detail?.items &&
        detail.total && <ItemRows items={detail.items} total={detail.total} />}
      {kind === "maps" && detail?.meta && <MapsBody meta={detail.meta} />}
      {kind === "photos" && <PhotosBody />}

      {!kind && (
        <div className="space-y-1.5 px-3 py-2.5">
          <div className="h-1.5 w-3/4 rounded-full bg-ink/10" />
          <div className="h-1.5 w-1/2 rounded-full bg-ink/8" />
        </div>
      )}
    </div>
  );
}
