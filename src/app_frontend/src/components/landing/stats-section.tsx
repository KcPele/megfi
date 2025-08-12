import { motion } from "framer-motion";
import { TrendingUp, DollarSign, Users, Activity } from "lucide-react";

export function StatsSection() {
  const fadeInUp = {
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 },
  };

  const stats = [
    {
      icon: DollarSign,
      value: "$2.4M",
      label: "Total Value Locked",
      change: "+15.2%",
      isPositive: true
    },
    {
      icon: TrendingUp,
      value: "4.5%",
      label: "Average APY",
      change: "Variable",
      isPositive: null
    },
    {
      icon: Users,
      value: "1,250+",
      label: "Active Users",
      change: "+8.7%",
      isPositive: true
    },
    {
      icon: Activity,
      value: "$120K",
      label: "24h Volume",
      change: "+23.1%",
      isPositive: true
    }
  ];

  return (
    <motion.section 
      initial="initial"
      whileInView="animate"
      viewport={{ once: true, margin: "-100px" }}
      className="py-16"
    >
      <div className="max-w-6xl mx-auto px-6">
        <motion.div variants={fadeInUp} className="card-container">
          <div className="text-center mb-8">
            <h2 className="heading-medium text-text-primary mb-2">
              Platform Statistics
            </h2>
            <p className="body-small text-text-secondary">
              Real-time metrics from the MegFi ecosystem
            </p>
          </div>

          <motion.div 
            variants={{
              animate: {
                transition: {
                  staggerChildren: 0.1,
                },
              },
            }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
          >
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                variants={fadeInUp}
                className="text-center"
              >
                <div className="w-12 h-12 bg-accent-mint/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <stat.icon className="w-6 h-6 text-accent-mint" />
                </div>
                
                <div className="heading-large text-text-primary mb-1">
                  {stat.value}
                </div>
                
                <div className="body-small text-text-muted mb-2">
                  {stat.label}
                </div>
                
                <div className={`body-tiny px-2 py-1 rounded-lg ${
                  stat.isPositive === true 
                    ? 'text-semantic-positive bg-semantic-positive/10' 
                    : stat.isPositive === false 
                    ? 'text-semantic-negative bg-semantic-negative/10'
                    : 'text-text-secondary bg-white/5'
                }`}>
                  {stat.change}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </motion.section>
  );
}