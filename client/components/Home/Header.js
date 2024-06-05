import { useState, useEffect } from "react";
import styles from "../../styles/Header.module.css";
import { FaHeadphones } from "react-icons/fa"; // Importing the Font Awesome headphones icon
import Link from "next/link";

const Header = () => {
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollTop, setLastScrollTop] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop =
        window.pageYOffset || document.documentElement.scrollTop;
      if (scrollTop > lastScrollTop) {
        // Downscroll
        setIsVisible(false);
      } else {
        // Upscroll
        setIsVisible(true);
      }
      setLastScrollTop(scrollTop <= 0 ? 0 : scrollTop); // For Mobile or negative scrolling
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollTop]);

  return (
    <header
      className={`${styles.header} ${
        isVisible ? styles.visible : styles.hidden
      }`}
    >
      <div className="flex items-center text-white font-bold text-lg md:text-xl lg:text-1xl font-sans">
        <FaHeadphones className="w-4 h-3 md:w-8 md:h-8 lg:w-10 lg:h-10 text-purple-500 mr-2" />
        <h2 style={{ marginLeft: "15px" }}>AUDIO INSIGHTS</h2>
      </div>
      <nav className="flex space-x-5 text-base md:text-md font-sans">
        <a href="#features" className="text-white hover:text-purple-500">
          Features
        </a>
        <a href="#contact" className="text-white hover:text-purple-500">
          Guidelines
        </a>
        <a href="#contact" className="text-white hover:text-purple-500">
          Contact
        </a>
        <Link href="/signup">
          <p href="#get-started" className="text-white hover:text-purple-500">
            Get Started
          </p>
        </Link>
      </nav>
    </header>
  );
};

export default Header;
