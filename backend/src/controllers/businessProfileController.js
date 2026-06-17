const Business = require('../models/Business');
const BusinessProfile = require('../models/BusinessProfile');
const fs = require('fs');
const path = require('path');

exports.getProfile = async (req, res) => {
    try {
        const business = await Business.findById(req.business._id)
            .select('-password');

        if (!business) {
            return res.status(404).json({ message: 'Business not found' });
        }

        let profile = await BusinessProfile.findOne({
            businessId: req.business._id
        });

        if (!profile) {
            profile = await BusinessProfile.create({
                businessId: req.business._id,
                name: business.name,
                contactEmail: business.email,
                phone: business.phone || '',
                ownerName: business.ownerName || '',
            });
        }

        const profileJSON = profile.toJSON ? profile.toJSON() : profile;

        const combined = {
            ...profileJSON,
            email: business.email,
            role: business.role,
            plan: business.plan,
            status: business.status,
            subscriptionStartDate: business.subscriptionStartDate,
            subscriptionEndDate: business.subscriptionEndDate,
            trialDays: business.trialDays,
            subscriptionMonths: business.subscriptionMonths,
            slug: business.slug,
            gallery: profile.gallery || [],
        };

        console.log('✅ Profile fetched, gallery count:', combined.gallery?.length || 0);

        res.json({
            success: true,
            business: combined
        });
    } catch (error) {
        console.error('Error fetching profile:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching profile',
            error: error.message
        });
    }
};

// ─── Update Profile ──────────────────────────────────────────────
exports.updateProfile = async (req, res) => {
    try {
        const allowedFields = [
            'name', 'ownerName', 'phone', 'contactEmail',
            'address', 'logoUrl', 'gstNumber', 'invoiceFooter',
            'instagram', 'whatsapp', 'headline', 'about'
        ];

        const invalidFields = Object.keys(req.body).filter(
            key => !allowedFields.includes(key) && key !== 'address'
        );

        if (invalidFields.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Cannot update restricted fields',
                invalidFields: invalidFields
            });
        }

        let profile = await BusinessProfile.findOne({
            businessId: req.business._id
        });

        if (!profile) {
            const business = await Business.findById(req.business._id);
            if (!business) {
                return res.status(404).json({
                    success: false,
                    message: 'Business not found'
                });
            }

            profile = new BusinessProfile({
                businessId: req.business._id,
                name: business.name,
                contactEmail: business.email,
                phone: business.phone || '',
                ownerName: business.ownerName || '',
            });
        }

        const updates = req.body;
        let hasUpdates = false;

        if (updates.address) {
            const addressFields = ['street', 'city', 'state', 'pincode', 'country'];
            const validAddressFields = Object.keys(updates.address).filter(
                field => addressFields.includes(field)
            );

            if (validAddressFields.length > 0) {
                if (!profile.address) {
                    profile.address = {};
                }

                validAddressFields.forEach(field => {
                    if (updates.address[field] !== undefined && updates.address[field] !== null) {
                        profile.address[field] = updates.address[field];
                        hasUpdates = true;
                    }
                });

                delete updates.address;
            }
        }

        Object.keys(updates).forEach(key => {
            if (allowedFields.includes(key) && updates[key] !== undefined && updates[key] !== null) {
                profile[key] = updates[key];
                hasUpdates = true;
            }
        });

        if (!hasUpdates) {
            return res.status(400).json({
                success: false,
                message: 'No valid fields to update'
            });
        }

        await profile.save();

        const business = await Business.findById(req.business._id)
            .select('-password');

        const profileJSON = profile.toJSON ? profile.toJSON() : profile;

        const combined = {
            ...profileJSON,
            email: business.email,
            role: business.role,
            plan: business.plan,
            status: business.status,
            subscriptionStartDate: business.subscriptionStartDate,
            subscriptionEndDate: business.subscriptionEndDate,
            trialDays: business.trialDays,
            subscriptionMonths: business.subscriptionMonths,
            gallery: profile.gallery || [],
        };

        res.json({
            success: true,
            message: 'Profile updated successfully',
            business: combined
        });
    } catch (error) {
        console.error('Error updating profile:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating profile',
            error: error.message
        });
    }
};

