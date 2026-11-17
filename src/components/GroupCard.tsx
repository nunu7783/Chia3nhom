import { motion } from 'motion/react';
import { GROUP_THEMES, type GroupResult } from '../utils/groupUtils';

interface GroupCardProps {
  group: GroupResult;
  index: number;
  isPresentationMode: boolean;
}

export function GroupCard({ group, index, isPresentationMode }: GroupCardProps) {
  const theme = GROUP_THEMES[index % GROUP_THEMES.length];

  return (
    <motion.article
      layout="position"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
      className={`flex flex-col rounded-xl border ${theme.cardBorder} bg-white shadow-sm overflow-hidden`}
    >
      <header className={`${theme.headerBg} px-5 py-4 flex items-baseline justify-between gap-4`}>
        <h3
          className={`font-display font-bold tracking-tight ${
            isPresentationMode ? 'text-2xl md:text-3xl' : 'text-xl md:text-2xl'
          }`}
        >
          {group.name}
        </h3>
        <span
          className={`font-mono tabular-nums font-semibold whitespace-nowrap shrink-0 ${theme.headerSubtext} ${
            isPresentationMode ? 'text-base md:text-lg' : 'text-sm md:text-base'
          }`}
        >
          {group.members.length} thành viên
        </span>
      </header>

      <div className={`flex-1 ${theme.cardTint} px-5 py-4`}>
        {group.members.length === 0 ? (
          <p
            className={`text-slate-500 italic py-2 ${
              isPresentationMode ? 'text-xl' : 'text-base'
            }`}
          >
            Nhóm chưa có thành viên
          </p>
        ) : (
          <ol className="divide-y divide-slate-200/75">
            {group.members.map((member, memberIdx) => (
              <li
                key={`${group.id}-${memberIdx}-${member}`}
                className={`flex items-baseline gap-3.5 py-2.5 first:pt-1 last:pb-1 rounded-md transition-colors duration-150 ${theme.hoverRow}`}
              >
                <span
                  className={`font-mono tabular-nums font-semibold shrink-0 select-none ${theme.indexText} ${
                    isPresentationMode ? 'text-lg md:text-xl w-8' : 'text-base w-7'
                  }`}
                >
                  {String(memberIdx + 1).padStart(2, '0')}.
                </span>
                <span
                  className={`font-medium text-slate-900 leading-snug break-words ${
                    isPresentationMode ? 'text-xl md:text-2xl' : 'text-lg md:text-xl'
                  }`}
                >
                  {member}
                </span>
              </li>
            ))}
          </ol>
        )}
      </div>
    </motion.article>
  );
}
