const Asset = require('../models/assetsModels');

const getAssets = async (req, res) => {
    try {
        const assets = await Asset.find();
        res.status(200).json({ assets });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching assets', error: error.message });
    }
};

module.exports = { getAssets };