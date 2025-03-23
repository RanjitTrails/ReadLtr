import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Link } from "wouter";

export default function FAQ() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Header />
      
      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Frequently Asked Questions</h2>
          
          <div className="space-y-6">
            {/* Question 1 */}
            <div className="border-b border-gray-200 pb-6">
              <h3 className="text-lg font-medium text-slate-900 mb-2">Why is Omnivore shutting down?</h3>
              <div className="text-slate-600">
                <p>
                  According to the <a href="https://blog.omnivore.app/p/details-on-omnivore-shutting-down" className="text-primary hover:underline">official announcement</a>, 
                  the Omnivore team has decided to shut down the service on June 1, 2024. The team cited financial sustainability 
                  challenges as the primary reason.
                </p>
              </div>
            </div>
            
            {/* Question 2 */}
            <div className="border-b border-gray-200 pb-6">
              <h3 className="text-lg font-medium text-slate-900 mb-2">Will my data from the official service be available?</h3>
              <div className="text-slate-600">
                <p>
                  Omnivore has provided an export feature for users to download their data before the shutdown. 
                  You can import this data into your self-hosted instance, but you'll need to implement an import tool 
                  that can parse the export format and insert the data into your database.
                </p>
              </div>
            </div>
            
            {/* Question 3 */}
            <div className="border-b border-gray-200 pb-6">
              <h3 className="text-lg font-medium text-slate-900 mb-2">Can I use the mobile apps with my self-hosted instance?</h3>
              <div className="text-slate-600">
                <p>
                  The mobile apps are designed to work with the official Omnivore API. You would need to modify the mobile app 
                  source code to point to your self-hosted API and then build and distribute the app yourself. This is more 
                  complex than setting up the web version.
                </p>
              </div>
            </div>
            
            {/* Question 4 */}
            <div className="border-b border-gray-200 pb-6">
              <h3 className="text-lg font-medium text-slate-900 mb-2">What are the resource requirements for self-hosting?</h3>
              <div className="text-slate-600">
                <p>
                  For personal use or a small group, a VPS with:
                </p>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>2-4 CPU cores</li>
                  <li>4-8 GB RAM</li>
                  <li>50+ GB storage</li>
                  <li>Monthly bandwidth depends on usage (likely 100+ GB)</li>
                </ul>
              </div>
            </div>
            
            {/* Question 5 */}
            <div className="border-b border-gray-200 pb-6">
              <h3 className="text-lg font-medium text-slate-900 mb-2">How do I keep my self-hosted instance updated?</h3>
              <div className="text-slate-600">
                <p>
                  Since you're forking the repository, you'll want to:
                </p>
                <ol className="list-decimal list-inside mt-2 space-y-1">
                  <li>Set up the original Omnivore repository as an upstream remote</li>
                  <li>Periodically fetch updates from upstream</li>
                  <li>Merge changes into your fork</li>
                  <li>Rebuild and deploy your instance with the latest code</li>
                </ol>
                <p className="mt-2">
                  Keep in mind that if you've made custom modifications, you may need to resolve merge conflicts.
                </p>
              </div>
            </div>
            
            {/* Question 6 */}
            <div>
              <h3 className="text-lg font-medium text-slate-900 mb-2">How can I contribute to the Omnivore project?</h3>
              <div className="text-slate-600">
                <p>
                  Since Omnivore is open-source, you can contribute by:
                </p>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>Reporting bugs or issues on GitHub</li>
                  <li>Submitting pull requests with fixes or enhancements</li>
                  <li>Improving documentation</li>
                  <li>Sharing your self-hosted setup with the community</li>
                </ul>
                <p className="mt-2">
                  This helps ensure the project remains viable for self-hosting even after the official service shuts down.
                </p>
              </div>
            </div>
          </div>
          
          <div className="mt-8 text-center">
            <Link href="/library">
              <a className="text-primary hover:underline font-medium">Go to Your Library →</a>
            </Link>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
