"use client"

//import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';


const CloudinaryButton = ({ excelUrl }) => {
  return (
    <Link legacyBehavior href={excelUrl}>
      <a className="bg-red-500 text-white rounded-lg py-2 px-3" style={{ position: 'fixed', top: '250px', left: '710px' }}>
        Download Excel File
      </a>
    </Link>
  );
};

export default CloudinaryButton;