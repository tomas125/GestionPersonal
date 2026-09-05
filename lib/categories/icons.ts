import {
  Bus,
  Car,
  Coins,
  CreditCard,
  Film,
  Gift,
  GraduationCap,
  HandCoins,
  HelpCircle,
  Home,
  Link2,
  Plane,
  PartyPopper,
  Scissors,
  ShoppingBag,
  Stethoscope,
  Utensils,
  Wallet,
  Wifi,
  type LucideIcon,
} from "lucide-react";
import { BarChart3 } from "lucide-react";

export const CATEGORY_ICONS: Record<string, LucideIcon> = {
  plane: Plane,
  utensils: Utensils,
  bus: Bus,
  car: Car,
  party: PartyPopper,
  "bar-chart": BarChart3,
  scissors: Scissors,
  link: Link2,
  "graduation-cap": GraduationCap,
  "help-circle": HelpCircle,
  coins: Coins,
  wallet: Wallet,
  home: Home,
  gift: Gift,
  "shopping-bag": ShoppingBag,
  "credit-card": CreditCard,
  stethoscope: Stethoscope,
  film: Film,
  wifi: Wifi,
  "hand-coins": HandCoins,
};

export const AVAILABLE_ICON_KEYS = Object.keys(CATEGORY_ICONS);

export function getCategoryIcon(icon: string): LucideIcon {
  return CATEGORY_ICONS[icon] ?? HelpCircle;
}
