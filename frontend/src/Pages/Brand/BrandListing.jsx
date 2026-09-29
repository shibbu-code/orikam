import React, { useEffect, useMemo, useState } from "react";
import {
  Search,
  ArrowLeft,
  ArrowUpDown,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import Navbar from "../../components/commen/Navbar";
import { getBrands } from "../../services/brandApi";

import "../Category/CategoryBrandListing.css";

const BrandListing = () => {
  const navigate = useNavigate();

  const [brands, setBrands] = useState([]);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("name_asc");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBrands = async () => {
      try {
        setLoading(true);

        const response =
          await getBrands();

        setBrands(
          response.data.brands || []
        );
      } catch (error) {
        console.error(
          "Failed to fetch brands:",
          error
        );
      } finally {
        setLoading(false);
      }
    };

    fetchBrands();
  }, []);

  const filteredBrands = useMemo(() => {
    let result = [...brands];

    /* Search */
    if (search.trim()) {
      const searchValue =
        search.toLowerCase();

      result = result.filter((item) =>
        item.name
          ?.toLowerCase()
          .includes(searchValue)
      );
    }

    /* Sort */
    if (sort === "name_asc") {
      result.sort((a, b) =>
        (a.name || "").localeCompare(
          b.name || ""
        )
      );
    }

    if (sort === "name_desc") {
      result.sort((a, b) =>
        (b.name || "").localeCompare(
          a.name || ""
        )
      );
    }

    if (sort === "newest") {
      result.sort(
        (a, b) =>
          new Date(b.createdAt || 0) -
          new Date(a.createdAt || 0)
      );
    }

    if (sort === "oldest") {
      result.sort(
        (a, b) =>
          new Date(a.createdAt || 0) -
          new Date(b.createdAt || 0)
      );
    }

    return result;
  }, [brands, search, sort]);

  const handleBrandClick = (
    brandId
  ) => {
    navigate(
      `/products?brand=${brandId}`
    );
  };

  return (
    <div className="category-brand-page">
      <Navbar />

      <main className="category-brand-container">

        {/* Back */}
        <button
          className="directory-back-button"
          onClick={() =>
            navigate("/")
          }
        >
          <ArrowLeft size={17} />
          Back to Home
        </button>

        {/* Header */}
        <div className="directory-header">

          <div>
            <h1>
              All Brands
            </h1>

            <p>
              Explore products from
              trusted dental brands.
            </p>
          </div>

          <span>
            {filteredBrands.length}{" "}
            Brands
          </span>

        </div>

        {/* Controls */}
        <div className="directory-controls">

          <div className="directory-search">

            <Search size={19} />

            <input
              type="text"
              placeholder="Search brands..."
              value={search}
              onChange={(e) =>
                setSearch(
                  e.target.value
                )
              }
            />

          </div>

          <div className="directory-sort">

            <ArrowUpDown size={17} />

            <select
              value={sort}
              onChange={(e) =>
                setSort(
                  e.target.value
                )
              }
            >
              <option value="name_asc">
                Name: A to Z
              </option>

              <option value="name_desc">
                Name: Z to A
              </option>

              <option value="newest">
                Newest
              </option>

              <option value="oldest">
                Oldest
              </option>
            </select>

          </div>

        </div>

        {/* Loading */}
        {loading ? (
          <div className="directory-state">
            Loading brands...
          </div>
        ) : filteredBrands.length ===
          0 ? (
          <div className="directory-state">

            <h2>
              No brands found
            </h2>

            <p>
              Try another search.
            </p>

          </div>
        ) : (
          <div className="directory-grid">

            {filteredBrands.map(
              (brand) => (
                <div
                  key={brand._id}
                  className="directory-card"
                  onClick={() =>
                    handleBrandClick(
                      brand._id
                    )
                  }
                >

                  <div className="directory-card-image">

                    {brand.logo ||
                    brand.image ? (
                      <img
                        src={
                          brand.logo ||
                          brand.image
                        }
                        alt={
                          brand.name
                        }
                      />
                    ) : (
                      <span>
                        {brand.name
                          ?.charAt(0)
                          ?.toUpperCase()}
                      </span>
                    )}

                  </div>

                  <div className="directory-card-content">

                    <h3>
                      {brand.name}
                    </h3>

                    {brand.description && (
                      <p>
                        {
                          brand.description
                        }
                      </p>
                    )}

                    <span className="directory-card-link">
                      View Products →
                    </span>

                  </div>

                </div>
              )
            )}

          </div>
        )}

      </main>
    </div>
  );
};

export default BrandListing;