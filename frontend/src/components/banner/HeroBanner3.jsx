import React from 'react'
import "./HeroBanner.css";
const HeroBanner3 = () => {
  
    return (
    <section className="hero-banner"
     onClick={() => {
      window.location.href = "/products/6abc8f1232d3d9794dbdb520";
    }  } 
    >
      <img
        src="/images/implant2.jpeg"
        alt="Special offer on dental products"
      />
    </section>
  );
  
}

export default HeroBanner3