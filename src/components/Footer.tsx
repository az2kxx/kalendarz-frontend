export const Footer = () => {
    return (
      <footer className="bg-white dark:bg-gray-800 mt-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-8 text-center text-sm text-gray-500 dark:text-gray-400 border-t border-gray-200 dark:border-gray-700">
            <p className="font-semibold text-gray-700 dark:text-gray-300">CalX © {new Date().getFullYear()}</p>
            <p className="mt-1">Inteligentne rezerwacje dla profesjonalistów sprzedaży.</p>
          </div>
        </div>
      </footer>
    );
  };