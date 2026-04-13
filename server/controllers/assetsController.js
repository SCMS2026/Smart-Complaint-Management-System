const Asset = require('../models/assetsModels');
const XLSX = require('xlsx');

const getAssets = async (req, res) => {
  try {
    const assets = await Asset.find();

    res.status(200).json({
      success: true,
      assets,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Error fetching assets",
    });
  }
};

const importAssets = async (req, res) => {
    if (!req.file || !req.file.buffer) {
        return res.status(400).json({ message: 'No file uploaded' });
    }

    try {
        const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const rows = XLSX.utils.sheet_to_json(sheet, { defval: '' });

        if (rows.length === 0) {
            return res.status(400).json({ message: 'Excel file appears to be empty' });
        }

        const assetsToInsert = [];
        const errors = [];

        rows.forEach((row, index) => {
            const name = row.name || row.Name || row.NAME;
            const category = row.category || row.Category || row.CATEGORY;

            if (!name || !category) {
                errors.push({ row: index + 2, message: 'Missing required field(s)' });
            } else {
                assetsToInsert.push({ name: name.toString(), category: category.toString() });
            }
        });

        let inserted = [];
        if (assetsToInsert.length > 0) {
            inserted = await Asset.insertMany(assetsToInsert, { ordered: false });
        }

        res.status(200).json({
            added: inserted.length,
            errors,
        });
    } catch (error) {
        console.error('asset import error', error);
        res.status(500).json({ message: 'Failed to import assets', error: error.message });
    }
};


// create a single new asset (name, location, category in req.body)
const createAsset = async (req, res) => {
    try {
        const { name, category, department_id } = req.body;
        if (!name || !category) {
            return res.status(400).json({ message: 'Missing fields for asset' });
        }
        const asset = new Asset({ name, category, department_id: department_id || null });
        await asset.save();
        const populated = await asset.populate('department_id', 'name');
        res.status(201).json({ asset: populated });
    } catch (error) {
        res.status(500).json({ message: 'Error creating asset', error: error.message });
    }
};

module.exports = { getAssets, importAssets, createAsset };