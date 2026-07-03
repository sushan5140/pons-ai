export type WidgetKind =
  | "flight"
  | "receipt"
  | "product"
  | "price"
  | "warranty"
  | "calendar"
  | "chat"
  | "note";

export interface WidgetDetail {
  route?: string;
  gate?: string;
  seat?: string;
  items?: { name: string; price: string }[];
  total?: string;
  size?: string;
  status?: string;
  was?: string;
  now?: string;
  purchased?: string;
  expiry?: string;
  remaining?: string;
  when?: string;
  location?: string;
  message?: string;
  unread?: string;
  bullets?: string[];
}

export interface WidgetNode {
  id: string;
  kind: WidgetKind;
  title: string;
  tag?: string;
  person?: string;
  wide?: boolean;
  detail: WidgetDetail;
}

export const HERO_WIDGETS: WidgetNode[] = [
  {
    id: "flight-rahul",
    kind: "flight",
    title: "Flight",
    person: "Rahul",
    wide: true,
    detail: { route: "DEL → SFO", gate: "27", seat: "9C" },
  },
  {
    id: "headphones-price",
    kind: "price",
    title: "Sony WH-1000XM6",
    tag: "−$40 drop",
    detail: { was: "$259.99", now: "$219.99" },
  },
  {
    id: "dinner-rahul",
    kind: "receipt",
    title: "Dinner · Roka",
    person: "Rahul",
    detail: {
      items: [
        { name: "Robata Set", price: "$142" },
        { name: "Sake Pairing", price: "$44" },
      ],
      total: "$186",
    },
  },
  {
    id: "adidas-order",
    kind: "product",
    title: "Adidas · Order #4471",
    detail: { size: "US 9", status: "Order confirmed" },
  },
  {
    id: "laptop-warranty",
    kind: "warranty",
    title: "MacBook Air · Warranty",
    detail: { purchased: "Jun 2025", expiry: "Jun 2027", remaining: "2 yrs left" },
  },
  {
    id: "dentist-cal",
    kind: "calendar",
    title: "Dentist Appointment",
    detail: { when: "Thu, Jun 18 · 10:00 AM", location: "Dr. Chen's Office" },
  },
  {
    id: "mom-chat",
    kind: "chat",
    title: "Mom",
    detail: { message: "Don't forget to call grandma", unread: "3 new messages" },
  },
  {
    id: "trip-note",
    kind: "note",
    title: "SF trip ideas",
    detail: { bullets: ["Golden Gate Bridge", "Ferry Building", "Sausalito day trip"] },
  },
];

// A single tonal ramp stepping from --color-ink through --color-secondary to
// --color-accent-hover — every stop is on the site's own blue-navy hue, just
// at a different depth, so the badges read as one coherent system instead of
// a rainbow of unrelated colors.
export const WIDGET_COLOR: Record<WidgetKind, string> = {
  flight: "#0D1620",
  price: "#13212E",
  receipt: "#253647",
  product: "#39495A",
  warranty: "#4D5F70",
  calendar: "#5F7285",
  chat: "#748DA0",
  note: "#8DB4CC",
};
