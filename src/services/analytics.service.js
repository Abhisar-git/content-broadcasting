const { Sequelize } = require("sequelize");
const { Content } = require("../models");
const { CONTENT_STATUS } = require("../utils/constants");
const { getSubjectAnalytics } = require("./live.service");

const getPrincipalSubjectAnalytics = async () => {
  const contentBySubject = await Content.findAll({
    attributes: ["subject", [Sequelize.fn("COUNT", Sequelize.col("id")), "count"]],
    group: ["subject"],
    order: [[Sequelize.literal("count"), "DESC"]]
  });

  const approvedBySubject = await Content.findAll({
    attributes: ["subject", [Sequelize.fn("COUNT", Sequelize.col("id")), "count"]],
    where: { status: CONTENT_STATUS.APPROVED },
    group: ["subject"],
    order: [[Sequelize.literal("count"), "DESC"]]
  });

  const liveAnalytics = await getSubjectAnalytics();

  return {
    mostActiveSubject: liveAnalytics.mostActiveSubject,
    totalContentBySubject: contentBySubject.map((item) => ({
      subject: item.subject,
      totalContents: Number(item.get("count"))
    })),
    approvedContentBySubject: approvedBySubject.map((item) => ({
      subject: item.subject,
      approvedContents: Number(item.get("count"))
    })),
    liveUsageBySubject: liveAnalytics.usageBySubject
  };
};

module.exports = {
  getPrincipalSubjectAnalytics
};
