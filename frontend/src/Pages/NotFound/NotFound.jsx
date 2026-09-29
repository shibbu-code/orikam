import React from "react";
import { ArrowLeft, Home, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";

import Navbar from "../../components/commen/Navbar";
import "./NotFound.css";

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="not-found-page">
      <Navbar />

      <main className="not-found-container">

        <div className="not-found-number">
          404
        </div>

        <div className="not-found-content">

          <span>PAGE NOT FOUND</span>

          <h1>
            Looks like you've
            <br />
            taken a wrong turn.
          </h1>

          <p>
            The page you're looking for doesn't exist,
            has been moved, or may no longer be available.
          </p>

          <div className="not-found-actions">

            <button
              className="not-found-primary"
              onClick={() => navigate("/")}
            >
              <Home size={17} />
              Back to Home
            </button>

            <button
              className="not-found-secondary"
              onClick={() => navigate("/products")}
            >
              <Search size={17} />
              Browse Products
            </button>

          </div>

          <button
            className="not-found-back"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft size={15} />
            Go Back
          </button>

        </div>

      </main>
    </div>
  );
};

export default NotFound;