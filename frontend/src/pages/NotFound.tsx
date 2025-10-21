export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-lg w-full text-center">
        <h1 className="text-9xl font-bold text-blue-600">404</h1>
        <p className="mt-4 text-xl text-gray-600">Page not found</p>
        <p className="mt-2 text-gray-500">
          Sorry, we couldn't find the page you're looking for.
        </p>
        <div className="mt-6">
          <a
            href="/"
            className="text-base font-medium text-blue-600 hover:text-blue-500"
          >
            Go back home<span aria-hidden="true"> →</span>
          </a>
        </div>
      </div>
    </div>
  );
}
