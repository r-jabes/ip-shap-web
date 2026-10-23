import { logger } from "@/lib/logger";
import { queueBackInStockNotices } from "@/lib/notifications/back-in-stock";
import {
  processDueNotifications,
  purgeOldNotifications,
} from "@/lib/notifications/outbox";
import { queueStockAlert } from "@/lib/notifications/stock-alerts";
import { releaseExpiredHolds } from "@/lib/orders/holds";
import { purgeOldHistory } from "@/lib/privacy/retention";
import { getRestockStore } from "@/lib/stock/restock-requests";

export type MaintenanceReport = {
  stockAlertQueued: boolean | null;
  backInStockQueued: number | null;
  notifications: Awaited<ReturnType<typeof processDueNotifications>> | null;
  notificationsPurged: number | null;
  restockRequestsPurged: number | null;
  history: Awaited<ReturnType<typeof purgeOldHistory>> | null;
  holds: Awaited<ReturnType<typeof releaseExpiredHolds>> | null;
  errors: string[];
};

/**
 * The scheduled housekeeping run: queue and send notifications (retrying unsent ones), delete old
 * data (delivered notifications, answered requests, year-old history) and release stock held by
 * orders nobody confirmed. Each task is independent — one failing never stops the others.
 */
export async function runMaintenance(now = new Date()): Promise<MaintenanceReport> {
  const report: MaintenanceReport = {
    stockAlertQueued: null,
    backInStockQueued: null,
    notifications: null,
    notificationsPurged: null,
    restockRequestsPurged: null,
    history: null,
    holds: null,
    errors: [],
  };

  const task = async (name: string, run: () => Promise<void>) => {
    try {
      await run();
    } catch (error) {
      const message = error instanceof Error ? error.message : "unknown";
      report.errors.push(`${name}: ${message}`);
      logger.error("Maintenance task failed", { task: name, error: message });
    }
  };

  // Release held stock first, so restocked drinks are noticed in the same run.
  await task("stock-holds", async () => {
    report.holds = await releaseExpiredHolds(now);
  });
  await task("stock-alert", async () => {
    report.stockAlertQueued = await queueStockAlert();
  });
  await task("back-in-stock", async () => {
    report.backInStockQueued = await queueBackInStockNotices();
  });
  await task("notifications", async () => {
    report.notifications = await processDueNotifications({ limit: 50, now });
  });
  await task("notification-cleanup", async () => {
    report.notificationsPurged = await purgeOldNotifications(now);
  });
  await task("restock-cleanup", async () => {
    report.restockRequestsPurged = await getRestockStore().purge(now);
  });
  await task("history-cleanup", async () => {
    report.history = await purgeOldHistory();
  });

  logger.info("Maintenance finished", { ...report });
  return report;
}
