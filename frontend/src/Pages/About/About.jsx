
import React from "react";
import {
  ArrowRight,
  CheckCircle2,
  ShieldCheck,
  Truck,
  Users,
  Package,
  Boxes,
  BadgePercent,
  ShoppingCart,
  Building2,
  Tags,
  Headphones,
  ClipboardCheck,
  TrendingUp,
  Clock3,
  Search,
  Wallet,
  CircleDollarSign,
  Award,
  ChevronRight,
} from "lucide-react";
import Footer from "../../components/home/Footer";
import { useNavigate } from "react-router-dom";

import Navbar from "../../components/commen/Navbar";
import "./About.css";

const About = () => {
  const navigate = useNavigate();

  const capabilities = [
    {
      icon: Search,
      title: "Product Discovery",
      description:
        "Explore dental products across multiple brands and categories in one centralized marketplace.",
      tag: "Easy discovery",
    },
    {
      icon: BadgePercent,
      title: "B2B & Bulk Pricing",
      description:
        "Access business-oriented pricing and quantity-based price tiers where available.",
      tag: "Volume purchasing",
    },
    {
      icon: Boxes,
      title: "MOQ-Based Ordering",
      description:
        "View minimum order quantities before purchasing and plan orders around your business requirements.",
      tag: "Smarter ordering",
    },
    {
      icon: Package,
      title: "Product Availability",
      description:
        "Review available stock information to make more informed purchasing decisions.",
      tag: "Stock visibility",
    },
    {
      icon: Tags,
      title: "Brand Comparison",
      description:
        "Discover products from different brands and compare available options before placing an order.",
      tag: "More choice",
    },
    {
      icon: Wallet,
      title: "Membership & Rewards",
      description:
        "Explore membership benefits and eligible reward coins designed to support repeat purchasing.",
      tag: "Added value",
    },
  ];

  const audiences = [
    {
      icon: Building2,
      title: "Dental Clinics",
      description:
        "Organize recurring supply purchases and find products for everyday clinical requirements.",
    },
    {
      icon: Users,
      title: "Dental Professionals",
      description:
        "Discover dental materials, instruments, equipment, and other relevant supplies.",
    },
    {
      icon: Package,
      title: "Distributors & Retailers",
      description:
        "Explore product ranges and quantity-based pricing options for business purchasing.",
    },
    {
      icon: ShoppingCart,
      title: "Healthcare Businesses",
      description:
        "Manage product discovery and ordering through a centralized digital shopping experience.",
    },
  ];

  const steps = [
    {
      number: "01",
      title: "Discover Products",
      description:
        "Browse categories, explore brands, search for products, and review product specifications.",
    },
    {
      number: "02",
      title: "Compare Pricing",
      description:
        "Check listed prices, bulk price tiers, minimum order quantities, and stock information.",
    },
    {
      number: "03",
      title: "Build Your Order",
      description:
        "Select the required quantities, review the order summary, and check applicable reward options.",
    },
    {
      number: "04",
      title: "Track Your Purchase",
      description:
        "Use your account to review orders and follow available order-status updates.",
    },
  ];

  const benefits = [
    "Multiple brands in one marketplace",
    "B2B pricing and bulk quantity tiers",
    "Minimum order quantity visibility",
    "Product and stock information",
    "Centralized cart and order management",
    "Membership and reward coin features",
  ];

  return (
    <div className="about-page">
      <Navbar />

      <main>
        {/* HERO */}
        <section className="about-hero">
          <div className="about-hero-inner">
            <div className="about-hero-content">
              

              

              <h1>
                Your dental supply
                <br />
                sourcing, <span>simplified.</span>
              </h1>

              <p className="about-hero-description">
                ORIKAM is a B2B dental marketplace that brings product
                discovery, brand selection, quantity-based pricing, and
                business ordering together in one convenient platform.
              </p>

              <div className="about-hero-actions">
                <button
                  className="about-primary-btn"
                  onClick={() => navigate("/products")}
                >
                  Explore Products
                  <ArrowRight size={17} />
                </button>

                <button
                  className="about-secondary-btn"
                  onClick={() => navigate("/products")}
                >
                  Discover Brands
                  <Package size={17} />
                </button>
              </div>

             
            </div>

            <div className="about-hero-visual">
              <div className="about-visual-topline">
                <div>
                  
                  <h3>One marketplace.</h3>
                  <p>More organized purchasing.</p>
                </div>

                <div className="about-visual-logo">
                  <Package size={24} />
                </div>
              </div>

              <div className="about-visual-product">
                <div className="about-product-symbol">
                  <Boxes size={35} />
                </div>

                <div className="about-product-info">
                  <span>BUSINESS PURCHASING</span>
                  <h4>Dental Supplies</h4>
                  <p>Products from multiple brands</p>
                </div>

                
              </div>

              <div className="about-visual-features">
                <div className="about-mini-feature">
                  <div className="about-mini-icon">
                    <BadgePercent size={19} />
                  </div>

                  <div>
                    <strong>Bulk Pricing</strong>
                    <span>Quantity-based rates</span>
                  </div>
                </div>

                <div className="about-mini-feature">
                  <div className="about-mini-icon">
                    <ClipboardCheck size={19} />
                  </div>

                  <div>
                    <strong>MOQ Visibility</strong>
                    <span>Clear order quantities</span>
                  </div>
                </div>

                <div className="about-mini-feature">
                  <div className="about-mini-icon">
                    <ShoppingCart size={19} />
                  </div>

                  <div>
                    <strong>Order Management</strong>
                    <span>Purchases in one place</span>
                  </div>
                </div>
              </div>

              


              
            </div>
          </div>
        </section>

        {/* MARKETPLACE INTRODUCTION */}
        <section className="about-intro">
          <div className="about-intro-label">
            <span className="about-section-tag">ABOUT THE MARKETPLACE</span>
            <h2>
              A more organized way to source dental supplies.
            </h2>
          </div>

          <div className="about-intro-copy">
            <p>
              Dental businesses regularly need to source products across
              different categories, brands, and quantities. Managing product
              discovery and purchasing across separate channels can make
              the process unnecessarily complicated.
            </p>

            <p>
              ORIKAM brings these activities into a single digital
              marketplace, helping business buyers explore products,
              understand pricing and minimum quantities, build orders,
              and manage purchases from their accounts.
            </p>

            <button
              className="about-text-link"
              onClick={() => navigate("/products")}
            >
              Explore the marketplace
              <ArrowRight size={16} />
            </button>
          </div>
        </section>

        {/* CAPABILITIES */}
        <section className="about-capabilities">
          <div className="about-section-heading">
            <div>
              <span className="about-section-tag">
                WHAT ORIKAM OFFERS
              </span>

              <h2>Tools designed for B2B purchasing.</h2>

              <p>
                A marketplace experience built around the way businesses
                discover products, evaluate quantities, and manage orders.
              </p>
            </div>

            <button
              className="about-outline-btn"
              onClick={() => navigate("/products")}
            >
              View Products
              <ArrowRight size={16} />
            </button>
          </div>

          <div className="about-capability-grid">
            {capabilities.map((item, index) => {
              const Icon = item.icon;

              return (
                <article className="about-capability-card" key={item.title}>
                  <div className="about-capability-card-top">
                    <div className="about-capability-icon">
                      <Icon size={22} />
                    </div>

                    <span className="about-card-number">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                  </div>

                  <span className="about-capability-tag">
                    {item.tag}
                  </span>

                  <h3>{item.title}</h3>

                  <p>{item.description}</p>

                  <div className="about-card-bottom">
                    <span>Explore ORIKAM</span>
                    <ArrowRight size={16} />
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        {/* BUYER TYPES */}
        <section className="about-audience">
          <div className="about-audience-heading">
            <span className="about-section-tag">
              WHO WE SERVE
            </span>

            <h2>Made for the dental supply ecosystem.</h2>

            <p>
              ORIKAM is designed for business buyers looking for a more
              convenient way to discover and purchase dental supplies.
            </p>
          </div>

          <div className="about-audience-grid">
            {audiences.map((item) => {
              const Icon = item.icon;

              return (
                <article className="about-audience-card" key={item.title}>
                  <div className="about-audience-icon">
                    <Icon size={22} />
                  </div>

                  <h3>{item.title}</h3>

                  <p>{item.description}</p>

                  <button onClick={() => navigate("/products")}>
                    Explore products
                    <ArrowRight size={15} />
                  </button>
                </article>
              );
            })}
          </div>
        </section>

        {/* B2B PURCHASING */}
        
        {/* HOW IT WORKS */}
        <section className="about-process">
          <div className="about-process-heading">
            <span className="about-section-tag">
              HOW IT WORKS
            </span>

            <h2>Four steps to a more organized purchase.</h2>

            <p>
              Find products, evaluate your options, build an order, and
              review your purchases through one marketplace.
            </p>
          </div>

          <div className="about-process-grid">
            {steps.map((step, index) => (
              <article className="about-process-card" key={step.number}>
                <div className="about-process-number">
                  <span>{step.number}</span>

                  {index !== steps.length - 1 && (
                    <div className="about-process-line" />
                  )}
                </div>

                <h3>{step.title}</h3>

                <p>{step.description}</p>
              </article>
            ))}
          </div>
        </section>

        {/* DIFFERENCE */}
        <section className="about-difference">
          <div className="about-difference-inner">
            <div className="about-difference-copy">
              <span className="about-section-tag">
                WHY ORIKAM
              </span>

              <h2>
                Less purchasing complexity.
                <br />
                More clarity at every step.
              </h2>

              <p>
                ORIKAM focuses on bringing important purchasing information
                together so businesses can make informed decisions without
                jumping between disconnected product and ordering workflows.
              </p>
            </div>

            <div className="about-difference-items">
              <div>
                <div className="about-difference-icon">
                  <Search size={20} />
                </div>

                <div>
                  <h3>Discover in one place</h3>
                  <p>
                    Browse products across categories and brands.
                  </p>
                </div>
              </div>

              <div>
                <div className="about-difference-icon">
                  <BadgePercent size={20} />
                </div>

                <div>
                  <h3>Understand your pricing</h3>
                  <p>
                    Review applicable B2B prices and quantity tiers.
                  </p>
                </div>
              </div>

              <div>
                <div className="about-difference-icon">
                  <Clock3 size={20} />
                </div>

                <div>
                  <h3>Keep orders organized</h3>
                  <p>
                    Review purchases and order-status information through
                    your account.
                  </p>
                </div>
              </div>

              <div>
                <div className="about-difference-icon">
                  <Award size={20} />
                </div>

                <div>
                  <h3>Explore member benefits</h3>
                  <p>
                    Access available membership and reward features.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FINAL CTA */}
        
      </main>

      {/* TRUST STRIP */}
      <section className="about-trust-strip">
        <div>
          <Package size={19} />
          <span>B2B Product Discovery</span>
        </div>

        <div>
          <BadgePercent size={19} />
          <span>Quantity-Based Pricing</span>
        </div>

        <div>
          <ClipboardCheck size={19} />
          <span>Order Management</span>
        </div>

        <div>
          <ShieldCheck size={19} />
          <span>Business-Focused Platform</span>
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default About;

