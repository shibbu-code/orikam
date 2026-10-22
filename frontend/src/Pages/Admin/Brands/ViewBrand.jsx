import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
ArrowLeft,
Edit,
Tag,
CalendarDays,
Hash,
FileText,
Image as ImageIcon,
} from "lucide-react";
import api from "../../../services/api";
import "./ViewBrand.css";

const AdminBrandDetails = () => {
const { brandId } = useParams();
const navigate = useNavigate();

const [brand, setBrand] = useState(null);
const [loading, setLoading] = useState(true);
const [error, setError] = useState("");

useEffect(() => {
const fetchBrand = async () => {
try {
setLoading(true);
setError("");


    const response = await api.get(
      `/api/brands/${brandId}`
    );

    const fetchedBrand =
      response.data.brand || response.data;

    if (!fetchedBrand?._id) {
      throw new Error("Brand not found.");
    }

    setBrand(fetchedBrand);
  } catch (err) {
    console.error("Fetch brand details error:", err);

    setError(
      err.response?.data?.message ||
        err.message ||
        "Failed to load brand details."
    );
  } finally {
    setLoading(false);
  }
};

fetchBrand();


}, [brandId]);

if (loading) {
return ( <div className="admin-brand-details-state">
Loading brand details... </div>
);
}

if (error || !brand) {
return ( <div className="admin-brand-details-state"> <Tag size={40} />


    <h2>Unable to load brand</h2>

    <p>{error || "Brand not found."}</p>

    <button
      className="brand-details-back"
      onClick={() => navigate("/admin/brands")}
    >
      <ArrowLeft size={17} />
      Back to Brands
    </button>
  </div>
);


}

return ( <div className="admin-brand-details-page">
{/* Header Actions */} <div className="brand-details-header">
<button
className="brand-details-back"
onClick={() => navigate("/admin/brands")}
> <ArrowLeft size={18} />
Back to Brands </button>


    <button
      className="brand-details-edit"
      onClick={() =>
        navigate(`/admin/brands/edit/${brand._id}`)
      }
    >
      <Edit size={16} />
      Edit Brand
    </button>
  </div>

  {/* Brand Heading */}
  <div className="brand-details-title">
    <div>
      <span className="brand-details-eyebrow">
        BRAND DETAILS
      </span>

      <h1>{brand.name}</h1>

      <p>
        Brand ID: {brand._id}
      </p>
    </div>

    <span
      className={`brand-details-status ${
        brand.isActive ? "active" : "inactive"
      }`}
    >
      {brand.isActive ? "Active" : "Inactive"}
    </span>
  </div>

  {/* Main Details */}
  <div className="brand-details-grid">
    {/* Logo Card */}
    <section className="brand-details-card brand-logo-card">
      <h2>Brand Logo</h2>

      <div className="brand-details-logo">
        {brand.logo ? (
          <img
            src={brand.logo}
            alt={`${brand.name} logo`}
          />
        ) : (
          <ImageIcon size={64} />
        )}
      </div>

      <h3>{brand.name}</h3>

      <p>Brand identity</p>
    </section>

    {/* Information Card */}
    <section className="brand-details-card">
      <h2>Brand Information</h2>

      <div className="brand-info-row">
        <span>
          <Tag size={17} />
          Brand Name
        </span>

        <strong>{brand.name || "—"}</strong>
      </div>

      <div className="brand-info-row">
        <span>
          <Hash size={17} />
          Brand ID
        </span>

        <strong>{brand._id}</strong>
      </div>

      <div className="brand-info-row">
        <span>
          <Hash size={17} />
          Slug
        </span>

        <strong>{brand.slug || "—"}</strong>
      </div>

      <div className="brand-info-row">
        <span>
          <CalendarDays size={17} />
          Created
        </span>

        <strong>
          {brand.createdAt
            ? new Date(
                brand.createdAt
              ).toLocaleDateString("en-IN", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })
            : "—"}
        </strong>
      </div>

      <div className="brand-info-row">
        <span>
          <CalendarDays size={17} />
          Last Updated
        </span>

        <strong>
          {brand.updatedAt
            ? new Date(
                brand.updatedAt
              ).toLocaleDateString("en-IN", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })
            : "—"}
        </strong>
      </div>
    </section>

    {/* Description Card */}
    <section className="brand-details-card brand-description-card">
      <h2>
        <FileText size={19} />
        Description
      </h2>

      <p>
        {brand.description ||
          "No description has been added for this brand."}
      </p>
    </section>
  </div>
</div>


);
};

export default AdminBrandDetails;
