const Brand = require("../models/Brand");

const addBrand = async (req, res) => {
  try {
    const {
      name,
      slug, logo,
             description,isActive,
    } = req.body;

    if (!name || !slug) {
      return res.status(400).json({  message: "Name and slug are required",
      });
    }

    // Check duplicate brand
    const existingBrand = await Brand.findOne({
      $or: [{ name }, { slug }],});

    if (existingBrand) {
      return res.status(400).json({
        message: "Brand with this name or slug already exists", });}

    const brand = await Brand.create({
      name,slug, logo,
         description, isActive: isActive ?? true,});

    res.status(201).json({
      message: "Brand added successfully",
      brand,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to add brand",
      error: error.message,
    });
  }
};


const getAllBrands = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) ;
    const brands = await Brand.find().limit(limit);

    res.status(200).json({
      message: "Brands fetched successfully",
      brands,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch brands",
      error: error.message,
    });
  }
};

const getBrandById = async (req, res) => {
  try {
    const { brandId } = req.params;

    const brand = await Brand.findById(brandId);

    if (!brand) {
      return res.status(404).json({
        message: "Brand not found",
      });
    }

    res.status(200).json({
      brand,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch brand",
      error: error.message,
    });
  }
};


const updateBrand = async (req, res) => {
  try {
    const { brandId } = req.params;

    const updatedBrand = await Brand.findByIdAndUpdate(
      brandId,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!updatedBrand) {
      return res.status(404).json({
        message: "Brand not found",
      });
    }

    res.status(200).json({
      message: "Brand updated successfully",
      brand: updatedBrand,
    });
  } catch (error) {
    console.error("Update brand error:", error);

    res.status(500).json({
      message: "Failed to update brand",
      error: error.message,
    });
  }
};

const updateBrandStatus = async (req, res) => {
  try {
    const { brandId } = req.params;
    const { isActive } = req.body;

    const brand = await Brand.findByIdAndUpdate(
      brandId,
      { isActive },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!brand) {
      return res.status(404).json({
        message: "Brand not found",
      });
    }

    res.status(200).json({
      message: `Brand ${
        isActive ? "activated" : "deactivated"
      } successfully`,
      brand,
    });
  } catch (error) {
    console.error("Brand status error:", error);

    res.status(500).json({
      message: "Failed to update brand status",
      error: error.message,
    });
  }
};


module.exports = {
  addBrand,
  getAllBrands,
  getBrandById,
  updateBrand,
  updateBrandStatus,
};