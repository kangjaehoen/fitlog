export function HomeHeader() {
  return (
    <header className="sticky top-0 z-10 border-b border-white/70 bg-white/85 backdrop-blur-[20px]">
      <div className="mx-auto flex w-full max-w-[420px] items-center justify-between gap-4 px-5 py-4">
        <h1 className="text-xl font-black text-slate-900">FitLog</h1>

        <div className="flex items-center gap-3 text-slate-500">
          <button
            type="button"
            className="grid size-9 place-items-center rounded-full bg-slate-100/90"
            aria-label="알림"
          >
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
          <button
            type="button"
            className="grid size-9 place-items-center rounded-full bg-slate-100/90"
            aria-label="캘린더"
          >
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
