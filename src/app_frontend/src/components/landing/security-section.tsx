import { motion } from "framer-motion";
import { Shield, Lock, Eye, Verified, Globe, Zap } from "lucide-react";

export function SecuritySection() {
  const fadeInUp = {
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 },
  };

  const securityFeatures = [
    {
      icon: Shield,
      title: "Chain-Key Cryptography",
      description: "Revolutionary threshold cryptography eliminates single points of failure"
    },
    {
      icon: Lock,
      title: "Non-Custodial",
      description: "You maintain full control of your assets with cryptographic proof of reserves"
    },
    {
      icon: Eye,
      title: "Transparent Protocol",
      description: "All smart contracts are open source and auditable on the Internet Computer"
    },
    {
      icon: Verified,
      title: "Decentralized Network",
      description: "Powered by a truly decentralized network of nodes across the globe"
    },
    {
      icon: Globe,
      title: "Cross-Chain Security",
      description: "Secure Bitcoin bridging without compromising on decentralization"
    },
    {
      icon: Zap,
      title: "Real-Time Monitoring",
      description: "24/7 network monitoring with instant security alerts and responses"
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
            Security First Approach
          </h2>
          <p className="body-regular text-text-secondary max-w-2xl mx-auto">
            Built on the Internet Computer's revolutionary security model, MegFi provides 
            institutional-grade protection for your Bitcoin assets.
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
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {securityFeatures.map((feature, index) => (
            <motion.div
              key={feature.title}
              variants={fadeInUp}
              className="card-mini group hover:bg-white/[0.08] transition-all duration-300"
            >
              <div className="w-10 h-10 bg-accent-mint/20 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <feature.icon className="w-5 h-5 text-accent-mint" />
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

        {/* Trust indicators */}
        <motion.div 
          variants={fadeInUp}
          className="mt-16 text-center"
        >
          <div className="flex flex-wrap justify-center items-center gap-8 text-text-muted">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-accent-mint" />
              <span className="body-small">Audited Smart Contracts</span>
            </div>
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-accent-mint" />
              <span className="body-small">Non-Custodial Protocol</span>
            </div>
            <div className="flex items-center gap-2">
              <Verified className="w-4 h-4 text-accent-mint" />
              <span className="body-small">Decentralized Network</span>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.section>
  );
}