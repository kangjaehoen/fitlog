"use client";

import { useRouter } from "next/navigation";
import { useState, type ReactNode } from "react";
import {
  CheckCircleIcon,
  InfoIcon,
  ShieldIcon,
  SparklesIcon,
  TrashIcon,
} from "@/components/icons";
import { StackHeader } from "@/components/navigation/stack-header";
import { clearAuthSession, getPersistedAuthToken } from "../auth-session";
import { withdrawAccount } from "../api";
import type { UnsubscribeData } from "../types";

type UnsubscribeScreenProps = {
  data: UnsubscribeData;
};

type ModalState = {
  title?: string;
  message: string;
  confirmLabel?: string;
  tone?: "default" | "danger";
  onConfirm?: () => void | Promise<void>;
};

const surfaceCardClass =
  "rounded-[14px] border border-[#edf0ff] bg-white shadow-[0_10px_28px_rgba(37,45,100,0.08)]";
const innerPanelClass =
  "rounded-[10px] border border-[#eef0f8] bg-[#faf9ff] shadow-[0_8px_20px_rgba(45,50,92,0.04)]";

function ImpactCard({
  icon,
  label,
  value,
  tone = "indigo",
}: {
  icon: ReactNode;
  label: string;
  value: string;
  tone?: "indigo" | "rose";
}) {
  return (
    <div className="rounded-[12px] bg-white/15 px-3 py-2 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.12)] backdrop-blur-sm">
      <div className="mb-2 flex items-center gap-1.5 text-white/70">
        {icon}
        <p className="text-[10px] font-bold leading-none">{label}</p>
      </div>
      <p
        className={`text-[13px] font-black leading-tight ${
          tone === "rose" ? "text-rose-100" : "text-white"
        }`}
      >
        {value}
      </p>
    </div>
  );
}

function ProcessStep({
  step,
  title,
  description,
  active,
}: {
  step: string;
  title: string;
  description: string;
  active?: boolean;
}) {
  return (
    <div
      className={`${innerPanelClass} flex items-center gap-3 px-3 py-3 ${
        active ? "border-[#d8d3ff] bg-[#f7f5ff]" : ""
      }`}
    >
      <span
        className={`grid size-8 shrink-0 place-items-center rounded-full text-[12px] font-black ${
          active ? "bg-[#6653e9] text-white" : "bg-white text-slate-400"
        }`}
      >
        {step}
      </span>
      <div className="min-w-0">
        <p className="text-[13px] font-black text-[#22243d]">{title}</p>
        <p className="mt-1 text-[11px] font-medium leading-4 text-slate-400">
          {description}
        </p>
      </div>
    </div>
  );
}

