import React from "react";
import { ArrowRight, CheckCircle2, ShieldCheck, Truck, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";

import Navbar from "../../components/commen/Navbar";
import "./About.css";

const About = () => {
  const navigate = useNavigate();

  return (
    <div className="about-page">
      <Navbar />

      <main>
        {/* Hero */}
        <section className="about-hero">
          <div className="about-hero-content">
            <span className="about-eyebrow">
              ABOUT ORIKAM
            </span>

            <h1>
              Simplifying the way
              <br />
              dental professionals <span>buy.</span>
            </h1>

            <p>
              ORIKAM is a B2B dental marketplace built to
              make sourcing dental products simpler,
              transparent, and reliable for professionals,
              clinics, and businesses.
            </p>

            <button
              className="about-primary-btn"
              onClick={() => navigate("/products")}
            >
              Explore Products
              <ArrowRight size={17} />
            </button>
          </div>

          <div className="about-hero-visual">
            <div className="about-visual-card main">
              <span className="visual-number">01</span>
              <h3>Trusted Products</h3>
              <p>
                Quality dental products from
                established brands.
              </p>
            </div>

            <div className="about-visual-card small top">
              <ShieldCheck size={22} />
              <span>Reliable</span>
            </div>

            <div className="about-visual-card small bottom">
              <Truck size={22} />
              <span>Business Ready</span>
            </div>
          </div>
        </section>

        {/* What We Do */}
        <section className="about-section">
          <div className="about-section-heading">
            <span>WHAT WE DO</span>
            <h2>Built around your business needs.</h2>
          </div>

          <div className="about-values">
            <div className="about-value-card">
              <div className="about-value-icon">
                <Users size={21} />
              </div>

              <h3>For Professionals</h3>

              <p>
                Designed for dentists, clinics,
                distributors, retailers, and healthcare
                businesses.
              </p>
            </div>

            <div className="about-value-card">
              <div className="about-value-icon">
                <ShieldCheck size={21} />
              </div>

              <h3>Trusted Marketplace</h3>

              <p>
                Discover products from multiple brands
                through one convenient platform.
              </p>
            </div>

            <div className="about-value-card">
              <div className="about-value-icon">
                <Truck size={21} />
              </div>

              <h3>Business Focused</h3>

              <p>
                Bulk pricing, MOQ support, inventory
                visibility, and streamlined ordering.
              </p>
            </div>
          </div>
        </section>

        {/* Story */}
        <section className="about-story">
          <div className="about-story-content">
            <span>OUR APPROACH</span>

            <h2>
              Making B2B purchasing
              <br />
              less complicated.
            </h2>

            <p>
              Traditional business purchasing can involve
              multiple suppliers, price discussions,
              availability checks, and complicated ordering
              processes.
            </p>

            <p>
              ORIKAM brings these workflows together into
              one digital experience, helping businesses
              discover products, compare options, manage
              quantities, and place orders efficiently.
            </p>

            <div className="about-check-list">
              <div>
                <CheckCircle2 size={17} />
                <span>Multiple brands in one platform</span>
              </div>

              <div>
                <CheckCircle2 size={17} />
                <span>Bulk & B2B pricing support</span>
              </div>

              <div>
                <CheckCircle2 size={17} />
                <span>Simple ordering experience</span>
              </div>
            </div>
          </div>

          <div className="about-story-box">
            <div className="story-box-line"></div>

            <span>ORIKAM</span>

            <h3>
              One platform.
              <br />
              Better sourcing.
            </h3>

            <p>
              Connecting businesses with the products
              they need.
            </p>
          </div>
        </section>

        {/* CTA */}
        <section className="about-cta">
          <div>
            <span>READY TO EXPLORE?</span>
            <h2>Find what your business needs.</h2>
          </div>

          <button
            onClick={() => navigate("/products")}
          >
            Browse Products
            <ArrowRight size={17} />
          </button>
        </section>
      </main>
    </div>
  );
};

export default About;