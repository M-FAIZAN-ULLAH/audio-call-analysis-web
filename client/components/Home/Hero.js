// Hero.js

import styles from '../../styles/Hero.module.css';
import image from "../Assets/2473510-removebg.png";
import Image from 'next/image';

const Hero = () => {
  return (
    <div className={`${styles.hero} bg-black text-white py-16`}>
      <div className="container mx-auto flex items-center justify-between">
        <div className="w-1/2 pr-8">
          <h2 style={{marginTop: "50px"}} className="text-4xl md:text-5xl font-bold mb-4">Unlock the Power of Audio Insights</h2>
          <p className="text-lg mb-6">Our advanced audio call analysis service helps you uncover valuable insights, improve customer experience, and drive business growth.</p>
          <div className="flex space-x-4">
            <button className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-md font-bold">Get Started</button>
            <button style={{backgroundColor: "white"}} className="bg-white-600 hover:bg-purple-700 text-black px-6 py-3 rounded-md font-bold">Learn More</button>
          </div>
        </div>
        <div className={`w-1/2 ${styles.imageContainer}`}>
        <Image
            src={image}
            alt="Audio Insights"
            layout="responsive"
            width={100} // Adjust width as needed
            height={400} // Adjust height as needed
            className="object-cover rounded-full" // Use rounded-full for circular shape
            style={{ borderRadius: '70%', overflow: 'hidden' }} // Ensures circular shape
          />
        </div>
      </div>
    </div>
  );
};

export default Hero;
