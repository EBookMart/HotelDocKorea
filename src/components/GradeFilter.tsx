"use client";

import { useTranslations } from "next-intl";

interface GradeFilterProps {
  selectedGrade: number | null;
  onGradeChange: (grade: number | null) => void;
  totalCount: number;
}

export default function GradeFilter({
  selectedGrade,
  onGradeChange,
  totalCount,
}: GradeFilterProps) {
  const t = useTranslations("gradeFilter");
  const grades = [5, 4, 3];

  return (
    <div className="w-full bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 lg:px-12 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="text-sm font-bold text-gray-700">{t("label")}</span>
          <div className="flex items-center gap-1.5 flex-wrap">
            {grades.map((g) => (
              <button
                key={g}
                onClick={() => onGradeChange(selectedGrade === g ? null : g)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 flex items-center gap-1 ${
                  selectedGrade === g
                    ? "bg-purple-600 text-white shadow-md ring-2 ring-purple-600 ring-offset-1"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {t("grade", { n: g })} {selectedGrade === g && "✓"}
              </button>
            ))}
            {selectedGrade !== null && (
              <button
                onClick={() => onGradeChange(null)}
                className="px-3 py-1.5 text-xs text-gray-500 hover:text-gray-700 font-bold underline underline-offset-2 ml-1"
              >
                {t("clear")}
              </button>
            )}
          </div>
        </div>

        <div className="text-sm font-bold text-gray-600 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100 w-fit">
          {t.rich("results", {
            count: totalCount,
            c: (chunks) => <span className="text-purple-600">{chunks}</span>,
          })}
        </div>
      </div>
    </div>
  );
}
