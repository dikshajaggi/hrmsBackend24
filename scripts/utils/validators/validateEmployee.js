
export const validateEmpMaster = (row) => {
  const errors = [];
  if (!row.Name) errors.push("Missing Name");
  if (!row.EmployeeCode) errors.push("Missing Employee Code");
  if (!row.DOJ) errors.push("Missing Date of Joining");
  if (!row.Branch) errors.push("Missing Branch");
  if (!row.Department) errors.push("Missing Department");
  if (!row.Designation) errors.push("Missing Designation");
  return errors;
}

export const validateEmpPersonal = (row) => {
const errors = [];
  if (!row.Email) errors.push("Missing Email");
  else if (!row.Email.includes("@")) errors.push("Invalid Email");
  if (!row.Contact) errors.push("Missing Contact");
  if (!row.Aadhaar) errors.push("Missing Aadhaar");
  if (!row.PAN) errors.push("Missing PAN");
  return errors;
}

export const validateEmpJob = (row) => {
const errors = [];
  if (!row["Employment Type"]) errors.push("Missing Employment Type");
  if (row["Notice Period Days"] && isNaN(Number(row["Notice Period Days"])))
    errors.push("Invalid Notice Period Days");
  return errors;
}

export const validateEmpDocs = (row) => {
 const errors = [];
  if (row["Document Type"] && !row["Document Path"])
    errors.push("Document Path missing for given Document Type");
  return errors;
}


export const validateEmployee = (row) => {
  return {
    master: validateEmpMaster(row),
    personal: validateEmpPersonal(row),
    job: validateEmpJob(row),
    docs: validateEmpDocs(row)
  }
}