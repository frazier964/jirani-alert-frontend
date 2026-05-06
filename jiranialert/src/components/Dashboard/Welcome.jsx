// src/components/Dashboard/Welcome.jsx
export default function Welcome({ userName, status }) {
  const statusColors = {
    Safe: 'bg-green-100 text-green-800',
    Watch: 'bg-yellow-100 text-yellow-800',
    Alert: 'bg-red-100 text-red-800',
  };
  return (
    <section className="mb-6">
      <h2 className="text-2xl font-semibold">Good afternoon, <span className="font-medium">{userName}</span> 👋</h2>
      <p className="mt-1 text-gray-600">
        Your community safety status: 
        <span className={`ml-2 px-2 py-0.5 rounded ${statusColors[status]}`}>{status}</span>
      </p>
      <p className="text-sm text-gray-500">Stay aware. Stay connected. Help your neighbors.</p>
    </section>
  );
}
