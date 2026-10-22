import React from "react";
import Navbar from "../components/commen/Navbar";
import "./Home.css";
import Footer from "../components/home/Footer";
import FAQSection from "../components/home/FAQSection";
import HotSellingSection from "../components/home/HotSellingSection";
import CategorySection from "../components/home/CategorySection"; 
import BrandSection from "../components/home/BrandSection";
import HeroBanner from "../components/banner/HeroBanner";
import HeroBanner2 from "../components/banner/HeroBanner2";
import QuickActions from "../components/commen/QuickActions";
const Home = () => {
  return (
    <div className="home-page">

      <Navbar />

        <main>
          <QuickActions />
        <HeroBanner2 />
        
        <BrandSection />
        <CategorySection />
        <HeroBanner />
        <HotSellingSection />
        <FAQSection />
        <Footer />
      </main>

    </div>
  );
};

export default Home;