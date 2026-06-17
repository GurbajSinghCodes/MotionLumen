const Client = require('../models/Client');
const buildPdf = require('../utils/invoicePdf');
const BusinessProfile = require('../models/BusinessProfile');
const fs = require('fs').promises;
const path = require('path');

// ── Generate Invoice PDF ──────────────────────────────────────
exports.generateInvoicePDF = async (req, res) => {
    try {

        // ─── Fetch Client ──────────────────────────────────────
        const client = await Client.findOne({
            _id: req.params.id,
            business: req.business._id
        });

        if (!client) {
            return res.status(404).json({ message: 'Client not found' });
        }



        const businessProfile = await BusinessProfile.findOne({
            businessId: req.business._id
        });



        // ─── Generate PDF ──────────────────────────────────────
        const pdf = await buildPdf(client, businessProfile || {});

        // Set headers
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader(
            'Content-Disposition',
            `attachment; filename=${client.invoiceId}.pdf`
        );
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
        res.setHeader('Pragma', 'no-cache');
        res.setHeader('Expires', '0');

        // Delete old PDFs after sending
        res.on('finish', () => {
            cleanupClientPDFs(req.params.id).catch(console.error);
        });

        res.send(pdf);

    } catch (error) {
        res.status(500).json({
            message: 'Error generating invoice',
            error: error.message
        });
    }
};


// ─── Get Invoice Data (JSON) ─────────────────────────────────
exports.getInvoiceData = async (req, res) => {
    try {
        const client = await Client.findOne({
            _id: req.params.id,
            business: req.business._id
        });

        if (!client) {
            return res.status(404).json({ message: 'Client not found' });
        }

        res.json({
            success: true,
            client: {
                _id: client._id,
                clientName: client.clientName,
                invoiceId: client.invoiceId,
                shootCharges: client.shootCharges,
                amountReceived: client.amountReceived,
                amountPending: client.amountPending,
                totalExpenses: client.totalExpenses,
                profit: client.profit,
                preWeddingDate: client.preWeddingDate,
                photographers: client.photographers,
                videographers: client.videographers,
                droneOperators: client.droneOperators,
                makeupArtist: client.makeupArtist,
                makeupCharge: client.makeupCharge,
                makeupPaid: client.makeupPaid,
                agentName: client.agentName,
                agentCommission: client.agentCommission,
                agentPaid: client.agentPaid,
                food: client.food,
                setup: client.setup,
                videoEdit: client.videoEdit,
                photoEdit: client.photoEdit,
                otherExpense: client.otherExpense,
                notes: client.notes
            }
        });
    } catch (error) {
        console.error('Error fetching invoice data:', error);
        res.status(500).json({ message: 'Error fetching invoice data' });
    }
};

// ─── Cleanup Old PDFs (Admin only) ───────────────────────────
exports.cleanupAllPDFs = async (req, res) => {
    try {
        // Check if user is admin
        if (req.business.role !== 'superadmin') {
            return res.status(403).json({
                message: 'Only admins can perform this action'
            });
        }

        const tmpDir = path.join(process.cwd(), 'tmp');
        let deletedCount = 0;

        try {
            await fs.access(tmpDir);
        } catch {
            return res.json({
                message: 'No tmp directory found',
                deletedCount: 0
            });
        }

        const files = await fs.readdir(tmpDir);
        const pdfFiles = files.filter(f => f.startsWith('invoice-') && f.endsWith('.pdf'));

        // Delete files older than 1 hour
        const oneHourAgo = Date.now() - (60 * 60 * 1000);

        for (const file of pdfFiles) {
            const filePath = path.join(tmpDir, file);
            try {
                const stats = await fs.stat(filePath);
                if (stats.mtimeMs < oneHourAgo) {
                    await fs.unlink(filePath);
                    deletedCount++;
                }
            } catch (err) {
                console.error(`Failed to delete file ${file}:`, err);
            }
        }

        res.json({
            message: `Cleaned up ${deletedCount} old invoice files`,
            deletedCount
        });
    } catch (error) {
        console.error('Error cleaning up PDFs:', error);
        res.status(500).json({ message: 'Error cleaning up PDFs' });
    }
};

// ─── Helper: Cleanup old PDFs for a client ──────────────────
async function cleanupClientPDFs(clientId) {
    try {
        const tmpDir = path.join(process.cwd(), 'tmp');

        try {
            await fs.access(tmpDir);
        } catch {
            return;
        }

        const files = await fs.readdir(tmpDir);
        const pdfFiles = files.filter(f =>
            f.startsWith(`invoice-${clientId}`) && f.endsWith('.pdf')
        );

        for (const file of pdfFiles) {
            const filePath = path.join(tmpDir, file);
            try {
                await fs.unlink(filePath);
                console.log(`Deleted old invoice file: ${file}`);
            } catch (err) {
                console.error(`Failed to delete file ${file}:`, err);
            }
        }
    } catch (error) {
        console.error('Error cleaning up PDFs:', error);
    }
}