package com.carrental.auth_service.service;

import com.carrental.auth_service.entity.Booking;
import com.itextpdf.kernel.colors.ColorConstants;
import com.itextpdf.kernel.colors.DeviceRgb;
import com.itextpdf.kernel.font.PdfFont;
import com.itextpdf.kernel.font.PdfFontFactory;
import com.itextpdf.kernel.geom.PageSize;
import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.borders.Border;
import com.itextpdf.layout.borders.SolidBorder;
import com.itextpdf.layout.element.*;
import com.itextpdf.layout.properties.HorizontalAlignment;
import com.itextpdf.layout.properties.TextAlignment;
import com.itextpdf.layout.properties.UnitValue;
import com.itextpdf.layout.properties.VerticalAlignment;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@Service
public class PdfReceiptService {

    private static final DeviceRgb DARK       = new DeviceRgb(10,  10,  20);
    private static final DeviceRgb GOLD       = new DeviceRgb(201, 168, 76);
    private static final DeviceRgb GOLD_LIGHT = new DeviceRgb(232, 201, 122);
    private static final DeviceRgb GREEN      = new DeviceRgb(34,  197, 94);
    private static final DeviceRgb LIGHT_BG   = new DeviceRgb(248, 248, 252);
    private static final DeviceRgb BORDER_CLR = new DeviceRgb(232, 232, 240);
    private static final DeviceRgb TEXT_MUTED = new DeviceRgb(106, 106, 122);
    private static final DeviceRgb TEXT_MAIN  = new DeviceRgb(10,  10,  30);
    private static final DeviceRgb ALT_ROW    = new DeviceRgb(240, 240, 248);

