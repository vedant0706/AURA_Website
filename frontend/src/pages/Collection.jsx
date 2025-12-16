import React, { useContext, useEffect, useState } from "react";
import { ShopContext } from "../context/ShopContext";
import { assets } from "../assets/assets";
import Title from "../components/Title";
import ProductItem from "../components/ProductItem";

const Collection = () => {
  const { products, search, showSearch } = useContext(ShopContext);

  const [showFilter, setShowFilter] = useState(false);       
  const [filterProducts, setFilterProducts] = useState([]);
  const [category, setCategory] = useState([]);         
  const [subCategory, setSubCategory] = useState([]);      
  const [sortType, setSortType] = useState("relevant");

  // Toggle category selection
  const toggleCategory = (e) => {
    const value = e.target.value;
    setCategory((prev) =>
      prev.includes(value) ? prev.filter((item) => item !== value) : [...prev, value]
    );
  };

  // Toggle sub-category selection
  const toggleSubCategory = (e) => {
    const value = e.target.value;
    setSubCategory((prev) =>
      prev.includes(value) ? prev.filter((item) => item !== value) : [...prev, value]
    );
  };

  // Apply all filters (category, sub-category, search)
  const applyFilter = () => {
    let productsCopy = products.slice();

    // Search filter
    if (showSearch && search) {
      productsCopy = productsCopy.filter((item) =>
        item.name.toLowerCase().includes(search.toLowerCase())
      );
    }

    // Category filter
    if (category.length > 0) {
      productsCopy = productsCopy.filter((item) => category.includes(item.category));
    }

    // Sub-category filter
    if (subCategory.length > 0) {
      productsCopy = productsCopy.filter((item) => subCategory.includes(item.subCategory));
    }

    setFilterProducts(productsCopy);
  };

  // Sort products based on selected sort type
  const sortProduct = () => {
    const fpCopy = filterProducts.slice();

    switch (sortType) {
      case "low-high":
        setFilterProducts(fpCopy.sort((a, b) => a.price - b.price));
        break;
      case "high-low":
        setFilterProducts(fpCopy.sort((a, b) => b.price - a.price));
        break;
      default:
        applyFilter(); // Reset to filtered list
        break;
    }
  };

  // Re-apply filters when any filter or search changes
  useEffect(() => {
    applyFilter();
  }, [category, subCategory, search, showSearch, products]);

  // Re-sort when sort type changes
  useEffect(() => {
    sortProduct();
  }, [sortType]);

  return (
    <div className="flex flex-col sm:flex-row gap-1 sm:gap-10 pt-10 border-t">
      {/* Filter Sidebar */}
      <div className="min-w-60">
        {/* Filter Toggle (Mobile Only) */}
        <p
          onClick={() => setShowFilter(!showFilter)}
          className="my-2 text-xl flex items-center cursor-pointer gap-2 border-b pb-2"
        >
          FILTERS
          <img
            className={`h-3 sm:hidden transition-transform ${showFilter ? "rotate-90" : ""}`}
            src={assets.dropdown_icon}
            alt="Toggle filters"
          />
        </p>

        {/* Category Filter */}
        <div
          className={`border border-gray-300 pl-5 py-3 mt-6 ${showFilter ? "" : "hidden"} sm:block`}
        >
          <p className="mb-3 text-sm font-medium">CATEGORIES</p>
          <div className="flex flex-col gap-2 text-sm font-light text-gray-700">
            <label className="flex gap-2 cursor-pointer">
              <input type="checkbox" className="w-3" value="Men" onChange={toggleCategory} />
              Men
            </label>
            <label className="flex gap-2 cursor-pointer">
              <input type="checkbox" className="w-3" value="Women" onChange={toggleCategory} />
              Women
            </label>
            <label className="flex gap-2 cursor-pointer">
              <input type="checkbox" className="w-3" value="Kids" onChange={toggleCategory} />
              Kids
            </label>
          </div>
        </div>

        {/* Type (Sub-category) Filter */}
        <div
          className={`border border-gray-300 pl-5 py-3 my-5 ${showFilter ? "" : "hidden"} sm:block`}
        >
          <p className="mb-3 text-sm font-medium">TYPE</p>
          <div className="flex flex-col gap-2 text-sm font-light text-gray-700">
            <label className="flex gap-2 cursor-pointer">
              <input type="checkbox" className="w-3" value="Topwear" onChange={toggleSubCategory} />
              Topwear
            </label>
            <label className="flex gap-2 cursor-pointer">
              <input type="checkbox" className="w-3" value="Bottomwear" onChange={toggleSubCategory} />
              Bottomwear
            </label>
            <label className="flex gap-2 cursor-pointer">
              <input type="checkbox" className="w-3" value="Winterwear" onChange={toggleSubCategory} />
              Winterwear
            </label>
          </div>
        </div>
      </div>

      {/* Product Listing Area */}
      <div className="flex-1">
        {/* Header: Title + Sort */}
        <div className="flex justify-between text-base sm:text-2xl mb-4">
          <Title text1={"ALL"} text2={"COLLECTIONS"} />

          {/* Sort Dropdown */}
          <select
            onChange={(e) => setSortType(e.target.value)}
            className="border-2 border-gray-300 text-sm px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-black/20"
            value={sortType}
          >
            <option value="relevant">Sort by: Relevant</option>
            <option value="low-high">Sort by: Low to High</option>
            <option value="high-low">Sort by: High to Low</option>
          </select>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 gap-y-6">
          {filterProducts.length === 0 ? (
            <p className="col-span-full text-center text-gray-500 py-10 text-lg">
              No products found matching your filters
            </p>
          ) : (
            filterProducts.map((item) => (
              <ProductItem
                key={item._id}
                id={item._id}
                name={item.name}
                price={item.price}
                image={item.image}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Collection;