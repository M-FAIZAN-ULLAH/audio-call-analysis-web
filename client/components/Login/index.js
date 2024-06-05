import React, { useState } from "react";
import Image from "next/image";
import { FaHeadphones, FaEye, FaEyeSlash } from "react-icons/fa";
import image from "../assets/Key-pana.png";
import Link from "next/link";
import { LoginUser } from "../../api/api";
import { useRouter } from "next/router";
import { useUser } from "../utilis/userContext";

const Login = () => {
  const { setCurrentUser, isAuthenticated } = useUser();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState("");
  const router = useRouter();

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };
  console.log("value: ", isAuthenticated);

  const validateEmail = (email) => {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailPattern.test(email);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!validateEmail(email)) {
      setEmailError("Please enter a valid email address.");
    } else {
      setEmailError("");
      try {
        const res = await LoginUser({ email, password });

        if (res.data === "User not found") {
          alert("user not found");
        } else {
          // login(res.data);
          // console.log("check this out: ",res.data)
          setCurrentUser(res.data);
          router.push("/dashboard");
        }
      } catch (err) {
        console.log(err);
      }
      // console.log({ email, password });
      // Handle login logic here
    }
  };

  return (
    <div className="min-h-screen flex">
      <div className="w-1/2 flex items-center justify-center">
        <Image src={image} alt="Key pana" className="h-90 max-h-full" />
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
          LOGIN TO YOUR ACCOUNT
        </h1>
        <hr className="border-white mb-4" />
        <form onSubmit={handleLogin}>
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
              htmlFor="password"
              className="block text-sm font-medium text-white"
            >
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                className="mt-1 p-2 block w-full border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 px-3 py-2"
                onClick={togglePasswordVisibility}
              >
                {showPassword ? (
                  <FaEyeSlash className="h-6 w-6 text-gray-500" />
                ) : (
                  <FaEye className="h-6 w-6 text-gray-500" />
                )}
              </button>
            </div>
          </div>
          <button
            type="submit"
            className="w-full bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700 focus:outline-none focus:bg-purple-700 mt-4"
          >
            Login
          </button>
        </form>
        <p className="mt-4 text-center">
          Don't have an account?{" "}
          <Link href="/signup" className="text-purple-600 hover:underline">
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
