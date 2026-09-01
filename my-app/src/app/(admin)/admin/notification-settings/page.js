// src/app/(admin)/admin/notification-settings/page.js
"use client";

import NotificationSettingsManager from "@/components/admin/notifications/NotificationSettingsManager";

export default function NotificationSettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-black text-slate-900">Notification Settings</h1>
        <p className="text-sm text-slate-500 mt-1">
          Control when subscribers get emailed about new products & news — instantly as each
          one is added, or once a day as a combined digest at a time you choose.
        </p>
      </div>
      <NotificationSettingsManager />
    </div>
  );
}