export function UnsubscribeScreen({ data }: UnsubscribeScreenProps) {
  const router = useRouter();
  const [agreed, setAgreed] = useState(false);
  const [withdrawing, setWithdrawing] = useState(false);
  const [modal, setModal] = useState<ModalState | null>(null);

  const handleWithdraw = async () => {
    setWithdrawing(true);

    try {
      await withdrawAccount(getPersistedAuthToken());
      clearAuthSession();
      setModal({
        title: "탈퇴 완료",
        message: data.successMessage,
        onConfirm: () => router.replace("/social-login"),
      });
    } catch (error) {
      setModal({
        title: "처리할 수 없어요",
        message:
          error instanceof Error && error.message === "AUTH_REQUIRED"
            ? "로그인이 필요합니다. 다시 로그인한 뒤 탈퇴를 진행해 주세요."
            : "탈퇴 처리 중 문제가 발생했습니다. 잠시 후 다시 시도해 주세요.",
      });
    } finally {
      setWithdrawing(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f8ff] pb-[164px] text-slate-950">
      <StackHeader title="서비스 탈퇴" fallbackHref="/setting" />

      <main className="mx-auto flex w-full max-w-[390px] flex-col gap-3 px-4 pb-4 pt-3">
        <section className="relative overflow-hidden rounded-[14px] px-5 py-[18px] text-white shadow-[0_14px_28px_rgba(96,72,220,0.26)] [background-image:radial-gradient(circle_at_82%_25%,rgba(255,255,255,0.24),transparent_28%),linear-gradient(135deg,#8374f6_0%,#6651e8_48%,#5941d9_100%)]">
          <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(255,255,255,0.16)_0%,transparent_42%)]" />
          <div className="pointer-events-none absolute -right-5 top-4 grid size-[104px] rotate-[-14deg] place-items-center rounded-[24px] border border-white/15 bg-white/10 text-white/45 shadow-inner">
            <ShieldIcon className="size-12" />
          </div>

          <div className="relative max-w-[250px]">
            <p className="text-[11px] font-black leading-none tracking-[0.22em] text-white/75">
              ACCOUNT
            </p>
            <h2 className="mt-2 text-[22px] font-black leading-tight">
              탈퇴 전 기록과 계정 상태를 확인해요
            </h2>
            <p className="mt-2 text-[12px] font-semibold leading-5 text-white/80">
              FitLog에 쌓아둔 운동, 식단, 신체 기록이 어떻게 처리되는지
              확인한 뒤 진행해 주세요.
            </p>
          </div>

          <div className="relative mt-5 grid grid-cols-3 gap-2">
            <ImpactCard
              icon={<ShieldIcon className="size-3.5" />}
              label="계정"
              value="탈퇴 전환"
            />
            <ImpactCard
              icon={<TrashIcon className="size-3.5" />}
              label="이용"
              value="접근 제한"
              tone="rose"
            />
            <ImpactCard
              icon={<SparklesIcon className="size-3.5" />}
              label="기록"
              value="정책 보관"
            />
          </div>
        </section>

        <section className={`${surfaceCardClass} px-4 py-3.5`}>
          <div className="mb-4 flex items-start gap-2">
            <span className="grid size-[27px] shrink-0 place-items-center rounded-full bg-[#7563f1] text-white">
              <InfoIcon className="size-4" />
            </span>
            <div className="min-w-0">
              <h2 className="text-[13px] font-black leading-none text-[#22243d]">
                탈퇴 시 유의사항
              </h2>
              <p className="mt-1.5 text-[11px] font-medium leading-4 text-slate-400">
                아래 내용을 확인해야 최종 탈퇴를 진행할 수 있어요.
              </p>
            </div>
          </div>

          <ul className="grid gap-2">
            {data.cautions.map((caution, index) => (
              <li
                key={caution}
                className={`${innerPanelClass} flex items-start gap-3 px-3 py-3`}
              >
                <span className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full bg-white text-[11px] font-black text-[#6653e9]">
                  {index + 1}
                </span>
                <p className="text-[12px] font-semibold leading-5 text-slate-600">
                  {caution}
                </p>
              </li>
            ))}
          </ul>
        </section>

        <section className={`${surfaceCardClass} px-4 py-3.5`}>
          <div className="mb-3 flex items-center justify-between gap-3">
            <h2 className="text-[13px] font-black leading-none text-[#22243d]">
              진행 순서
            </h2>
            <span className="rounded-full bg-[#f1efff] px-2.5 py-1 text-[10px] font-black leading-none text-[#6653e9]">
              3단계
            </span>
          </div>
          <div className="grid gap-2">
            <ProcessStep
              step="1"
              title="안내 확인"
              description="계정 상태와 기록 처리 방식을 먼저 확인합니다."
              active
            />
            <ProcessStep
              step="2"
              title="동의 체크"
              description="탈퇴 동의 후 최종 확인 버튼이 준비됩니다."
              active={agreed}
            />
            <ProcessStep
              step="3"
              title="최종 확인"
              description="확인 후 계정은 탈퇴 상태로 전환됩니다."
            />
          </div>
        </section>

        <label
          className={`${surfaceCardClass} flex cursor-pointer items-start gap-3 px-4 py-4 transition ${
            agreed ? "border-[#d8d3ff] bg-[#fbfaff]" : "hover:border-[#d8d3ff]"
          }`}
        >
          <input
            type="checkbox"
            checked={agreed}
            onChange={(event) => setAgreed(event.target.checked)}
            className="sr-only"
          />
          <span
            className={`mt-0.5 grid size-6 shrink-0 place-items-center rounded-full border-2 transition ${
              agreed
                ? "border-[#6653e9] bg-[#6653e9] text-white"
                : "border-slate-200 bg-white text-transparent"
            }`}
          >
            <CheckCircleIcon className="size-4" />
          </span>
          <span className="min-w-0">
            <span className="block text-[13px] font-black text-[#22243d]">
              탈퇴 안내 확인
            </span>
            <span className="mt-1 block text-[12px] font-semibold leading-5 text-slate-500">
              {data.agreementLabel}
            </span>
          </span>
        </label>
      </main>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-indigo-100/80 bg-white/95 px-4 pb-[calc(0.75rem+env(safe-area-inset-bottom))] pt-3 shadow-[0_-14px_28px_rgba(79,70,229,0.10)] backdrop-blur-xl">
        <div className="mx-auto w-full max-w-[390px]">
          <div className="mb-2.5 flex items-start gap-2 rounded-[14px] bg-[#faf9ff] px-3 py-2.5">
            <InfoIcon className="mt-0.5 size-4 shrink-0 text-[#6653e9]" />
            <p className="text-[11px] font-medium leading-5 text-slate-500">
              마음이 바뀌었다면 언제든 설정으로 돌아갈 수 있어요. 탈퇴는 최종 확인
              후에만 진행됩니다.
            </p>
          </div>
          <div className="grid grid-cols-[1fr_0.82fr] gap-2">
            <button
              type="button"
              onClick={() => router.push("/setting")}
              className="flex h-[52px] items-center justify-center rounded-[16px] bg-[linear-gradient(135deg,#8876fb,#6150dc)] text-[15px] font-black text-white shadow-[0_12px_22px_rgba(97,80,220,0.24)] transition-transform active:scale-[0.98]"
            >
              {data.continueLabel}
            </button>
            <button
              type="button"
              onClick={() => {
                if (!agreed) {
                  setModal({
                    title: "동의가 필요해요",
                    message: "탈퇴 안내를 확인하고 동의 체크박스를 선택해 주세요.",
                  });
                  return;
                }

                setModal({
                  title: "정말 탈퇴하시겠어요?",
                  message: data.confirmMessage,
                  confirmLabel: "탈퇴 진행",
                  tone: "danger",
                  onConfirm: handleWithdraw,
                });
              }}
              disabled={withdrawing}
              className={`flex h-[52px] items-center justify-center rounded-[16px] border text-[14px] font-black transition-transform active:scale-[0.98] disabled:cursor-wait disabled:opacity-70 ${
                agreed
                  ? "border-rose-200 bg-rose-50 text-rose-600"
                  : "border-slate-200 bg-white text-slate-400"
              }`}
            >
              {withdrawing ? "처리 중" : data.withdrawLabel}
            </button>
          </div>
        </div>
      </div>

      {modal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 p-6 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-[24px] bg-white p-5 shadow-2xl">
            <div
              className={`mb-4 grid size-11 place-items-center rounded-full ${
                modal.tone === "danger"
                  ? "bg-rose-50 text-rose-500"
                  : "bg-[#f1efff] text-[#6653e9]"
              }`}
            >
              {modal.tone === "danger" ? (
                <TrashIcon className="size-5" />
              ) : (
                <InfoIcon className="size-5" />
              )}
            </div>
            <h2 className="text-lg font-black text-slate-900">
              {modal.title ?? "알림"}
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              {modal.message}
            </p>
            <div className="mt-6 flex gap-2">
              {modal.confirmLabel ? (
                <button
                  type="button"
                  onClick={() => setModal(null)}
                  disabled={withdrawing}
                  className="flex-1 rounded-[14px] bg-slate-100 py-3 text-sm font-bold text-slate-600 disabled:cursor-wait disabled:opacity-60"
                >
                  취소
                </button>
              ) : null}
              <button
                type="button"
                disabled={withdrawing}
                onClick={() => {
                  if (modal.onConfirm) {
                    void modal.onConfirm();
                    return;
                  }

                  setModal(null);
                }}
                className={`flex-1 rounded-[14px] py-3 text-sm font-bold text-white disabled:cursor-wait disabled:opacity-70 ${
                  modal.tone === "danger"
                    ? "bg-rose-500"
                    : "bg-[linear-gradient(135deg,#8876fb,#6150dc)]"
                }`}
              >
                {withdrawing ? "처리 중" : (modal.confirmLabel ?? "확인")}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
