import prisma from "../db/db.config.js";

function getAllSaturdays(year, month) {
  const saturdays = [];
  const date = new Date(Date.UTC(year, month, 1)); // Use UTC

  while (date.getUTCMonth() === month) {
    if (date.getUTCDay() === 6) { // Saturday
      saturdays.push(new Date(date)); // stays in UTC
    }
    date.setUTCDate(date.getUTCDate() + 1);
  }

  return saturdays;
}

function getSaturdayWeekNumber(date) {
  const day = date.getUTCDate();
  return Math.ceil(day / 7);
}

async function ensureDefaultGlobalSaturdayRule() {
  const global = await prisma.saturdayoff.findFirst({
    where: { branch_id: null, site_id: null }
  });

  if (!global) {
    // create default global rule 2nd and 4th
    await prisma.saturdayoff.create({
      data: {
        branch_id: null,
        site_id: null,
        off_saturdays: [2, 4],
        is_active: true
      }
    });
  } else if (!global.off_saturdays || global.off_saturdays.length === 0) {
    // update empty global rule
    await prisma.saturdayoff.update({
      where: { id: global.id },
      data: { off_saturdays: [2, 4], is_active: true }
    });
  }
}


export const getSaturdayOffs = async (req, res) => {
  try {
    let { branch_id, site_id, year, month } = req.query;
    year = Number(year);
    month = Number(month);

    if (!year || isNaN(month)) {
      return res.status(400).json({ message: "year and month required" });
    }

    const cleanBranchId = branch_id ? Number(branch_id) : null;
    const cleanSiteId = site_id ? Number(site_id) : null;

    // 1. Generate list of Saturdays for the month
    const allSaturdays = getAllSaturdays(year, month);

    // 2. Fetch rule → priority: site > branch > global
    let rule = null;

    if (cleanSiteId) {
      rule = await prisma.saturdayoff.findFirst({
        where: { site_id: cleanSiteId, is_active: true },
      });
    }

    if (!rule && cleanBranchId) {
      rule = await prisma.saturdayoff.findFirst({
        where: { branch_id: cleanBranchId, site_id: null, is_active: true },
      });
    }

    if (!rule) {
      rule = await prisma.saturdayoff.findFirst({
        where: { branch_id: null, site_id: null, is_active: true },
      });
    }

    const offSaturdaysPattern = rule ? rule.off_saturdays : [];

    // 3. Fetch overrides for month
    const startDate = new Date(Date.UTC(year, month, 1));
    const endDate = new Date(Date.UTC(year, month + 1, 0));

    const overrides = await prisma.saturdayoffoverride.findMany({
      where: {
        override_date: { gte: startDate, lte: endDate },
        OR: [
          { site_id: cleanSiteId },
          { branch_id: cleanBranchId },
          { site_id: null, branch_id: null }, // global override
        ],
      },
    });

    const overrideMap = new Map();
    overrides.forEach((o) => {
      const key = o.override_date.toISOString().slice(0, 10);
      overrideMap.set(key, o);
    });

    // . Apply overrides
    const finalResults = [];
    const saturdayOffs = [];
    const saturdayWorking = [];

    allSaturdays.forEach((sat) => {
      const key = sat.toISOString().slice(0, 10);
      const weekNum = getSaturdayWeekNumber(sat);

      let status = offSaturdaysPattern.includes(weekNum)
        ? "off"
        : "working";

      // override apply
      if (overrideMap.has(key)) {
        status = overrideMap.get(key).status;
      }

      // push result
      finalResults.push({
        date: sat,
        week_number: weekNum,
        status,
      });

      if (status === "off") saturdayOffs.push(sat);
      else saturdayWorking.push(sat);
    });

    if (!cleanBranchId && !cleanSiteId) {
      await ensureDefaultGlobalSaturdayRule()
    }

    return res.status(200).json({
      year,
      month,
      all_saturdays: allSaturdays,
      saturday_offs: saturdayOffs,
      saturday_working: saturdayWorking,
      final: finalResults,
    });
  } catch (err) {
    console.error("SATURDAY OFF ERROR: ", err);
    return res.status(500).json({ message: "Server Error" });
  }
};

