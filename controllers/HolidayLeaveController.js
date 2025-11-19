import prisma from "../db/db.config.js"

export const getHolidays = async (req, res) => {
  try {
    const { branch_id, site_id } = req.query;

    const whereClause = {
      is_deleted: false,
      OR: [
        { is_national: true },                                      // National holidays
        branch_id ? { branch_id: Number(branch_id) } : {},          // Branch holidays
        site_id ? { site_id: Number(site_id) } : {},                // Site holidays
      ],
    };

    const holidays = await prisma.holiday.findMany({
      where: whereClause,
      orderBy: { holiday_date: "asc" },
    });

    return res.status(200).json({ data: holidays });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to fetch holidays" });
  }
};
