import Link from 'next/link';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-4xl font-bold mb-8">Criminus Platform</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Link href="/dispatch" className="group">
          <div className="p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-all border border-gray-200">
            <h2 className="text-xl font-semibold mb-2 group-hover:text-blue-600">AI Dispatch Call System</h2>
            <p className="text-gray-600">
              A proof-of-concept emergency dispatch system powered by AI with voice interaction.
            </p>
          </div>
        </Link>
        
        <Link href="/spam" className="group">
          <div className="p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-all border border-gray-200">
            <h2 className="text-xl font-semibold mb-2 group-hover:text-blue-600">SMS Spam Detector</h2>
            <p className="text-gray-600">
              Analyze SMS messages to detect spam and potential threats.
            </p>
          </div>
        </Link>
        
        {/* Add more links to other sections as needed */}
      </div>
    </main>
  );
}
