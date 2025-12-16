import React from "react";
import Title from "../components/Title";
import { assets } from "../assets/assets";

const Contact = () => {
  return (
    <div>
      {/* Page Header */}
      <div className="text-center text-2xl pt-10 border-t border-gray-300">
        <Title text1={"CONTACT"} text2={"US"} />
      </div>

      {/* Contact Section: Image + Info */}
      <div className="my-10 flex flex-col justify-center md:flex-row gap-10 mb-28">
        {/* Store Image */}
        <img
          src={assets.contact_img}
          className="w-full md:max-w-[480px] rounded-lg shadow-lg object-cover"
          alt="AURA Store – Premium Shopping Experience"
        />

        {/* Contact Details */}
        <div className="flex flex-col justify-center items-start gap-6 text-gray-700">
          {/* Store Address */}
          <p className="font-semibold text-xl text-gray-800">Our Store</p>
          <p className="text-gray-600 leading-relaxed">
            54709 Williams Station
            <br />
            Suite 350, Washington, USA
          </p>

          {/* Contact Info */}
          <p className="text-gray-600 leading-relaxed">
            Tel: +91 9326XXXXXX
            <br />
            Email: support@aura.com
          </p>

          {/* Careers / Team Section */}
          <p className="font-semibold text-xl text-gray-800">Careers at AURA</p>
          <p className="text-gray-600">
            Learn more about our teams and job openings.
          </p>

          {/* Call-to-Action Button */}
          <button className="border-2 border-black px-8 py-4 text-sm font-medium hover:bg-black hover:text-white transition-all duration-300 rounded-md">
            Contact Us
          </button>
        </div>
      </div>
    </div>
  );
};

export default Contact;