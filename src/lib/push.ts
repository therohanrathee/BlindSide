/**
 * Converts a base64 string to a Uint8Array.
 * Required for passing the VAPID public key to the PushManager.
 */
function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, "+")
    .replace(/_/g, "/");

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

/**
 * Registers the Service Worker and Subscribes the User to Push Notifications.
 */
export async function subscribeToPushNotifications() {
  if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
    console.warn("Push notifications are not supported by the browser.");
    return false;
  }

  try {
    // 1. Request permission
    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      console.warn("Notification permission not granted.");
      return false;
    }

    // 2. Register Service Worker
    const registration = await navigator.serviceWorker.register("/sw.js", {
      scope: "/",
    });
    
    // Ensure the service worker is ready
    await navigator.serviceWorker.ready;

    // 3. Subscribe to PushManager
    const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
    if (!vapidPublicKey) {
      console.error("Missing NEXT_PUBLIC_VAPID_PUBLIC_KEY in environment variables.");
      return false;
    }

    const convertedVapidKey = urlBase64ToUint8Array(vapidPublicKey);

    let subscription = await registration.pushManager.getSubscription();

    if (!subscription) {
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: convertedVapidKey,
      });
    }

    // 4. Send the subscription to our backend
    const response = await fetch("/api/push/subscribe", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(subscription),
    });

    if (!response.ok) {
      throw new Error("Failed to store push subscription on server");
    }

    // Show a test confirmation notification locally
    await registration.showNotification("Notifications Enabled! 🎉", {
      body: "You'll now receive alerts for new matches and messages.",
      icon: "/icon-512x512.png",
      badge: "/badge-72x72.png",
    });

    console.log("Successfully subscribed to push notifications!");
    return true;
  } catch (error) {
    console.error("Error subscribing to push notifications:", error);
    return false;
  }
}
