
import {
  Copy,
  Building2,
  Tag,
  Mail,
  Phone,
  MessageCircle,
  MapPin,
  Clock,
  Globe,
  SlidersHorizontal,
  Calendar,
  Layers,
  FileText,
  Lock,
  KeyRound,
  ShieldCheck,
  Bell,
  BellOff,
  CheckCheck,
  Check,
  Inbox,
  Eye,
  EyeOff,
  RefreshCw,
  AlertCircle,
  Image as ImageIcon,
  Star,
  Coins,
  CreditCard,
  Ban,
  CheckCircle2,
  UserPlus,
  Sparkles,
  LayoutDashboard,
  ClipboardList,
  Users,
  Settings2,
  Package,
  CalendarDays,
  Settings,
  Award,
  Heart,
  Receipt,
  Workflow,
  Target,
  Search,
  Trash2,
  X,
} from "lucide-react";

function brandIcon(paths) {
  return function BrandIcon({ size, strokeWidth, className, ...rest }) {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="currentColor"
        className={className}
        {...rest}
      >
        {paths}
      </svg>
    );
  };
}

const Facebook = brandIcon(
  <path d="M15 3h-2.5A4.5 4.5 0 0 0 8 7.5V10H5v4h3v8h4v-8h3l1-4h-4V7.5a1 1 0 0 1 1-1H16V3z" />
);
const Instagram = brandIcon(
  <>
    <rect x="3" y="3" width="18" height="18" rx="5" fill="none" stroke="currentColor" strokeWidth="1.7" />
    <circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" strokeWidth="1.7" />
    <circle cx="17.3" cy="6.7" r="1" />
  </>
);
const Linkedin = brandIcon(
  <>
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4V10h4v1.5A6 6 0 0 1 16 8z" />
    <rect x="2" y="10" width="4" height="11" />
    <circle cx="4" cy="5" r="2" />
  </>
);

const ICONS = {
  copy: Copy,
  building: Building2,
  tag: Tag,
  mail: Mail,
  phone: Phone,
  message: MessageCircle,
  pin: MapPin,
  clock: Clock,
  globe: Globe,
  facebook: Facebook,
  instagram: Instagram,
  linkedin: Linkedin,
  sliders: SlidersHorizontal,
  calendar: Calendar,
  layers: Layers,
  file: FileText,
  lock: Lock,
  key: KeyRound,
  shield: ShieldCheck,
  bell: Bell,
  bellOff: BellOff,
  checkDouble: CheckCheck,
  check: Check,
  inbox: Inbox,
  eye: Eye,
  eyeOff: EyeOff,
  refresh: RefreshCw,
  alert: AlertCircle,
  image: ImageIcon,
  star: Star,
  coin: Coins,
  creditCard: CreditCard,
  ban: Ban,
  checkCircle: CheckCircle2,
  userPlus: UserPlus,
  spark: Sparkles,
  layoutDashboard: LayoutDashboard,
  clipboardList: ClipboardList,
  users: Users,
  settings2: Settings2,
  package: Package,
  calendarDays: CalendarDays,
  settings: Settings,
  award: Award,
  heart: Heart,
  receipt: Receipt,
  workflow: Workflow,
  target: Target,
  search: Search,
  trash: Trash2,
  close: X,
};

export default function Icon({ name, size = 18, className = "", strokeWidth = 1.7 }) {
  const Cmp = ICONS[name];
  if (!Cmp) return null;
  return (
    <Cmp
      size={size}
      strokeWidth={strokeWidth}
      className={className}
      aria-hidden="true"
      focusable="false"
    />
  );
}
