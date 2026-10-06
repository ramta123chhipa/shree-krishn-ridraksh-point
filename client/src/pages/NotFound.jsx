import Button from '../components/common/Button';

export default function NotFound() {
  return (
    <div className="container-page py-24 text-center">
      <h1 className="text-5xl font-bold">Page not found</h1>
      <p className="mt-4 text-ink/70">The page you are looking for does not exist or has moved.</p>
      <Button to="/" className="mt-8">Back to home</Button>
    </div>
  );
}
