import React, { useState } from "react";
import Image from "next/image";
import { Modal } from "antd";
import { FaHeadphones } from "react-icons/fa";
import image from "../assets/Key-rafiki (1).png";
import Link from "next/link";
import { Register } from "../../api/api";
import { useRouter } from "next/router";

const Signup = () => {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [emailError, setEmailError] = useState("");
  const [isModalVisible, setIsModalVisible] = useState(false);
  const router = useRouter();

  const validateEmail = (email) => {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailPattern.test(email);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!validateEmail(email)) {
      setEmailError("Please enter a valid email address.");
    } else {
      setEmailError("");

      try {
        const response = await Register(username, email);

        console.log("Registration successful:", response);
        if (response) {
          setEmail("");
          setUsername("");
          setIsModalVisible(true);
          router.push("/login");
        }
      } catch (err) {
        console.log(err);
      }
      // console.log({ email, username });
    }
  };

  return (
    <div className="min-h-screen flex">
      <div className="w-1/2 flex items-center justify-center">
        <Image src={image} alt="Key Rafiki" className="h-auto max-h-full" />
      </div>
      <div className="w-0.5/2 flex flex-col justify-center px-8 ml-40 mb-56">
        <div className="mb-20">
          <Link href="/" passHref>
            <div className="flex items-center text-white font-bold text-lg md:text-xl lg:text-1xl font-sans">
              <FaHeadphones className="w-4 h-3 md:w-8 md:h-8 lg:w-10 lg:h-10 text-purple-500 mr-2" />
              <h2 style={{ marginLeft: "15px" }}>AUDIO INSIGHTS</h2>
            </div>
          </Link>
        </div>
        <h1 className="text-3xl font-bold mb-4 text-white">
          CREATE AN ACCOUNT
        </h1>
        <hr className="border-white mb-4" />
        <form onSubmit={handleRegister}>
          <div className="mb-8">
            <label
              htmlFor="email"
              className="block text-sm font-medium text-white"
            >
              Email
            </label>
            <input
              type="email"
              id="email"
              className="mt-1 p-2 block w-full border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            {emailError && (
              <p className="text-red-500 text-sm mt-1">{emailError}</p>
            )}
          </div>
          <div className="mb-8">
            <label
              htmlFor="username"
              className="block text-sm font-medium text-white"
            >
              Username
            </label>
            <input
              type="text"
              id="username"
              className="mt-1 p-2 block w-full border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700 focus:outline-none focus:bg-purple-700 mt-4"
          >
            Register
          </button>
        </form>
        <p className="mt-4 text-center">
          Already have an account?{" "}
          <Link href="/login" className="text-purple-600 hover:underline">
            Sign in
          </Link>
        </p>
      </div>
      <Modal
        title="Registration Successful"
        visible={isModalVisible}
        onOk={() => setIsModalVisible(false)}
        onCancel={() => setIsModalVisible(false)}
      >
        <p>Email has been successfully sent.</p>
      </Modal>
    </div>
  );
};

export default Signup;