// ─── Upload Logo ──────────────────────────────────────────────────
exports.uploadLogo = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'No file uploaded'
            });
        }

        let profile = await BusinessProfile.findOne({
            businessId: req.business._id
        });

        if (!profile) {
            const business = await Business.findById(req.business._id);
            if (!business) {
                return res.status(404).json({
                    success: false,
                    message: 'Business not found'
                });
            }

            profile = new BusinessProfile({
                businessId: req.business._id,
                name: business.name,
                contactEmail: business.email,
            });
        }

        const baseUrl = process.env.BASE_URL || 'http://localhost:5000';
        const logoUrl = `${baseUrl}/uploads/logos/${req.file.filename}`;

        profile.logoUrl = logoUrl;
        await profile.save();

        res.json({
            success: true,
            message: 'Logo uploaded successfully',
            logoUrl: logoUrl,
            business: profile
        });
    } catch (error) {
        console.error('Error uploading logo:', error);
        res.status(500).json({
            success: false,
            message: 'Error uploading logo',
            error: error.message
        });
    }
};

// ─── Delete Logo ──────────────────────────────────────────────────
exports.deleteLogo = async (req, res) => {
    try {
        const profile = await BusinessProfile.findOne({
            businessId: req.business._id
        });

        if (!profile || !profile.logoUrl) {
            return res.status(404).json({
                success: false,
                message: 'Logo not found'
            });
        }

        // Delete file from disk
        const logoPath = path.join(__dirname, '../../', profile.logoUrl.replace(`${process.env.BASE_URL || 'http://localhost:5000'}/`, ''));

        if (fs.existsSync(logoPath)) {
            fs.unlinkSync(logoPath);
        }

        profile.logoUrl = '';
        await profile.save();

        res.json({
            success: true,
            message: 'Logo deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting logo:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting logo',
            error: error.message
        });
    }
};

// ─── Upload Gallery Image ────────────────────────────────────────
exports.uploadGalleryImage = async (req, res) => {
    try {
        console.log('📸 Upload request received');
        console.log('📸 Business ID:', req.business._id);

        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'No file uploaded'
            });
        }

        const { title, type } = req.body;
        const businessId = req.business._id;

        const fileUrl = `/uploads/${businessId}/gallery/${req.file.filename}`;
        const thumbnailUrl = fileUrl;

        // ─── Create gallery item ──────────────────────────────────
        const newGalleryItem = {
            type: type || 'image',
            title: title || req.file.originalname.split('.')[0] || 'Untitled',
            url: fileUrl,
            thumbnail: thumbnailUrl,
        };

        // ─── Check if profile exists ─────────────────────────────
        let profile = await BusinessProfile.findOne({
            businessId: businessId
        });

        if (!profile) {
            // ─── Create new profile ──────────────────────────────────
            const business = await Business.findById(businessId);
            if (!business) {
                return res.status(404).json({
                    success: false,
                    message: 'Business not found'
                });
            }

            profile = new BusinessProfile({
                businessId: businessId,
                name: business.name,
                contactEmail: business.email,
                phone: business.phone || '',
                ownerName: business.ownerName || '',
                gallery: [newGalleryItem], // ✅ Add gallery directly
            });

            await profile.save();
            console.log('✅ Created new profile with gallery item');

            return res.json({
                success: true,
                message: 'File uploaded successfully',
                gallery: profile.gallery || [],
                fileUrl: fileUrl,
            });
        }

        // ─── Use findByIdAndUpdate ──────────────────────────────────
        const updatedProfile = await BusinessProfile.findByIdAndUpdate(
            profile._id,
            { $push: { gallery: newGalleryItem } },
            { new: true, runValidators: true }
        );

        console.log('✅ Updated profile gallery count:', updatedProfile?.gallery?.length || 0);

        res.json({
            success: true,
            message: 'File uploaded successfully',
            gallery: updatedProfile?.gallery || [],
            fileUrl: fileUrl,
        });
    } catch (error) {
        console.error('❌ Upload error:', error);
        console.error('❌ Error stack:', error.stack);
        res.status(500).json({
            success: false,
            message: 'Error uploading file',
            error: error.message
        });
    }
};
// ─── Add Gallery Item (for manual entry) ─────────────────────────
exports.addGalleryItem = async (req, res) => {
    try {
        const { type, title, url, thumbnail } = req.body;

        if (!type || !url) {
            return res.status(400).json({
                success: false,
                message: 'Type and URL are required'
            });
        }

        const profile = await BusinessProfile.findOne({
            businessId: req.business._id
        });

        if (!profile) {
            return res.status(404).json({
                success: false,
                message: 'Profile not found'
            });
        }

        const galleryItem = {
            type: type || 'image',
            title: title || '',
            url: url,
            thumbnail: thumbnail || '',
        };

        profile.gallery.push(galleryItem);
        await profile.save();

        res.json({
            success: true,
            message: 'Gallery item added successfully',
            gallery: profile.gallery
        });
    } catch (error) {
        console.error('Error adding gallery item:', error);
        res.status(500).json({
            success: false,
            message: 'Error adding gallery item',
            error: error.message
        });
    }
};

