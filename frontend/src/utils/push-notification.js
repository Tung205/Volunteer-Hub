
import axios from 'axios';
import api from '../api/axios';

const VAPID_PUBLIC_KEY = 'BL0VNiUlDdC_zSCloOdyDTnAuHGow65nYeQ9YWA7xYSqaCxXrNpo4s5diPf_mKq7Kfap_Qqb_u4-3MHdwZyEiQI';

/**
 * Converts VAPID key to Uint8Array
 */
function urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
        .replace(/-/g, '+')
        .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}

/**
 * Check if Push API is supported
 */
export function isPushSupported() {
    return 'serviceWorker' in navigator && 'PushManager' in window;
}

/**
 * Register Service Worker
 */
export async function registerServiceWorker() {
    if (!isPushSupported()) return;

    try {
        const registration = await navigator.serviceWorker.register('/sw.js');
        console.log('SW Registered:', registration);
        return registration;
    } catch (error) {
        console.error('SW Registration failed:', error);
    }
}

/**
 * Request Permission and Subscribe
 */
export async function subscribeUserToPush() {
    if (!isPushSupported()) {
        alert("Trình duyệt không hỗ trợ Push Notification");
        return;
    }

    const registration = await navigator.serviceWorker.ready;

    // Subscribe
    try {
        const subscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
        });

        console.log('Push Subscription:', subscription);

        // Send to backend
        await api.post('/api/subscriptions', {
            endpoint: subscription.endpoint,
            keys: subscription.toJSON().keys
        });

        alert("Đã bật nhận thông báo thành công!");
        return subscription;

    } catch (err) {
        console.error('Failed to subscribe to Push', err);
        if (Notification.permission === 'denied') {
            alert("Bạn đã chặn thông báo. Vui lòng bật lại trong cài đặt trình duyệt.");
        } else {
            alert(`Lỗi khi đăng ký thông báo: ${err.message || err}`);
        }
    }
}
