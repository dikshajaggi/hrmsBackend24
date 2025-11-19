import prisma from "../db/db.config.js"


export const getBranches = async (req, res) => {
  try {
    const branches = await prisma.branch.findMany();
       const branchesWithAll = [
      { id: "All", branch_name: "All" },  
      ...branches
    ];

    res.status(200).json({
      message: "Branches fetched successfully",
      data: branchesWithAll,
    });

  } catch (error) {
    console.error("Error fetching branches:", error);
    res.status(500).json({
      message: "Failed to fetch branches",
      error: error.message,
    });
  }
};
