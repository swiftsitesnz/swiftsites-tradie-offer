const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);

const ALLOWED_ORIGINS = ["*"];

function corsHeaders(origin) {
  return {
    "Access-Control-Allow-Origin": ALLOWED_ORIGINS.includes("*") ? "*" : origin,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
}

module.exports = async function handler(req, res) {
  // CORS preflight
  if (req.method === "OPTIONS") {
    res.writeHead(204, corsHeaders(req.headers.origin));
    return res.end();
  }

  // Set CORS headers for all responses
  const headers = corsHeaders(req.headers.origin);
  Object.entries(headers).forEach(([key, value]) => {
    res.setHeader(key, value);
  });

  if (req.method !== "POST") {
    return res.status(405).json({ success: false, error: "Method not allowed" });
  }

  try {
    const { name, business_type, phone, email, message } = req.body;

    // Validate required fields
    if (!name || !business_type || !phone || !email) {
      return res.status(400).json({
        success: false,
        error: "Please fill in all required fields.",
      });
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        error: "Please provide a valid email address.",
      });
    }

    // Build HTML email body
    const htmlBody = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 560px; margin: 0 auto; color: #1a1a1a;">
        <h2 style="color: #08080A; border-bottom: 3px solid #E8FF47; padding-bottom: 12px;">
          New Tradie Website Enquiry
        </h2>
        <table style="width: 100%; border-collapse: collapse; margin-top: 16px;">
          <tr>
            <td style="padding: 10px 12px; font-weight: 600; color: #555; width: 140px; vertical-align: top;">Name</td>
            <td style="padding: 10px 12px;">${escapeHtml(name)}</td>
          </tr>
          <tr style="background: #f8f8f8;">
            <td style="padding: 10px 12px; font-weight: 600; color: #555; vertical-align: top;">Business Type</td>
            <td style="padding: 10px 12px;">${escapeHtml(business_type)}</td>
          </tr>
          <tr>
            <td style="padding: 10px 12px; font-weight: 600; color: #555; vertical-align: top;">Phone</td>
            <td style="padding: 10px 12px;"><a href="tel:${escapeHtml(phone)}" style="color: #08080A;">${escapeHtml(phone)}</a></td>
          </tr>
          <tr style="background: #f8f8f8;">
            <td style="padding: 10px 12px; font-weight: 600; color: #555; vertical-align: top;">Email</td>
            <td style="padding: 10px 12px;"><a href="mailto:${escapeHtml(email)}" style="color: #08080A;">${escapeHtml(email)}</a></td>
          </tr>
          ${message ? `
          <tr>
            <td style="padding: 10px 12px; font-weight: 600; color: #555; vertical-align: top;">Message</td>
            <td style="padding: 10px 12px;">${escapeHtml(message)}</td>
          </tr>` : ""}
        </table>
        <p style="margin-top: 24px; font-size: 13px; color: #999;">
          Sent from the Tradie $299 landing page &middot; swiftsites.nz
        </p>
      </div>
    `;

    // Send via Resend
    const { data, error } = await resend.emails.send({
      from: "SwiftSites Tradie Offer <noreply@swiftsites.nz>",
      to: ["swiftsites@swiftsites.nz"],
      reply_to: email,
      subject: `New Tradie Enquiry - ${name} (${business_type})`,
      html: htmlBody,
    });

    if (error) {
      console.error("Resend error:", error);
      return res.status(500).json({
        success: false,
        error: "Failed to send enquiry. Please try again.",
      });
    }

    return res.status(200).json({ success: true, id: data.id });
  } catch (err) {
    console.error("Server error:", err);
    return res.status(500).json({
      success: false,
      error: "Something went wrong. Please try again.",
    });
  }
};

function escapeHtml(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
