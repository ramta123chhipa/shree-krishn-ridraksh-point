import { useParams } from 'react-router-dom';
import ProductListing from '../components/product/ProductListing';

export default function Category() {
  const { slug } = useParams();
  return <ProductListing title="Category" fixedCategory={slug} />;
}
