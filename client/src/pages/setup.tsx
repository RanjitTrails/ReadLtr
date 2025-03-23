import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { CodeBlock } from "@/components/ui/code-block";
import { Link } from "wouter";

export default function Setup() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Header />
      
      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Setting Up Your Local Environment</h2>
          
          <div className="mb-8">
            <h3 className="text-xl font-semibold text-slate-900 mb-3">1. Clone the Repository</h3>
            <p className="text-slate-600 mb-4">First, fork the ReadLtr repository to your GitHub account, then clone it to your local machine:</p>
            
            <CodeBlock language="bash">
{`# Fork the repository on GitHub first, then:
git clone https://github.com/YOUR_USERNAME/readltr.git
cd readltr`}
            </CodeBlock>
          </div>
          
          <div className="mb-8">
            <h3 className="text-xl font-semibold text-slate-900 mb-3">2. Review Project Structure</h3>
            <p className="text-slate-600 mb-4">Familiarize yourself with the key directories in the repository:</p>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-300">
                <thead>
                  <tr>
                    <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900">Directory</th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Description</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  <tr>
                    <td className="whitespace-nowrap py-2 pl-4 pr-3 text-sm font-medium text-gray-900 font-mono">/packages/api</td>
                    <td className="px-3 py-2 text-sm text-gray-500">Backend API server code</td>
                  </tr>
                  <tr>
                    <td className="whitespace-nowrap py-2 pl-4 pr-3 text-sm font-medium text-gray-900 font-mono">/packages/web</td>
                    <td className="px-3 py-2 text-sm text-gray-500">Web client application</td>
                  </tr>
                  <tr>
                    <td className="whitespace-nowrap py-2 pl-4 pr-3 text-sm font-medium text-gray-900 font-mono">/docker</td>
                    <td className="px-3 py-2 text-sm text-gray-500">Docker configuration files</td>
                  </tr>
                  <tr>
                    <td className="whitespace-nowrap py-2 pl-4 pr-3 text-sm font-medium text-gray-900 font-mono">/deployment</td>
                    <td className="px-3 py-2 text-sm text-gray-500">Deployment configuration</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          
          <div className="mb-8">
            <h3 className="text-xl font-semibold text-slate-900 mb-3">3. Install Dependencies</h3>
            <p className="text-slate-600 mb-4">Install the required dependencies for development:</p>
            
            <CodeBlock language="bash">
{`# Install dependencies
npm install

# Alternatively, if you use yarn:
yarn install`}
            </CodeBlock>
          </div>
          
          <div className="mb-8">
            <h3 className="text-xl font-semibold text-slate-900 mb-3">4. Set Up Development Environment</h3>
            <p className="text-slate-600 mb-4">Create necessary environment configuration files:</p>
            
            <CodeBlock language="bash">
{`# Create environment files from templates
cp packages/api/.env.example packages/api/.env
cp packages/web/.env.example packages/web/.env`}
            </CodeBlock>
            
            <p className="text-slate-600 mt-4 mb-2">Edit the environment files with your preferred settings. Pay special attention to:</p>
            <ul className="list-disc list-inside text-slate-600 mb-4 space-y-1">
              <li>Database connection settings</li>
              <li>Authentication keys</li>
              <li>Storage configuration</li>
            </ul>
          </div>
          
          <div className="mb-4">
            <h3 className="text-xl font-semibold text-slate-900 mb-3">5. Set Up Docker Environment</h3>
            <p className="text-slate-600 mb-4">For local development, you can use Docker to set up the required services:</p>
            
            <CodeBlock language="bash">
{`# Start the development environment
docker-compose -f docker/docker-compose.dev.yml up -d`}
            </CodeBlock>
            
            <p className="text-slate-600 mt-4">This will start PostgreSQL, Typesense, and other required services in containers.</p>
          </div>
        </div>
        
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-xl font-semibold text-slate-900 mb-4">Required Modifications for Self-Hosting</h3>
          
          <div className="mb-6">
            <h4 className="text-lg font-medium text-slate-900 mb-2">Authentication Changes</h4>
            <p className="text-slate-600 mb-4">
              Based on PR <a href="https://github.com/omnivore-app/omnivore/pull/4465" className="text-primary hover:underline">#4465</a>, 
              you'll need to modify the authentication system to work without depending on the official Omnivore services.
            </p>
            
            <div className="bg-blue-50 border-l-4 border-blue-400 p-4">
              <div className="flex">
                <div className="ml-3">
                  <p className="text-sm text-blue-700">
                    You can implement a local authentication system by modifying the auth handlers in the API package.
                    The PR discussion contains helpful information on how to approach this.
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mb-6">
            <h4 className="text-lg font-medium text-slate-900 mb-2">Storage Configuration</h4>
            <p className="text-slate-600 mb-4">
              You'll need to configure storage for saved articles and media. Options include:
            </p>
            
            <ul className="list-disc list-inside text-slate-600 space-y-2 mb-4">
              <li>Local file system storage</li>
              <li>S3-compatible storage (MinIO, AWS S3, etc.)</li>
              <li>Other object storage services</li>
            </ul>
            
            <CodeBlock language="javascript">
{`// Example storage configuration in .env
STORAGE_TYPE=s3
S3_ENDPOINT=http://minio:9000
S3_ACCESS_KEY=minioadmin
S3_SECRET_KEY=minioadmin
S3_BUCKET_NAME=readltr
S3_REGION=us-east-1`}
            </CodeBlock>
          </div>
          
          <div>
            <h4 className="text-lg font-medium text-slate-900 mb-2">Database Initialization</h4>
            <p className="text-slate-600 mb-4">
              You'll need to initialize the PostgreSQL database with the Omnivore schema:
            </p>
            
            <CodeBlock language="bash">
{`# Apply database migrations
cd packages/api
npm run migrate:up

# Seed initial data (if needed)
npm run db:seed`}
            </CodeBlock>
          </div>
          
          <div className="mt-8 text-center">
            <Link href="/configuration">
              <a className="text-primary hover:underline font-medium">Continue to Configuration Guide →</a>
            </Link>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
