const Asset = require('../models/assetsModels');
const XLSX = require('xlsx');

// GET /api/assets - List all assets with optional filters
const getAssets = async (req, res) => {
  try {
    const { type, city, area, status, department_id, search } = req.query;
    const filter = {};

    if (type) filter.type = type;
    if (city) filter['location.city'] = city;
    if (area) filter['location.area'] = area;
    if (status) filter.status = status;
    if (department_id) filter.department_id = department_id;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { 'location.address': { $regex: search, $options: 'i' } },
        { assetCode: { $regex: search, $options: 'i' } }
      ];
    }

    const assets = await Asset.find(filter)
      .populate('department_id', 'name')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: assets.length,
      assets
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Error fetching assets",
      error: error.message
    });
  }
};



// GET /api/assets/filters - Get distinct values for filters
const getAssetFilters = async (req, res) => {
  try {
    const types = await Asset.distinct('type');
    const cities = await Asset.distinct('location.city');
    const areas = await Asset.distinct('location.area');
    const statuses = await Asset.distinct('status');

    res.status(200).json({
      success: true,
      filters: { types, cities, areas, statuses }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Error fetching filters",
      error: error.message
    });
  }
};

// GET /api/assets/:id - Get single asset by ID
const getAssetById = async (req, res) => {
  try {
    const asset = await Asset.findById(req.params.id)
      .populate('department_id', 'name');

    if (!asset) {
      return res.status(404).json({
        success: false,
        message: "Asset not found"
      });
    }

    res.status(200).json({
      success: true,
      asset
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Error fetching asset",
      error: error.message
    });
  }
};

// Generate unique asset code
const generateAssetCode = async (type) => {
  const typePrefix = {
    street_light: 'STL',
    bench: 'BEN',
    park: 'PRK',
    road: 'ROD',
    drain: 'DRN',
    water_line: 'WTR',
    sewer_line: 'SWR',
    public_building: 'BLD',
    playground: 'PLG',
    garden: 'GDN',
    signboard: 'SGN',
    other: 'AST'
  }[type] || 'AST';

  const count = await Asset.countDocuments({ type });
  const number = String(count + 1).padStart(4, '0');
  return `${typePrefix}-${number}`;
};

// POST /api/assets - Create single asset (Admin only)
const createAsset = async (req, res) => {
  try {
    const { name, type, category, department_id, location, description, 
            installationDate, status, image, notes } = req.body;

    if (!name || !type || !location?.address || !location?.area) {
      return res.status(400).json({ 
        success: false, 
        message: "Missing required fields: name, type, location.address, location.area" 
      });
    }

    // Generate unique asset code
    const assetCode = await generateAssetCode(type);

    const asset = new Asset({
      assetCode,
      name,
      type,
      category: category || [],
      department_id: department_id || null,
      location,
      description,
      installationDate,
      status: status || 'active',
      image,
      notes
    });

    await asset.save();
    const populated = await asset.populate('department_id', 'name');

    res.status(201).json({ 
      success: true, 
      message: 'Asset created successfully',
      asset: populated 
    });
  } catch (error) {
    console.error('Error creating asset:', error);
    res.status(500).json({ 
      success: false, 
      message: "Error creating asset", 
      error: error.message 
    });
  }
};

// PUT /api/assets/:id - Update asset (Admin only)
const updateAsset = async (req, res) => {
  try {
    const { name, type, category, department_id, location, description,
            installationDate, lastMaintenanceDate, nextMaintenanceDate,
            status, image, notes } = req.body;

    const asset = await Asset.findById(req.params.id);
    if (!asset) {
      return res.status(404).json({
        success: false,
        message: "Asset not found"
      });
    }

    // Update fields
    if (name !== undefined) asset.name = name;
    if (type !== undefined) asset.type = type;
    if (category !== undefined) asset.category = category;
    if (department_id !== undefined) asset.department_id = department_id;
    if (location !== undefined) asset.location = { ...asset.location, ...location };
    if (description !== undefined) asset.description = description;
    if (installationDate !== undefined) asset.installationDate = installationDate;
    if (lastMaintenanceDate !== undefined) asset.lastMaintenanceDate = lastMaintenanceDate;
    if (nextMaintenanceDate !== undefined) asset.nextMaintenanceDate = nextMaintenanceDate;
    if (status !== undefined) asset.status = status;
    if (image !== undefined) asset.image = image;
    if (notes !== undefined) asset.notes = notes;

    await asset.save();
    const populated = await asset.populate('department_id', 'name');

    res.status(200).json({ 
      success: true, 
      message: 'Asset updated successfully',
      asset: populated 
    });
  } catch (error) {
    console.error('Error updating asset:', error);
    res.status(500).json({ 
      success: false, 
      message: "Error updating asset", 
      error: error.message 
    });
  }
};

// DELETE /api/assets/:id - Delete asset (Admin only)
const deleteAsset = async (req, res) => {
  try {
    const asset = await Asset.findByIdAndDelete(req.params.id);

    if (!asset) {
      return res.status(404).json({
        success: false,
        message: "Asset not found"
      });
    }

    res.status(200).json({ 
      success: true, 
      message: 'Asset deleted successfully' 
    });
  } catch (error) {
    console.error('Error deleting asset:', error);
    res.status(500).json({ 
      success: false, 
      message: "Error deleting asset", 
      error: error.message 
    });
  }
};

// Import assets from Excel (Admin only)
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
          const type = row.type || row.Type || row.TYPE;
          const address = row.address || row.Address || row.ADDRESS;
          const area = row.area || row.Area || row.AREA;
          const city = row.city || row.City || row.CITY;
          const category = row.category || row.Category || row.CATEGORY;

          if (!name || !type || !address || !area) {
              errors.push({ row: index + 2, message: 'Missing required fields (name, type, address, area)' });
          } else {
              const location = {
                address,
                area,
                city: city || ''
              };
              assetsToInsert.push({ 
                name: name.toString(), 
                type: type.toString(),
                location,
                category: category ? [category.toString()] : [],
                status: 'active'
              });
          }
      });

        let inserted = [];
        if (assetsToInsert.length > 0) {
            inserted = await Asset.insertMany(assetsToInsert, { ordered: false });
        }

        res.status(200).json({
            success: true,
            added: inserted.length,
            errors,
        });
    } catch (error) {
        console.error('asset import error', error);
        res.status(500).json({ message: 'Failed to import assets', error: error.message });
    }
};

module.exports = { 
  getAssets, 
  getAssetById,
  getAssetFilters,
  createAsset, 
  updateAsset,
  deleteAsset,
  importAssets 
};