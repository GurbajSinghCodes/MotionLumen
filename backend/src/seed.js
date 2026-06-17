require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Business = require('./models/Business');
const Client = require('./models/Client');
(async () => {
    await mongoose.connect(process.env.MONGO_URI);
    // await Business.deleteMany({});
    // await Business.create({
    //     name: 'Super admin',
    //     slug: 'Admin Studio',
    //     ownerName: 'Demo Owner',
    //     email: 'admin@gmail.com',
    //     password: await bcrypt.hash('123456', 10),
    //     role: 'superadmin',
    //     status: 'active',
    //     plan: 'trial',
    // });

    // const b = await Business.create({
    //     name: 'Demo Wedding Studio',
    //     slug: 'demo-wedding-studio',
    //     ownerName: 'Demo Owner',
    //     email: 'admin@gmail.com',
    //     password: await bcrypt.hash('123456', 10),
    //     phone: '9876543210',
    //     city: 'Mohali',
    //     whatsapp: '919876543210',
    //     gallery: [{
    //         type: 'image', title: 'Couple Sunset',
    //         url: 'https://images.unsplash.com/photo-1529634597503-139d3726fed5'
    //     }, { type: 'video', title: 'Sample Reel', url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' }]
    // });

    // await Client.create(
    //     {
    //         business: b._id,
    //         invoiceId: 'INV-1001',
    //         clientName: 'Rahul & Simran',
    //         preWeddingDate: new Date(),
    //         shootCharges: 50000,
    //         advanceAmount: 10000,
    //         receivedBy: 'Owner',
    //         photoBy: 'Aman',
    //         droneBy: 'Ravi',
    //         videoBy: 'Karan',
    //         food: 3000,
    //         setup: 6000,
    //         videoEdit: 5000,
    //         photoEdit: 4000,
    //         otherExpense: 1000
    //     });

    // console.log('Demo login: demo@studio.com / 123456');
    process.exit();
})();
