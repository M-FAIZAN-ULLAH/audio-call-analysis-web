import React from "react";
import Header from "./Header";
import Hero from "./Hero";
import Guidelines from "./Guidelines";
import Features from "./Features";
import Contact from "./Contact";
import Footer from "./Footer";

const Home = () => {
  return (
    <div className="bg-white min-h-screen">
    <Header />
    <Hero/>
    <Guidelines/>
    <Features/>
    <Contact/>
    <Footer/>
  </div>
  );
};

export default Home;
