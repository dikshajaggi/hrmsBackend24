import jwt from "jsonwebtoken";
import jwksClient from "jwks-rsa";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const TENANT_ID = process.env.AZ_TENANT_ID;
const CLIENT_ID = process.env.AZ_CLIENT_ID;

const client = jwksClient({
  jwksUri: `https://login.microsoftonline.com/${TENANT_ID}/discovery/v2.0/keys` // to fetch microsoft's public keys as they have signed the token
});

// in token headerr a kid (key id) is present....and getkey is using that kid to get public key from micorsoft's jwks
function getKey(header, callback) {
  client.getSigningKey(header.kid, (err, key) => {
    if (err) return callback(err);
    const signingKey = key.getPublicKey();
    callback(null, signingKey);
  });
}

export async function verifyMicrosoftToken(req, res, next) {
  const authHeader = req.headers.authorization;
  console.log(authHeader, "authHeaderauthHeader")
  if (!authHeader?.startsWith("Bearer "))
    return res.status(401).json({ message: "No token found" });

  const token = authHeader.split(" ")[1];
  console.log(token, "tokentoken")

  jwt.verify(
    token,
    getKey,
    {
      audience: [
        `api://${CLIENT_ID}`,
    ],
      issuer: [
        `https://sts.windows.net/${TENANT_ID}/`,
        `https://login.microsoftonline.com/${TENANT_ID}/v2.0`,
      ]
    },
    async (err, decoded) => {
      if (err) {
        return res.status(401).json({ message: "Invalid or expired token" });
      }

      // microsoft token verified 
      const azureOid = decoded.oid || decoded.sub;
      const email = decoded.preferred_username || decoded.email;
      const name = decoded.name || "";

      // map microsoft user to db... this data  will be helpful for rbac also
      let user = await prisma.user.findUnique({ where: { azure_oid: azureOid }, 
        include: { employee: true } // include existing mapping 
      });

      if (!user) {
        user = await prisma.user.create({
          data: {
            azure_oid: azureOid,
            email,
            name,
            role: "EMPLOYEE", // default role
            last_login: new Date(), // first login
          },
        });
      } else {
      // update existing user’s last_login every time they log in
      await prisma.user.update({
        where: { azure_oid: azureOid },
        data: { last_login: new Date() },
      });
    }

      // ------------------------------
      // EmployeeMaster <-> User Mapping (IMPORTANT!)
      // ------------------------------

      // User already mapped to an employee ->  no need to do anything
      if (!user.employee_id) {

        // Try matching employee via official email from HR CSV
        const employee = await prisma.employeePersonalDetails.findUnique({
          where: { email: email },   // depends on HR CSV
          select: { employee_id: true }
        });

        if (employee) {
          // Connect user <-> employee
          await prisma.user.update({
            where: { azure_oid: azureOid },
            data: {
              employee: {
                connect: { employee_id: employee.employee_id }
              }
            }
          });
        }
      }

      // Fetch updated user (with employee details)
      user = await prisma.user.findUnique({
        where: { azure_oid: azureOid },
        include: { employee: true }
      });


      req.user = user;
      next();
    }
  );
}
