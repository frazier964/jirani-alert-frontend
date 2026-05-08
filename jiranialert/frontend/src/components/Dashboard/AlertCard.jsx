// src/components/Dashboard/AlertCard.jsx
import { Link } from 'react-router-dom';
import { MapPin, AlertCircle } from 'lucide-react';

export default function AlertCard({ alert }) {
  const severityColors = {
    Low: 'bg-green-100 text-green-800',
    Medium: 'bg-yellow-100 text-yellow-800',
    High: 'bg-red-100 text-red-800',
  };

  return (
    <article className="bg-white rounded-lg shadow p-4 flex flex-col justify-between h-full">
      <div className="flex items-center mb-2">
        <AlertCircle className="w-5 h-5 mr-2 text-gray-600" />
        <h4 className="font-medium text-gray-800">{alert.type}</h4>
      </div>
      <p className="text-sm text-gray-500 mb-1">
        <MapPin className="inline w-4 h-4 mr-1" />{alert.location}
      </p>
      <p className="text-xs text-gray-400 mb-2">{alert.timeAgo || 'Just now'}</p>
      <span className={`inline-block px-2 py-0.5 text-xs rounded ${severityColors[alert.severity]}`}> {alert.severity} </span>
      <Link
        to={`/alerts/${alert.id}`}
        className="mt-3 text-blue-600 hover:underline text-sm"
      >
        View Details
      </Link>
    </article>
  );
}
