import {
  Star,
  MessageSquare,
  Users,
  HeartHandshake,
  Gift,
  CalendarDays,
  BarChart3,
  Bell,
  QrCode,
  Repeat,
  type LucideIcon,
} from "lucide-react";

const ICONS: Record<string, LucideIcon> = {
  star: Star,
  message: MessageSquare,
  users: Users,
  heart: HeartHandshake,
  gift: Gift,
  calendar: CalendarDays,
  chart: BarChart3,
  bell: Bell,
  qr: QrCode,
  repeat: Repeat,
};

export function LandingIcon({
  name,
  className,
}: {
  name: string;
  className?: string;
}) {
  const Icon = ICONS[name] ?? Star;
  return <Icon className={className} />;
}
