import prisma from "../db/db.config.js"

export const createEmployee = async (req, res) => {
  
}

export const updateEmployee = async(req, res) => {
   
}

export const deleteEmployee = async(req, res) => {
}

export const getEmployees = async (req, res) => {
  try {
    const employees = await prisma.employeeMaster.findMany({
      where: {
        is_deleted: false,
      },

      include: {
        // Lookup tables
        department: true,
        branch: true,
        designation: true,
        projectSite: true,

        // Core employee info
        personal_details: true,
        job_details: {
          include: {
            manager: true,   // if you have manager relation in job details
          }
        },

        // Files
        documents: true,
      },

      orderBy: {
        employee_id: "desc",
      }
    });

    res.status(200).json({
      message: "Employees fetched successfully",
      data: employees,
    });

  } catch (error) {
    console.error("Error fetching employees:", error);
    res.status(500).json({
      message: "Failed to fetch employees",
      error: error.message,
    });
  }
};
