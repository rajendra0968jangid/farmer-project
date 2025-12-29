const db = require("../models/db.model");
const ApiError = require("../utils/apiError");

const BannerService = () => {

    const Banner = db.banners
    const getBannerForAgent = async (req) => {

        const banners = await Banner.findAll({
            where: { isActive: true },
            order: [['createdAt', 'DESC']],
            attributes: ['id', 'imageUrl']
        })
        req.result = { banners }
    }

    const addBannerByUrl = async (req) => {
        // Only Manufacturer can add
        if (req.user.userType !== 'Manufacturer') {
            throw new ApiError(403, "बैनर जोड़ने की अनुमति सिर्फ निर्माता को है");
        }
        const { imageUrl } = req.body;
        if (!imageUrl || !imageUrl.trim()) {
            throw new ApiError(400, "इमेज URL देना अनिवार्य है");
        }
        const cleanUrl = imageUrl.trim();
        await db.sequelize.transaction(async (t) => {
            // 1. Naya banner create kar do (hamesha add hoga)
            const newBanner = await Banner.create({
                imageUrl: cleanUrl,
                isActive: true
            }, { transaction: t });

            // 2. Ab check karo kitne active banners hain
            const totalActive = await Banner.count({
                where: { isActive: true },
                transaction: t
            });

            // 3. Agar 6 se zyada ho gaye → sabse purane ko delete kar do
            if (totalActive > 6) {
                const bannersToDelete = await Banner.findAll({
                    where: { isActive: true },
                    order: [['createdAt', 'ASC']], // sabse purane pehle
                    limit: totalActive - 6,        // jitne extra hain utne delete
                    transaction: t
                });

                // Hard delete (ya soft delete )
                const deletedIds = bannersToDelete.map(b => b.id);
                await Banner.destroy({
                    where: { id: deletedIds },
                    transaction: t
                });
            }
            req.result = {
                banner: {
                    id: newBanner.id,
                    imageUrl: newBanner.imageUrl,
                    isActive: newBanner.isActive,
                    createdAt: newBanner.createdAt
                }
            };
        });
    };

    const deleteBanner = async (req) => {
        if (req.user.userType !== "Manufacturer") throw new ApiError(403, "बैनर हटाने की अनुमति सिर्फ निर्माता को है")
        const { id } = req.params;
        if (!id) throw new ApiError(400, "बैनर ID देना अनिवार्य है")

        await db.sequelize.transaction(async (t) => {
            // 1. Banner check
            const banner = await Banner.findOne({
                where: { id: id },
                transaction: t,
            });

            if (!banner) {
                throw new ApiError(404, "बैनर नहीं मिला");
            }
            // 2. Hard delete
            await Banner.destroy({
                where: { id: id },
                transaction: t,
            });

            req.result = {
                bannerId: Number(id),
            };
        });
    };


    return { getBannerForAgent, addBannerByUrl, deleteBanner }
}

module.exports = BannerService()