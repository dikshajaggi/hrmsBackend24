export const validateAttendance = (row) => {
  const errors = [];

  // -----------------------------
  // Check Employee Code
  // -----------------------------
  if (!row.EmployeeCode) {
    errors.push("Missing EmployeeCode");
  }

  // -----------------------------
  // Check Date
  // -----------------------------
  if (!row.Date) {
    errors.push("Missing Date");
  } else if (isNaN(Date.parse(row.Date))) {
    errors.push(`Invalid Date '${row.Date}'`);
  }

  // -----------------------------
  // Allowed initials from UI
  // -----------------------------
  const VALID_INITIALS = [
    "P", "H", "S", 
    "L", "L1", "L2",
    "SL", "SL1", "SL2",
    "W", "C"
  ];

  // -----------------------------
  // Status validation
  // -----------------------------
  if (!row.Status || row.Status.trim() === "") {
    errors.push("Missing Status");
  } else if (!VALID_INITIALS.includes(row.Status)) {
    errors.push(`Invalid Status '${row.Status}'`);
  }

  // -----------------------------
  // Leave validation
  // Only required for leave-related codes:
  // L, L1, L2, SL, SL1, SL2
  // -----------------------------
  const LEAVE_CODES = ["L", "L1", "L2", "SL", "SL1", "SL2"];

  if (LEAVE_CODES.includes(row.Status)) {
    if (!row.LeaveType || row.LeaveType.trim() === "") {
      errors.push(`LeaveType required when Status is '${row.Status}'`);
    }
  }

  return errors;
};
