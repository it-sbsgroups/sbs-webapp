// src/lib/dateUtils.js

export const formatDateTimeIST = (isoString) => {
  if (!isoString) return "—";
  const date = new Date(isoString);
  if (isNaN(date.getTime())) return "—";
  return date.toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

export const formatDateIST = (isoString) => {
  if (!isoString) return "—";
  const date = new Date(isoString);
  if (isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en-IN", {
    timeZone: "Asia/Kolkata",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

export const formatTimeIST = (isoString) => {
  if (!isoString) return "—";
  const date = new Date(isoString);
  if (isNaN(date.getTime())) return "—";
  return date.toLocaleTimeString("en-IN", {
    timeZone: "Asia/Kolkata",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

export const getTimeDifference = (startIso, endIso) => {
  if (!startIso || !endIso) return null;
  const start = new Date(startIso);
  const end = new Date(endIso);
  if (isNaN(start.getTime()) || isNaN(end.getTime())) return null;
  const diffMs = end.getTime() - start.getTime();
  if (diffMs < 0) return null;
  const diffMin = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMin / 60);
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays > 0) return `${diffDays}d ${diffHours % 24}h`;
  if (diffHours > 0) return `${diffHours}h ${diffMin % 60}m`;
  if (diffMin > 0) return `${diffMin}m`;
  return `${Math.floor(diffMs / 1000)}s`;
};

export const getAverageResponseTime = (rfqs) => {
  if (!rfqs || rfqs.length === 0) return "—";
  const responseTimes = [];
  rfqs.forEach((rfq) => {
    if (rfq.createdAt) {
      const replyTime = rfq.responses?.[0]?.sentAt || rfq.updatedAt || null;
      if (replyTime) {
        const diff = new Date(replyTime) - new Date(rfq.createdAt);
        if (diff > 0) responseTimes.push(diff);
      }
    }
  });
  if (responseTimes.length === 0) return "—";
  const avgMs = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;
  const avgMin = Math.floor(avgMs / 60000);
  const avgHours = Math.floor(avgMin / 60);
  const avgDays = Math.floor(avgHours / 24);
  if (avgDays > 0) return `${avgDays}d ${avgHours % 24}h`;
  if (avgHours > 0) return `${avgHours}h ${avgMin % 60}m`;
  if (avgMin > 0) return `${avgMin}m`;
  return `${Math.floor(avgMs / 1000)}s`;
};