    public byte[] generateReceipt(Booking booking) {
        try (ByteArrayOutputStream baos = new ByteArrayOutputStream()) {
            PdfWriter writer   = new PdfWriter(baos);
            PdfDocument pdf    = new PdfDocument(writer);
            Document document  = new Document(pdf, PageSize.A4);
            document.setMargins(0, 0, 40, 0);

            PdfFont bold    = PdfFontFactory.createFont(com.itextpdf.io.font.constants.StandardFonts.HELVETICA_BOLD);
            PdfFont regular = PdfFontFactory.createFont(com.itextpdf.io.font.constants.StandardFonts.HELVETICA);

            String carName = booking.getCar() != null
                    ? booking.getCar().getBrand() + " " + booking.getCar().getModel()
                    : "N/A";

            // ── DARK HEADER
            Table header = new Table(UnitValue.createPercentArray(new float[]{1}))
                    .setWidth(UnitValue.createPercentValue(100))
                    .setBackgroundColor(DARK);
            Cell headerCell = new Cell()
                    .setBorder(Border.NO_BORDER)
                    .setPadding(36);

            // Brand name
            Paragraph brand = new Paragraph()
                    .add(new Text("Rent").setFont(bold).setFontColor(ColorConstants.WHITE).setFontSize(28))
                    .add(new Text("Xpress").setFont(bold).setFontColor(GOLD).setFontSize(28))
                    .setTextAlignment(TextAlignment.CENTER)
                    .setMarginBottom(4);
            headerCell.add(brand);

            headerCell.add(new Paragraph("BOOKING RECEIPT")
                    .setFont(bold).setFontSize(9).setFontColor(TEXT_MUTED)
                    .setTextAlignment(TextAlignment.CENTER)
                    .setCharacterSpacing(3).setMarginBottom(20));

            // Gold divider
            Table divider = new Table(UnitValue.createPercentArray(new float[]{1}))
                    .setWidth(UnitValue.createPercentValue(40))
                    .setHorizontalAlignment(HorizontalAlignment.CENTER);
            divider.addCell(new Cell().setHeight(2).setBackgroundColor(GOLD).setBorder(Border.NO_BORDER));
            headerCell.add(divider).add(new Paragraph("\n"));

            // CONFIRMED badge
            Cell badge = new Cell()
                    .add(new Paragraph("✓  BOOKING CONFIRMED")
                            .setFont(bold).setFontSize(13).setFontColor(ColorConstants.WHITE)
                            .setTextAlignment(TextAlignment.CENTER))
                    .setBackgroundColor(GREEN)
                    .setBorder(Border.NO_BORDER)
                    .setPaddingTop(10).setPaddingBottom(10);

            Table badgeTable = new Table(UnitValue.createPercentArray(new float[]{1}))
                    .setWidth(UnitValue.createPercentValue(60))
                    .setHorizontalAlignment(HorizontalAlignment.CENTER);
            badgeTable.addCell(badge);
            headerCell.add(badgeTable);

            header.addCell(headerCell);
            document.add(header);

            // ── BOOKING INFO ROW
            float[] infoWidths = {1, 1, 1};
            Table infoRow = new Table(UnitValue.createPercentArray(infoWidths))
                    .setWidth(UnitValue.createPercentValue(100))
                    .setBackgroundColor(LIGHT_BG);

            addInfoCell(infoRow, bold, regular, "Booking ID", "#" + booking.getId(), GOLD);
            addInfoCell(infoRow, bold, regular, "Booking Date",
                    booking.getCreatedAt() != null
                            ? booking.getCreatedAt().format(DateTimeFormatter.ofPattern("dd MMM yyyy"))
                            : LocalDateTime.now().format(DateTimeFormatter.ofPattern("dd MMM yyyy")),
                    TEXT_MAIN);
            addInfoCell(infoRow, bold, regular, "Status", "CONFIRMED", GREEN);
            document.add(infoRow);

            // ── SECTION: Ride Details
            document.add(sectionHeader("RIDE DETAILS", bold));

            String[][] rideRows = {
                    {"Vehicle",         carName},
                    {"Fuel Type",       nvl(booking.getFuelPreference(), "N/A")},
                    {"Pickup Date",     booking.getStartDate().format(DateTimeFormatter.ofPattern("dd MMMM yyyy, EEEE"))},
                    {"Return Date",     booking.getEndDate().format(DateTimeFormatter.ofPattern("dd MMMM yyyy, EEEE"))},
                    {"Duration",        booking.getTotalDays() + " day" + (booking.getTotalDays() != 1 ? "s" : "")},
                    {"Pickup Location", nvl(booking.getLocation(), "N/A")},
                    {"Destination",     nvl(booking.getDestination(), "N/A")},
                    {"Pickup Address",  nvl(booking.getPickupAddress(), "N/A")},
            };
            document.add(buildTable(rideRows, bold, regular));

            // ── SECTION: Customer Details
            document.add(sectionHeader("CUSTOMER DETAILS", bold));

            String userEmail = booking.getUser() != null ? booking.getUser().getEmail() : booking.getEmail();
            String[][] custRows = {
                    {"Full Name",  nvl(booking.getName(),    "N/A")},
                    {"Email",      nvl(userEmail,            "N/A")},
                    {"Contact",    nvl(booking.getContact(), "N/A")},
            };
            document.add(buildTable(custRows, bold, regular));

            // ── SECTION: Payment Details
            document.add(sectionHeader("PAYMENT DETAILS", bold));

            String[][] payRows = {
                    {"Payment Method",  nvl(booking.getPaymentMethod(), "N/A")},
                    {"Transaction Ref", nvl(booking.getTxnId(),         "N/A")},
                    {"Amount Paid",     "\u20B9" + String.format("%.0f", booking.getTotalPrice())},
            };
            document.add(buildTable(payRows, bold, regular));

            // ── TOTAL AMOUNT BOX
            document.add(new Paragraph("\n"));
            Table totalBox = new Table(UnitValue.createPercentArray(new float[]{1}))
                    .setWidth(UnitValue.createPercentValue(100))
                    .setBackgroundColor(DARK);
            Cell totalCell = new Cell().setBorder(Border.NO_BORDER).setPadding(20);
            totalCell.add(new Paragraph("TOTAL AMOUNT PAID")
                    .setFont(bold).setFontSize(9).setFontColor(TEXT_MUTED)
                    .setCharacterSpacing(2).setTextAlignment(TextAlignment.CENTER));
            totalCell.add(new Paragraph("\u20B9" + String.format("%.0f", booking.getTotalPrice()))
                    .setFont(bold).setFontSize(36).setFontColor(GOLD)
                    .setTextAlignment(TextAlignment.CENTER).setMarginBottom(0));
            totalBox.addCell(totalCell);
            document.add(totalBox);

            // ── FOOTER
            document.add(new Paragraph("\n"));
            Table footer = new Table(UnitValue.createPercentArray(new float[]{1}))
                    .setWidth(UnitValue.createPercentValue(100))
                    .setBackgroundColor(LIGHT_BG)
                    .setBorderTop(new SolidBorder(BORDER_CLR, 1));
            Cell footerCell = new Cell().setBorder(Border.NO_BORDER).setPadding(20);
            footerCell.add(new Paragraph("Thank you for choosing RentXpress!")
                    .setFont(bold).setFontSize(13).setFontColor(TEXT_MAIN)
                    .setTextAlignment(TextAlignment.CENTER));
            footerCell.add(new Paragraph("For support: support@rentxpress.in  |  +91 98765 43210")
                    .setFont(regular).setFontSize(10).setFontColor(TEXT_MUTED)
                    .setTextAlignment(TextAlignment.CENTER).setMarginTop(4));
            footerCell.add(new Paragraph("© 2026 RentXpress · Pimpri, Pune, Maharashtra")
                    .setFont(regular).setFontSize(9).setFontColor(TEXT_MUTED)
                    .setTextAlignment(TextAlignment.CENTER).setMarginTop(2));
            footer.addCell(footerCell);
            document.add(footer);

            document.close();
            return baos.toByteArray();

        } catch (Exception e) {
            throw new RuntimeException("Failed to generate PDF receipt: " + e.getMessage(), e);
        }
    }

