import Seo from '../components/common/Seo';
import HeroSection from '../components/home/HeroSection';
import Banners from '../components/home/Banners';
import CategorySection from '../components/home/CategorySection';
import FeaturedProducts from '../components/home/FeaturedProducts';
import OffersSection from '../components/home/OffersSection';
import WhyChooseUs from '../components/home/WhyChooseUs';
import Testimonials from '../components/home/Testimonials';
import FaqSection from '../components/home/FaqSection';
import Newsletter from '../components/home/Newsletter';

export default function Home() {
  return (
    <>
      <Seo description="Buy authentic Rudraksh, gemstones (ratna), malas and spiritual products from Shree Krishna Rudraksh Point." />
      <HeroSection />
      <Banners />
      <CategorySection />
      <FeaturedProducts title="Featured" params={{ featured: 'true' }} />
      <FeaturedProducts title="Best sellers" params={{ bestSeller: 'true' }} viewAllTo="/shop?sort=popularity" />
      <OffersSection />
      <FeaturedProducts title="New arrivals" params={{ sort: 'newest' }} viewAllTo="/shop?sort=newest" />
      <WhyChooseUs />
      <Testimonials />
      <FaqSection />
      <Newsletter />
    </>
  );
}