// ─── Update Gallery Item ──────────────────────────────────────────
exports.updateGalleryItem = async (req, res) => {
    try {
        const { index } = req.params;
        const { type, title, url, thumbnail } = req.body;

        const profile = await BusinessProfile.findOne({
            businessId: req.business._id
        });

        if (!profile) {
            return res.status(404).json({
                success: false,
                message: 'Profile not found'
            });
        }

        if (index < 0 || index >= profile.gallery.length) {
            return res.status(400).json({
                success: false,
                message: 'Invalid gallery index'
            });
        }

        if (type) profile.gallery[index].type = type;
        if (title !== undefined) profile.gallery[index].title = title;
        if (url) profile.gallery[index].url = url;
        if (thumbnail !== undefined) profile.gallery[index].thumbnail = thumbnail;

        await profile.save();

        res.json({
            success: true,
            message: 'Gallery item updated successfully',
            gallery: profile.gallery
        });
    } catch (error) {
        console.error('Error updating gallery item:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating gallery item',
            error: error.message
        });
    }
};

exports.removeGalleryItem = async (req, res) => {
    try {
        const { index } = req.params;

        const profile = await BusinessProfile.findOne({
            businessId: req.business._id
        });

        if (!profile) {
            return res.status(404).json({
                success: false,
                message: 'Profile not found'
            });
        }

        if (index < 0 || index >= profile.gallery.length) {
            return res.status(400).json({
                success: false,
                message: 'Invalid gallery index'
            });
        }

        const item = profile.gallery[index];
        if (item && item.url) {
            // ✅ Extract the file path using businessId from URL
            const businessId = req.business._id;
            const filePath = path.join(__dirname, '../../uploads', businessId.toString(), 'gallery', path.basename(item.url));
            try {
                if (fs.existsSync(filePath)) {
                    fs.unlinkSync(filePath);
                    console.log('Deleted file:', filePath);
                }
            } catch (err) {
                console.error('Failed to delete file:', err);
            }
        }

        profile.gallery.splice(index, 1);
        await profile.save();

        res.json({
            success: true,
            message: 'Gallery item removed successfully',
            gallery: profile.gallery
        });
    } catch (error) {
        console.error('Error removing gallery item:', error);
        res.status(500).json({
            success: false,
            message: 'Error removing gallery item',
            error: error.message
        });
    }
};

exports.getAllPublicStudios = async (req, res) => {
    try {
        const businesses = await Business.find({
            status: 'active',
            deletedAt: null,
            role: 'business'
        }).select('-password');

        // ─── Get profiles with gallery for each business ──────
        const studios = await Promise.all(
            businesses.map(async (business) => {
                const profile = await BusinessProfile.findOne({
                    businessId: business._id
                });

                // Get first 3 gallery images
                const galleryImages = (profile?.gallery || [])
                    .slice(0, 3)
                    .map(g => ({
                        url: g.url,
                        thumbnail: g.thumbnail || g.url,
                        title: g.title
                    }));

                return {
                    _id: business._id,
                    slug: business.slug,
                    name: profile?.name || business.name,
                    ownerName: profile?.ownerName || business.ownerName || '',
                    city: profile?.address?.city || business.city || '',
                    headline: profile?.headline || business.headline || '',
                    about: profile?.about || business.about || '',
                    whatsapp: profile?.whatsapp || business.whatsapp || '',
                    instagram: profile?.instagram || business.instagram || '',
                    gallery: galleryImages,
                };
            })
        );

        res.json({
            success: true,
            studios: studios
        });
    } catch (error) {
        console.error('Error fetching studios:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching studios',
            error: error.message
        });
    }
}