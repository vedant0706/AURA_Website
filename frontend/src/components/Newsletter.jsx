import React from "react";

const Newsletter = () => {
  const onSubmitHandler = (event) => {
    event.preventDefault();
  };

  return (
    <div className="text-center">
      {/* Offer Headline */}
      <p className="text-2xl font-medium text-gray-800">
        Subscribe now & get 20% off
      </p>

      {/* Description */}
      <p className="text-gray-400 mt-3">
        Lorem Ipsum is simply dummy text of the printing and typesetting
        industry.
      </p>

      {/* Subscription Form */}
      <form
        onSubmit={onSubmitHandler}
        className="w-full sm:w-1/2 flex items-center gap-3 mx-auto my-6 border pl-3"
      >
        <input
          type="email"
          className="w-full sm:flex-1 outline-none"
          placeholder="Enter your email"
          required
          aria-label="Email address"
        />
        <button
          type="submit"
          className="bg-black text-white text-xs px-10 py-4 cursor-pointer hover:bg-gray-800 transition-colors"
        >
          SUBSCRIBE
        </button>
      </form>
    </div>
  );
};

export default Newsletter;