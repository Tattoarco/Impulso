export default function StatsCards({ jobs }) {
  const stats = [
    {
      icon: "fi fi-rr-folder",
      label: "Total proyectos",
      value: jobs.length,
      bg: "bg-orange-50",
      color: "text-[#F26419]",
    },
    {
      icon: "fi fi-rr-check-circle",
      label: "Activos",
      value: jobs.filter((j) => j.status === "published").length,
      bg: "bg-green-50",
      color: "text-green-500",
    },
    {
      icon: "fi fi-rr-users",
      label: "Postulantes",
      value: jobs.reduce((acc, j) => acc + (parseInt(j.applications_count) || 0), 0),
      bg: "bg-violet-50",
      color: "text-violet-500",
    },
    {
      icon: "fi fi-rr-edit",
      label: "Borradores",
      value: jobs.filter((j) => j.status === "draft").length,
      bg: "bg-amber-50",
      color: "text-amber-500",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {stats.map(({ icon, label, value, bg, color }) => (
        <div
          key={label}
          className="bg-white rounded-2xl border border-gray-100 p-5 flex items-center gap-4"
        >
          <div className={`w-11 h-11 ${bg} ${color} rounded-xl flex items-center justify-center shrink-0`}>
            <i className={`${icon} text-lg`} />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900 leading-none">{value}</p>
            <p className="text-xs text-gray-400 mt-1">{label}</p>
          </div>
        </div>
      ))}
    </div>
  );
}