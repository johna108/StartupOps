"use client";
import React, { useRef } from "react";
import { useScroll, useTransform, useSpring, motion } from "framer-motion";

export const ContainerScroll = ({ titleComponent, children }) => {
  const containerRef = useRef(null);
  // Use the global viewport scroll so the animation begins on the first page scroll
  const { scrollYProgress } = useScroll();
  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => {
      window.removeEventListener("resize", checkMobile);
    };
  }, []);

  const scaleDimensions = () => {
    return isMobile ? [0.7, 0.9] : [1.05, 1];
  };

  // Trigger the main part of the animation early (on first small page scroll)
  const sd = scaleDimensions();

  // Add more intermediate keyframes so the animation has more "frames"
  const rotateRaw = useTransform(
    scrollYProgress,
    [0, 0.01, 0.05, 0.2, 1],
    [20, 12, 6, 2, 0]
  );

  const scaleRaw = useTransform(
    scrollYProgress,
    [0, 0.01, 0.05, 0.2, 1],
    [sd[0], sd[0] + (sd[1] - sd[0]) * 0.5, sd[1], 1.02, 1]
  );

  const translateRaw = useTransform(
    scrollYProgress,
    [0, 0.01, 0.05, 0.2, 1],
    [0, -30, -60, -90, -100]
  );

  // Smooth the raw transforms with springs for higher-frame, natural motion
  const springConfig = { stiffness: 200, damping: 30 };
  const rotate = useSpring(rotateRaw, springConfig);
  const scale = useSpring(scaleRaw, springConfig);
  const translate = useSpring(translateRaw, springConfig);

  return (
    <div
      className="h-[30rem] md:h-[50rem] flex items-center justify-center relative p-2 md:p-4 pt-0"
      ref={containerRef}
    >
      <div
        className="w-full relative"
        style={{
          perspective: "1000px",
        }}
      >
        <Header translate={translate} titleComponent={titleComponent} />
        <Card rotate={rotate} translate={translate} scale={scale}>
          {children}
        </Card>
      </div>
    </div>
  );
};

export const Header = ({ translate, titleComponent }) => {
  return (
    <motion.div
      style={{
        translateY: translate,
      }}
      className="div max-w-5xl mx-auto text-center"
    >
      {titleComponent}
    </motion.div>
  );
};

export const Card = ({ rotate, scale, children }) => {
  return (
    <motion.div
      style={{
        rotateX: rotate,
        scale,
        boxShadow:
          "0 0 #0000004d, 0 9px 20px #0000004a, 0 37px 37px #00000042, 0 84px 50px #00000026, 0 149px 60px #0000000a, 0 233px 65px #00000003",
      }}
      className="max-w-5xl -mt-8 mx-auto h-[28rem] md:h-[38rem] w-full border-4 border-[#6C6C6C] p-2 md:p-6 bg-[#222222] rounded-[30px] shadow-2xl"
    >
      <div className="h-full w-full overflow-hidden rounded-2xl bg-zinc-900 md:rounded-2xl md:p-4">
        {children}
      </div>
    </motion.div>
  );
};
