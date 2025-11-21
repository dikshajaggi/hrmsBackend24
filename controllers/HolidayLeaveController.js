import prisma from "../db/db.config.js";

export const getHolidays = async (req, res) => {
  try {
    let { branch_id, site_id, year } = req.query;

    year = Number(year);

    if (!year) {
      return res.status(400).json({ message: "Year is required" });
    }

    const cleanBranchId = branch_id ? Number(branch_id) : null;
    const cleanSiteId = site_id ? Number(site_id) : null;

    const startDate = new Date(year, 0, 1);
    const endDate = new Date(year, 11, 31);

    const baseWhere = {
      is_deleted: false,
      holiday_date: {
        gte: startDate,
        lte: endDate,
      },
    };

    const [national, branch, site] = await Promise.all([
      prisma.holiday.findMany({
        where: { ...baseWhere, is_national: true },
      }),
      cleanBranchId
        ? prisma.holiday.findMany({ where: { ...baseWhere, branch_id: cleanBranchId } })
        : prisma.holiday.findMany({ where: baseWhere }),  // get all branch holidays
      cleanSiteId
        ? prisma.holiday.findMany({ where: { ...baseWhere, site_id: cleanSiteId } })
        : prisma.holiday.findMany({ where: baseWhere }),  // get all site holidays
    ]);
    // Merge them with priority: site > branch > national
    const merged = new Map();

    const push = (arr) => {
      arr.forEach((h) => {
        const key = new Date(h.holiday_date).toISOString().substring(0, 10);
        merged.set(key, h);
      });
    };

    push(national);
    push(branch);
    push(site);

    const finalHolidays = Array.from(merged.values()).sort(
      (a, b) => new Date(a.holiday_date) - new Date(b.holiday_date)
    );

    return res.status(200).json({ data: finalHolidays });
  } catch (error) {
    console.error("HOLIDAY ERROR:", error);
    return res.status(500).json({ message: "Failed to fetch holidays" });
  }
};
