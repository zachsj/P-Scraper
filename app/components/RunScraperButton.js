"use client"

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

// Import the ProgressBar component from react-bootstrap correctly
import ProgressBar from 'react-bootstrap/ProgressBar';


const RunScraperButton = () => {
  const router = useRouter();
  const [progress, setProgress] = useState(0);
  const [isScraping, setIsScraping] = useState(false);


  const handleClick = async () => {
    setIsScraping(true);
    setProgress(0);
    //router.refresh();
    router.push(`/?runScraperButton=${true}`);
    setTimeout(() => {
      router.push(`/`);
    }, 20000);
    setTimeout(() => {
      location.reload();
    }, 21000);
  };

  // Simulating progress update
  // Replace this with your actual scraping logic that updates the progress
  const simulateProgressUpdate = () => {
    const interval = setInterval(() => {
      setProgress((prevProgress) => {
        const newProgress = prevProgress + 5;
        if (newProgress >= 100) {
         // setTimeout(() => {
          clearInterval(interval);
          setIsScraping(false);
        }
        //, 10000);  // 10 second delay
      //}
        return newProgress;
      });
    }, 1000);
  };

  useEffect(() => {
    if (isScraping) {
      simulateProgressUpdate();
    }
  }, [isScraping]);

  return (
    <div>
      <div>
        <button onClick={handleClick} className="bg-blue-500 text-white rounded-lg py-1 px-2">
          Run Scraper for:
          <p style={{ marginTop: '5px' }}>https://books.toscrape.com</p>
        </button>
      </div>
      {isScraping && (
        <div className="mt-3">
          <ProgressBar animated now={progress} label={`${progress}%`} />
        </div>
      )}
    </div>
  );
};

export default RunScraperButton;