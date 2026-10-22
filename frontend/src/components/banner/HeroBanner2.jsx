import React from 'react'
import "./HeroBanner.css";
const HeroBanner2 = () => {
  return (
    <section className="hero-banner"
    onClick={() => {
      window.location.href = "/products";
    }  } 

    >
      <img
        src="images/dussera2.jpeg"
        alt="Special offer on dental products"
      />
    </section>
  );
}

export default HeroBanner2