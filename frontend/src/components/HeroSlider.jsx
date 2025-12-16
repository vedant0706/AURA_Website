import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/pagination";
import { Autoplay, Pagination } from "swiper/modules";
import header_1 from "../assets/all_clothes/top_5.avif";
import header_2 from "../assets/all_clothes/top_6.avif";
import header_3 from "../assets/all_clothes/MT_6.jpg";
import header_4 from "../assets/all_clothes/MT_7.webp";

export default function HeroSlider() {
  return (
    <Swiper
      modules={[Autoplay, Pagination]}
      autoplay={{ delay: 3000, disableOnInteraction: false }} 
      loop={true}
      pagination={{ clickable: true }}
      className="mySwiper"
    >
      {/* Slide 1 */}
      <SwiperSlide>
        <img src={header_1} className="w-full h-130" alt="Latest collection - Slide 1" />
      </SwiperSlide>

      {/* Slide 2 */}
      <SwiperSlide>
        <img src={header_2} className="w-full h-130" alt="Latest collection - Slide 2" />
      </SwiperSlide>

      {/* Slide 3 */}
      <SwiperSlide>
        <img src={header_3} className="w-full h-130" alt="Latest collection - Slide 3" />
      </SwiperSlide>

      {/* Slide 4 */}
      <SwiperSlide>
        <img src={header_4} className="w-full h-130" alt="Latest collection - Slide 4" />
      </SwiperSlide>
    </Swiper>
  );
}