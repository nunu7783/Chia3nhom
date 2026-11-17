import { useMemo, useState } from 'react';
import { MotionConfig } from 'motion/react';
import {
  AlertCircle,
  Check,
  Copy,
  Maximize2,
  Minimize2,
  Minus,
  Plus,
  RotateCcw,
  Shuffle,
  Trash2,
  Users,
} from 'lucide-react';
import { GroupCard } from './components/GroupCard';
import {
  INITIAL_SAMPLE_GROUPS,
  SAMPLE_STUDENTS,
  computeDistributionPlan,
  divideIntoGroups,
  formatGroupsForClipboard,
  parseStudentLines,
  type GroupResult,
  type SplitMode,
} from './utils/groupUtils';

export default function App() {
  const [rawInput, setRawInput] = useState<string>(() => SAMPLE_STUDENTS.join('\n'));
  const [splitMode, setSplitMode] = useState<SplitMode>('byGroupCount');
  const [numberInput, setNumberInput] = useState<string>('3');
  const [groups, setGroups] = useState<GroupResult[]>(INITIAL_SAMPLE_GROUPS);
  const [isSampleState, setIsSampleState] = useState<boolean>(true);
  const [generationId, setGenerationId] = useState<number>(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);
  const [isPresentationMode, setIsPresentationMode] = useState<boolean>(false);

  const parsedStudents = useMemo(() => parseStudentLines(rawInput), [rawInput]);

  const numericValue = useMemo(() => {
    const parsed = parseInt(numberInput, 10);
    return Number.isFinite(parsed) && parsed >= 1 ? parsed : 1;
  }, [numberInput]);

  const plan = useMemo(
    () => computeDistributionPlan(parsedStudents.length, splitMode, numericValue),
    [parsedStudents.length, splitMode, numericValue]
  );

  const activeTotalMembers = useMemo(
    () => groups.reduce((acc, g) => acc + g.members.length, 0),
    [groups]
  );

  const handleModeChange = (nextMode: SplitMode) => {
    setSplitMode(nextMode);
    setErrorMessage(null);
    if (nextMode === 'byGroupSize' && numberInput === '3' && parsedStudents.length === 12) {
      setNumberInput('4');
    } else if (nextMode === 'byGroupCount' && numberInput === '4' && parsedStudents.length === 12) {
      setNumberInput('3');
    }
  };

  const handleStepNumber = (delta: number) => {
    const next = Math.max(1, Math.min(500, numericValue + delta));
    setNumberInput(String(next));
    setErrorMessage(null);
  };

  const handleNumberBlur = () => {
    if (!numberInput.trim() || parseInt(numberInput, 10) < 1 || Number.isNaN(parseInt(numberInput, 10))) {
      setNumberInput('1');
    } else {
      setNumberInput(String(Math.min(500, parseInt(numberInput, 10))));
    }
  };

  const runDivision = (compareWithPrevious: boolean) => {
    if (parsedStudents.length === 0) {
      setErrorMessage('Vui lòng nhập ít nhất một tên sinh viên (mỗi dòng một người) trước khi chia nhóm.');
      return;
    }

    setErrorMessage(null);
    const nextGroups = divideIntoGroups(
      parsedStudents,
      splitMode,
      numericValue,
      compareWithPrevious ? groups : undefined
    );
    setGroups(nextGroups);
    setIsSampleState(false);
    setGenerationId((prev) => prev + 1);
    setCopied(false);
  };

  const handleCopyResults = async () => {
    if (groups.length === 0) return;
    const text = formatGroupsForClipboard(groups);

    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
      } else {
        throw new Error('Clipboard API unavailable');
      }
      setCopied(true);
    } catch {
      const helper = document.createElement('textarea');
      helper.value = text;
      helper.setAttribute('readonly', '');
      helper.style.position = 'fixed';
      helper.style.opacity = '0';
      document.body.appendChild(helper);
      helper.select();
      document.execCommand('copy');
      document.body.removeChild(helper);
      setCopied(true);
    }

    window.setTimeout(() => {
      setCopied(false);
    }, 2500);
  };

  const handleLoadSample = () => {
    setRawInput(SAMPLE_STUDENTS.join('\n'));
    setSplitMode('byGroupCount');
    setNumberInput('3');
    setGroups(INITIAL_SAMPLE_GROUPS);
    setIsSampleState(true);
    setErrorMessage(null);
    setCopied(false);
    setGenerationId((prev) => prev + 1);
  };

  const handleClearList = () => {
    setRawInput('');
    setErrorMessage(null);
    setCopied(false);
  };

  const planSummaryText = useMemo(() => {
    if (parsedStudents.length === 0) {
      return 'Chưa có sinh viên trong danh sách.';
    }
    const { groupCount, minSize, maxSize } = plan;
    const sizeText =
      minSize === maxSize ? `${minSize} sinh viên/nhóm` : `${minSize}–${maxSize} sinh viên/nhóm`;
    return `Dự kiến: ${groupCount} nhóm · ${sizeText}`;
  }, [parsedStudents.length, plan]);

  return (
    <MotionConfig reducedMotion="user">
      <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
        {/* Top Bar: Clean classroom header */}
        <header className="bg-white border-b border-slate-200">
          <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
            <h1 className="font-display text-xl sm:text-2xl font-bold tracking-tight text-slate-900 whitespace-nowrap shrink-0">
              Chia Nhóm Ngẫu Nhiên
            </h1>

            <div className="flex items-center gap-3 shrink-0">
              <button
                type="button"
                onClick={() => setIsPresentationMode((prev) => !prev)}
                className="inline-flex items-center gap-2 px-4 py-2 min-h-[40px] rounded-lg border border-slate-300 bg-white text-slate-800 hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-700 text-sm font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                {isPresentationMode ? (
                  <>
                    <Minimize2 className="w-4 h-4 shrink-0" aria-hidden="true" />
                    <span>Hiện bảng nhập liệu</span>
                  </>
                ) : (
                  <>
                    <Maximize2 className="w-4 h-4 shrink-0" aria-hidden="true" />
                    <span>Chế độ chiếu lớp</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </header>

        {/* Main Workspace */}
        <main className="flex-1 w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
            {/* Left Zone: Input & Configuration Panel */}
            {!isPresentationMode && (
              <section
                aria-label="Danh sách sinh viên và tùy chọn chia nhóm"
                className="lg:col-span-4 bg-white rounded-xl border border-slate-200 shadow-sm p-5 sm:p-6 flex flex-col gap-5"
              >
                <div>
                  <div className="flex items-baseline justify-between gap-3 mb-2">
                    <label
                      htmlFor="student-list-input"
                      className="font-display text-lg font-bold text-slate-900"
                    >
                      Danh sách sinh viên
                    </label>
                    <span className="font-mono tabular-nums text-sm font-semibold text-slate-600 whitespace-nowrap shrink-0">
                      {parsedStudents.length} người
                    </span>
                  </div>

                  <p className="text-sm text-slate-600 mb-3 leading-relaxed">
                    Dán danh sách tên từ Excel hoặc Word, mỗi dòng một người. Các dòng trống sẽ tự động được bỏ qua.
                  </p>

                  <textarea
                    id="student-list-input"
                    value={rawInput}
                    onChange={(e) => {
                      setRawInput(e.target.value);
                      if (errorMessage) setErrorMessage(null);
                    }}
                    onKeyDown={(e) => {
                      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                        e.preventDefault();
                        runDivision(false);
                      }
                    }}
                    rows={10}
                    placeholder={'Nguyễn Văn A\nTrần Thị B\nLê Hoàng C'}
                    className="w-full rounded-lg border border-slate-300 bg-slate-50/60 px-3.5 py-3 text-base text-slate-900 placeholder:text-slate-400 leading-relaxed focus:bg-white focus:border-sky-700 focus:outline-2 focus:outline-sky-700/20 resize-y min-h-[210px]"
                  />

                  <div className="flex items-center justify-between gap-3 mt-2.5 text-sm">
                    <button
                      type="button"
                      onClick={handleLoadSample}
                      className="inline-flex items-center gap-1.5 text-slate-600 hover:text-sky-800 font-medium transition-colors py-1 whitespace-nowrap shrink-0 cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                      <span>Nạp danh sách mẫu</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleClearList}
                      disabled={rawInput.length === 0}
                      className="inline-flex items-center gap-1.5 text-slate-600 hover:text-rose-700 disabled:opacity-40 disabled:pointer-events-none font-medium transition-colors py-1 whitespace-nowrap shrink-0 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                      <span>Xóa danh sách</span>
                    </button>
                  </div>
                </div>

                <hr className="border-slate-200" />

                {/* Split Mode Controls */}
                <div className="flex flex-col gap-4">
                  <div>
                    <span className="block font-display text-base font-bold text-slate-900 mb-2">
                      Cách thức chia nhóm
                    </span>
                    <div
                      role="group"
                      aria-label="Chọn cách thức chia nhóm"
                      className="grid grid-cols-2 gap-1 p-1 bg-slate-100 rounded-lg border border-slate-200"
                    >
                      <button
                        type="button"
                        onClick={() => handleModeChange('byGroupCount')}
                        aria-pressed={splitMode === 'byGroupCount'}
                        className={`px-3 py-2.5 min-h-[42px] rounded-md text-sm font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                          splitMode === 'byGroupCount'
                            ? 'bg-white text-slate-900 shadow-sm'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        Theo số nhóm
                      </button>
                      <button
                        type="button"
                        onClick={() => handleModeChange('byGroupSize')}
                        aria-pressed={splitMode === 'byGroupSize'}
                        className={`px-3 py-2.5 min-h-[42px] rounded-md text-sm font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                          splitMode === 'byGroupSize'
                            ? 'bg-white text-slate-900 shadow-sm'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        Số người / nhóm
                      </button>
                    </div>
                  </div>

                  {/* Numeric Input + Stepper */}
                  <div>
                    <label
                      htmlFor="group-number-input"
                      className="block text-sm font-semibold text-slate-700 mb-2"
                    >
                      {splitMode === 'byGroupCount'
                        ? 'Nhập số lượng nhóm muốn chia'
                        : 'Nhập số sinh viên tối đa mỗi nhóm'}
                    </label>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleStepNumber(-1)}
                        aria-label="Giảm 1"
                        disabled={numericValue <= 1}
                        className="w-11 h-11 flex items-center justify-center rounded-lg border border-slate-300 bg-white text-slate-800 hover:bg-slate-100 disabled:opacity-40 disabled:pointer-events-none transition-colors shrink-0 cursor-pointer"
                      >
                        <Minus className="w-4 h-4" aria-hidden="true" />
                      </button>
                      <input
                        id="group-number-input"
                        type="number"
                        min={1}
                        max={500}
                        value={numberInput}
                        onChange={(e) => {
                          setNumberInput(e.target.value);
                          if (errorMessage) setErrorMessage(null);
                        }}
                        onBlur={handleNumberBlur}
                        className="w-full h-11 rounded-lg border border-slate-300 bg-white px-3 text-center font-mono tabular-nums text-lg font-bold text-slate-900 focus:border-sky-700 focus:outline-2 focus:outline-sky-700/20"
                      />
                      <button
                        type="button"
                        onClick={() => handleStepNumber(1)}
                        aria-label="Tăng 1"
                        className="w-11 h-11 flex items-center justify-center rounded-lg border border-slate-300 bg-white text-slate-800 hover:bg-slate-100 transition-colors shrink-0 cursor-pointer"
                      >
                        <Plus className="w-4 h-4" aria-hidden="true" />
                      </button>
                    </div>

                    <p className="mt-2.5 text-sm font-medium text-slate-600 tabular-nums">
                      {planSummaryText}
                    </p>
                    {parsedStudents.length > 0 && splitMode === 'byGroupCount' && numericValue > parsedStudents.length && (
                      <p className="mt-1 text-sm text-amber-700 font-medium">
                        Lưu ý: Số nhóm lớn hơn số sinh viên nên một số nhóm sẽ chưa có thành viên.
                      </p>
                    )}
                  </div>

                  {errorMessage && (
                    <div
                      role="alert"
                      className="flex items-start gap-2.5 rounded-lg border border-rose-200 bg-rose-50 px-3.5 py-3 text-sm font-medium text-rose-800"
                    >
                      <AlertCircle className="w-4 h-4 mt-0.5 shrink-0 text-rose-700" aria-hidden="true" />
                      <span>{errorMessage}</span>
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={() => runDivision(false)}
                    className="w-full inline-flex items-center justify-center gap-2.5 px-6 py-3.5 min-h-[48px] rounded-xl bg-sky-700 hover:bg-sky-800 active:bg-sky-900 text-white font-display text-lg font-bold shadow-sm transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-700"
                  >
                    <Users className="w-5 h-5 shrink-0" aria-hidden="true" />
                    <span>Chia nhóm</span>
                  </button>
                </div>
              </section>
            )}

            {/* Right Zone (or Full Width in Presentation Mode): Color-coded Result Cards */}
            <section
              aria-label="Kết quả chia nhóm"
              className={`${isPresentationMode ? 'lg:col-span-12' : 'lg:col-span-8'} flex flex-col gap-6`}
            >
              {/* Results Toolbar */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm px-5 py-4 sm:px-6 flex flex-wrap items-center justify-between gap-4">
                <div className="flex flex-col gap-0.5">
                  <h2
                    className={`font-display font-bold text-slate-900 tracking-tight ${
                      isPresentationMode ? 'text-2xl sm:text-3xl' : 'text-xl sm:text-2xl'
                    }`}
                  >
                    {isSampleState ? 'Kết quả chia nhóm (3 nhóm mẫu)' : 'Kết quả chia nhóm'}
                  </h2>
                  <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-sm sm:text-base text-slate-600 font-medium tabular-nums">
                    <span>{groups.length} nhóm</span>
                    <span aria-hidden="true">·</span>
                    <span>{activeTotalMembers} sinh viên</span>
                    <span aria-hidden="true">·</span>
                    <span>Chênh lệch sĩ số tối đa 1 người</span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={() => runDivision(true)}
                    className="inline-flex items-center justify-center gap-2 px-4 py-2.5 min-h-[44px] rounded-lg border border-slate-300 bg-white hover:bg-slate-100 text-slate-900 text-base font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-700"
                  >
                    <Shuffle className="w-4 h-4 shrink-0 text-sky-700" aria-hidden="true" />
                    <span>Chia lại</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleCopyResults}
                    disabled={groups.length === 0}
                    className={`inline-flex items-center justify-center gap-2 px-4 py-2.5 min-h-[44px] rounded-lg border text-base font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-700 ${
                      copied
                        ? 'border-emerald-300 bg-emerald-50 text-emerald-800'
                        : 'border-slate-900 bg-slate-900 hover:bg-slate-800 text-white'
                    }`}
                  >
                    {copied ? (
                      <>
                        <Check className="w-4 h-4 shrink-0" aria-hidden="true" />
                        <span>Đã sao chép</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4 shrink-0" aria-hidden="true" />
                        <span>Sao chép kết quả</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Result Cards Grid */}
              {groups.length === 0 ? (
                <div className="bg-white rounded-xl border border-slate-200 p-10 text-center">
                  <p className="text-lg font-medium text-slate-600">
                    Chưa có nhóm nào được tạo. Hãy dán danh sách sinh viên và nhấn “Chia nhóm”.
                  </p>
                </div>
              ) : (
                <div
                  className={`grid gap-5 sm:gap-6 items-stretch ${
                    isPresentationMode
                      ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
                      : 'grid-cols-1 md:grid-cols-2'
                  }`}
                >
                  {groups.map((group, index) => (
                    <GroupCard
                      key={`${generationId}-${group.id}`}
                      group={group}
                      index={index}
                      isPresentationMode={isPresentationMode}
                    />
                  ))}
                </div>
              )}
            </section>
          </div>
        </main>
      </div>
    </MotionConfig>
  );
}
