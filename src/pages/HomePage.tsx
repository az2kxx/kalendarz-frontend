import { Link } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { TrendingUp, Zap, ShieldCheck, Quote } from 'lucide-react';
import { motion } from 'framer-motion';

const sectionVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" as const }
  },
};

export const HomePage = () => {
  return (
    <div className="bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-grow pt-16">
        <section className="bg-white dark:bg-gray-900">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div 
              className="py-28 md:py-40 text-center"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <h1 className="text-4xl sm:text-5xl md:text-7xl font-extrabold text-gray-900 dark:text-white leading-tight tracking-tighter">
                Przestań tracić czas na maile.
                <br />
                <span className="text-indigo-500">Zacznij zamykać deale.</span>
              </h1>
              <p className="mt-6 max-w-2xl mx-auto text-lg md:text-xl text-gray-600 dark:text-gray-300">
                CalX to inteligentny kalendarz dla nowoczesnych zespołów sprzedaży. Udostępnij go jednym linkiem i pozwól, aby Twoje leady same rezerwowały spotkania.
              </p>
              <div className="mt-10">
                <Link
                  to="/register"
                  className="inline-block px-8 py-4 text-lg font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-500 shadow-lg transform hover:scale-105 transition-all duration-300"
                >
                  Zwiększ swoją sprzedaż z CalX
                </Link>
              </div>
            </motion.div>
          </div>
        </section>

        <motion.section 
          className="py-24 bg-gray-50 dark:bg-gray-800"
          variants={sectionVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
        >
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">Zaprojektowane dla Zwycięzców</h2>
              <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">Narzędzie, które pracuje tak ciężko, jak Ty.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-12">
              <div className="text-center">
                <div className="flex items-center justify-center h-16 w-16 mx-auto bg-indigo-100 dark:bg-indigo-900/50 rounded-full mb-5">
                  <TrendingUp className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Więcej spotkań, mniej wysiłku</h3>
                <p className="mt-2 text-gray-600 dark:text-gray-400">
                  Umieść link CalX w swojej stopce mailowej lub kampanii i patrz, jak Twój kalendarz sam się zapełnia. Koniec z ping-pongiem mailowym.
                </p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center h-16 w-16 mx-auto bg-indigo-100 dark:bg-indigo-900/50 rounded-full mb-5">
                  <Zap className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Skróć cykl sprzedaży</h3>
                <p className="mt-2 text-gray-600 dark:text-gray-400">
                  Umożliwiaj rezerwację spotkania natychmiast, gdy lead jest "gorący". Zmniejsz tarcie i szybciej przechodź do etapu demo lub oferty.
                </p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center h-16 w-16 mx-auto bg-indigo-100 dark:bg-indigo-900/50 rounded-full mb-5">
                  <ShieldCheck className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Profesjonalny wizerunek</h3>
                <p className="mt-2 text-gray-600 dark:text-gray-400">
                  Pokaż, że szanujesz czas swoich klientów. Prosty i elegancki proces rezerwacji z CalX buduje zaufanie od pierwszego kontaktu.
                </p>
              </div>
            </div>
          </div>
        </motion.section>

        <motion.section 
          className="py-24 bg-white dark:bg-gray-900"
          variants={sectionVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
        >
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto text-center">
              <Quote className="h-12 w-12 mx-auto text-gray-400 dark:text-gray-600" />
              <blockquote className="mt-6">
                <p className="text-2xl font-medium text-gray-900 dark:text-white">
                  "Od kiedy nasz zespół sprzedaży wdrożył CalX, liczba umówionych spotkań demo wzrosła o 40%. To absolutny game-changer w naszym procesie."
                </p>
              </blockquote>
              <footer className="mt-6">
                <p className="text-base font-semibold text-indigo-600 dark:text-indigo-400">Anna Kowalska</p>
                <p className="text-base text-gray-600 dark:text-gray-400">Senior Account Executive, TechSolutions Inc.</p>
              </footer>
            </div>
          </div>
        </motion.section>

        <motion.section 
          className="bg-gray-800"
          variants={sectionVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
        >
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-indigo-600 rounded-lg shadow-xl -mx-4 -mb-12 p-12 md:p-16 text-center">
              <h2 className="text-3xl md:text-4xl font-extrabold text-white">Gotowy, by zdominować swój pipeline?</h2>
              <p className="mt-4 text-lg text-indigo-200 max-w-2xl mx-auto">
                Dołącz do setek sprzedawców, którzy już zautomatyzowali swoje umawianie spotkań i zyskali przewagę nad konkurencją dzięki CalX.
              </p>
              <div className="mt-8">
                <Link to="/register" className="inline-block px-10 py-4 text-lg font-bold text-indigo-600 bg-white rounded-lg hover:bg-gray-100 shadow-lg transform hover:scale-105 transition-all duration-300">
                  Zacznij wygrywać więcej
                </Link>
              </div>
            </div>
          </div>
        </motion.section>
      </main>

      <Footer />
    </div>
  );
};