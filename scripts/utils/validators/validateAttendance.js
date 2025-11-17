
export const validateAttendance = (row) => {
    const errors = []
    if (!row.EmployeeCode) errors.push("Missing EmployeeCode"); // employee_id

    if (!row.Date) errors.push("Missing Date"); // attendance_date
    else if (isNaN(Date.parse(row.Date))) errors.push("Invalid Date");

    const validStatuses = ["present", "absent", "wfh", "leave"];
    if (!row.Status) errors.push("Missing Status");
    else if (!validStatuses.includes(row.Status.toLowerCase())) errors.push("Invalid Status");

    if (row.Status?.toLowerCase() === "leave" && !row.LeaveType) errors.push("LeaveType required when status is 'leave'");

    return errors;
}