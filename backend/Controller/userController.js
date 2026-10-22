const User = require("../models/User");
const Product = require("../models/Product");
const mongoose = require("mongoose")

const createCustomer = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    // Check required fields
    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Name, email and password are required",
      });
    }

    // Check if customer already exists
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        message: "Customer with this email already exists",
      });
    }

    // Create customer
    const customer = await User.create({
      name,
      email,
      password,
      phone,
      role: "customer",
    });

    res.status(201).json({
      message: "Customer created successfully",
      customer,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to create customer",
      error: error.message,
    });
  }
};
const getUserDetails = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId).select("-password");

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    res.status(200).json({
      message: "User details fetched successfully",
      user,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch user details",
      error: error.message,
    });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password ) {
      return res.status(400).json({
        message: "Email, password  are required",
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    if (user.password !== password) {
      return res.status(401).json({
        message: "Invalid password",
      });
    }

    // Verify selected role
   

    res.status(200).json({
      message: "Login successful",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });

  } catch (error) {
    console.error("Login error:", error);

    res.status(500).json({
      message: "Login failed",
      error: error.message,
    });
  }
};

const registerUser = async (req, res) => {
try {
const { name, email, password, phone, referralCode } = req.body;

if (!name || !email || !password) {
  return res.status(400).json({
    message: "Name, email and password are required",
  });
}

const normalizedEmail = email.trim().toLowerCase();

const existingUser = await User.findOne({
  email: normalizedEmail,
});

if (existingUser) {
  return res.status(400).json({
    message: "User with this email already exists",
  });
}

let referrer = null;

// Validate referral code if provided
if (referralCode) {
  referrer = await User.findOne({
    referralCode: referralCode.trim().toUpperCase(),
    role: "customer",
  });

  if (!referrer) {
    return res.status(400).json({
      message: "Invalid referral code",
    });
  }
}

// Generate a unique referral code
let newReferralCode;
let codeExists = true;

while (codeExists) {
  newReferralCode =
    "ORI" +
    Math.random().toString(36).substring(2, 8).toUpperCase();

  codeExists = await User.exists({
    referralCode: newReferralCode,
  });
}

const user = await User.create({
  name: name.trim(),
  email: normalizedEmail,
  password,
  phone,
  role: "customer",
  referralCode: newReferralCode,
  referredBy: referrer ? referrer._id : null,
  referralRewardClaimed: false,
});

const userData = user.toObject();
delete userData.password;

res.status(201).json({
  message: "Registration successful",
  user: userData,
});


} catch (error) {
console.error("Registration error:", error);


res.status(500).json({
  message: "Registration failed",
  error: error.message,
});


}
};


const updateUserProfile = async (req, res) => {
  try {
    const { userId } = req.params;
    const { name, email, phone } = req.body;

    if (!name || !email) {
      return res.status(400).json({
        message: "Name and email are required",
      });
    }

    const existingUser = await User.findOne({
      email,
      _id: { $ne: userId },
    });

    if (existingUser) {
      return res.status(400).json({
        message: "Email is already in use",
      });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: phone?.trim() || "",
      },
      {
        new: true,
        runValidators: true,
      }
    ).select("-password");

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    res.status(200).json({
      message: "Profile updated successfully",
      user,
    });
  } catch (error) {
    console.error("Update profile error:", error);

    res.status(500).json({
      message: "Failed to update profile",
      error: error.message,
    });
  }
};

const addRecentlyViewed = async (req, res) => {
  try {
    const { userId, productId } = req.body;

    if (!userId || !productId) {
      return res.status(400).json({
        message: "userId and productId are required",
      });
    }

    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    // Remove  already exists
    user.recentlyViewed = user.recentlyViewed.filter(
      (id) => id.toString() !== productId.toString()
    );

    // Add latest view....
    user.recentlyViewed.unshift(productId);

    // ' only latest 5
    user.recentlyViewed = user.recentlyViewed.slice(0, 5);

    await user.save();

    res.status(200).json({
      message: "Recently viewed updated successfully",
      recentlyViewed: user.recentlyViewed,
    });
  } catch (error) {
    console.error("Add recently viewed error:", error);

    res.status(500).json({
      message: "Failed to update recently viewed",
      error: error.message,
    });
  }
};

const getRecentlyViewed = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId)
      .select("recentlyViewed")
      .populate(
        "recentlyViewed",
        "name logo images price b2bPrice stock rating brand"
      );

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    res.status(200).json({
      message: "Recently viewed products fetched successfully",
      products: user.recentlyViewed || [],
    });
  } catch (error) {
    console.error("Get recently viewed error:", error);

    res.status(500).json({
      message: "Failed to fetch recently viewed products",
      error: error.message,
    });
  }
};

const getUserAddresses = async (req, res) => {
try {
const { userId } = req.params;

if (!mongoose.isValidObjectId(userId)) {
  return res.status(400).json({ message: "Invalid user ID" });
}

const user = await User.findById(userId).select("addresses");

if (!user) {
  return res.status(404).json({ message: "User not found" });
}

res.status(200).json({
  message: "Addresses fetched successfully",
  addresses: user.addresses || [],
});

} catch (error) {
console.error("Get addresses error:", error);
res.status(500).json({
message: "Failed to fetch addresses",
error: error.message,
});
}
};

