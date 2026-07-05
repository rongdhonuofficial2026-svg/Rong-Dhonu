'use client'

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

export interface FormStep {
  id: string
  title: string
  description?: string
  isValid: boolean
  content: React.ReactNode
}

interface MultiStepFormProps {
  steps: FormStep[]
  onComplete: () => void
  isSubmitting?: boolean
  className?: string
}

export function MultiStepForm({ steps, onComplete, isSubmitting, className }: MultiStepFormProps) {
  const [currentStep, setCurrentStep] = React.useState(0)
  const isLastStep = currentStep === steps.length - 1

  const handleNext = () => {
    if (currentStep < steps.length - 1) setCurrentStep((prev) => prev + 1)
  }
  const handlePrev = () => {
    if (currentStep > 0) setCurrentStep((prev) => prev - 1)
  }

  return (
    <div className={cn("w-full max-w-3xl mx-auto", className)}>
      {/* Progress Header */}
      <div className="mb-8">
        <div className="flex justify-between items-end mb-2">
          <div>
            <h3 className="text-2xl font-serif font-bold text-foreground">{steps[currentStep].title}</h3>
            <p className="text-muted-foreground text-sm">{steps[currentStep].description}</p>
          </div>
          <span className="text-sm font-medium text-accent">
            Step {currentStep + 1} of {steps.length}
          </span>
        </div>
        
        {/* Progress Bar */}
        <div className="w-full bg-muted rounded-full h-2">
          <motion.div 
            className="bg-accent h-2 rounded-full"
            initial={{ width: `${((currentStep) / steps.length) * 100}%` }}
            animate={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      {/* Step Content */}
      <div className="min-h-[300px] relative overflow-hidden bg-card border border-border p-6 rounded-xl shadow-sm">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            {steps[currentStep].content}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Footer Navigation */}
      <div className="flex items-center justify-between mt-8">
        <Button 
          variant="outline" 
          onClick={handlePrev} 
          disabled={currentStep === 0 || isSubmitting}
        >
          Previous
        </Button>
        <Button 
          onClick={isLastStep ? onComplete : handleNext}
          disabled={!steps[currentStep].isValid || isSubmitting}
        >
          {isSubmitting ? "Submitting..." : isLastStep ? "Submit" : "Next Step"}
        </Button>
      </div>
    </div>
  )
}
