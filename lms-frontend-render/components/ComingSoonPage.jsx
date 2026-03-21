import Link from "next/link";
import { ArrowRight, Clock3 } from "lucide-react";

export default function ComingSoonPage({
  title,
  description,
  primaryHref = null,
  primaryLabel = null,
  secondaryHref = null,
  secondaryLabel = null,
}) {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 md:p-10">
        <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-5">
          <Clock3 size={26} />
        </div>

        <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
        <p className="text-gray-500 mt-3 leading-relaxed max-w-2xl">{description}</p>

        <div className="mt-8 grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-gray-100 bg-gray-50 p-5">
            <p className="text-sm font-semibold text-gray-800">Status</p>
            <p className="text-sm text-gray-500 mt-2">
              This route now exists and is safe to open. The deeper workflow for this section can be connected next.
            </p>
          </div>

          <div className="rounded-2xl border border-gray-100 bg-indigo-50 p-5">
            <p className="text-sm font-semibold text-indigo-800">Next Step</p>
            <p className="text-sm text-indigo-700 mt-2">
              If you want, I can connect this page to real backend data and forms in the next pass.
            </p>
          </div>
        </div>

        {(primaryHref || secondaryHref) && (
          <div className="mt-8 flex flex-col sm:flex-row gap-3">
            {primaryHref && primaryLabel && (
              <Link
                href={primaryHref}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 text-white text-sm font-semibold px-4 py-3 hover:bg-indigo-700 transition-colors"
              >
                {primaryLabel} <ArrowRight size={16} />
              </Link>
            )}
            {secondaryHref && secondaryLabel && (
              <Link
                href={secondaryHref}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 text-gray-700 text-sm font-semibold px-4 py-3 hover:bg-gray-50 transition-colors"
              >
                {secondaryLabel}
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
