"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { CheckCircleIcon, InfoIcon } from "@/components/icons";
import { StackHeader } from "@/components/navigation/stack-header";
import type { UnsubscribeData } from "../types";

type UnsubscribeScreenProps = {
  data: UnsubscribeData;
};

type ModalState = {
  message: string;
  confirmLabel?: string;
  onConfirm?: () => void;
};

export function UnsubscribeScreen({ data }: UnsubscribeScreenProps) {
  const router = useRouter();
  const [agreed, setAgreed] = useState(false);
  const [modal, setModal] = useState<ModalState | null>(null);

  return (
    <div className="min-h-screen bg-slate-50">
      <StackHeader title="서비스 탈퇴" fallbackHref="/setting" />

      <main className="mx-auto max-w-md px-6 pt-8 pb-10">
        <section className="rounded-[28px] border border-slate-100 bg-slate-50 p-5">
          <h2 className="mb-4 flex items-center gap-2 text-[15px] font-bold text-slate-800">
            <InfoIcon className="size-5 text-blue-500" />
            탈퇴 전 유의사항
          </h2>
          <ul className="space-y-4">
            {data.cautions.map((caution) => (
              <li key={caution} className="flex gap-3">
                <CheckCircleIcon className="mt-0.5 size-4 shrink-0 text-slate-300" />
                <p className="text-[14px] leading-6 text-slate-600">{caution}</p>
              </li>
            ))}
          </ul>
        </section>

        <label className="mt-6 flex cursor-pointer items-center gap-3 rounded-[24px] border-2 border-slate-100 bg-white p-4 transition hover:border-blue-100">
          <input
            type="checkbox"
            checked={agreed}
            onChange={(event) => setAgreed(event.target.checked)}
            className="size-5 accent-blue-500"
          />
          <span className="text-[14px] font-medium text-slate-700">
            {data.agreementLabel}
          </span>
        </label>

        <div className="mt-8 flex flex-col gap-3">
          <button
            type="button"
            onClick={() => router.push("/setting")}
            className="h-14 rounded-2xl bg-[#101828] text-[16px] font-bold text-white shadow-lg shadow-slate-200"
          >
            {data.continueLabel}
          </button>
          <button
            type="button"
            onClick={() => {
              if (!agreed) {
                setModal({ message: "탈퇴 동의 체크박스를 먼저 확인해 주세요." });
                return;
              }

              setModal({
                message: data.confirmMessage,
                confirmLabel: "탈퇴 진행",
                onConfirm: () =>
                  setModal({
                    message: data.successMessage,
                    onConfirm: () => router.push("/setting"),
                  }),
              });
            }}
            className="h-12 rounded-2xl text-[14px] font-medium text-slate-400 transition hover:bg-red-50 hover:text-red-500"
          >
            {data.withdrawLabel}
          </button>
        </div>
      </main>

      {modal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-6">
          <div className="w-full max-w-sm rounded-[28px] bg-white p-6 shadow-2xl">
            <h2 className="text-lg font-bold text-slate-900">알림</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              {modal.message}
            </p>
            <div className="mt-6 flex gap-2">
              {modal.confirmLabel ? (
                <button
                  type="button"
                  onClick={() => setModal(null)}
                  className="flex-1 rounded-xl bg-slate-100 py-3 text-sm font-bold text-slate-600"
                >
                  취소
                </button>
              ) : null}
              <button
                type="button"
                onClick={() => {
                  if (modal.onConfirm) {
                    modal.onConfirm();
                    return;
                  }

                  setModal(null);
                }}
                className="flex-1 rounded-xl bg-[#101828] py-3 text-sm font-bold text-white"
              >
                {modal.confirmLabel ?? "확인"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
