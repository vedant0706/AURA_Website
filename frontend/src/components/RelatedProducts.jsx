import React, { useContext, useEffect, useState } from "react";
import { ShopContext } from "../context/ShopContext";
import Title from "./Title";
import ProductItem from "./ProductItem";

const RelatedProducts = ({ category, subCategory, currentProductId }) => {
  const { products } = useContext(ShopContext);
  const [related, setRelated] = useState([]);

  useEffect(() => {
    if (products.length > 0) {
      let productsCopy = products.slice();

      // Filter by category
      productsCopy = productsCopy.filter((item) => category === item.category);

      // Filter by subCategory
      productsCopy = productsCopy.filter(
        (item) => subCategory === item.subCategory
      );

      // Exclude the current product
      productsCopy = productsCopy.filter(
        (item) => item._id !== currentProductId
      );

      // Take only first 5 related products
      setRelated(productsCopy.slice(0, 5));
    }
  }, [products, category, subCategory, currentProductId]);

  return (
    <div className="my-24">
      {/* Section Title */}
      <div className="text-center text-3xl py-2">
        <Title text1={"RELATED"} text2={"PRODUCTS"} />
      </div>

      {/* Related Products Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 gap-y-6">
        {related.map((item) => (
          <ProductItem
            key={item._id}
            id={item._id}
            name={item.name}
            price={item.price}
            image={item.image}
          />
        ))}
      </div>
    </div>
  );
};

export default RelatedProducts;