import { motion } from "framer-motion";
import { ArrowRight, Wallet, ArrowLeftRight, DollarSign, PieChart } from "lucide-react";

export function HowItWorksSection() {
  const fadeInUp = {
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 },
  };

  const steps = [
    {
      step: "01",
      icon: Wallet,
      title: "Connect Wallet",
      description: "Authenticate securely using Internet Identity for seamless access to your Bitcoin holdings",
      color: "accent-mint"
    },
    {
      step: "02", 
      icon: ArrowLeftRight,
      title: "Bridge Bitcoin",
      description: "Convert your Bitcoin to ckBTC using ICP's chain-key technology with cryptographic proof of reserves",
      color: "accent-yellow"
    },
    {
      step: "03",
      icon: DollarSign,
      title: "Borrow & Earn",
      description: "Use ckBTC as collateral to borrow ckUSDC or participate in yield strategies to maximize returns",
      color: "accent-teal"
    },
    {
      step: "04",
      icon: PieChart,
      title: "Manage Portfolio",
      description: "Monitor your positions, track performance, and optimize your Bitcoin DeFi strategy in real-time",
      color: "accent-pink"
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
            How It Works
          </h2>
          <p className="body-regular text-text-secondary max-w-2xl mx-auto">
            Get started with Bitcoin DeFi in four simple steps. Our intuitive interface 
            makes it easy to bridge, borrow, and earn with your Bitcoin.
          </p>
        </motion.div>

        <motion.div 
          variants={{
            animate: {
              transition: {
                staggerChildren: 0.2,
              },
            },
          }}
          className="space-y-8 lg:space-y-0 lg:grid lg:grid-cols-2 lg:gap-8"
        >
          {steps.map((step, index) => (
            <motion.div
              key={step.step}
              variants={fadeInUp}
              className="relative"
            >
              <div className="card-container flex items-start gap-6 group hover:shadow-[0_12px_48px_rgba(0,0,0,0.5)] transition-all duration-300">
                {/* Step indicator */}
                <div className="flex-shrink-0">
                  <div className="text-text-muted body-tiny font-bold mb-2">
                    STEP {step.step}
                  </div>
                  <div className={`w-12 h-12 bg-${step.color}/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform`}>
                    <step.icon className={`w-6 h-6 text-${step.color}`} />
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1">
                  <h3 className="heading-small text-text-primary mb-3">
                    {step.title}
                  </h3>
                  <p className="body-small text-text-secondary leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>

              {/* Connection arrow for desktop */}
              {index < steps.length - 1 && index % 2 === 0 && (
                <div className="hidden lg:block absolute top-1/2 -right-4 transform -translate-y-1/2 z-10">
                  <ArrowRight className="w-6 h-6 text-accent-mint" />
                </div>
              )}
            </motion.div>
          ))}
        </motion.div>
      </div>
    </motion.section>
  );
}