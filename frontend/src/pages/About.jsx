import React from "react";
import Title from "../components/Title";
import { assets } from "../assets/assets";

const About = () => {
  return (
    <div>
      {/* Page Header */}
      <div className="text-2xl text-center pt-8 border-t border-gray-300">
        <Title text1={"ABOUT"} text2={"US"} />
      </div>

      {/* About Section: Image + Text */}
      <div className="my-10 flex flex-col md:flex-row gap-16">
        {/* Company Image */}
        <img
          className="w-full md:max-w-[450px] rounded-lg shadow-lg object-cover"
          src={assets.about_img}
          alt="AURA – Premium Fashion & Lifestyle"
        />

        {/* About Text Content */}
        <div className="flex flex-col justify-center gap-6 md:w-2/4 text-gray-700">
          <p className="font-light leading-relaxed">
            AURA was born out of a passion for innovation and a desire to
            revolutionize online shopping. The journey began with a simple idea:
            to provide a platform where customers can easily discover, explore,
            and purchase a wide range of products from the comfort of their
            homes.
          </p>
          <p className="font-light leading-relaxed">
            Since our inception, we've worked tirelessly to curate a diverse
            selection of high-quality products that cater to every taste and
            preference — from fashion and beauty to electronics and home
            essentials. We offer an extensive collection sourced from trusted
            brands and suppliers.
          </p>

          {/* Mission Statement */}
          <b className="text-gray-800 text-lg">Our Mission</b>
          <p className="font-light leading-relaxed">
            Our mission at AURA is to empower customers with choice,
            convenience, and confidence. We're dedicated to providing a seamless
            shopping experience that exceeds expectations — from browsing and
            ordering to delivery and beyond.
          </p>
        </div>
      </div>

      {/* Why Choose Us Section */}
      <div className="text-xl py-4">
        <Title text1={"WHY"} text2={"CHOOSE US"} />
      </div>

      {/* Feature Cards */}
      <div className="flex flex-col md:flex-row text-md mb-20">
        {/* Quality Assurance */}
        <div className="border border-gray-300 px-10 md:px-16 py-8 sm:py-20 flex flex-col gap-5 hover:shadow-lg transition-shadow">
          <b>Quality Assurance</b>
          <p className="text-gray-600">
            We meticulously select and vet each product to ensure it meets our
            stringent quality standards.
          </p>
        </div>

        {/* Convenience */}
        <div className="border border-gray-300 px-10 md:px-16 py-8 sm:py-20 flex flex-col gap-5 hover:shadow-lg transition-shadow">
          <b>Convenience</b>
          <p className="text-gray-600">
            With our user-friendly interface and hassle-free ordering process,
            shopping has never been easier.
          </p>
        </div>

        {/* Customer Service */}
        <div className="border border-gray-300 px-10 md:px-16 py-8 sm:py-20 flex flex-col gap-5 hover:shadow-lg transition-shadow">
          <b>Exceptional Customer Service</b>
          <p className="text-gray-600">
            Our team of dedicated professionals is here to assist you every step
            of the way, ensuring your satisfaction is our top priority.
          </p>
        </div>
      </div>
    </div>
  );
};

export default About;