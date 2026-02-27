"use client";

import { buttonVariants } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Check, Star } from "lucide-react";
import { useState, useRef } from "react";
import confetti from "canvas-confetti";

export function Pricing({
  plans,
  title = "Simple, Transparent Pricing",
  description = "Choose the plan that works for you\nAll plans include access to our platform, lead generation tools, and dedicated support.",
  onSelectPlan,
  isLoading = false,
  billingPeriod = "monthly",
  onTogglePeriod = () => {},
}) {
  const [isMonthly, setIsMonthly] = useState(true);
  const switchRef = useRef(null);

  const handleToggle = (checked) => {
    setIsMonthly(!checked);
    onTogglePeriod(!checked ? "annual" : "monthly");
    
    if (checked && switchRef.current) {
      const rect = switchRef.current.getBoundingClientRect();
      const x = rect.left + rect.width / 2;
      const y = rect.top + rect.height / 2;

      confetti({
        particleCount: 50,
        spread: 60,
        origin: {
          x: x / window.innerWidth,
          y: y / window.innerHeight,
        },
        colors: [
          "hsl(var(--primary))",
          "hsl(var(--accent))",
          "hsl(var(--secondary))",
          "hsl(var(--muted))",
        ],
        ticks: 200,
        gravity: 1.2,
        decay: 0.94,
        startVelocity: 30,
        shapes: ["circle"],
      });
    }
  };

  return (
    <div className="w-full">
      <div className="text-center space-y-2.5 mb-7">
        <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
          {title}
        </h2>
        <p className="text-muted-foreground text-sm md:text-base">
          {description}
        </p>
      </div>

      <div className="flex justify-center mb-7">
        <label className="relative inline-flex items-center cursor-pointer">
          <Label className="mr-2 text-xs">Monthly</Label>
          <Switch
            ref={switchRef}
            checked={!isMonthly}
            onCheckedChange={handleToggle}
            className="relative"
          />
          <Label className="ml-2 text-xs">
            Annual <span className="text-primary text-xs">(Save 20%)</span>
          </Label>
        </label>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-6xl mx-auto">
        {plans.map((plan, index) => (
          <motion.div
            key={index}
            initial={{ y: 50, opacity: 1 }}
            whileInView={{
              y: 0,
              opacity: 1,
              scale: 1.0,
            }}
            viewport={{ once: true }}
            transition={{
              duration: 0.8,
              type: "spring",
              stiffness: 100,
              damping: 30,
              delay: 0.1 * index,
            }}
            className={cn(
              "rounded-xl border-[1px] p-3.5 md:p-5 bg-background text-center flex flex-col justify-center relative transition-all duration-300 h-full",
              plan.isPopular ? "border-primary border-2 shadow-lg shadow-primary/10 md:scale-105" : "border-border"
            )}
          >
            {plan.isPopular && (
              <div className="absolute top-0 right-0 bg-primary py-0.5 px-1.5 rounded-bl-lg rounded-tr-lg flex items-center">
                <Star className="text-primary-foreground h-2.5 w-2.5 fill-current" />
                <span className="text-primary-foreground ml-0.5 font-sans font-semibold text-xs">
                  Popular
                </span>
              </div>
            )}
            <div className="flex-1 flex flex-col">
              <p className="text-sm md:text-sm font-semibold text-muted-foreground mt-1">
                {plan.name}
              </p>
              <div className="mt-3 flex items-center justify-center gap-x-1.5">
                <span className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">
                  ${isMonthly ? plan.price : plan.yearlyPrice}
                </span>
                {plan.period !== "one-time" && (
                  <span className="text-xs font-semibold leading-4 text-muted-foreground">
                    /{plan.period}
                  </span>
                )}
              </div>

              <p className="text-xs leading-3 text-muted-foreground mt-1">
                {isMonthly ? "billed monthly" : "billed annually"}
              </p>

              <ul className="mt-3 gap-1.5 flex flex-col">
                {plan.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-1.5">
                    <Check className="h-3 w-3 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-left text-xs leading-3">{feature}</span>
                  </li>
                ))}
              </ul>

              <hr className="w-full my-2.5" />

              <button
                onClick={() => onSelectPlan?.(plan)}
                disabled={isLoading}
                className={cn(
                  buttonVariants({
                    variant: "outline",
                  }),
                  "group relative w-full gap-1.5 overflow-hidden text-xs md:text-sm font-semibold tracking-tighter mt-auto h-8 md:h-9",
                  "transform-gpu ring-offset-current transition-all duration-300 ease-out hover:ring-2 hover:ring-primary hover:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed",
                  plan.isPopular
                    ? "bg-primary text-primary-foreground hover:bg-primary/90"
                    : "bg-background text-foreground hover:bg-primary hover:text-primary-foreground"
                )}
              >
                {plan.buttonText}
              </button>
              <p className="mt-2 text-xs leading-3 text-muted-foreground">
                {plan.description}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
