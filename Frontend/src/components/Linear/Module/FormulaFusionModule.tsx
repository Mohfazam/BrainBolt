// src/components/FormulaFusionModule.tsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Sigma, Zap, BookOpen, PlayCircle, ChevronRight } from 'lucide-react';
import { ModuleData } from '../Data/moduleData';

interface FormulaFusionModuleProps {
  module: ModuleData;
}

const FormulaFusionModule: React.FC<FormulaFusionModuleProps> = ({ module }) => {
  const [selectedDerivation, setSelectedDerivation] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const [showApplications, setShowApplications] = useState(false);

  const derivations = module.content.derivations;
  const derivation = derivations[selectedDerivation];

  return (
    <div className="p-6 bg-gray-900 min-h-screen">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Derivation List */}
        <div className="lg:col-span-1">
          <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Sigma size={20} className="text-purple-400" />
            Derivations
          </h3>
          <div className="space-y-3">
            {/* @ts-ignore */}
            {derivations.map((deriv, index) => (
              <motion.div
                key={deriv.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`p-4 rounded-lg cursor-pointer transition-all ${
                  selectedDerivation === index
                    ? 'bg-purple-600/20 border-2 border-purple-500'
                    : 'bg-gray-700/30 hover:bg-gray-600/40 border border-gray-600'
                }`}
                onClick={() => {
                  setSelectedDerivation(index);
                  setCurrentStep(0);
                  setShowApplications(false);
                }}
              >
                <h4 className="font-bold text-white text-sm mb-2">{deriv.title}</h4>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <div
                          key={i}
                          className={`w-2 h-2 rounded-full mr-1 ${
                            i < deriv.complexity ? 'bg-orange-500' : 'bg-gray-600'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-xs text-gray-400">Complexity</span>
                  </div>
                  <span className="text-xs text-gray-400">{deriv.timeRequired}min</span>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Equation Database */}
          <div className="mt-6">
            <h4 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
              <BookOpen size={16} className="text-blue-400" />
              Quick Reference
            </h4>
            {/* @ts-ignore */}
            {module.content.equationDatabase.map((category, index) => (
              <div key={index} className="mb-4 bg-gray-800/30 p-3 rounded-lg">
                <h5 className="font-medium text-gray-300 mb-2">{category.name}</h5>
            {/* @ts-ignore */}
                {category.equations.map((eq, eqIndex) => (
                  <div key={eqIndex} className="bg-gray-900/50 p-2 rounded mb-1 font-mono text-sm text-gray-400">
                    {eq}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Derivation Details */}
        <div className="lg:col-span-2">
          <div className="bg-gray-800/50 rounded-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h4 className="text-2xl font-bold text-white">{derivation.title}</h4>
              <div className="flex items-center gap-2">
                <Zap size={16} className="text-yellow-400" />
                <span className="text-yellow-400 font-medium">Complexity: {derivation.complexity}/5</span>
              </div>
            </div>

            {/* Step-by-Step Derivation */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <h5 className="text-lg font-bold text-white">Step-by-Step Derivation</h5>
                <div className="flex gap-2">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setCurrentStep(0)}
                    className="px-3 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded text-sm"
                  >
                    Reset
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setCurrentStep(derivation.steps.length - 1)}
                    className="px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded text-sm"
                  >
                    Show All
                  </motion.button>
                </div>
              </div>

              <div className="space-y-4">
            {/* @ts-ignore */}
                {derivation.steps.map((step, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ 
                      opacity: index <= currentStep ? 1 : 0.2,
                      y: 0,
                      scale: index === currentStep ? 1.02 : 1
                    }}
                    transition={{ delay: index * 0.1 }}
                    className={`p-6 rounded-lg border-l-4 ${
                      index <= currentStep
                        ? index === currentStep
                          ? 'bg-purple-900/30 border-purple-500 shadow-lg'
                          : 'bg-gray-800/50 border-green-500'
                        : 'bg-gray-800/20 border-gray-600'
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                        index <= currentStep ? 'bg-purple-600 text-white' : 'bg-gray-600 text-gray-400'
                      }`}>
                        {step.step}
                      </div>
                      <div className="flex-1">
                        <div className="bg-gray-900/70 p-4 rounded-lg mb-3 font-mono text-gray-300 border border-gray-700">
                          {step.equation}
                        </div>
                        <p className="text-gray-300">{step.explanation}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className="flex justify-center mt-6">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setCurrentStep(Math.min(currentStep + 1, derivation.steps.length - 1))}
                  disabled={currentStep >= derivation.steps.length - 1}
                  className="px-6 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:opacity-50 text-white rounded-lg font-medium flex items-center gap-2"
                >
                  {currentStep >= derivation.steps.length - 1 ? 'Complete!' : 'Next Step'}
                  {currentStep < derivation.steps.length - 1 && <ChevronRight size={16} />}
                </motion.button>
              </div>
            </div>

            {/* Applications */}
            <div className="mt-6">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowApplications(!showApplications)}
                className="flex items-center gap-2 text-lg font-bold text-white mb-4"
              >
                <PlayCircle size={20} className="text-green-400" />
                Applications
                <ChevronRight 
                  size={16} 
                  className={`transform transition-transform ${showApplications ? 'rotate-90' : ''}`} 
                />
              </motion.button>

              {showApplications && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="grid grid-cols-1 md:grid-cols-2 gap-4"
                >
            {/* @ts-ignore */}
                  {derivation.applications.map((app, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-green-900/20 border border-green-700/30 p-4 rounded-lg"
                    >
                      <p className="text-green-300">{app}</p>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Category Statistics */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* @ts-ignore */}

        {module.content.categories.map((category, index) => (
          <div key={index} className="bg-gray-800/30 p-4 rounded-lg">
            <h5 className="font-bold text-white">{category.name}</h5>
            <p className="text-gray-400 text-sm">{category.derivationCount} derivations</p>
            <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
              <div 
                className="bg-purple-500 h-2 rounded-full" 
                style={{ width: `${(category.derivationCount / 20) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FormulaFusionModule;