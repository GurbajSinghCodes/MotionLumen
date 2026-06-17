const router = require('express').Router();
const { auth } = require('../middleware/auth');
const checkWriteAccess = require('../middleware/checkWriteAccess');

const {
    getAllClients,
    createClient,
    getClient,
    updateClient,
    deleteClient
} = require('../controllers/clientController');

const {
    generateInvoicePDF,
    getInvoiceData,
    cleanupAllPDFs
} = require('../controllers/invoiceController');

// ─── All routes require auth ──────────────────────────────────
router.use(auth);

// ─── Read-Only Routes (GET) - Always allowed ─────────────────
router.get('/', getAllClients);
router.get('/:id', getClient);
router.get('/:id/invoice.pdf', generateInvoicePDF);
router.get('/:id/invoice-data', getInvoiceData);

// ─── Write Routes (POST, PUT, DELETE) - Blocked if expired ──
router.use(checkWriteAccess);
router.post('/', createClient);
router.put('/:id', updateClient);
router.delete('/:id', deleteClient);
router.delete('/invoices/cleanup', cleanupAllPDFs);

module.exports = router;