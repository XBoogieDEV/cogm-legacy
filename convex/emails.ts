import { v } from "convex/values";
import { internalAction } from "./_generated/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

// Email sender - using verified domain
const FROM_EMAIL = "COGM Memorial <noreply@cogmlegacy.org>";

// Admin email to receive notifications
const ADMIN_EMAIL = "cogm357@gmail.com";

// Site URL for links and assets
const SITE_URL = process.env.SITE_URL || "https://cogm-legacy.vercel.app";

// Design tokens matching website
const colors = {
  maroon: "#8B2332",
  maroonDark: "#6B1A26",
  gold: "#C5A572",
  goldLight: "#D4BC8E",
  cream: "#F5F1EB",
  creamDark: "#E8E2D8",
  doveWhite: "#FDFCFA",
  charcoal: "#2C2C2C",
};

// Reusable email wrapper with header and footer
const emailWrapper = (content: string) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: ${colors.cream}; font-family: 'Lato', 'Helvetica Neue', Arial, sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: ${colors.cream};">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="max-width: 600px; width: 100%;">

          <!-- Header with Logo -->
          <tr>
            <td align="center" style="padding-bottom: 30px;">
              <img src="${SITE_URL}/images/logo-banner.png" alt="COGM Memorial" style="max-width: 280px; height: auto;" />
            </td>
          </tr>

          <!-- Gold Divider -->
          <tr>
            <td align="center" style="padding-bottom: 30px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td style="height: 1px; background: linear-gradient(90deg, transparent, ${colors.gold}, transparent);"></td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Main Content Card -->
          <tr>
            <td>
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: ${colors.doveWhite}; border-radius: 8px; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06); border: 1px solid rgba(197, 165, 114, 0.2);">
                <tr>
                  <td style="padding: 40px;">
                    ${content}
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align="center" style="padding-top: 30px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td style="height: 1px; background: linear-gradient(90deg, transparent, ${colors.gold}, transparent);"></td>
                </tr>
              </table>
              <p style="color: ${colors.charcoal}; font-size: 12px; margin-top: 20px; opacity: 0.6;">
                Conference of Grand Masters, Prince Hall Affiliated<br>
                This is an automated message from COGM Memorial
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

// Styled button component
const button = (text: string, href: string) => `
<table role="presentation" cellspacing="0" cellpadding="0" style="margin: 25px 0;">
  <tr>
    <td align="center" style="background: linear-gradient(135deg, ${colors.maroon} 0%, ${colors.maroonDark} 100%); border-radius: 4px;">
      <a href="${href}" target="_blank" style="display: inline-block; padding: 14px 32px; font-family: Georgia, serif; font-size: 16px; font-weight: 500; color: ${colors.doveWhite}; text-decoration: none; letter-spacing: 0.05em;">
        ${text}
      </a>
    </td>
  </tr>
</table>
`;

// Info box component
const infoBox = (content: string) => `
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin: 25px 0;">
  <tr>
    <td style="background-color: ${colors.cream}; border-left: 4px solid ${colors.gold}; border-radius: 0 8px 8px 0; padding: 20px 24px;">
      ${content}
    </td>
  </tr>
</table>
`;

// Internal action: Send new submission notification to admin
export const sendAdminNotification = internalAction({
  args: {
    submissionId: v.string(),
    fullName: v.string(),
    jurisdiction: v.string(),
    submitterName: v.string(),
    submitterEmail: v.string(),
    submittedAt: v.number(),
  },
  handler: async (ctx, args) => {
    const submittedDate = new Date(args.submittedAt).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });

    const content = `
      <h1 style="font-family: Georgia, 'Cormorant Garamond', serif; font-size: 28px; font-weight: 500; color: ${colors.maroon}; margin: 0 0 20px 0; letter-spacing: 0.02em;">
        New Memorial Submission
      </h1>

      <p style="color: ${colors.charcoal}; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
        A new memorial submission has been received and is awaiting your review.
      </p>

      ${infoBox(`
        <h3 style="font-family: Georgia, serif; font-size: 18px; font-weight: 500; color: ${colors.maroon}; margin: 0 0 15px 0;">
          Deceased Member
        </h3>
        <p style="color: ${colors.charcoal}; font-size: 15px; line-height: 1.8; margin: 0;">
          <strong>Name:</strong> ${args.fullName}<br>
          <strong>Jurisdiction:</strong> ${args.jurisdiction}
        </p>
      `)}

      ${infoBox(`
        <h3 style="font-family: Georgia, serif; font-size: 18px; font-weight: 500; color: ${colors.maroon}; margin: 0 0 15px 0;">
          Submitted By
        </h3>
        <p style="color: ${colors.charcoal}; font-size: 15px; line-height: 1.8; margin: 0;">
          <strong>Name:</strong> ${args.submitterName}<br>
          <strong>Email:</strong> ${args.submitterEmail}<br>
          <strong>Date:</strong> ${submittedDate}
        </p>
      `)}

      ${button("Review Submission", `${SITE_URL}/admin`)}
    `;

    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: ADMIN_EMAIL,
      subject: `New Memorial Submission: ${args.fullName}`,
      html: emailWrapper(content),
    });

    if (error) {
      console.error("Failed to send admin notification:", error);
      throw new Error(`Failed to send email: ${error.message}`);
    }

    return { success: true, emailId: data?.id };
  },
});

