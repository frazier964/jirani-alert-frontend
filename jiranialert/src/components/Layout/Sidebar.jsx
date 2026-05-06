// src/components/Layout/Sidebar.jsx
import { Home, AlertCircle, MapPin, Users, MessageCircle, Activity, Settings, HelpCircle } from 'lucide-react';
import { NavLink } from 'react-router-dom';

const navItems = [
  { to: '/', icon: Home, label: 'Dashboard' },
  { to: '/report', icon: AlertCircle, label: 'Report Emergency' },
  { to: '/alerts', icon: MapPin, label: 'Nearby Alerts' },
  { to: '/feed', icon: Users, label: 'Community Feed' },
  { to: '/messages', icon: MessageCircle, label: 'Messages' },
  { to: '/activity', icon: Activity, label: 'My Activity' },
  { to: '/settings', icon: Settings, label: 'Settings' },
  { to: '/help', icon: HelpCircle, label: 'Help & Safety Tips' },
];

export default function Sidebar() {
  // Sidebar intentionally removed – render nothing
  return null;
}
