"use client";

import { useCallback, useEffect, useState } from "react";
import {
  getExistingPushSubscription,
  getNotificationPermission,
  isPushNotificationSupported,
  requestNotificationPermission,
  serializePushSubscription,
  subscribeBrowserPush,
  unsubscribeBrowserPush,
} from "./browser-push";
import {
  deletePushSubscription,
  getVapidPublicKey,
  savePushSubscription,
} from "./api";
import type { PushPermissionStatus } from "./types";

function getStatusMessage(status: PushPermissionStatus) {
  switch (status) {
    case "unsupported":
      return "이 브라우저는 푸시 알림을 지원하지 않아요.";
    case "denied":
      return "브라우저 알림 권한이 차단되어 있어요. 브라우저 설정에서 권한을 허용해 주세요.";
    case "granted":
      return "브라우저 알림 권한이 허용되어 있어요.";
    case "subscribed":
      return "푸시 알림을 받을 준비가 되었어요.";
    case "error":
      return "푸시 알림 설정 중 문제가 발생했어요.";
    default:
      return "푸시 알림을 켜면 브라우저 권한 요청이 표시돼요.";
  }
}

export function usePushNotification() {
  const [permissionStatus, setPermissionStatus] =
    useState<PushPermissionStatus>("default");
  const [isSupported, setIsSupported] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [message, setMessage] = useState(getStatusMessage("default"));

  const refreshPushStatus = useCallback(async () => {
    const supported = isPushNotificationSupported();
    setIsSupported(supported);

    if (!supported) {
      setPermissionStatus("unsupported");
      setIsSubscribed(false);
      setMessage(getStatusMessage("unsupported"));
      return;
    }

    const permission = getNotificationPermission();
    const subscription = await getExistingPushSubscription();
    const nextStatus = subscription ? "subscribed" : permission;

    setPermissionStatus(nextStatus);
    setIsSubscribed(Boolean(subscription));
    setMessage(getStatusMessage(nextStatus));
  }, []);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void refreshPushStatus();
    }, 0);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [refreshPushStatus]);

  const enablePushNotification = useCallback(async () => {
    setIsProcessing(true);
    setMessage("푸시 알림을 등록하는 중이에요.");

    try {
      if (!isPushNotificationSupported()) {
        setPermissionStatus("unsupported");
        setMessage(getStatusMessage("unsupported"));
        return false;
      }

      const permission = await requestNotificationPermission();

      if (permission !== "granted") {
        setPermissionStatus(permission);
        setMessage(getStatusMessage(permission));
        return false;
      }

      const publicKey = await getVapidPublicKey();
      const subscription = await subscribeBrowserPush(publicKey);
      const payload = serializePushSubscription(subscription);

      try {
        await savePushSubscription(payload);
      } catch (error) {
        await subscription.unsubscribe().catch(() => undefined);
        throw error;
      }

      setPermissionStatus("subscribed");
      setIsSubscribed(true);
      setMessage(getStatusMessage("subscribed"));
      return true;
    } catch (error) {
      console.error(error);
      setPermissionStatus("error");
      setIsSubscribed(false);
      setMessage("푸시 알림 등록에 실패했어요. 서버 설정과 로그인 상태를 확인해 주세요.");
      return false;
    } finally {
      setIsProcessing(false);
    }
  }, []);

  const disablePushNotification = useCallback(async () => {
    setIsProcessing(true);
    setMessage("푸시 알림을 해제하는 중이에요.");

    try {
      const payload = await unsubscribeBrowserPush();

      if (payload) {
        try {
          await deletePushSubscription({ endpoint: payload.endpoint });
        } catch (error) {
          console.error(error);
          setPermissionStatus("error");
          setIsSubscribed(false);
          setMessage("브라우저 구독은 해제됐지만 서버 반영에 실패했습니다. 잠시 후 다시 시도해 주세요.");
          return true;
        }
      }

      const permission = getNotificationPermission();
      const nextStatus = permission === "unsupported" ? "unsupported" : permission;

      setPermissionStatus(nextStatus);
      setIsSubscribed(false);
      setMessage(
        nextStatus === "unsupported"
          ? getStatusMessage("unsupported")
          : "푸시 알림 구독을 해제했어요.",
      );
      return true;
    } catch (error) {
      console.error(error);
      setPermissionStatus("error");
      setMessage("푸시 알림 해제에 실패했어요. 잠시 후 다시 시도해 주세요.");
      return false;
    } finally {
      setIsProcessing(false);
    }
  }, []);

  return {
    enablePushNotification,
    disablePushNotification,
    isProcessing,
    isSubscribed,
    isSupported,
    message,
    permissionStatus,
    refreshPushStatus,
  };
}
