export function HomeHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-white/70 bg-white/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-md items-center justify-between px-5 py-4">
        <div>
          <h1 className="text-xl font-black text-slate-900">FitLog</h1>
        </div>
        <div className="flex items-center gap-3 text-slate-500">
          <button type="button" className="p-2" aria-label="알림">
            <img
              src="/icons/custom/bell.svg"
              alt=""
              aria-hidden="true"
              width={20}
              height={20}
              loading="eager"
              className="block size-5"
            />
          </button>
          <button type="button" className="p-2" aria-label="캘린더">
            <img
              src="/icons/custom/calendar.svg"
              alt=""
              aria-hidden="true"
              width={20}
              height={20}
              loading="eager"
              className="block size-5"
            />
          </button>
        </div>
      </div>
    </header>
  );
}
