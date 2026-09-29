import React, { useEffect, useMemo, useState } from "react";
import {
  Search,
  ArrowLeft,
  ArrowUpDown,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import Navbar from "../../components/commen/Navbar";
import { getCategories } from "../../services/categoryApi";

import "./CategoryBrandListing.css";

const CategoryListing = () => {
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("name_asc");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);

        const response =
          await getCategories();

        setCategories(
          response.data.categories || []
        );
      } catch (error) {
        console.error(
          "Failed to fetch categories:",
          error
        );
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const filteredCategories = useMemo(() => {
    let result = [...categories];

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
  }, [categories, search, sort]);

  const handleCategoryClick = (
    categoryId
  ) => {
    navigate(
      `/products?category=${categoryId}`
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
              All Categories
            </h1>

            <p>
              Browse dental products
              by category.
            </p>
          </div>

          <span>
            {filteredCategories.length}{" "}
            Categories
          </span>

        </div>

        {/* Controls */}
        <div className="directory-controls">

          <div className="directory-search">

            <Search size={19} />

            <input
              type="text"
              placeholder="Search categories..."
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
            Loading categories...
          </div>
        ) : filteredCategories.length ===
          0 ? (
          <div className="directory-state">

            <h2>
              No categories found
            </h2>

            <p>
              Try another search.
            </p>

          </div>
        ) : (
          <div className="directory-grid">

            {filteredCategories.map(
              (category) => (
                <div
                  key={category._id}
                  className="directory-card"
                  onClick={() =>
                    handleCategoryClick(
                      category._id
                    )
                  }
                >

                  <div className="directory-card-image">

                    {category.image ||
                    category.logo ? (
                      <img
                        src={
                          category.image ||
                          category.logo
                        }
                        alt={
                          category.name
                        }
                      />
                    ) : (
                      <span>
                        {category.name
                          ?.charAt(0)
                          ?.toUpperCase()}
                      </span>
                    )}

                  </div>

                  <div className="directory-card-content">

                    <h3>
                      {category.name}
                    </h3>

                    {category.description && (
                      <p>
                        {
                          category.description
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

export default CategoryListing;