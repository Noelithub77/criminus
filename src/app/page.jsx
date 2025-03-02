"use client";
import dynamic from 'next/dynamic';
import Loading from './loading';
import "./App.css";

// Dynamically import the AppContent component with ssr disabled
const DynamicApp = dynamic(() => import('./AppContent'), {
  ssr: false,
  loading: () => <Loading />
});

// Export the dynamic component
export default function App() {
  return <DynamicApp />;
}
