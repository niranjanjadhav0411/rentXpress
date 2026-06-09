package com.carrental.auth_service.service;

import com.carrental.auth_service.entity.Booking;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;
    private final PdfReceiptService pdfReceiptService;

    // ── Booking Received (sent immediately on booking creation)
    @Async
    public void sendBookingReceivedEmail(Booking booking) {
        try {
            String subject = "🚗 Booking Received – RentXpress #" + booking.getId();
            String html = buildBookingReceivedHtml(booking);
            sendHtmlEmail(booking.getEmail(), subject, html, null);
            log.info("Booking received email sent to {}", booking.getEmail());
        } catch (Exception e) {
            log.error("Failed to send booking received email: {}", e.getMessage());
        }
    }

    // ── Booking Confirmed (admin approves) — with PDF receipt
    @Async
    public void sendBookingConfirmedEmail(Booking booking) {
        try {
            byte[] pdf = pdfReceiptService.generateReceipt(booking);
            String subject = "✅ Booking Confirmed – RentXpress #" + booking.getId();
            String html = buildConfirmedHtml(booking);
            sendHtmlEmail(booking.getEmail(), subject, html, pdf);
            log.info("Booking confirmed email + PDF sent to {}", booking.getEmail());
        } catch (Exception e) {
            log.error("Failed to send booking confirmed email: {}", e.getMessage());
        }
    }

    // ── Booking Rejected
    @Async
    public void sendBookingRejectedEmail(Booking booking) {
        try {
            String subject = "❌ Booking Update – RentXpress #" + booking.getId();
            String html = buildRejectedHtml(booking);
            sendHtmlEmail(booking.getEmail(), subject, html, null);
            log.info("Booking rejected email sent to {}", booking.getEmail());
        } catch (Exception e) {
            log.error("Failed to send booking rejected email: {}", e.getMessage());
        }
    }

    // ── Core mail sender
    private void sendHtmlEmail(String to, String subject, String html, byte[] pdfAttachment)
            throws MessagingException {
        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
        helper.setTo(to);
        helper.setSubject(subject);
        helper.setText(html, true);
        helper.setFrom("noreply@rentxpress.in");
        if (pdfAttachment != null) {
            helper.addAttachment("RentXpress_Receipt.pdf",
                    new org.springframework.core.io.ByteArrayResource(pdfAttachment));
        }
        mailSender.send(message);
    }

    //  HTML Templates

    private String buildBookingReceivedHtml(Booking b) {
        return baseTemplate(
                "#f59e0b", "⏳ Booking Received",
                "Hi " + b.getName() + ", your booking request has been received.",
                "We will review your booking and payment details. You will receive a confirmation email within 24 hours.",
                b,
                "#f59e0b", "PENDING REVIEW",
                "Your payment reference <strong>" + nvl(b.getTxnId(), "N/A") + "</strong> has been noted. " +
                        "Our team will verify and confirm your booking shortly.",
                null
        );
    }

    private String buildConfirmedHtml(Booking b) {
        return baseTemplate(
                "#22c55e", "✅ Booking Confirmed!",
                "Hi " + b.getName() + ", great news — your booking is confirmed!",
                "Your car will be ready for pickup on " + b.getStartDate() + ". Please find your receipt attached.",
                b,
                "#22c55e", "CONFIRMED",
                "Please carry a valid photo ID at the time of pickup. Contact us if you have any questions.",
                "Your detailed receipt (PDF) is attached to this email."
        );
    }

    private String buildRejectedHtml(Booking b) {
        return baseTemplate(
                "#ef4444", "❌ Booking Not Confirmed",
                "Hi " + b.getName() + ", unfortunately we could not confirm your booking.",
                "This may be due to car unavailability or payment verification issues.",
                b,
                "#ef4444", "REJECTED",
                "If you made a payment, it will be refunded within 3-5 business days. " +
                        "Please contact us at support@rentxpress.in for assistance.",
                null
        );
    }

    private String baseTemplate(
            String accentColor, String title, String intro, String subtitle,
            Booking b, String statusColor, String statusLabel,
            String extraNote, String footerText) {

        String carName = b.getCar() != null
                ? b.getCar().getBrand() + " " + b.getCar().getModel()
                : "N/A";

        return """
        <!DOCTYPE html>
        <html>
        <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"/></head>
        <body style="margin:0;padding:0;background:#f4f4f8;font-family:'Helvetica Neue',Arial,sans-serif;">
          <table width="100%%" cellpadding="0" cellspacing="0" style="background:#f4f4f8;padding:30px 0;">
            <tr><td align="center">
              <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">

                <!-- HEADER -->
                <tr><td style="background:#0a0a14;padding:32px 40px;text-align:center;">
                  <div style="display:inline-flex;align-items:center;gap:10px;">
                    <div style="width:40px;height:40px;border-radius:10px;background:linear-gradient(135deg,#e8c97a,#c9a84c);display:inline-block;line-height:40px;text-align:center;font-size:18px;font-weight:900;color:#0a0a0f;">R</div>
                    <span style="font-size:24px;font-weight:900;color:#f0ede6;letter-spacing:-0.5px;">Rent<span style="color:#c9a84c;">Xpress</span></span>
                  </div>
                  <p style="color:#6a6a7a;font-size:12px;margin:8px 0 0;letter-spacing:2px;text-transform:uppercase;">Premium Car Rental</p>
                </td></tr>

                <!-- STATUS BANNER -->
                <tr><td style="background:%s;padding:20px 40px;text-align:center;">
                  <span style="font-size:22px;font-weight:900;color:#ffffff;letter-spacing:1px;">%s</span>
                </td></tr>

                <!-- TITLE -->
                <tr><td style="padding:36px 40px 20px;">
                  <h1 style="margin:0 0 8px;font-size:24px;font-weight:800;color:#0a0a14;">%s</h1>
                  <p style="margin:0 0 6px;font-size:15px;color:#4a4a5a;line-height:1.6;">%s</p>
                  <p style="margin:0;font-size:14px;color:#8a8a9a;">%s</p>
                </td></tr>

                <!-- BOOKING DETAILS -->
                <tr><td style="padding:0 40px 28px;">
                  <table width="100%%" cellpadding="0" cellspacing="0"
                    style="background:#f8f8fc;border-radius:12px;overflow:hidden;border:1px solid #e8e8f0;">
                    <tr><td colspan="2" style="background:#0a0a14;padding:12px 20px;">
                      <span style="font-size:11px;font-weight:700;color:#c9a84c;letter-spacing:2px;text-transform:uppercase;">Booking Details</span>
                    </td></tr>
                    %s
                  </table>
                </td></tr>

                <!-- NOTE -->
                <tr><td style="padding:0 40px 28px;">
                  <div style="background:#fffbeb;border:1px solid #fde68a;border-radius:10px;padding:16px 20px;">
                    <p style="margin:0;font-size:13px;color:#92400e;line-height:1.6;">%s</p>
                  </div>
                </td></tr>

                %s

                <!-- FOOTER -->
                <tr><td style="background:#f8f8fc;padding:24px 40px;text-align:center;border-top:1px solid #e8e8f0;">
                  <p style="margin:0 0 6px;font-size:12px;color:#8a8a9a;">Need help? Contact us at <a href="mailto:support@rentxpress.in" style="color:#c9a84c;">support@rentxpress.in</a></p>
                  <p style="margin:0;font-size:11px;color:#aaaaaa;">© 2026 RentXpress · Pimpri, Pune, Maharashtra · All rights reserved</p>
                </td></tr>

              </table>
            </td></tr>
          </table>
        </body>
        </html>
        """.formatted(
                statusColor, statusLabel,
                title, intro, subtitle,
                buildDetailsRows(b, carName),
                extraNote != null ? extraNote : "",
                extraNote != null && extraNote.contains("PDF")
                        ? "<tr><td style='padding:0 40px 28px;'><div style='background:#f0fdf4;border:1px solid #bbf7d0;border-radius:10px;padding:14px 18px;'><p style='margin:0;font-size:13px;color:#166534;'>📎 " + extraNote + "</p></div></td></tr>"
                        : ""
        );
    }

    private String buildDetailsRows(Booking b, String carName) {
        String[][] rows = {
                {"Booking ID",    "#" + b.getId()},
                {"Vehicle",       carName},
                {"Pickup Date",   b.getStartDate().toString()},
                {"Return Date",   b.getEndDate().toString()},
                {"Duration",      b.getTotalDays() + " day" + (b.getTotalDays() != 1 ? "s" : "")},
                {"Pickup Location", nvl(b.getLocation(), "N/A")},
                {"Fuel Type",     nvl(b.getFuelPreference(), "N/A")},
                {"Payment Method",nvl(b.getPaymentMethod(), "N/A")},
                {"Txn Reference", nvl(b.getTxnId(), "N/A")},
                {"Total Amount",  "₹" + String.format("%.0f", b.getTotalPrice())},
                {"Status",        b.getStatus().name()},
        };
        StringBuilder sb = new StringBuilder();
        boolean alt = false;
        for (String[] row : rows) {
            String bg = alt ? "#f0f0f8" : "#f8f8fc";
            sb.append("<tr style='background:").append(bg).append(";'>");
            sb.append("<td style='padding:11px 20px;font-size:12px;color:#6a6a7a;font-weight:600;width:42%;border-bottom:1px solid #e8e8f0;'>")
                    .append(row[0]).append("</td>");
            sb.append("<td style='padding:11px 20px;font-size:13px;color:#0a0a14;font-weight:700;border-bottom:1px solid #e8e8f0;'>")
                    .append(row[1]).append("</td>");
            sb.append("</tr>");
            alt = !alt;
        }
        return sb.toString();
    }

    private String nvl(String s, String def) {
        return (s != null && !s.isBlank()) ? s : def;
    }
}
