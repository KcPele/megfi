import { motion } from "framer-motion";
import { Bitcoin, DollarSign, Shield, Zap, TrendingUp, Globe, Lock, Users } from "lucide-react";

export function FeaturesSection() {
  const fadeInUp = {
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 },
  };

  const features = [
    {
      icon: Bitcoin,
      title: "Bitcoin Bridging",
      description: "Seamlessly convert Bitcoin to chain-key Bitcoin (ckBTC) with cryptographic proof of reserves",
      color: "accent-yellow"
    },
    {
      icon: DollarSign,
      title: "Collateralized Lending",
      description: "Use your ckBTC as collateral to borrow ckUSDC with competitive rates and flexible terms",
      color: "accent-teal"
    },
    {
      icon: Shield,
      title: "Chain-Key Security",
      description: "Powered by Internet Computer's revolutionary chain-key cryptography for maximum security",
      color: "accent-mint"
    },
    {
      icon: Zap,
      title: "Instant Transactions",
      description: "Execute transactions in seconds with minimal fees on the Internet Computer network",
      color: "accent-pink"
    },
    {
      icon: TrendingUp,
      title: "Optimized Returns",
      description: "Access yield opportunities while maintaining exposure to Bitcoin's price appreciation",
      color: "accent-teal"
    },
    {
      icon: Globe,
      title: "Global Access",
      description: "Available worldwide with no geographic restrictions or KYC requirements",
      color: "accent-mint"
    }
  ];

  return (
    <motion.section 
      initial="initial"
      whileInView="animate"
      viewport={{ once: true, margin: "-100px" }}
      className="py-20"
    >
      <div className="max-w-6xl mx-auto px-6">
        <motion.div variants={fadeInUp} className="text-center mb-16">
          <h2 className="heading-large text-text-primary mb-4">
            Why Choose MegFi?
          </h2>
          <p className="body-regular text-text-secondary max-w-2xl mx-auto">
            Built on cutting-edge technology to provide the safest and most efficient 
            Bitcoin DeFi experience on the Internet Computer.
          </p>
        </motion.div>

        <motion.div 
          variants={{
            animate: {
              transition: {
                staggerChildren: 0.1,
              },
            },
          }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              variants={fadeInUp}
              className="card-container group hover:shadow-[0_12px_48px_rgba(0,0,0,0.5)] transition-all duration-300"
            >
              <div className={`w-12 h-12 bg-${feature.color}/20 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                <feature.icon className={`w-6 h-6 text-${feature.color}`} />
              </div>
              
              <h3 className="heading-small text-text-primary mb-2">
                {feature.title}
              </h3>
              
              <p className="body-small text-text-secondary leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </motion.section>
  );
}