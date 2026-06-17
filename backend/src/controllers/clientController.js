const Client = require('../models/Client');
const fs = require('fs').promises;
const path = require('path');

// ─── Get All Clients ──────────────────────────────────────────
exports.getAllClients = async (req, res) => {
    try {
        const clients = await Client.find({ business: req.business._id })
            .sort({ createdAt: -1 });

        return res.json({
            clients: clients || [],
            count: clients?.length || 0
        });
    } catch (error) {
        console.error('Error fetching clients:', error);
        return res.status(500).json({ message: 'Failed to fetch clients' });
    }
};


// ─── Get Single Client ────────────────────────────────────────
exports.getClient = async (req, res) => {
    try {
        const client = await Client.findOne({
            _id: req.params.id,
            business: req.business._id
        });

        if (!client) {
            return res.status(404).json({ message: 'Client not found' });
        }

        res.json({ client });
    } catch (error) {
        console.error('Error fetching client:', error);
        res.status(500).json({ message: 'Error fetching client' });
    }
};

// ─── Create Client ────────────────────────────────────────────
exports.createClient = async (req, res) => {
    try {
        // ✅ Extra check: Block if read-only
        if (req.isReadOnly) {
            return res.status(403).json({
                message: 'Subscription expired. Cannot create new clients.',
                code: 'SUBSCRIPTION_EXPIRED',
            });
        }

        const invoiceId = req.body.invoiceId || `INV-${Date.now()}`;

        const client = await Client.create({
            ...req.body,
            invoiceId,
            business: req.business._id
        });

        res.json({ client });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(409).json({
                message: 'Invoice ID already exists for this business'
            });
        }
        res.status(400).json({ message: error.message });
    }
};

// ─── Update Client ────────────────────────────────────────────
exports.updateClient = async (req, res) => {
    try {
        // ✅ Extra check: Block if read-only
        if (req.isReadOnly) {
            return res.status(403).json({
                message: 'Subscription expired. Cannot update clients.',
                code: 'SUBSCRIPTION_EXPIRED',
            });
        }

        const client = await Client.findOneAndUpdate(
            { _id: req.params.id, business: req.business._id },
            req.body,
            {
                returnDocument: 'after',
                runValidators: true
            }
        );

        if (!client) {
            return res.status(404).json({ message: 'Client not found' });
        }

        res.json({ client });
    } catch (error) {
        console.error('Error updating client:', error);
        res.status(500).json({ message: 'Error updating client' });
    }
};

// ─── Delete Client ────────────────────────────────────────────
exports.deleteClient = async (req, res) => {
    try {
        // ✅ Extra check: Block if read-only
        if (req.isReadOnly) {
            return res.status(403).json({
                message: 'Subscription expired. Cannot delete clients.',
                code: 'SUBSCRIPTION_EXPIRED',
            });
        }

        const deleted = await Client.findOneAndDelete({
            _id: req.params.id,
            business: req.business._id,
        });

        if (!deleted) {
            return res.status(404).json({ message: 'Client not found' });
        }

        res.json({ message: 'Deleted' });
    } catch (error) {
        console.error('Error deleting client:', error);
        res.status(500).json({ message: 'Error deleting client' });
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