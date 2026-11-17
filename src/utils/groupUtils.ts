export type SplitMode = 'byGroupCount' | 'byGroupSize';

export interface GroupResult {
  id: number;
  name: string;
  members: string[];
}

export interface GroupTheme {
  headerBg: string;
  headerSubtext: string;
  cardBorder: string;
  cardTint: string;
  indexText: string;
  hoverRow: string;
}

export const GROUP_THEMES: GroupTheme[] = [
  {
    headerBg: 'bg-sky-700 text-white',
    headerSubtext: 'text-sky-100',
    cardBorder: 'border-sky-200',
    cardTint: 'bg-sky-50/35',
    indexText: 'text-sky-700',
    hoverRow: 'hover:bg-sky-50/80',
  },
  {
    headerBg: 'bg-emerald-700 text-white',
    headerSubtext: 'text-emerald-100',
    cardBorder: 'border-emerald-200',
    cardTint: 'bg-emerald-50/35',
    indexText: 'text-emerald-700',
    hoverRow: 'hover:bg-emerald-50/80',
  },
  {
    headerBg: 'bg-amber-700 text-white',
    headerSubtext: 'text-amber-100',
    cardBorder: 'border-amber-200',
    cardTint: 'bg-amber-50/35',
    indexText: 'text-amber-700',
    hoverRow: 'hover:bg-amber-50/80',
  },
  {
    headerBg: 'bg-rose-700 text-white',
    headerSubtext: 'text-rose-100',
    cardBorder: 'border-rose-200',
    cardTint: 'bg-rose-50/35',
    indexText: 'text-rose-700',
    hoverRow: 'hover:bg-rose-50/80',
  },
  {
    headerBg: 'bg-violet-700 text-white',
    headerSubtext: 'text-violet-100',
    cardBorder: 'border-violet-200',
    cardTint: 'bg-violet-50/35',
    indexText: 'text-violet-700',
    hoverRow: 'hover:bg-violet-50/80',
  },
  {
    headerBg: 'bg-teal-700 text-white',
    headerSubtext: 'text-teal-100',
    cardBorder: 'border-teal-200',
    cardTint: 'bg-teal-50/35',
    indexText: 'text-teal-700',
    hoverRow: 'hover:bg-teal-50/80',
  },
  {
    headerBg: 'bg-orange-700 text-white',
    headerSubtext: 'text-orange-100',
    cardBorder: 'border-orange-200',
    cardTint: 'bg-orange-50/35',
    indexText: 'text-orange-700',
    hoverRow: 'hover:bg-orange-50/80',
  },
  {
    headerBg: 'bg-indigo-700 text-white',
    headerSubtext: 'text-indigo-100',
    cardBorder: 'border-indigo-200',
    cardTint: 'bg-indigo-50/35',
    indexText: 'text-indigo-700',
    hoverRow: 'hover:bg-indigo-50/80',
  },
  {
    headerBg: 'bg-cyan-700 text-white',
    headerSubtext: 'text-cyan-100',
    cardBorder: 'border-cyan-200',
    cardTint: 'bg-cyan-50/35',
    indexText: 'text-cyan-700',
    hoverRow: 'hover:bg-cyan-50/80',
  },
  {
    headerBg: 'bg-fuchsia-700 text-white',
    headerSubtext: 'text-fuchsia-100',
    cardBorder: 'border-fuchsia-200',
    cardTint: 'bg-fuchsia-50/35',
    indexText: 'text-fuchsia-700',
    hoverRow: 'hover:bg-fuchsia-50/80',
  },
];

export const SAMPLE_STUDENTS: string[] = [
  'Nguyễn Minh Anh',
  'Trần Quốc Bảo',
  'Lê Thảo Vy',
  'Phạm Hoàng Nam',
  'Vũ Ngọc Linh',
  'Đặng Gia Huy',
  'Bùi Khánh Ly',
  'Hoàng Đức Trọng',
  'Đỗ Thùy Dương',
  'Ngô Tuấn Kiệt',
  'Võ Phương Nhi',
  'Phan Anh Quân',
];

