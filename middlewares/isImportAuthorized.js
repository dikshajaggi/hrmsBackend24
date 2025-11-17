import { PrismaClient } from "@prisma/client"
const prisma = new PrismaClient()

export async function isImportAuthorized(req, res, next) {
  try {
    const userId = req.user?.user_id  // coming from the info stored in db from the microsoft token
    if (!userId) return res.status(401).json({ message: "User not authenticated." })

    // checking role and permission flag
    const user = await prisma.user.findUnique({
      where: { user_id : userId },
      include: { UserPermissions: true },
    })

    if (!user) return res.status(404).json({ message: "User not found." })

    const isHR = user.role === "HR" || user.role === "ADMIN" || user.role === "EMPLOYEE"
    const hasImportAccess = user.UserPermissions?.some(p => p.can_import_employees === true)

    if (!isHR && !hasImportAccess) {
      return res.status(403).json({
        message: "Access denied. You don't have import permissions.",
      })
    }

    next()
  } catch (err) {
    console.error("Auth Error - ", err)
    res.status(500).json({ message: "Authorization check failed." })
  }
}
