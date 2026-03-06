import { Resend } from "resend";
import dotenv from 'dotenv';

dotenv.config();
const resend = new Resend(process.env.RESEND_API_KEY || "re_9RD4LGsU_AwVox66iM9JwyHU58wZAZkk4");

const sendEmail = async (to, subject, html) => {
  try {
    await resend.emails.send({
      from: `"Immigration" <onboarding@resend.dev>`,
      to,
      subject,
      html,
    });

    return { status: 200, message: "Email sent successfully" };
  } catch (error) {
    console.error("Send email error:", error);
    return { status: 500, message: "Failed to send email" };
  }
};

export default sendEmail;
