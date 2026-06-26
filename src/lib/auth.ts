import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { organization, createAccessControl } from "better-auth/plugins";
import { prisma } from "@/lib/prisma";

const defaultStatements = {
  organization: ["update", "delete"],
  member: ["create", "update", "delete"],
  invitation: ["create", "cancel"],
  team: ["create", "update", "delete"],
  ac: ["create", "read", "update", "delete"],
};

const defaultAc = createAccessControl(defaultStatements);

export const ownerAc = defaultAc.newRole({
  organization: ["update", "delete"],
  member: ["create", "update", "delete"],
  invitation: ["create", "cancel"],
  team: ["create", "update", "delete"],
  ac: ["create", "read", "update", "delete"],
});

export const adminAc = defaultAc.newRole({
  organization: ["update"],
  invitation: ["create", "cancel"],
  member: ["create", "update", "delete"],
  team: ["create", "update", "delete"],
  ac: ["create", "read", "update", "delete"],
});

export const memberAc = defaultAc.newRole({
  organization: [],
  member: [],
  invitation: [],
  team: [],
  ac: ["read"],
});

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
    minPasswordLength: 8,
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      enabled: !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET),
    },
    github: {
      clientId: process.env.GITHUB_CLIENT_ID || "",
      clientSecret: process.env.GITHUB_CLIENT_SECRET || "",
      enabled: !!(process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET),
    },
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // 1 day
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60, // 5 minutes
    },
  },
  plugins: [
    organization({
      creatorRole: "OWNER",
      sendInvitationEmail: async (data) => {
        const inviteUrl = `${process.env.BETTER_AUTH_URL || "http://localhost:3000"}/invite/${data.invitation.id}`;
        const apiKey = process.env.RESEND_API_KEY;
        const fromEmail = process.env.EMAIL_FROM || "onboarding@resend.dev";
        const emailSubject = `Invitation to join ${data.organization.name} on Cortex AI`;
        const emailHtml = `
          <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px;">
            <h2 style="color: #4f46e5; margin-bottom: 16px;">Cortex AI</h2>
            <p>Hello,</p>
            <p>You have been invited by <strong>${data.inviter.user.name || data.inviter.user.email}</strong> (${data.inviter.user.email}) to join their organization <strong>${data.organization.name}</strong> as a <strong>${data.role}</strong>.</p>
            <p style="margin: 24px 0;">
              <a href="${inviteUrl}" style="background-color: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">Accept Invitation</a>
            </p>
            <p style="color: #64748b; font-size: 12px; margin-top: 32px; border-top: 1px solid #f1f5f9; padding-top: 16px;">
              This invitation will expire on ${new Date(data.invitation.expiresAt).toLocaleDateString()}. If you did not expect this invitation, you can safely ignore this email.
            </p>
          </div>
        `;

        if (!apiKey) {
          console.log("=== MOCK INVITATION EMAIL ===");
          console.log(`To: ${data.email}`);
          console.log(`Subject: ${emailSubject}`);
          console.log(`Link: ${inviteUrl}`);
          console.log("=============================");
          return;
        }

        try {
          const response = await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
              from: fromEmail,
              to: [data.email],
              subject: emailSubject,
              html: emailHtml,
            }),
          });

          if (!response.ok) {
            const errorText = await response.text();
            console.error(`Resend API error: ${errorText}`);
          } else {
            console.log(`Invitation email sent successfully to ${data.email}`);
          }
        } catch (err) {
          console.error("Failed to send invitation email:", err);
        }
      },
      roles: {
        OWNER: ownerAc,
        ADMIN: adminAc,
        MANAGER: adminAc,
        EMPLOYEE: memberAc,
        CLIENT: memberAc,
        TEAM_LEAD: adminAc,
        DEVELOPER: memberAc,
        DESIGNER: memberAc,
        QA: memberAc,
      },
    }),
  ],
  trustedOrigins: [
    process.env.BETTER_AUTH_URL || "http://localhost:3000",
  ],
});

export type Session = typeof auth.$Infer.Session;