// Internal action: Send confirmation email to submitter
export const sendSubmitterConfirmation = internalAction({
  args: {
    fullName: v.string(),
    submitterName: v.string(),
    submitterEmail: v.string(),
  },
  handler: async (ctx, args) => {
    const content = `
      <h1 style="font-family: Georgia, 'Cormorant Garamond', serif; font-size: 28px; font-weight: 500; color: ${colors.maroon}; margin: 0 0 20px 0; letter-spacing: 0.02em;">
        Thank You for Your Submission
      </h1>

      <p style="color: ${colors.charcoal}; font-size: 16px; line-height: 1.6; margin: 0 0 15px 0;">
        Dear ${args.submitterName},
      </p>

      <p style="color: ${colors.charcoal}; font-size: 16px; line-height: 1.6; margin: 0 0 25px 0;">
        We have received your memorial submission for <strong>${args.fullName}</strong>.
        Thank you for helping us honor their memory and dedicated service to our fraternity.
      </p>

      ${infoBox(`
        <h3 style="font-family: Georgia, serif; font-size: 18px; font-weight: 500; color: ${colors.maroon}; margin: 0 0 15px 0;">
          What Happens Next
        </h3>
        <ul style="color: ${colors.charcoal}; font-size: 15px; line-height: 2; margin: 0; padding-left: 20px;">
          <li>Our team will review the submission within 1-2 business days</li>
          <li>You will receive an email notification when the memorial is published</li>
          <li>If we need any additional information, we will contact you directly</li>
        </ul>
      `)}

      <p style="color: ${colors.charcoal}; font-size: 16px; line-height: 1.6; margin: 25px 0 0 0;">
        If you have any questions, please don't hesitate to reach out.
      </p>

      <p style="color: ${colors.charcoal}; font-size: 16px; line-height: 1.6; margin: 25px 0 0 0;">
        With fraternal gratitude,<br>
        <strong style="color: ${colors.maroon};">COGM Memorial Team</strong>
      </p>
    `;

    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: args.submitterEmail,
      subject: `Memorial Submission Received: ${args.fullName}`,
      html: emailWrapper(content),
    });

    if (error) {
      console.error("Failed to send submitter confirmation:", error);
      throw new Error(`Failed to send email: ${error.message}`);
    }

    return { success: true, emailId: data?.id };
  },
});

// Internal action: Send status change notification to submitter
export const sendStatusNotification = internalAction({
  args: {
    fullName: v.string(),
    submitterName: v.string(),
    submitterEmail: v.string(),
    newStatus: v.string(),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const statusConfig: Record<string, { subject: string; title: string; message: string }> = {
      reviewed: {
        subject: `Memorial Submission Reviewed: ${args.fullName}`,
        title: "Submission Under Review",
        message: "Your memorial submission has been reviewed by our team and is being prepared for publication on our memorial wall.",
      },
      published: {
        subject: `Memorial Published: ${args.fullName}`,
        title: "Memorial Now Published",
        message: "We are pleased to inform you that the memorial has been published and is now visible on our memorial wall for all to honor.",
      },
    };

    const config = statusConfig[args.newStatus];
    if (!config) {
      return { success: false, reason: "No notification for this status" };
    }

    const content = `
      <h1 style="font-family: Georgia, 'Cormorant Garamond', serif; font-size: 28px; font-weight: 500; color: ${colors.maroon}; margin: 0 0 20px 0; letter-spacing: 0.02em;">
        ${config.title}
      </h1>

      <p style="color: ${colors.charcoal}; font-size: 16px; line-height: 1.6; margin: 0 0 15px 0;">
        Dear ${args.submitterName},
      </p>

      <p style="color: ${colors.charcoal}; font-size: 16px; line-height: 1.6; margin: 0 0 25px 0;">
        ${config.message}
      </p>

      ${infoBox(`
        <p style="color: ${colors.charcoal}; font-size: 15px; line-height: 1.8; margin: 0;">
          <strong>Memorial:</strong> ${args.fullName}<br>
          <strong>Status:</strong> <span style="color: ${colors.maroon}; font-weight: 500;">${args.newStatus.charAt(0).toUpperCase() + args.newStatus.slice(1)}</span>
          ${args.notes ? `<br><strong>Notes:</strong> ${args.notes}` : ""}
        </p>
      `)}

      ${args.newStatus === "published" ? button("View Memorial Wall", `${SITE_URL}/memorials`) : ""}

      <p style="color: ${colors.charcoal}; font-size: 16px; line-height: 1.6; margin: 25px 0 0 0;">
        Thank you for helping us preserve the memory of our departed brethren.
      </p>

      <p style="color: ${colors.charcoal}; font-size: 16px; line-height: 1.6; margin: 25px 0 0 0;">
        With fraternal gratitude,<br>
        <strong style="color: ${colors.maroon};">COGM Memorial Team</strong>
      </p>
    `;

    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: args.submitterEmail,
      subject: config.subject,
      html: emailWrapper(content),
    });

    if (error) {
      console.error("Failed to send status notification:", error);
      throw new Error(`Failed to send email: ${error.message}`);
    }

    return { success: true, emailId: data?.id };
  },
});
