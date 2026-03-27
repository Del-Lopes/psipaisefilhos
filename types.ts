import { LucideIcon } from 'lucide-react';

export interface Pillar {
  title: string;
  subtitle: string;
  description: string;
  icon: LucideIcon;
}

export interface NavigationItem {
  label: string;
  href: string;
}