const addUserAddress = async (req, res) => {
try {
const { userId } = req.params;
console.log(userId);
const {
  fullName,
  phone,
  addressLine,
  landmark,
  city,
  state,
  pincode,
  addressType,
  isDefault,
} = req.body;

if (!mongoose.isValidObjectId(userId)) {
  return res.status(400).json({ message: "Invalid user ID" });
}

if (
  !fullName?.trim() ||
  !phone?.trim() ||
  !addressLine?.trim() ||
  !city?.trim() ||
  !state?.trim() ||
  !pincode?.trim()
) {
  return res.status(400).json({
    message:
      "Full name, phone, address, city, state and pincode are required",
  });
}

if (
  addressType !== undefined &&
  !["Home", "Office", "Other"].includes(addressType)
) {
  return res.status(400).json({
    message: "Address type must be Home, Office or Other",
  });
}

const user = await User.findById(userId);

if (!user) {
  return res.status(404).json({ message: "User not found" });
}

const makeDefault =
  user.addresses.length === 0 || isDefault === true;

if (makeDefault) {
  user.addresses.forEach((address) => {
    address.isDefault = false;
  });
}

user.addresses.push({
  fullName: fullName.trim(),
  phone: phone.trim(),
  addressLine: addressLine.trim(),
  landmark: landmark?.trim() || "",
  city: city.trim(),
  state: state.trim(),
  pincode: pincode.trim(),
  addressType: addressType || "Home",
  isDefault: makeDefault,
});

await user.save();

const newAddress = user.addresses[user.addresses.length - 1];

res.status(201).json({
  message: "Address added successfully",
  address: newAddress,
  addresses: user.addresses,
});

} catch (error) {
console.error("Add address error:", error);
res.status(500).json({
message: "Failed to add address",
error: error.message,
});
}
};

const updateUserAddress = async (req, res) => {
try {
const { userId, addressId } = req.params;

if (
  !mongoose.isValidObjectId(userId) ||
  !mongoose.isValidObjectId(addressId)
) {
  return res.status(400).json({
    message: "Invalid user ID or address ID",
  });
}

const allowedFields = [
  "fullName",
  "phone",
  "addressLine",
  "landmark",
  "city",
  "state",
  "pincode",
  "addressType",
];

const updates = {};

for (const field of allowedFields) {
  if (req.body[field] !== undefined) {
    updates[field] =
      typeof req.body[field] === "string"
        ? req.body[field].trim()
        : req.body[field];
  }
}

if (Object.keys(updates).length === 0) {
  return res.status(400).json({
    message: "Provide at least one address field to update",
  });
}

if (
  updates.addressType !== undefined &&
  !["Home", "Office", "Other"].includes(updates.addressType)
) {
  return res.status(400).json({
    message: "Address type must be Home, Office or Other",
  });
}

const user = await User.findById(userId);

if (!user) {
  return res.status(404).json({ message: "User not found" });
}

const address = user.addresses.id(addressId);

if (!address) {
  return res.status(404).json({ message: "Address not found" });
}

Object.assign(address, updates);

await user.save();

res.status(200).json({
  message: "Address updated successfully",
  address,
  addresses: user.addresses,
});

} catch (error) {
console.error("Update address error:", error);
res.status(500).json({
message: "Failed to update address",
error: error.message,
});
}
};

const deleteUserAddress = async (req, res) => {
try {
const { userId, addressId } = req.params;

if (
  !mongoose.isValidObjectId(userId) ||
  !mongoose.isValidObjectId(addressId)
) {
  return res.status(400).json({
    message: "Invalid user ID or address ID",
  });
}

const user = await User.findById(userId);

if (!user) {
  return res.status(404).json({ message: "User not found" });
}

const address = user.addresses.id(addressId);

if (!address) {
  return res.status(404).json({ message: "Address not found" });
}

const wasDefault = address.isDefault;

user.addresses.pull({ _id: addressId });

if (wasDefault && user.addresses.length > 0) {
  user.addresses[0].isDefault = true;
}

await user.save();

res.status(200).json({
  message: "Address deleted successfully",
  addresses: user.addresses,
});

} catch (error) {
console.error("Delete address error:", error);
res.status(500).json({
message: "Failed to delete address",
error: error.message,
});
}
};

const setDefaultUserAddress = async (req, res) => {
try {
const { userId, addressId } = req.params;

if (
  !mongoose.isValidObjectId(userId) ||
  !mongoose.isValidObjectId(addressId)
) {
  return res.status(400).json({
    message: "Invalid user ID or address ID",
  });
}

const user = await User.findById(userId);

if (!user) {
  return res.status(404).json({ message: "User not found" });
}

const selectedAddress = user.addresses.id(addressId);

if (!selectedAddress) {
  return res.status(404).json({ message: "Address not found" });
}

user.addresses.forEach((address) => {
  address.isDefault = address._id.equals(selectedAddress._id);
});

await user.save();

res.status(200).json({
  message: "Default address updated successfully",
  address: selectedAddress,
  addresses: user.addresses,
});

} catch (error) {
console.error("Set default address error:", error);
res.status(500).json({
message: "Failed to set default address",
error: error.message,
});
}
};

module.exports = {
  createCustomer,
  getUserDetails,
  loginUser,
  registerUser,
  updateUserProfile,
  addRecentlyViewed,
  getRecentlyViewed,
  getUserAddresses,
  addUserAddress,
  updateUserAddress,
  deleteUserAddress,
  setDefaultUserAddress,

};