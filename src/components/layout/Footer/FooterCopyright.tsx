const FooterCopyright = () => (
  <div className="bg-primary-900 py-4">
    <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center">
      <p className="text-sm text-gray-400 mb-3 md:mb-0">
        &copy; {new Date().getFullYear()} China Square. All rights reserved.
      </p>
    </div>
  </div>
);

export default FooterCopyright;