// Contact.js

import React from 'react';
import styles from '../../styles/Contact.module.css';

const Contact = () => {
    return (
        <div className={`${styles.contact}  py-16`}>
            <div className="container mx-auto text-center">
                <h2 className="text-3xl font-bold text-white mb-4">Contact Us</h2>
                <p className="text-lg text-white mb-8">Get in touch with our team for more information.</p>
                <form className="w-full max-w-lg mx-auto">
                    <div className="flex flex-wrap mb-6">
                        <div className="w-full">
                           
                            <input className="appearance-none block w-full bg-gray-200 text-gray-700 border rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white" id="name" type="text" placeholder="Your Name" />
                        </div>
                    </div>
                    <div className="flex flex-wrap mb-6">
                        <div className="w-full">
                            
                            <input className="appearance-none block w-full bg-gray-200 text-gray-700 border rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white focus:border-gray-500" id="email" type="email" placeholder="Your Email" />
                        </div>
                    </div>
                    <div className="flex flex-wrap mb-6">
                        <div className="w-full">
                           
                            <textarea className="appearance-none block w-full bg-gray-200 text-gray-700 border rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white focus:border-gray-500" id="message" placeholder="Your Message" rows="6"></textarea>
                        </div>
                    </div>
                    <div className="w-full text-center">
                        <button className="bg-purple-600 hover:bg-purple-700 text-white py-3 px-6 rounded-md font-bold" type="button">Submit</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Contact;
