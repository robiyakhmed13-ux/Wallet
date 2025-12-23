import React from "react";
import { motion } from "framer-motion";
import { THEME } from "../../data/theme";

const GlassCard = ({ children, className = "", onClick, style = {}, gradient }) => (
  <motion.div
    whileHover={onClick ? { scale: 1.01, y: -2 } : {}}
    whileTap={onClick ? { scale: 0.99 } : {}}
    onClick={onClick}
    className={`relative overflow-hidden rounded-2xl border border-white/5 ${onClick ? "cursor-pointer" : ""} ${className}`}
    style={{ background: gradient || THEME.bg.card, ...style }}
  >
    {children}
  </motion.div>
);

export default GlassCard;
