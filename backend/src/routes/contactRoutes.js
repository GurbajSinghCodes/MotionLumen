const router = require('express').Router();
const nodemailer = require('nodemailer');

// ─── Contact Form Route ──────────────────────────────────────────
router.post('/contact', async (req, res) => {
    try {
        const { name, whatsapp, email, message, businessEmail, businessName } = req.body;

        // ─── Validate required fields ──────────────────────────
        if (!name || !whatsapp || !message || !businessEmail) {
            return res.status(400).json({
                success: false,
                message: 'Name, WhatsApp number, and message are required'
            });
        }

        // ─── Send email ──────────────────────────────────────────
        const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST || 'smtp.gmail.com',
            port: parseInt(process.env.SMTP_PORT || '587'),
            secure: process.env.SMTP_SECURE === 'true',
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
        });

        await transporter.sendMail({
            from: process.env.SMTP_FROM || process.env.SMTP_USER,
            to: businessEmail,
            subject: `New Inquiry from ${name} - ${businessName || 'MotionLumen'}`,
            replyTo: email || process.env.SMTP_USER,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f9f9f9; border-radius: 10px;">
                    <h2 style="color: #1a1a2e; border-bottom: 2px solid #e94560; padding-bottom: 10px;">New Contact Form Submission</h2>
                    <div style="background: white; padding: 20px; border-radius: 8px; margin-top: 15px;">
                        <p><strong>From:</strong> ${businessName || 'MotionLumen'}</p>
                        <p><strong>Name:</strong> ${name}</p>
                        <p><strong>WhatsApp:</strong> ${whatsapp}</p>
                        ${email ? `<p><strong>Email:</strong> ${email}</p>` : ''}
                        <p><strong>Message:</strong></p>
                        <div style="background: #f5f5f5; padding: 15px; border-radius: 6px; margin-top: 8px;">
                            ${message}
                        </div>
                    </div>
                    <p style="color: #888; font-size: 12px; margin-top: 20px; text-align: center;">
                        This inquiry was sent from your studio page on MotionLumen.
                    </p>
                </div>
            `,
            text: `
                New Inquiry from ${name} (${businessName || 'MotionLumen'})
                
                Name: ${name}
                WhatsApp: ${whatsapp}
                ${email ? `Email: ${email}` : ''}
                Message: ${message}
                
                This inquiry was sent from your studio page on MotionLumen.
            `,
        });

        res.json({
            success: true,
            message: 'Email sent successfully'
        });

    } catch (error) {
        console.error('Contact form error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to send email'
        });
    }
});

module.exports = router;