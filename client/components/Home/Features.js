// Features.js

import styles from '../../styles/Features.module.css';

const Features = () => {
  return (
    <div className={`${styles.features} bg-black text-white py-16`}>
      <div className="container mx-auto text-center">
        <div className={`${styles.square} mb-8`}>Our Offerings</div>
        <h2 className="text-3xl md:text-4xl font-bold mb-4">
          Elevate Your Audio Call Experience
        </h2>
        <p className="text-md mb-8">
          Our suite of tools and features are designed to help you make the most of your audio calls.
        </p>
        <div style={{marginLeft:"250px",width: "950px", height: "600px"}}>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-6">
          <div style={{marginRight:"60px"}} className={`${styles.card}`}>
            <h3 style={{marginTop: "30px"}} className="text-lg font-bold mb-2">Sentiment Analysis</h3>
            <p>Understand the emotional tone of your calls and identify areas for improvement.</p>
          </div>
          <div className={`${styles.card}`}>
            <h3 style={{marginTop: "30px"}} className="text-lg font-bold mb-2">Keyword Tracking</h3>
            <p>Monitor the use of key phrases and topics to gain deeper insights.</p>
          </div>
          <div className={`${styles.card}`}>
            <h3 style={{marginTop: "30px"}} className="text-lg font-bold mb-2">Speaker Identification</h3>
            <p>Easily identify who is speaking and their contribution to the conversation.</p>
          </div>
          <div className={`${styles.card}`}>
            <h3 style={{marginTop: "30px"}} className="text-lg font-bold mb-2">Call Transcription</h3>
            <p>Automatically transcribe your calls for easy review and reference.</p>
          </div>
          <div className={`${styles.card}`}>
            <h3 style={{marginTop: "30px"}} className="text-lg font-bold mb-2">Customizable Reporting</h3>
            <p>Generate tailored reports to meet your specific business needs.</p>
          </div>
          <div className={`${styles.card}`}>
            <h3 style={{marginTop: "30px"}} className="text-lg font-bold mb-2">Real-time Alerts</h3>
            <p>Stay informed with instant notifications on key events and insights.</p>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
};

export default Features;
