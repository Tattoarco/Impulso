import clsx from "clsx";

export default function ProjectCard({
  icon,
  title,
  subtitle,
  level,
  variant = "default", // default | highlighted
}) {
  return (
    <div
      className={clsx(
        "flex items-center gap-3 rounded-lg p-3 border transition duration-200",
        "bg-white border-gray-200 shadow-sm hover:shadow-md hover:-translate-y-0.5",
        variant === "highlighted" && "border-orange-300 bg-orange-50"
      )}
    >
      {/* ICON */}
      <div className="w-9 h-9 flex items-center justify-center rounded-md bg-orange-100">
        <i className={`${icon} text-orange-500 text-lg`}></i>
      </div>

      {/* CONTENT */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold leading-tight truncate">
          {title}
        </p>
        <p className="text-xs text-gray-500 ">
          {subtitle}
        </p>
      </div>

      {/* BADGE */}
      <span
        className={clsx(
          "text-[10px] px-2 py-1 rounded-full font-semibold whitespace-nowrap",
          "bg-orange-100 text-orange-500"
        )}
      >
        {level}
      </span>
    </div>
  );
}