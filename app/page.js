'use client';

import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function PHackingDemo() {
  // States for the application
  const [step, setStep] = useState(0);
  const [datasets, setDatasets] = useState([]);
  const [selectedDataset, setSelectedDataset] = useState(null);
  const [pValue, setPValue] = useState(null);
  const [trialCount, setTrialCount] = useState(0);
  const [significantFindings, setSignificantFindings] = useState(0);
  const [showRealityCheck, setShowRealityCheck] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);

  // Generate random datasets where there is no real effect
  const generateDatasets = (numDatasets = 20, sampleSize = 30) => {
    const newDatasets = [];
    for (let i = 0; i < numDatasets; i++) {
      const groupA = Array.from({ length: sampleSize }, () => Math.random() * 100);
      const groupB = Array.from({ length: sampleSize }, () => Math.random() * 100);
      
      const meanA = groupA.reduce((a, b) => a + b, 0) / sampleSize;
      const meanB = groupB.reduce((a, b) => a + b, 0) / sampleSize;
      
      // Calculate p-value using t-test approximation
      const varA = groupA.reduce((a, b) => a + Math.pow(b - meanA, 2), 0) / (sampleSize - 1);
      const varB = groupB.reduce((a, b) => a + Math.pow(b - meanB, 2), 0) / (sampleSize - 1);
      
      const pooledVar = ((sampleSize - 1) * varA + (sampleSize - 1) * varB) / (2 * sampleSize - 2);
      const se = Math.sqrt(pooledVar * (1/sampleSize + 1/sampleSize));
      const t = Math.abs((meanA - meanB) / se);
      
      // Approximate p-value using a simplified approach
      // This is not a real p-value calculation but works for demonstration
      const df = 2 * sampleSize - 2;
      const pValue = 2 * (1 - Math.min(1, Math.exp(-0.3 * t * Math.sqrt(df/2))));
      
      newDatasets.push({
        id: i,
        groupA,
        groupB,
        meanA,
        meanB,
        pValue,
        significant: pValue < 0.05,
        chartData: [
          { name: 'Group A', value: meanA },
          { name: 'Group B', value: meanB }
        ]
      });
    }
    return newDatasets;
  };

  // Initialize datasets
  useEffect(() => {
    setDatasets(generateDatasets());
  }, []);

  // Run multiple trials to demonstrate p-hacking
  const runMultipleTrials = () => {
    setIsRunning(true);
    setTrialCount(0);
    setSignificantFindings(0);
    
    let count = 0;
    let significant = 0;
    
    const interval = setInterval(() => {
      count++;
      setTrialCount(count);
      
      // Select a random dataset
      const randomIndex = Math.floor(Math.random() * datasets.length);
      const dataset = datasets[randomIndex];
      setSelectedDataset(dataset);
      setPValue(dataset.pValue.toFixed(4));
      
      if (dataset.significant) {
        significant++;
        setSignificantFindings(significant);
      }
      
      if (count >= 20) {
        clearInterval(interval);
        setIsRunning(false);
        setTimeout(() => {
          setShowRealityCheck(true);
        }, 1000);
      }
    }, 300);
  };

  // Reset the demonstration
  const resetDemo = () => {
    setStep(0);
    setSelectedDataset(null);
    setPValue(null);
    setTrialCount(0);
    setSignificantFindings(0);
    setShowRealityCheck(false);
    setDatasets(generateDatasets());
    setShowExplanation(false);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto bg-white rounded-lg shadow-lg">
      <h1 className="text-3xl font-bold mb-6 text-blue-800">P-Value Hunting: An Interactive Demonstration</h1>
      
      {step === 0 && (
        <div className="space-y-6">
          <p className="text-lg">
            Welcome to this interactive demonstration about statistical significance and p-values.
          </p>
          <p>
            Imagine you&apos;re a researcher testing if a new supplement improves test scores.
            You randomly assign participants to either take the supplement (Group A) or a placebo (Group B).
          </p>
          <p className="font-medium">
            The scientific standard is to consider a result &quot;statistically significant&quot; if the p-value is less than 0.05
            (meaning there&apos;s less than a 5% chance the observed difference happened by random chance).
          </p>
          <button 
            onClick={() => setStep(1)} 
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Start the Experiment
          </button>
        </div>
      )}
      
      {step === 1 && (
        <div className="space-y-6">
          <p className="text-lg font-medium">
            Let&apos;s run our experiment to see if our supplement works!
          </p>
          <p>
            Press the button below to analyze the data from our experiment. 
            If you get a p-value less than 0.05, you can publish your finding! If not, don&apos;t worry...
            you can always try a different approach to the analysis.
          </p>
          
          {!isRunning && !showRealityCheck && (
            <button 
              onClick={runMultipleTrials} 
              className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
            >
              Run Analysis
            </button>
          )}
          
          {(isRunning || showRealityCheck) && (
            <div className="space-y-4 p-4 border rounded-md">
              <p className="font-medium">{isRunning ? "Analysis in progress..." : "Final Analysis Results"}</p>
              <p>Trials run: {trialCount}</p>
              <p>Significant findings (p &lt; 0.05): {significantFindings}</p>
              
              {selectedDataset && (
                <div className="mt-4">
                  <p className="font-medium">Current analysis:</p>
                  <p className={pValue < 0.05 ? "text-green-600 font-bold" : "text-red-600"}>
                    p-value = {pValue} {pValue < 0.05 ? "(Significant!)" : "(Not significant)"}
                  </p>
                  
                  <div className="h-64 mt-4">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={selectedDataset.chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis label={{ value: 'Score', angle: -90, position: 'insideLeft' }} />
                        <Tooltip />
                        <Bar dataKey="value" fill={pValue < 0.05 ? "#10B981" : "#6B7280"} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}
            </div>
          )}
          
          {showRealityCheck && (
            <div className="space-y-6 p-6 border-2 border-red-500 rounded-md bg-red-50">
              <h2 className="text-2xl font-bold text-red-600">The Rug Pull: Here&apos;s What Actually Happened</h2>
              <p className="font-medium">
                Congratulations! You found {significantFindings} &quot;statistically significant&quot; results out of {trialCount} trials.
              </p>
              <p>
                <span className="font-bold">But here&apos;s the truth:</span> All of the data was completely random. There was NO real difference between the groups.
              </p>
              <p>
                This is p-hacking in action. By running multiple analyses and only reporting the ones that show statistical significance, 
                you can &quot;find&quot; effects that don&apos;t really exist.
              </p>
              <p>
                In this demonstration, approximately 5% of the trials showed &quot;significant&quot; results purely by chance - 
                exactly what the p &lt; 0.05 threshold predicts for random data!
              </p>
              
              <div className="flex space-x-4">
                <button 
                  onClick={() => setShowExplanation(true)} 
                  className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  Learn More About P-Hacking
                </button>
                <button 
                  onClick={resetDemo} 
                  className="px-6 py-2 border border-gray-300 rounded-md hover:bg-gray-100 transition-colors"
                >
                  Try Again
                </button>
              </div>
            </div>
          )}
          
          {showExplanation && (
            <div className="mt-8 p-6 border rounded-md bg-blue-50">
              <h2 className="text-2xl font-bold mb-4 text-blue-800">The Severity of P-Hacking</h2>
              
              <p className="mb-3">
                <span className="font-bold">What is p-hacking?</span> P-hacking refers to manipulating data analysis to find patterns that appear statistically significant, 
                even when no real effect exists.
              </p>
              
              <p className="mb-3">
                <span className="font-bold">Common p-hacking techniques include:</span>
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>Collecting data until you get a significant result (&quot;optional stopping&quot;)</li>
                <li>Analyzing many different variables but only reporting the significant ones</li>
                <li>Trying multiple statistical tests and only reporting those that &quot;work&quot;</li>
                <li>Excluding &quot;outliers&quot; that contradict your hypothesis</li>
                <li>Slicing data in different ways until you find significance</li>
              </ul>
              
              <p className="mb-3">
                <span className="font-bold">Why is this dangerous?</span> P-hacking undermines scientific integrity by:
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>Creating a scientific literature filled with false positive results</li>
                <li>Leading to failed replications and wasted research resources</li>
                <li>Potentially informing harmful policies or medical interventions</li>
                <li>Eroding public trust in science</li>
              </ul>
              
              <p className="mb-3">
                <span className="font-bold">Solutions include:</span>
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>Pre-registration of study designs and analysis plans</li>
                <li>Publishing null results</li>
                <li>Requiring replication before accepting results</li>
                <li>Using stricter statistical thresholds</li>
                <li>Focusing on effect sizes rather than just p-values</li>
              </ul>
              
              <p>
                This demonstration shows why a single p-value below 0.05 should never be treated as definitive proof. 
                With enough attempts, you&apos;ll eventually find &quot;significance&quot; in completely random data.
              </p>
              
              <button 
                onClick={resetDemo} 
                className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Reset Demonstration
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}