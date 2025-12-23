import React from "react";
import { motion } from "framer-motion";
import { THEME } from "../../data/theme";

const ModalShell = ({ children, onClose, mode = "bottom" }) => {
  const backdrop = { background: "rgba(0,0,0,0.75)" };

  if (mode === "center") {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[80] flex items-center justify-center p-4"
        style={backdrop}
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.96, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.96, opacity: 0 }}
          transition={{ type: "spring", damping: 24 }}
          className="w-full max-w-md rounded-3xl p-5"
          style={{ background: THEME.bg.secondary }}
          onClick={(e) => e.stopPropagation()}
        >
          {children}
        </motion.div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[80] flex items-end"
      style={backdrop}
      onClick={onClose}
    >
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 28 }}
        className="w-full max-h-[92vh] overflow-y-auto rounded-t-3xl p-6"
        style={{ background: THEME.bg.secondary }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-12 h-1 rounded-full mx-auto mb-5" style={{ background: "rgba(255,255,255,0.2)" }} />
        {children}
      </motion.div>
    </motion.div>
  );
};

export default ModalShell;
