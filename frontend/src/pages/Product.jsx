import React, { useContext, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { ShopContext } from "../context/ShopContext";
import { assets } from "../assets/assets";
import RelatedProducts from "../components/RelatedProducts";
import { toast } from "react-toastify";

const Product = () => {
  const { productId } = useParams();
  const { products, currency, addToCart } = useContext(ShopContext);

  const [productData, setProductData] = useState(null);
  const [image, setImage] = useState("");
  const [size, setSize] = useState("");

  // Fetch product data by ID from global products array
  const fetchProductData = () => {
    const foundProduct = products.find((item) => item._id === productId);
    if (foundProduct) {
      setProductData(foundProduct);
      setImage(foundProduct.image[0]); // Set first image as default
    }
  };

  // Re-fetch when productId or products list changes
  useEffect(() => {
    if (products.length > 0) {
      fetchProductData();
    }
  }, [productId, products]);

  // Show loading state until product is found
  if (!productData) {
    return (
      <div className="opacity-0 h-screen border-t-2 pt-10">
        Loading product...
      </div>
    );
  }

  return (
    <div className="border-t-2 pt-10 transition-opacity ease-in duration-500 opacity-100">
      {/* Product Images + Details */}
      <div className="flex flex-col sm:flex-row gap-12">
        {/* Image Gallery */}
        <div className="flex-1 flex flex-col-reverse gap-4 sm:flex-row">
          {/* Thumbnails */}
          <div className="flex sm:flex-col overflow-x-auto sm:overflow-y-scroll justify-between sm:justify-normal sm:w-[18.7%] w-full scrollbar-thin">
            {productData.image.map((img, index) => (
              <img
                key={index}
                src={img}
                alt={`Product thumbnail ${index + 1}`}
                onClick={() => setImage(img)}
                className={`w-[24%] sm:w-full sm:mb-3 flex-shrink-0 cursor-pointer rounded-md transition-all hover:opacity-80 ${
                  image === img ? "border-2 border-black p-1" : ""
                }`}
              />
            ))}
          </div>

          {/* Main Image */}
          <div className="w-full sm:w-[80%]">
            <img
              src={image}
              alt={productData.name}
              className="w-full h-auto rounded-lg shadow-lg object-cover"
            />
          </div>
        </div>

        {/* Product Info */}
        <div className="flex-1">
          <h1 className="font-semibold text-3xl mt-2 text-gray-900">
            {productData.name}
          </h1>

          {/* Star Rating */}
          <div className="flex items-center gap-1 mt-3">
            {[...Array(4)].map((_, i) => (
              <img key={i} src={assets.star_icon} alt="Star" className="w-4" />
            ))}
            <img src={assets.star_dull_icon} alt="Half star" className="w-4" />
            <p className="pl-2 text-sm text-gray-600">(122 Reviews)</p>
          </div>

          {/* Price */}
          <p className="mt-5 text-3xl font-bold text-gray-900">
            {currency}
            {productData.price}
          </p>

          {/* Description */}
          <p className="mt-6 text-gray-600 leading-relaxed max-w-2xl">
            {productData.description}
          </p>

          {/* Size Selector */}
          <div className="my-8">
            <p className="text-lg font-medium mb-3">Select Size</p>
            <div className="flex gap-3 flex-wrap">
              {productData.sizes.map((item) => (
                <button
                  key={item}
                  onClick={() => setSize(item)}
                  className={`border rounded-md py-3 px-6 text-sm font-medium transition-all ${
                    size === item
                      ? "border-black bg-black text-white"
                      : "border-gray-300 bg-white hover:border-black"
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          {/* Add to Cart Button */}
          <button
            onClick={() => {
              if (!size) {
                toast.error("Please select a size");
                return;
              }
              addToCart(productData._id, size);
            }}
            className="bg-black text-white px-10 py-4 text-sm font-medium rounded-md hover:bg-gray-900 transition-all active:scale-95"
          >
            ADD TO CART
          </button>

          <hr className="mt-10 border-gray-300" />

          {/* Trust Badges */}
          <div className="text-sm text-gray-600 mt-6 space-y-1">
            <p>100% Original product</p>
            <p>Cash on delivery available</p>
            <p>Easy 7-day return & exchange policy</p>
          </div>
        </div>
      </div>

      {/* Description & Reviews Section */}
      <div className="mt-20">
        <div className="flex border-b">
          <b className="border px-6 py-4 text-sm bg-gray-50">Description</b>
          <p className="border px-6 py-4 text-sm text-gray-600 cursor-pointer hover:bg-gray-50">
            Reviews (122)
          </p>
        </div>
        <div className="px-6 py-8 text-sm text-gray-600 border border-t-0 leading-relaxed space-y-4 bg-gray-50">
          <p>
            An e-commerce website is an online platform that facilitates the
            buying and selling of products or services over the internet. It
            serves as a virtual marketplace where businesses and individuals can
            showcase their products, interact with customers, and conduct
            transactions without the need for a physical presence.
          </p>
          <p>
            E-commerce websites typically display products with detailed
            descriptions, images, prices, and available variations (e.g., sizes,
            colors). Each product has its own dedicated page with relevant
            information to help customers make informed decisions.
          </p>
        </div>
      </div>

      {/* Related Products */}
      <div className="mt-20">
        <RelatedProducts
          category={productData.category}
          subCategory={productData.subCategory}
          currentProductId={productData._id}
        />
      </div>
    </div>
  );
};

export default Product;