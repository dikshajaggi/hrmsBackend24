import prisma from "../db/db.config.js"


export const getProjectSites = async (req, res) => {
  try {
    const projectSites = await prisma.projectSite.findMany();

    const sitesWithAll = [
      { id: "All", site_name: "All" },  
      ...projectSites
    ];


    res.status(200).json({
      message: "projectSites fetched successfully",
      data: sitesWithAll,
    });

  } catch (error) {
    console.error("Error fetching projectSites:", error);
    res.status(500).json({
      message: "Failed to fetch projectSites",
      error: error.message,
    });
  }
};
