import React from 'react'
import "./HeroBanner.css";
const HeroBanner4 = () => {
  return (
    <section className="hero-banner"
     onClick={() => {
      window.location.href = "/products/6abc8f1232d3d9794dbdb515";
    }  } 
    >
      <img
        src="/images/implant3.jpeg"
        alt="Special offer on dental products"
      />
    </section>
  )
}

export default HeroBanner4