export const setSaturdayRule = async (req, res) => {
  try {
    let { branch_id, site_id, off_saturdays } = req.body;

    const cleanBranchId = branch_id ? Number(branch_id) : null;
    const cleanSiteId = site_id ? Number(site_id) : null;

    if (!Array.isArray(off_saturdays)) {
      return res.status(400).json({ message: "off_saturdays must be an array" });
    }

    let rule;

    // ================
    // 1) SITE RULE
    // ================
    if (cleanSiteId !== null) {
      rule = await prisma.saturdayoff.upsert({
        where: {
          branch_id_site_id: {
            branch_id: cleanBranchId,
            site_id: cleanSiteId,
          }
        },
        update: { off_saturdays, is_active: true },
        create: {
          branch_id: cleanBranchId,
          site_id: cleanSiteId,
          off_saturdays,
          is_active: true
        }
      });
    }

    // ==================
    // 2) BRANCH RULE
    // ==================
    else if (cleanBranchId !== null) {
      rule = await prisma.saturdayoff.upsert({
        where: {
          branch_id_site_id: {
            branch_id: cleanBranchId,
            site_id: null,
          }
        },
        update: { off_saturdays, is_active: true },
        create: {
          branch_id: cleanBranchId,
          site_id: null,
          off_saturdays,
          is_active: true
        }
      });
    }

    // ==================
    // 3) GLOBAL RULE
    // ==================
    else {
      // for global, upsert won't work (NULL in composite key)
      const existing = await prisma.saturdayoff.findFirst({
        where: { branch_id: null, site_id: null }
      });

      if (existing) {
        rule = await prisma.saturdayoff.update({
          where: { id: existing.id },
          data: { off_saturdays, is_active: true }
        });
      } else {
        rule = await prisma.saturdayoff.create({
          data: {
            branch_id: null,
            site_id: null,
            off_saturdays,
            is_active: true
          }
        });
      }
    }

    return res.status(200).json({
      message: "Saturday rule saved",
      data: rule
    });

  } catch (err) {
    console.error("Saturday Rule Error:", err);
    return res.status(500).json({ message: "Server Error" });
  }
};


export const getSaturdayRule = async (req, res) => {
  try {
    let { branch_id, site_id } = req.query;

    const cleanBranchId = branch_id ? Number(branch_id) : null;
    const cleanSiteId = site_id ? Number(site_id) : null;

    let rule = null;

    // 1) Site rule (highest priority)
    if (cleanSiteId !== null) {
      rule = await prisma.saturdayoff.findFirst({
        where: {
          site_id: cleanSiteId,
          is_active: true
        }
      });
    }

    // 2) Branch rule (fallback)
    if (!rule && cleanBranchId !== null) {
      rule = await prisma.saturdayoff.findFirst({
        where: {
          branch_id: cleanBranchId,
          site_id: null,
          is_active: true
        }
      });
    }

    // 3) Global rule (lowest fallback)
    if (!rule) {
      rule = await prisma.saturdayoff.findFirst({
        where: {
          branch_id: null,
          site_id: null,
          is_active: true
        }
      });
    }

    // if even global rule is missing, build default [2,4]
    if (!rule) {
      rule = {
        branch_id: null,
        site_id: null,
        off_saturdays: [2, 4],
      };
    }

    return res.status(200).json({
      status: "success",
      rule
    });

  } catch (err) {
    console.error("FETCH RULE ERROR:", err);
    return res.status(500).json({ message: "Server Error" });
  }
};


export const saveCustomSaturdayOverrides = async (req, res) => {
  try {
    let { branch_id, site_id, year, month, dates } = req.body;

    if (!Array.isArray(dates) || !year || month === undefined) {
      return res.status(400).json({ message: "dates[], year, month required" });
    }

    const cleanBranchId = branch_id ? Number(branch_id) : null;
    const cleanSiteId = site_id ? Number(site_id) : null;

    // Delete existing overrides for the month + same branch/site
    const monthStart = new Date(Date.UTC(year, month, 1));
    const monthEnd = new Date(Date.UTC(year, month + 1, 0));

    await prisma.saturdayoffoverride.deleteMany({
      where: {
        override_date: { gte: monthStart, lte: monthEnd },
        branch_id: cleanBranchId,
        site_id: cleanSiteId,
      }
    });

    // Insert new overrides
    const payload = dates.map(d => {
      // d is "2025-03-08"

      const [y, m, day] = d.split("-").map(Number);

      // Build local date with no timezone shift
      const overrideUTC = new Date(Date.UTC(y, m - 1, day));

      return {
        branch_id: cleanBranchId,
        site_id: cleanSiteId,
        override_date: overrideUTC,
        status: "off"
      };
    });

    await prisma.saturdayoffoverride.createMany({
      data: payload
    });

    return res.status(200).json({
      message: "Custom Saturday overrides saved",
      overrides: payload
    });

  } catch (err) {
    console.error("SAVE CUSTOM OVERRIDES ERROR:", err);
    return res.status(500).json({ message: "Server Error" });
  }
};


export const getCustomSaturdayOverrides = async (req, res) => {
  try {
    let { branch_id, site_id, year, month } = req.query;

    if (!year || month === undefined)
      return res.status(400).json({ message: "year and month required" });

    const cleanBranchId = branch_id ? Number(branch_id) : null;
    const cleanSiteId = site_id ? Number(site_id) : null;

    const monthStart = new Date(Date.UTC(year, month, 1));
    const monthEnd = new Date(Date.UTC(year, month + 1, 0));

    const overrides = await prisma.saturdayoffoverride.findMany({
      where: {
        override_date: { gte: monthStart, lte: monthEnd },
        branch_id: cleanBranchId,
        site_id: cleanSiteId,
      },
      orderBy: { override_date: "asc" }
    });

    return res.status(200).json({
      overrides: overrides.map(o => ({
        ...o,
        override_date: o.override_date.toISOString().slice(0, 10)
      }))
    });

  } catch (err) {
    console.error("GET CUSTOM OVERRIDES ERROR:", err);
    return res.status(500).json({ message: "Server Error" });
  }
};
