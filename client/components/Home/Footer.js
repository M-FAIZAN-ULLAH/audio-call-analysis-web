// Footer.js

import React from 'react';

const Footer = () => {
    return (
        <footer className="bg-black text-white py-8">
            <div className="container mx-auto flex flex-wrap justify-center md:justify-between items-start">
                <div className="footer-content flex flex-wrap justify-between w-full max-w-3xl ml-auto mx-auto font-sans">
                    {/* Left section */}
                    <div className="footer-section mb-7 md:mb-0">
                        <h4 className="text-lg font-bold mb-2">Company</h4>
                        <ul className="text-sm">
                            <li><a href="#" className="text-white hover:text-purple-500">About</a></li>
                            <li><a href="#" className="text-white hover:text-purple-500">Careers</a></li>
                            <li><a href="#" className="text-white hover:text-purple-500">Blog</a></li>
                            <li><a href="#" className="text-white hover:text-purple-500">Contact</a></li>
                        </ul>
                    </div>
                    {/* Middle section */}
                    <div className="footer-section mb-4 md:mb-0">
                        <h4 className="text-lg font-bold mb-2">Product</h4>
                        <ul className="text-sm">
                            <li><a href="#" className="text-white hover:text-purple-500">Features</a></li>
                            <li><a href="#" className="text-white hover:text-purple-500">Integrations</a></li>
                            <li><a href="#" className="text-white hover:text-purple-500">Pricing</a></li>
                            <li><a href="#" className="text-white hover:text-purple-500">Documentation</a></li>
                            <li><a href="#" className="text-white hover:text-purple-500">Resources</a></li>
                            <li><a href="#" className="text-white hover:text-purple-500">Support</a></li>
                        </ul>
                    </div>
                    {/* Right section */}
                    <div className="footer-section">
                        <h4 className="text-lg font-bold mb-2">Legal</h4>
                        <ul className="text-sm">
                            <li><a href="#" className="text-white hover:text-purple-500">Terms of Service</a></li>
                            <li><a href="#" className="text-white hover:text-purple-500">Privacy Policy</a></li>
                            <li><a href="#" className="text-white hover:text-purple-500">Cookie Policy</a></li>
                            <li><a href="#" className="text-white hover:text-purple-500">Security</a></li>
                        </ul>
                    </div>
                </div>
            </div>
            {/* Copyright */}
            <div className="container mx-auto text-center mt-8">
                <p className="text-sm">&copy; 2024 Audio Call Analysis. All rights reserved.</p>
            </div>
        </footer>
    );
};

export default Footer;
