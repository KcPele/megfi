import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Github, Twitter, MessageCircle, Globe, Shield, Zap } from "lucide-react";

export function Footer() {
  const fadeInUp = {
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 },
  };

  const currentYear = new Date().getFullYear();

  return (
    <motion.footer 
      initial="initial"
      whileInView="animate"
      viewport={{ once: true }}
      className="relative py-16 mt-20"
    >
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-bg-secondary/50 to-transparent" />
      
      <div className="relative max-w-6xl mx-auto px-6">
        <motion.div variants={fadeInUp} className="grid grid-cols-1 lg:grid-cols-4 gap-8 mb-12">
          {/* Brand section */}
          <div className="lg:col-span-1">
            <h3 className="heading-medium text-text-primary mb-4">MegFi</h3>
            <p className="body-small text-text-secondary mb-6 leading-relaxed">
              Unlocking Bitcoin's DeFi potential on the Internet Computer with 
              institutional-grade security and decentralized innovation.
            </p>
            
            {/* Social links */}
            <div className="flex gap-4">
              <a 
                href="#" 
                className="w-10 h-10 bg-white/5 rounded-lg flex items-center justify-center hover:bg-white/10 transition-colors"
                aria-label="GitHub"
              >
                <Github className="w-5 h-5 text-text-secondary" />
              </a>
              <a 
                href="#" 
                className="w-10 h-10 bg-white/5 rounded-lg flex items-center justify-center hover:bg-white/10 transition-colors"
                aria-label="Twitter"
              >
                <Twitter className="w-5 h-5 text-text-secondary" />
              </a>
              <a 
                href="#" 
                className="w-10 h-10 bg-white/5 rounded-lg flex items-center justify-center hover:bg-white/10 transition-colors"
                aria-label="Discord"
              >
                <MessageCircle className="w-5 h-5 text-text-secondary" />
              </a>
            </div>
          </div>

          {/* Product links */}
          <div>
            <h4 className="heading-small text-text-primary mb-4">Product</h4>
            <div className="space-y-3">
              <Link to="/deposit" className="block body-small text-text-secondary hover:text-accent-mint transition-colors">
                Deposit Bitcoin
              </Link>
              <Link to="/borrow" className="block body-small text-text-secondary hover:text-accent-mint transition-colors">
                Borrow USDC
              </Link>
              <Link to="/home" className="block body-small text-text-secondary hover:text-accent-mint transition-colors">
                Dashboard
              </Link>
              <Link to="/account" className="block body-small text-text-secondary hover:text-accent-mint transition-colors">
                Portfolio
              </Link>
            </div>
          </div>

          {/* Resources links */}
          <div>
            <h4 className="heading-small text-text-primary mb-4">Resources</h4>
            <div className="space-y-3">
              <a href="#" className="block body-small text-text-secondary hover:text-accent-mint transition-colors">
                Documentation
              </a>
              <a href="#" className="block body-small text-text-secondary hover:text-accent-mint transition-colors">
                API Reference
              </a>
              <a href="#" className="block body-small text-text-secondary hover:text-accent-mint transition-colors">
                Security Audit
              </a>
              <a href="#" className="block body-small text-text-secondary hover:text-accent-mint transition-colors">
                Bug Bounty
              </a>
            </div>
          </div>

          {/* Company links */}
          <div>
            <h4 className="heading-small text-text-primary mb-4">Company</h4>
            <div className="space-y-3">
              <a href="#" className="block body-small text-text-secondary hover:text-accent-mint transition-colors">
                About
              </a>
              <a href="#" className="block body-small text-text-secondary hover:text-accent-mint transition-colors">
                Blog
              </a>
              <a href="#" className="block body-small text-text-secondary hover:text-accent-mint transition-colors">
                Careers
              </a>
              <a href="#" className="block body-small text-text-secondary hover:text-accent-mint transition-colors">
                Contact
              </a>
            </div>
          </div>
        </motion.div>

        {/* Trust indicators */}
        <motion.div 
          variants={fadeInUp}
          className="flex flex-wrap justify-center items-center gap-8 py-6 mb-8 border-t border-white/[0.05]"
        >
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-accent-mint" />
            <span className="body-tiny text-text-muted">Audited Smart Contracts</span>
          </div>
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-accent-mint" />
            <span className="body-tiny text-text-muted">Decentralized Protocol</span>
          </div>
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-accent-mint" />
            <span className="body-tiny text-text-muted">Internet Computer Network</span>
          </div>
        </motion.div>

        {/* Bottom section */}
        <motion.div 
          variants={fadeInUp}
          className="flex flex-col md:flex-row justify-between items-center gap-4 pt-6 border-t border-white/[0.05]"
        >
          <p className="body-tiny text-text-muted">
            © {currentYear} MegFi. Built on the Internet Computer.
          </p>
          
          <div className="flex gap-6">
            <a href="#" className="body-tiny text-text-muted hover:text-accent-mint transition-colors">
              Terms of Service
            </a>
            <a href="#" className="body-tiny text-text-muted hover:text-accent-mint transition-colors">
              Privacy Policy
            </a>
            <a href="#" className="body-tiny text-text-muted hover:text-accent-mint transition-colors">
              Disclaimer
            </a>
          </div>
        </motion.div>
      </div>
    </motion.footer>
  );
}