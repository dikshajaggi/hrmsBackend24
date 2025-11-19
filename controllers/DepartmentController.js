import prisma from "../db/db.config.js"


export const getDepartments = async (req, res) => {
  try {
    const departments = await prisma.department.findMany();

    const deptWithAll = [
      { id: "All", department_name: "All" },  
      ...departments
    ];


    res.status(200).json({
      message: "departments fetched successfully",
      data: deptWithAll,
    });

  } catch (error) {
    console.error("Error fetching departments:", error);
    res.status(500).json({
      message: "Failed to fetch departments",
      error: error.message,
    });
  }
};

