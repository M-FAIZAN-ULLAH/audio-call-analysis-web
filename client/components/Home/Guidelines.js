import React, { useEffect, useRef, useState } from 'react';
import styles from '../../styles/Guidelines.module.css';
import { FaMicrophone, FaChartPie, FaBolt, FaFile } from 'react-icons/fa'; // Importing necessary icons

const Guidelines = () => {
  const [isVisible, setIsVisible] = useState([false, false, false, false]);
  const cardRefs = [useRef(), useRef(), useRef(), useRef()];

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry, index) => {
        if (entry.isIntersecting) {
          setIsVisible((prevState) => {
            const newState = [...prevState];
            newState[index] = true;
            return newState;
          });
          observer.unobserve(entry.target);
        }
      });
    });

    cardRefs.forEach((ref) => {
      if (ref.current) {
        observer.observe(ref.current);
      }
    });

    return () => {
      cardRefs.forEach((ref) => {
        if (ref.current) {
          observer.unobserve(ref.current);
        }
      });
    };
  }, []);

  return (
    <section id="guidelines">
    <div className={`${styles.guidelines} container mx-auto py-16 text-center`}>
      <h2 className="text-5xl font-bold text-black mb-4">Guidelines for Audio Call Analysis</h2>
      <p className="text-gray-500 mb-8 text-2xl mt-8">Follow these guidelines to get the most out of our{' '}
        <br />
        audio call analysis service.</p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {/* Card 1 */}
        <div ref={cardRefs[0]} className={`${styles.card} ${isVisible[0] ? styles.visible : styles.hidden} bg-white p-6 rounded-lg shadow-lg text-center`}>
          <FaMicrophone className="w-12 h-12 text-purple-600 mb-4 mx-auto" />
          <h3 className="text-xl text-black font-bold mb-2">Clear Audio</h3>
          <p className="text-gray-600">Ensure high-quality audio recordings for accurate analysis.</p>
        </div>
        {/* Card 2 */}
        <div ref={cardRefs[1]} className={`${styles.card} ${isVisible[1] ? styles.visible : styles.hidden} bg-white p-6 rounded-lg shadow-lg text-center`}>
          <FaFile className="w-12 h-12 text-purple-600 mb-4 mx-auto" />
          <h3 className="text-xl text-black font-bold mb-2">Detailed Transcripts</h3>
          <p className="text-gray-600">Review the full transcripts of your audio calls for deeper insights.</p>
        </div>
        {/* Card 3 */}
        <div ref={cardRefs[2]} className={`${styles.card} ${isVisible[2] ? styles.visible : styles.hidden} bg-white p-6 rounded-lg shadow-lg text-center`}>
          <FaChartPie className="w-12 h-12 text-purple-600 mb-4 mx-auto" />
          <h3 className="text-xl text-black font-bold mb-2">Sentiment Analysis</h3>
          <p className="text-gray-600">Understand the emotional tone and sentiment of your customer interactions.</p>
        </div>
        {/* Card 4 */}
        <div ref={cardRefs[3]} className={`${styles.card} ${isVisible[3] ? styles.visible : styles.hidden} bg-white p-6 rounded-lg shadow-lg text-center`}>
          <FaBolt className="w-12 h-12 text-purple-600 mb-4 mx-auto" />
          <h3 className="text-xl text-black font-bold mb-2">Real-time Alerts</h3>
          <p className="text-gray-600">Get instant notifications about important call events or customer issues.</p>
        </div>
      </div>
    </div>
    </section>
  );
};

export default Guidelines;
