const puppeteer = require('puppeteer');

module.exports = async function buildInvoicePdf(client, businessProfile) {
    try {
        // ─── Get Base URL ──────────────────────────────────────
        const baseUrl = process.env.BASE_URL || 'http://localhost:5000';

        // ─── Prepare Data ──────────────────────────────────────
        const data = {
            client: {
                clientName: client.clientName || 'N/A',
                invoiceId: client.invoiceId || 'N/A',
                preWeddingDate: client.preWeddingDate
                    ? new Date(client.preWeddingDate).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                    })
                    : 'N/A',
                shootCharges: client.shootCharges || 0,
                amountReceived: client.amountReceived || 0,
                amountPending: client.amountPending || 0,
            },
            business: {
                name: businessProfile.name || 'Studio Name',
                ownerName: businessProfile.ownerName || '',
                phone: businessProfile.phone || '',
                contactEmail: businessProfile.contactEmail || '',
                gstNumber: businessProfile.gstNumber || '',
                fullAddress: businessProfile.fullAddress || '',
                // ─── Fix Logo URL ──────────────────────────────
                logoUrl: businessProfile.logoUrl
                    ? businessProfile.logoUrl.startsWith('http')
                        ? businessProfile.logoUrl
                        : `${baseUrl}${businessProfile.logoUrl}`
                    : '',
                invoiceFooter: businessProfile.invoiceFooter || 'Thank you for choosing us!',
                instagram: businessProfile.instagram || '',
                whatsapp: businessProfile.whatsapp || '',
                headline: businessProfile.headline || '',
                website: businessProfile.website || 'https://MotionLumen.com',
            },
            formattedDate: new Date().toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
            }),
        };

        // ─── HTML Template ────────────────────────────────────
        const html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Invoice ${client.invoiceId}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            background: #ffffff;
            color: #1a1a2e;
            padding: 0;
            margin: 0;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
        }
        .invoice-container {
            max-width: 780px;
            width: 100%;
            background: #ffffff;
            border: 1px solid #e8eef5;
            border-radius: 18px;
            overflow: hidden;
            box-shadow: 0 24px 50px rgba(15, 23, 42, 0.08);
            margin: 24px auto;
        }
        
        /* ─── Header ─── */
        .header {
            display: grid;
            grid-template-columns: auto 1fr auto;
            gap: 22px;
            align-items: start;
            padding: 32px 34px 24px 34px;
            border-bottom: 1px solid #e8eef5;
            background: #ffffff;
        }
        .header.no-logo {
            grid-template-columns: 1fr auto;
        }
        .logo-wrapper {
            width: 96px;
            height: 96px;
            display: flex;
            align-items: center;
            justify-content: center;
            background: #f4f7fb;
            border-radius: 20px;
            overflow: hidden;
            border: none;
        }
        .logo {
            width: 100%;
            height: 100%;
            object-fit: contain;
        }
        .company-info {
            min-width: 0;
        }
        .company-name {
            font-size: 26px;
            font-weight: 800;
            color: #151b2e;
            line-height: 1.1;
            letter-spacing: -0.6px;
        }
        .company-subtitle {
            margin-top: 6px;
            font-size: 13px;
            font-weight: 600;
            color: #4f5d73;
        }
        .company-details {
            margin-top: 16px;
            font-size: 12px;
            color: #4f5d73;
            line-height: 1.75;
        }
        .company-details div {
            display: flex;
            gap: 8px;
            align-items: baseline;
        }
        .company-details .label {
            min-width: 70px;
            color: #67758b;
            font-weight: 700;
        }
        .company-details .value {
            color: #344050;
        }
        .invoice-title {
            text-align: right;
            align-self: start;
        }
        .invoice-title h1 {
            font-size: 32px;
            color: #151b2e;
            font-weight: 900;
            letter-spacing: 2px;
            margin-bottom: 8px;
        }
        .invoice-title .inv-number,
        .invoice-title .inv-date {
            display: block;
            font-size: 12px;
            color: #6b7280;
            font-weight: 600;
            margin-top: 6px;
            letter-spacing: 0.2px;
        }
        .invoice-title .inv-number strong {
            color: #1f2937;
            font-weight: 800;
        }
        
        /* ─── Client Row ─── */
        .client-row {
            display: flex;
            justify-content: space-between;
            background: #f8f9fa;
            padding: 14px 35px;
            margin: 0;
            border-bottom: 1px solid #e9ecef;
        }
        .client-row .group .label {
            color: #999;
            font-weight: 600;
            font-size: 9px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        .client-row .group .value {
            font-weight: 600;
            color: #1a1a2e;
            margin-top: 2px;
            font-size: 14px;
        }
        
        /* ─── Table ─── */
        .table-wrap {
            padding: 20px 35px 0 35px;
        }
        .invoice-table {
            width: 100%;
            border-collapse: collapse;
            font-size: 13px;
        }
        .invoice-table th {
            background: #1a1a2e;
            color: #ffffff;
            padding: 10px 14px;
            text-align: left;
            font-weight: 600;
            font-size: 10px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        .invoice-table td {
            padding: 10px 14px;
            border-bottom: 1px solid #f0f0f0;
            color: #333;
        }
        .invoice-table tr:last-child td {
            border-bottom: none;
        }
        .invoice-table .text-right {
            text-align: right;
        }
        .invoice-table .total-row td {
            border-top: 2px solid #1a1a2e;
            padding: 12px 14px;
            font-weight: 700;
            font-size: 14px;
            background: #fafafa;
        }
        .invoice-table .total-row .text-right {
            color: #1a1a2e;
        }
        
        /* ─── Balance Box ─── */
        .balance-box {
            margin: 16px 35px 0 35px;
            background: #1a1a2e;
            color: #ffffff;
            padding: 14px 20px;
            border-radius: 8px;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        .balance-box .label {
            font-size: 13px;
            font-weight: 500;
            opacity: 0.85;
        }
        .balance-box .amount {
            font-size: 22px;
            font-weight: 700;
            letter-spacing: 0.5px;
        }
        
        /* ─── Footer ─── */
        .footer {
            padding: 20px 35px 30px 35px;
            text-align: center;
            border-top: 1px solid #e9ecef;
            margin-top: 20px;
        }
        .footer .headline {
            font-size: 14px;
            font-weight: 600;
            color: #1a1a2e;
            margin-bottom: 4px;
        }
        .footer .footer-text {
            font-size: 13px;
            color: #555;
            margin-bottom: 2px;
        }
        .footer .social-links {
            margin-top: 12px;
            display: flex;
            justify-content: center;
            gap: 16px;
            flex-wrap: wrap;
        }
        .footer .social-link {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            background: #f4f7fb;
            padding: 10px 14px;
            border-radius: 999px;
            color: #384255;
            text-decoration: none;
            border: 1px solid transparent;
            transition: transform 0.18s ease, border-color 0.18s ease, color 0.18s ease;
            font-size: 12px;
            font-weight: 600;
        }
        .footer .social-link:hover {
            color: #111827;
            border-color: #d8e2f0;
            transform: translateY(-1px);
        }
        .footer .icon {
            width: 18px;
            height: 18px;
            display: inline-flex;
            align-items: center;
            justify-content: center;
        }
        .footer .icon svg {
            width: 100%;
            height: 100%;
        }
        .footer .powered {
            font-size: 11px;
            color: #7b8595;
            margin-top: 14px;
        }
        .footer .powered a {
            color: #999;
            text-decoration: none;
        }
        .footer .powered a:hover {
            color: #1a1a2e;
            text-decoration: underline;
        }
        
        /* ─── Responsive ─── */
        @media (max-width: 600px) {
            .header {
                flex-direction: column;
                align-items: center;
                text-align: center;
                padding: 20px;
            }
            .invoice-title {
                text-align: center;
                padding-left: 0;
            }
            .client-row {
                flex-direction: column;
                gap: 8px;
                text-align: center;
                padding: 12px 20px;
            }
            .table-wrap {
                padding: 12px 20px 0 20px;
            }
            .balance-box {
                margin: 12px 20px 0 20px;
                flex-direction: column;
                gap: 6px;
                text-align: center;
                padding: 16px;
            }
            .footer {
                padding: 16px 20px 20px 20px;
            }
            .footer .social-links {
                flex-direction: column;
                gap: 6px;
            }
        }
        
        @media print {
            body { background: #ffffff; }
            .invoice-container { box-shadow: none; }
        }
    </style>
</head>
<body>
    <div class="invoice-container">
        <!-- ─── Header ─── -->
        <div class="header ${data.business.logoUrl ? 'has-logo' : 'no-logo'}">
            ${data.business.logoUrl ? `
            <div class="logo-wrapper">
                <img src="${data.business.logoUrl}" alt="Logo" class="logo">
            </div>
            ` : ''}
            <div class="company-info">
                <div class="company-name">${data.business.name}</div>
                ${data.business.ownerName ? `<div class="company-subtitle">Owned by ${data.business.ownerName}</div>` : ''}
                <div class="company-details">
                    ${data.business.fullAddress ? `<div><span class="label">Address</span><span class="value">${data.business.fullAddress}</span></div>` : ''}
                    ${data.business.phone ? `<div><span class="label">Phone</span><span class="value">${data.business.phone}</span></div>` : ''}
                    ${data.business.contactEmail ? `<div><span class="label">Email</span><span class="value">${data.business.contactEmail}</span></div>` : ''}
                    ${data.business.gstNumber ? `<div><span class="label">GST</span><span class="value">${data.business.gstNumber}</span></div>` : ''}
                </div>
            </div>
            <div class="invoice-title">
                <h1>INVOICE</h1>
                <div class="inv-number">Invoice <strong>#${data.client.invoiceId}</strong></div>
                <div class="inv-date">Date: ${data.formattedDate}</div>
            </div>
        </div>

        <!-- ─── Client Row ─── -->
        <div class="client-row">
            <div class="group">
                <div class="label">Client</div>
                <div class="value">${data.client.clientName}</div>
            </div>
            <div class="group" style="text-align:center;">
                <div class="label">Pre-Wedding Date</div>
                <div class="value">${data.client.preWeddingDate}</div>
            </div>
            <div class="group" style="text-align:right;">
                <div class="label">Invoice ID</div>
                <div class="value">#${data.client.invoiceId}</div>
            </div>
        </div>

        <!-- ─── Table ─── -->
        <div class="table-wrap">
            <table class="invoice-table">
                <thead>
                    <tr>
                        <th>Description</th>
                        <th style="text-align:right;">Amount</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>Shoot Charges</td>
                        <td class="text-right">₹${Number(data.client.shootCharges).toLocaleString('en-IN')}</td>
                    </tr>
                    <tr>
                        <td>Amount Received</td>
                        <td class="text-right">₹${Number(data.client.amountReceived).toLocaleString('en-IN')}</td>
                    </tr>
                    <tr class="total-row">
                        <td><strong>Balance Due</strong></td>
                        <td class="text-right"><strong>₹${Number(data.client.amountPending).toLocaleString('en-IN')}</strong></td>
                    </tr>
                </tbody>
            </table>
        </div>

        <!-- ─── Balance Box ─── -->
        <div class="balance-box">
            <span class="label">Total Balance Due</span>
            <span class="amount">₹${Number(data.client.amountPending).toLocaleString('en-IN')}</span>
        </div>

        <!-- ─── Footer ─── -->
        <div class="footer">
            ${data.business.headline ? `<div class="headline">${data.business.headline}</div>` : ''}
            <div class="footer-text">${data.business.invoiceFooter}</div>
            
            ${data.business.instagram || data.business.whatsapp ? `
            <div class="social-links">
                ${data.business.instagram ? `
                    <a href="https://instagram.com/${data.business.instagram.replace('@', '')}" target="_blank" class="social-link">
                        <span class="icon">
                            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M7.75 2.5h8.5A5.25 5.25 0 0 1 21.5 7.75v8.5A5.25 5.25 0 0 1 16.25 21.5h-8.5A5.25 5.25 0 0 1 2.5 16.25v-8.5A5.25 5.25 0 0 1 7.75 2.5Z" stroke="#E1306C" stroke-width="1.5"/>
                                <path d="M15.5 11.999a3.5 3.5 0 1 1-7 0 3.5 3.5 0 0 1 7 0Z" stroke="#E1306C" stroke-width="1.5"/>
                                <path d="M17.5 6.5h.01" stroke="#E1306C" stroke-width="1.5" stroke-linecap="round"/>
                            </svg>
                        </span>
                        ${data.business.instagram}
                    </a>
                ` : ''}
                ${data.business.whatsapp ? `
                    <a href="https://wa.me/${data.business.whatsapp.replace(/[^0-9]/g, '')}" target="_blank" class="social-link">
                        <span class="icon">
                            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M12.01 2.5C6.048 2.5 1.5 6.945 1.5 12c0 1.975.596 3.807 1.62 5.354L2 22.5l5.262-1.377A9.471 9.471 0 0 0 12.01 21.5c5.962 0 10.51-4.445 10.51-9.5S17.972 2.5 12.01 2.5Z" stroke="#25D366" stroke-width="1.5"/>
                                <path d="M15.41 14.82c-.22.6-1.26 1.17-1.72 1.24-.45.07-1.01.1-1.86-.2a7.546 7.546 0 0 1-3.39-2.2 6.924 6.924 0 0 1-1.33-2.1c-.14-.38-.26-.85.09-1.24l.37-.38c.2-.2.47-.26.72-.17.23.07.72.3 1.14.6.4.28.83.66.96.84.12.18.2.42.08.69-.1.25-.4.79-.54 1.05-.15.27-.3.32-.56.2-.24-.1-.98-.37-1.86-1.13-.7-.62-1.17-1.4-1.3-1.71-.13-.32-.01-.6.11-.77.12-.17.26-.43.39-.65.14-.22.18-.38.28-.63.1-.25.05-.47-.02-.66-.08-.19-.72-1.73-.99-2.37-.26-.64-.53-.55-.72-.56-.18-.01-.4-.01-.61-.01-.2 0-.53.07-.81.35-.28.28-1.08 1.06-1.08 2.58 0 1.52 1.11 2.99 1.27 3.2.16.22 2.2 3.36 5.33 4.7.74.32 1.32.51 1.77.65.74.24 1.41.21 1.94.13.59-.09 1.82-.74 2.08-1.45.27-.71.27-1.32.19-1.45-.08-.13-.3-.2-.63-.34Z" fill="#25D366"/>
                            </svg>
                        </span>
                        WhatsApp
                    </a>
                ` : ''}
            </div>
            ` : ''}
            
            <div class="powered">
                Powered by <a href="${data.business.website || 'https://MotionLumen.com'}" target="_blank">MotionLumen</a>
            </div>
        </div>
    </div>
</body>
</html>`;

        // ─── Generate PDF ──────────────────────────────────────
        const browser = await puppeteer.launch({
            headless: 'new',
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });

        const page = await browser.newPage();

        // ─── Set Viewport and Load Content ─────────────────────
        await page.setViewport({ width: 800, height: 1200 });
        await page.setContent(html, {
            waitUntil: 'networkidle0',
            timeout: 30000
        });

        // ─── Wait for images to load ───────────────────────────
        if (data.business.logoUrl) {
            try {
                await page.waitForSelector('.logo', { timeout: 5000 });
            } catch (err) {
            }
        }

        const pdf = await page.pdf({
            format: 'A4',
            printBackground: true,
            margin: {
                top: '0px',
                bottom: '0px',
                left: '0px',
                right: '0px'
            }
        });

        await browser.close();
        return pdf;

    } catch (error) {
        console.error('Error generating PDF:', error);
        throw error;
    }
};