import React, { useContext, useEffect, useState } from "react";
import { ShopContext } from "../context/ShopContext";
import Title from "../components/Title";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const Orders = () => {
  const navigate = useNavigate();
  const { isLoggedin, currency, axiosInstance, isLoading } =
    useContext(ShopContext);

  const [orderData, setOrderData] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadOrderData = async () => {
    try {
      if (!isLoggedin) {
        toast.error("Please login to view orders");
        navigate("/login");
        return;
      }

      setLoading(true);

      const response = await axiosInstance.post("/api/order/userorders");

      if (response.data.success) {
        const allOrdersItem = [];

        response.data.orders.forEach((order) => {
          order.items.forEach((item) => {
            allOrdersItem.push({
              ...item,
              status: order.status,
              payment: order.payment,
              paymentMethod: order.paymentMethod,
              date: order.date,
            });
          });
        });

        // Show newest orders first
        setOrderData(allOrdersItem.reverse());
      } else {
        toast.error(response.data.message || "Failed to load orders");
      }
    } catch (error) {
      if (error.response?.status === 401) {
        toast.error("Session expired. Please login again");
        navigate("/login");
      } else {
        toast.error(error.response?.data?.message || "Failed to load orders");
      }
    } finally {
      setLoading(false);
    }
  };

  // Load orders when authentication state is confirmed
  useEffect(() => {
    if (!isLoading) {
      if (isLoggedin) {
        loadOrderData();
      } else {
        toast.error("Please login to view orders");
        navigate("/login");
      }
    }
  }, [isLoggedin, isLoading]);

  // Loading state while fetching data
  if (isLoading || loading) {
    return (
      <div className="border-t pt-16 min-h-screen">
        <div className="text-2xl mb-8">
          <Title text1={"MY"} text2={"ORDERS"} />
        </div>
        <div className="text-center py-20">
          <p className="text-gray-500 text-lg">Loading your orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="border-t pt-16 min-h-screen">
      {/* Page Title */}
      <div className="text-2xl mb-8">
        <Title text1={"MY"} text2={"ORDERS"} />
      </div>

      {/* Orders List */}
      <div>
        {orderData.length > 0 ? (
          orderData.map((item, index) => (
            <div
              key={`${item._id}-${item.size}-${index}`}
              className="py-6 border-t border-b text-gray-700 flex flex-col md:flex-row md:items-center md:justify-between gap-6 last:border-b-0"
            >
              {/* Product Info */}
              <div className="flex items-start gap-6 text-sm">
                <img
                  src={item.image[0]}
                  className="w-16 sm:w-20 rounded-md object-cover"
                  alt={item.name}
                />
                <div>
                  <p className="sm:text-base font-medium leading-tight">
                    {item.name}
                  </p>
                  <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-gray-700">
                    <p className="font-semibold">
                      {currency}
                      {item.price}
                    </p>
                    <p>• Quantity: {item.quantity}</p>
                    <p>• Size: {item.size}</p>
                  </div>
                  <p className="mt-2 text-sm">
                    Date:{" "}
                    <span className="text-gray-500">
                      {new Date(item.date).toDateString()}
                    </span>
                  </p>
                  <p className="text-sm">
                    Payment:{" "}
                    <span className="text-gray-500">{item.paymentMethod}</span>
                  </p>
                </div>
              </div>

              {/* Status + Track Button */}
              <div className="flex items-center justify-between md:w-1/2 md:justify-end gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-green-600"></div>
                  <p className="text-sm md:text-base font-medium">
                    {item.status}
                  </p>
                </div>
                <button
                  onClick={loadOrderData}
                  disabled={loading}
                  className="border border-gray-300 bg-white px-5 py-2 text-sm font-medium rounded-md hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  {loading ? "Loading..." : "Track Order"}
                </button>
              </div>
            </div>
          ))
        ) : (
          /* Empty State */
          <div className="text-center py-20 text-gray-500">
            <p className="text-xl mb-3">No orders found</p>
            <p className="text-sm mb-6">
              Looks like you haven't placed any orders yet.
            </p>
            <button
              onClick={() => navigate("/collection")}
              className="px-8 py-3 bg-black text-white rounded-md text-sm font-medium hover:bg-gray-900 transition-all hover:scale-105"
            >
              Start Shopping
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Orders;