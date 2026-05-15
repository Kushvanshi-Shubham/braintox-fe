import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Logo } from "../Icons/IconsImport";
import { Button } from "../components/ui/button";




export const LandingNavbar = () => (
  <motion.nav
    initial={{ y: -100, opacity: 0 }}
    animate={{ y: 0, opacity: 1 }}
    transition={{ duration: 0.5, ease: "easeOut" }}
    className="flex justify-between items-center px-6 py-4 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm shadow-md dark:shadow-lg transition-colors duration-300 sticky top-0 z-20"
  >
    <Link to="/" className="flex items-center gap-2 text-2xl font-bold text-gray-900 dark:text-white">
      <Logo className="w-8 h-8 drop-shadow-sm" />
      Braintox
    </Link>
    <div className="flex items-center space-x-2">
      <Link to="/login">
        <Button variant="ghost" text="Login" />
      </Link>
      <Link to="/signup">
        <Button variant="primary" text="Sign Up" />
      </Link>
    </div>
  </motion.nav>
);
