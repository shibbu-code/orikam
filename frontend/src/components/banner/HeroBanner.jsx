import React from "react";
import "./HeroBanner.css";

const HeroBanner = () => {
  return (
    <section className="hero-banner"
     onClick={() => {
      window.location.href = "/membership";
    }  } 
    >
      <img
        src="/images/sale.png"
        alt="Special offer on dental products"
      />
    </section>
  );
};

export default HeroBanner;