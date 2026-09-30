import React, { useEffect, useState } from "react";
import {
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react";
import {
  useNavigate,
  useSearchParams,
} from "react-router-dom";

import Navbar from "../../components/commen/Navbar";
import ProductCard from "../../components/home/ProductCard";

import { getProducts } from "../../services/productApi";
import { getCategories } from "../../services/categoryApi";
import { getBrands } from "../../services/brandApi";

import "./ProductListing.css";

const ProductListing = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] =
    useSearchParams();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState(
    searchParams.get("category") || ""
  );
  const [brand, setBrand] = useState(
    searchParams.get("brand") || ""
  );
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [sort, setSort] = useState("");

  const [loading, setLoading] = useState(true);

  /* =========================================
     FETCH CATEGORIES + BRANDS
  ========================================= */

  useEffect(() => {
    const fetchFilters = async () => {
      try {
        const [
          categoryResponse,
          brandResponse,
        ] = await Promise.all([
          getCategories(),
          getBrands(),
        ]);

        setCategories(
          categoryResponse.data.categories || []
        );

        setBrands(
          brandResponse.data.brands || []
        );
      } catch (error) {
        console.error(
          "Failed to fetch filters:",
          error
        );
      }
    };

    fetchFilters();
  }, []);

  /* =========================================
     SYNC URL FILTERS
  ========================================= */

  useEffect(() => {
    const urlCategory =
      searchParams.get("category") || "";

    const urlBrand =
      searchParams.get("brand") || "";

    setCategory(urlCategory);
    setBrand(urlBrand);
  }, [searchParams]);

  /* =========================================
     FETCH PRODUCTS
  ========================================= */

  useEffect(() => {
    fetchProducts();
  }, [
    search,
    category,
    brand,
    minPrice,
    maxPrice,
    sort,
  ]);

  const fetchProducts = async () => {
    try {
      setLoading(true);

      const response = await getProducts({
        search,
        category,
        brand,
        minPrice,
        maxPrice,
        sort,
      });

      setProducts(
        response.data.products || []
      );
    } catch (error) {
      console.error(
        "Failed to fetch products:",
        error
      );

      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  /* =========================================
     FILTER HANDLERS
  ========================================= */

  const handleCategoryChange = (value) => {
    setCategory(value);

    const params = new URLSearchParams(
      searchParams
    );

    if (value) {
      params.set("category", value);
    } else {
      params.delete("category");
    }

    setSearchParams(params);
  };

  const handleBrandChange = (value) => {
    setBrand(value);

    const params = new URLSearchParams(
      searchParams
    );

    if (value) {
      params.set("brand", value);
    } else {
      params.delete("brand");
    }

    setSearchParams(params);
  };

  /* =========================================
     ADD TO CART
  ========================================= */

  const handleAddToCart = async (
    productId
  ) => {
    const userId =
      localStorage.getItem("userId");

    if (!userId) {
      navigate("/login");
      return;
    }

    try {
      const response = await fetch(
        "https://orikam-2.onrender.com/api/cart/add",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId,
            productId,
            quantity: 1,
          }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        alert("Product added to cart");
      } else {
        alert(
          data.message ||
            "Failed to add product"
        );
      }
    } catch (error) {
      console.error(
        "Add to cart error:",
        error
      );
    }
  };

  /* =========================================
     CLEAR FILTERS
  ========================================= */

  const clearFilters = () => {
    setSearch("");
    setCategory("");
    setBrand("");
    setMinPrice("");
    setMaxPrice("");
    setSort("");

    setSearchParams({});
  };

  const hasFilters =
    search ||
    category ||
    brand ||
    minPrice ||
    maxPrice ||
    sort;

  /* =========================================
     PAGE TITLE
  ========================================= */

  const selectedCategory =
    categories.find(
      (item) => item._id === category
    );

  const selectedBrand =
    brands.find(
      (item) => item._id === brand
    );

  let pageTitle = "Dental Products";
  let pageDescription =
    "Explore our collection of dental products.";

  if (selectedCategory) {
    pageTitle = selectedCategory.name;
    pageDescription =
      `Explore products in ${selectedCategory.name}.`;
  }

  if (selectedBrand) {
    pageTitle = selectedBrand.name;
    pageDescription =
      `Explore products from ${selectedBrand.name}.`;
  }

  /* =========================================
     RENDER
  ========================================= */

  return (
    <div className="product-listing-page">
      <Navbar />

      <main className="product-listing-container">

        {/* Header */}
        <div className="product-listing-header">

          <div>
            <h1>{pageTitle}</h1>

            <p>
              {pageDescription}
            </p>
          </div>

          <span className="product-count">
            {products.length} Products
          </span>

        </div>

        {/* Search */}
        <div className="product-search">

          <Search size={20} />

          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
          />

        </div>

        {/* Filters */}
        <div className="product-filter-bar">

          {/* Category */}
          <div className="filter-group">

            <label>
              Category
            </label>

            <select
              value={category}
              onChange={(e) =>
                handleCategoryChange(
                  e.target.value
                )
              }
            >
              <option value="">
                All Categories
              </option>

              {categories.map((item) => (
                <option
                  key={item._id}
                  value={item._id}
                >
                  {item.name}
                </option>
              ))}
            </select>

          </div>

          {/* Brand */}
          <div className="filter-group">

            <label>
              Brand
            </label>

            <select
              value={brand}
              onChange={(e) =>
                handleBrandChange(
                  e.target.value
                )
              }
            >
              <option value="">
                All Brands
              </option>

              {brands.map((item) => (
                <option
                  key={item._id}
                  value={item._id}
                >
                  {item.name}
                </option>
              ))}
            </select>

          </div>

          {/* Min Price */}
          <div className="filter-group">

            <label>
              Min Price
            </label>

            <input
              type="number"
              placeholder="₹ Min"
              value={minPrice}
              onChange={(e) =>
                setMinPrice(
                  e.target.value
                )
              }
            />

          </div>

          {/* Max Price */}
          <div className="filter-group">

            <label>
              Max Price
            </label>

            <input
              type="number"
              placeholder="₹ Max"
              value={maxPrice}
              onChange={(e) =>
                setMaxPrice(
                  e.target.value
                )
              }
            />

          </div>

          {/* Sort */}
          <div className="filter-group">

            <label>
              Sort By
            </label>

            <select
              value={sort}
              onChange={(e) =>
                setSort(e.target.value)
              }
            >
              <option value="">
                Newest
              </option>

              <option value="price_asc">
                Price: Low to High
              </option>

              <option value="price_desc">
                Price: High to Low
              </option>

              <option value="rating">
                Rating
              </option>

              <option value="popular">
                Popular
              </option>
            </select>

          </div>

          {/* Clear */}
          {hasFilters && (
            <button
              className="clear-filter-button"
              onClick={clearFilters}
            >
              <X size={16} />
              Clear
            </button>
          )}

        </div>

        {/* Products */}
        {loading ? (
          <div className="products-loading">
            Loading products...
          </div>
        ) : products.length === 0 ? (
          <div className="products-empty">

            <SlidersHorizontal size={40} />

            <h2>
              No products found
            </h2>

            <p>
              Try changing your search
              or filters.
            </p>

            <button
              onClick={clearFilters}
            >
              Clear Filters
            </button>

          </div>
        ) : (
          <div className="products-grid">

            {products.map((product) => (
              <ProductCard
                key={product._id}
                product={product}
                onAddToCart={
                  handleAddToCart
                }
              />
            ))}

          </div>
        )}

      </main>
    </div>
  );
};

export default ProductListing;