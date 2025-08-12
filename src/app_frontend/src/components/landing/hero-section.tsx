import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, Shield, Zap, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";

export function HeroSection() {
  const fadeInUp = {
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 },
  };

  const stagger = {
    animate: {
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  return (
    <motion.section 
      initial="initial"
      animate="animate"
      variants={stagger}
      className="relative py-20 md:py-32 text-center"
    >
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-accent-mint/5 via-transparent to-accent-teal/5 rounded-3xl" />
      
      <div className="relative max-w-4xl mx-auto px-6">
        <motion.h1 
          variants={fadeInUp}
          className="heading-xl text-text-primary mb-6"
        >
          Unlock Bitcoin's
          <span className="text-accent-mint"> DeFi Potential</span>
        </motion.h1>
        
        <motion.p 
          variants={fadeInUp}
          className="body-regular text-text-secondary max-w-2xl mx-auto mb-8"
        >
          Bridge your Bitcoin to the Internet Computer and access institutional-grade 
          DeFi opportunities with chain-key technology. No compromises on security or decentralization.
        </motion.p>

        <motion.div 
          variants={fadeInUp}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12"
        >
          <Link to="/deposit">
            <Button className="bg-accent-mint text-text-inverse hover:bg-accent-mint/90 px-8 py-3 rounded-xl font-semibold">
              Get Started
              <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </Link>
          
          <Link to="/account">
            <Button variant="outline" className="border-white/20 text-text-primary hover:bg-white/5 px-8 py-3 rounded-xl">
              View Portfolio
            </Button>
          </Link>
        </motion.div>

        {/* Feature highlights */}
        <motion.div 
          variants={fadeInUp}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto"
        >
          <div className="flex items-center gap-3 justify-center md:justify-start">
            <Shield className="w-5 h-5 text-accent-mint" />
            <span className="body-small text-text-secondary">Bank-Grade Security</span>
          </div>
          
          <div className="flex items-center gap-3 justify-center">
            <Zap className="w-5 h-5 text-accent-yellow" />
            <span className="body-small text-text-secondary">Instant Bridging</span>
          </div>
          
          <div className="flex items-center gap-3 justify-center md:justify-end">
            <TrendingUp className="w-5 h-5 text-accent-teal" />
            <span className="body-small text-text-secondary">Optimized Returns</span>
          </div>
        </motion.div>
      </div>
    </motion.section>
  );
}