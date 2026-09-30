import React from "react";
import Navbar from "../components/commen/Navbar";
import "./Home.css";
import Footer from "../components/home/Footer";
import FAQSection from "../components/home/FAQSection";
import HotSellingSection from "../components/home/HotSellingSection";
import CategorySection from "../components/home/CategorySection"; 
import BrandSection from "../components/home/BrandSection";
import HeroBanner from "../components/banner/HeroBanner";
import QuickActions from "../components/commen/QuickActions";
const Home = () => {
  return (
    <div className="home-page">

      <Navbar />

        <main>
        <HeroBanner />
        <QuickActions />
        <BrandSection />
        <CategorySection />
        <HotSellingSection />
        <FAQSection />
        <Footer />
      </main>

    </div>
  );
};

export default Home;