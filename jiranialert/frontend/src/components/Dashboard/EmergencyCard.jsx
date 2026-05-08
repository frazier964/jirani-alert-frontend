// src/components/Dashboard/EmergencyCard.jsx
// Lucide icons: use names that actually exist in the library
import {
  AlertTriangle,
  Flame,
  Car,
  Shield,
  Stethoscope,
  HelpCircle,
} from 'lucide-react';
import { useState } from 'react';

export default function EmergencyCard() {
  const [type, setType] = useState('fire');
  const [autoLoc, setAutoLoc] = useState(true);

  const types = [
    { id: 'fire', icon: <Flame />, label: 'Fire' },
    { id: 'accident', icon: <Car />, label: 'Accident' },
    { id: 'theft', icon: <Shield />, label: 'Theft' },
    { id: 'medical', icon: <Stethoscope />, label: 'Medical' },
    { id: 'other', icon: <HelpCircle />, label: 'Other' },
  ];

  const sendAlert = () => {
    // Placeholder: you would call your API here.
    console.log('Sending alert', { type, autoLoc });
    alert('Emergency alert sent!');
  };

  return (
    <section className="bg-red-50 rounded-xl p-4 shadow-md mb-6 animate-pulse">
      <h3 className="text-lg font-medium mb-2 flex items-center">
        <AlertTriangle className="mr-2 text-red-600" /> Report Emergency
      </h3>
      <div className="flex gap-2 mb-3">
        {types.map(t => (
          <button
            key={t.id}
            onClick={() => setType(t.id)}
            className={`flex-1 py-2 rounded-md border ${type === t.id ? 'border-red-600 bg-red-100' : 'border-gray-200'}`}
          >
            {t.icon}
            <span className="ml-1">{t.label}</span>
          </button>
        ))}
      </div>
      <label className="flex items-center mb-3">
        <input
          type="checkbox"
          checked={autoLoc}
          onChange={() => setAutoLoc(!autoLoc)}
          className="mr-2"
        />
        Auto‑detect location
      </label>
      <button
        onClick={sendAlert}
        className="w-full bg-red-600 text-white py-2 rounded-md hover:bg-red-700"
      >
        Send Alert Now
      </button>
    </section>
  );
}