export const INITIAL_SAMPLE_GROUPS: GroupResult[] = [
  {
    id: 1,
    name: 'Nhóm 1',
    members: ['Nguyễn Minh Anh', 'Trần Quốc Bảo', 'Lê Thảo Vy', 'Phạm Hoàng Nam'],
  },
  {
    id: 2,
    name: 'Nhóm 2',
    members: ['Vũ Ngọc Linh', 'Đặng Gia Huy', 'Bùi Khánh Ly', 'Hoàng Đức Trọng'],
  },
  {
    id: 3,
    name: 'Nhóm 3',
    members: ['Đỗ Thùy Dương', 'Ngô Tuấn Kiệt', 'Võ Phương Nhi', 'Phan Anh Quân'],
  },
];

export function parseStudentLines(rawText: string): string[] {
  return rawText
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
}

export interface DistributionPlan {
  groupCount: number;
  minSize: number;
  maxSize: number;
}

export function computeDistributionPlan(
  studentCount: number,
  mode: SplitMode,
  rawValue: number
): DistributionPlan {
  if (studentCount <= 0) {
    return { groupCount: 0, minSize: 0, maxSize: 0 };
  }

  const safeValue = Math.max(1, Math.floor(Number.isFinite(rawValue) ? rawValue : 1));
  const groupCount =
    mode === 'byGroupCount'
      ? safeValue
      : Math.max(1, Math.ceil(studentCount / safeValue));

  const minSize = Math.floor(studentCount / groupCount);
  const remainder = studentCount % groupCount;
  const maxSize = remainder > 0 ? minSize + 1 : minSize;

  return { groupCount, minSize, maxSize };
}

function getRandomInt(maxExclusive: number): number {
  if (maxExclusive <= 1) return 0;
  if (typeof crypto !== 'undefined' && typeof crypto.getRandomValues === 'function') {
    const array = new Uint32Array(1);
    const limit = Math.floor(0xffffffff / maxExclusive) * maxExclusive;
    let rand = 0;
    do {
      crypto.getRandomValues(array);
      rand = array[0];
    } while (rand >= limit);
    return rand % maxExclusive;
  }
  return Math.floor(Math.random() * maxExclusive);
}

export function shuffleArray<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = getRandomInt(i + 1);
    const temp = copy[i];
    copy[i] = copy[j];
    copy[j] = temp;
  }
  return copy;
}

function buildBalancedGroups(shuffled: string[], groupCount: number): GroupResult[] {
  const total = shuffled.length;
  const baseSize = Math.floor(total / groupCount);
  const remainder = total % groupCount;

  const groups: GroupResult[] = [];
  let cursor = 0;

  for (let i = 0; i < groupCount; i++) {
    const size = baseSize + (i < remainder ? 1 : 0);
    const members = shuffled.slice(cursor, cursor + size);
    cursor += size;
    groups.push({
      id: i + 1,
      name: `Nhóm ${i + 1}`,
      members,
    });
  }

  return groups;
}

function getPartitionSignature(groups: GroupResult[], unordered: boolean): string {
  const groupStrings = groups.map((g) => [...g.members].sort((a, b) => a.localeCompare(b, 'vi')).join('\u0001'));
  if (unordered) {
    return groupStrings.sort().join('\u0002');
  }
  return groupStrings.join('\u0002');
}

export function divideIntoGroups(
  students: string[],
  mode: SplitMode,
  rawValue: number,
  previousGroups?: GroupResult[]
): GroupResult[] {
  if (students.length === 0) {
    return [];
  }

  const { groupCount } = computeDistributionPlan(students.length, mode, rawValue);
  if (groupCount <= 0) {
    return [];
  }

  const unorderedCompare = groupCount < students.length;
  const previousSig =
    previousGroups && previousGroups.length === groupCount
      ? getPartitionSignature(previousGroups, unorderedCompare)
      : null;

  let candidate = buildBalancedGroups(shuffleArray(students), groupCount);

  if (previousSig && students.length >= 2 && groupCount >= 2) {
    for (let attempt = 0; attempt < 20; attempt++) {
      if (getPartitionSignature(candidate, unorderedCompare) !== previousSig) {
        break;
      }
      candidate = buildBalancedGroups(shuffleArray(students), groupCount);
    }
  }

  return candidate;
}

export function formatGroupsForClipboard(groups: GroupResult[]): string {
  return groups
    .map((group) => {
      const header = `${group.name} (${group.members.length} sinh viên):`;
      if (group.members.length === 0) {
        return `${header}\n  (Chưa có thành viên)`;
      }
      const memberLines = group.members
        .map((member, index) => `  ${index + 1}. ${member}`)
        .join('\n');
      return `${header}\n${memberLines}`;
    })
    .join('\n\n');
}
