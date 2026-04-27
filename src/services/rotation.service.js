const { CONTENT_STATUS } = require("../utils/constants");

const isContentInActiveWindow = (content, currentDate) => {
  if (!content.startTime || !content.endTime) {
    return false;
  }

  if (content.status !== CONTENT_STATUS.APPROVED) {
    return false;
  }

  return currentDate >= new Date(content.startTime) && currentDate <= new Date(content.endTime);
};

const pickActiveScheduleForSlot = (slot, schedules, currentDate) => {
  const eligibleSchedules = schedules
    .filter((schedule) => schedule.content && isContentInActiveWindow(schedule.content, currentDate))
    .sort((a, b) => a.rotationOrder - b.rotationOrder);

  if (!eligibleSchedules.length) {
    return null;
  }

  const totalCycleDuration = eligibleSchedules.reduce(
    (sum, schedule) => sum + schedule.durationMinutes,
    0
  );
  if (totalCycleDuration <= 0) {
    return null;
  }

  const anchorTimestamp = new Date(slot.createdAt).getTime();
  const nowTimestamp = currentDate.getTime();
  const elapsedMinutes = Math.max(0, Math.floor((nowTimestamp - anchorTimestamp) / 60000));
  const cycleOffset = elapsedMinutes % totalCycleDuration;

  let progress = 0;
  for (const schedule of eligibleSchedules) {
    progress += schedule.durationMinutes;
    if (cycleOffset < progress) {
      return schedule;
    }
  }

  return eligibleSchedules[eligibleSchedules.length - 1];
};

module.exports = {
  pickActiveScheduleForSlot
};