    // ── Helpers 

    private void addInfoCell(Table t, PdfFont bold, PdfFont regular, String label, String value, DeviceRgb valueColor) {
        Cell c = new Cell().setBorder(Border.NO_BORDER)
                .setBorderRight(new SolidBorder(BORDER_CLR, 1))
                .setPadding(16).setTextAlignment(TextAlignment.CENTER);
        c.add(new Paragraph(label).setFont(regular).setFontSize(9).setFontColor(TEXT_MUTED).setCharacterSpacing(1));
        c.add(new Paragraph(value).setFont(bold).setFontSize(14).setFontColor(valueColor).setMarginTop(2));
        t.addCell(c);
    }

    private Table buildTable(String[][] rows, PdfFont bold, PdfFont regular) {
        Table table = new Table(UnitValue.createPercentArray(new float[]{38, 62}))
                .setWidth(UnitValue.createPercentValue(100));
        boolean alt = false;
        for (String[] row : rows) {
            DeviceRgb bg = alt ? ALT_ROW : new DeviceRgb(255, 255, 255);
            SolidBorder bottom = new SolidBorder(BORDER_CLR, 0.5f);

            Cell label = new Cell().add(new Paragraph(row[0])
                            .setFont(bold).setFontSize(10).setFontColor(TEXT_MUTED))
                    .setBackgroundColor(bg).setBorder(Border.NO_BORDER)
                    .setBorderBottom(bottom).setPaddingLeft(32).setPaddingTop(11).setPaddingBottom(11);

            Cell value = new Cell().add(new Paragraph(row[1])
                            .setFont(bold).setFontSize(11).setFontColor(TEXT_MAIN))
                    .setBackgroundColor(bg).setBorder(Border.NO_BORDER)
                    .setBorderBottom(bottom).setPaddingLeft(12).setPaddingTop(11).setPaddingBottom(11);

            table.addCell(label).addCell(value);
            alt = !alt;
        }
        return table;
    }

    private Paragraph sectionHeader(String text, PdfFont bold) {
        return new Paragraph(text)
                .setFont(bold).setFontSize(9).setFontColor(GOLD)
                .setCharacterSpacing(2)
                .setMarginTop(20).setMarginLeft(32).setMarginBottom(0);
    }

    private String nvl(String s, String def) {
        return (s != null && !s.isBlank()) ? s : def;
    }
}
