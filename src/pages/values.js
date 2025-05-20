import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Values from '../components/pages_not_pages/Values';

export async function getStaticProps() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

  try {
    const res = await fetch(`${baseUrl}/data/articles/values.json`);
    if (!res.ok) throw new Error(`Failed to fetch: ${res.status} ${res.statusText}`);

    const valuesArticles = await res.json();
    return { props: { valuesArticles } };
  } catch (error) {
    console.error('Error fetching valuesArticles:', error);
    return { props: { valuesArticles: [] } };
  }
}

