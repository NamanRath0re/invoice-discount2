'use client';

import ComponentBuilder from '@/components/ComponentBuilder';
import { useState } from 'react';

export default function Home() {
  const [formId] = useState<number>(1);
  const [stepKey] = useState<string>('business_details');
  return <ComponentBuilder formId={formId} stepKey={stepKey} />;
}