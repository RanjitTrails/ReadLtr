import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { CodeBlock } from "@/components/ui/code-block";
import { Link } from "wouter";

export default function Configuration() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Header />
      
      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Configuration Details</h2>
          
          <div className="mb-8">
            <h3 className="text-xl font-semibold text-slate-900 mb-3">Environment Variables</h3>
            <p className="text-slate-600 mb-4">
              Configure the following environment variables for your self-hosted instance:
            </p>
            
            <h4 className="text-lg font-medium text-slate-900 mt-6 mb-2">API Service Configuration</h4>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-300">
                <thead>
                  <tr>
                    <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900">Variable</th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Description</th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Example</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  <tr>
                    <td className="whitespace-nowrap py-2 pl-4 pr-3 text-sm font-medium text-gray-900 font-mono">DB_HOST</td>
                    <td className="px-3 py-2 text-sm text-gray-500">PostgreSQL database host</td>
                    <td className="px-3 py-2 text-sm font-mono text-gray-500">localhost</td>
                  </tr>
                  <tr>
                    <td className="whitespace-nowrap py-2 pl-4 pr-3 text-sm font-medium text-gray-900 font-mono">DB_PORT</td>
                    <td className="px-3 py-2 text-sm text-gray-500">PostgreSQL database port</td>
                    <td className="px-3 py-2 text-sm font-mono text-gray-500">5432</td>
                  </tr>
                  <tr>
                    <td className="whitespace-nowrap py-2 pl-4 pr-3 text-sm font-medium text-gray-900 font-mono">DB_USER</td>
                    <td className="px-3 py-2 text-sm text-gray-500">Database username</td>
                    <td className="px-3 py-2 text-sm font-mono text-gray-500">postgres</td>
                  </tr>
                  <tr>
                    <td className="whitespace-nowrap py-2 pl-4 pr-3 text-sm font-medium text-gray-900 font-mono">DB_PASS</td>
                    <td className="px-3 py-2 text-sm text-gray-500">Database password</td>
                    <td className="px-3 py-2 text-sm font-mono text-gray-500">postgres</td>
                  </tr>
                  <tr>
                    <td className="whitespace-nowrap py-2 pl-4 pr-3 text-sm font-medium text-gray-900 font-mono">DB_NAME</td>
                    <td className="px-3 py-2 text-sm text-gray-500">Database name</td>
                    <td className="px-3 py-2 text-sm font-mono text-gray-500">omnivore</td>
                  </tr>
                  <tr>
                    <td className="whitespace-nowrap py-2 pl-4 pr-3 text-sm font-medium text-gray-900 font-mono">JWT_SECRET</td>
                    <td className="px-3 py-2 text-sm text-gray-500">Secret for JWT tokens</td>
                    <td className="px-3 py-2 text-sm font-mono text-gray-500">[random string]</td>
                  </tr>
                  <tr>
                    <td className="whitespace-nowrap py-2 pl-4 pr-3 text-sm font-medium text-gray-900 font-mono">TYPESENSE_HOST</td>
                    <td className="px-3 py-2 text-sm text-gray-500">Typesense search server host</td>
                    <td className="px-3 py-2 text-sm font-mono text-gray-500">localhost</td>
                  </tr>
                  <tr>
                    <td className="whitespace-nowrap py-2 pl-4 pr-3 text-sm font-medium text-gray-900 font-mono">TYPESENSE_PORT</td>
                    <td className="px-3 py-2 text-sm text-gray-500">Typesense search server port</td>
                    <td className="px-3 py-2 text-sm font-mono text-gray-500">8108</td>
                  </tr>
                </tbody>
              </table>
            </div>
            
            <h4 className="text-lg font-medium text-slate-900 mt-6 mb-2">Web Client Configuration</h4>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-300">
                <thead>
                  <tr>
                    <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900">Variable</th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Description</th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Example</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  <tr>
                    <td className="whitespace-nowrap py-2 pl-4 pr-3 text-sm font-medium text-gray-900 font-mono">NEXT_PUBLIC_API_URL</td>
                    <td className="px-3 py-2 text-sm text-gray-500">URL for the API service</td>
                    <td className="px-3 py-2 text-sm font-mono text-gray-500">http://localhost:4000</td>
                  </tr>
                  <tr>
                    <td className="whitespace-nowrap py-2 pl-4 pr-3 text-sm font-medium text-gray-900 font-mono">NEXT_PUBLIC_APP_URL</td>
                    <td className="px-3 py-2 text-sm text-gray-500">URL for the web application</td>
                    <td className="px-3 py-2 text-sm font-mono text-gray-500">http://localhost:3000</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          
          <div className="mb-8">
            <h3 className="text-xl font-semibold text-slate-900 mb-3">Authentication Configuration</h3>
            <p className="text-slate-600 mb-4">
              You'll need to implement a local authentication system for your self-hosted instance. Based on PR 
              <a href="https://github.com/omnivore-app/omnivore/pull/4465" className="text-primary hover:underline mx-1">#4465</a>, 
              you can modify the authentication code to use a simple email/password system.
            </p>
            
            <CodeBlock language="javascript">
{`// Example local auth implementation in packages/api/src/auth/handlers.ts
export const localRegister = async (req: Request, res: Response) => {
  try {
    const { email, password, name } = req.body;
    
    // Validate inputs
    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    // Check if user exists
    const existingUser = await getUserByEmail(email);
    if (existingUser) {
      return res.status(409).json({ error: 'User already exists' });
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create user
    const user = await createUser({
      email,
      password: hashedPassword,
      name,
    });
    
    // Generate JWT
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
      expiresIn: '7d',
    });
    
    return res.status(201).json({ token, user });
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};`}
            </CodeBlock>
          </div>
          
          <div>
            <h3 className="text-xl font-semibold text-slate-900 mb-3">Web Extension Setup</h3>
            <p className="text-slate-600 mb-4">
              To use the browser extension with your self-hosted instance, you'll need to modify the extension configuration:
            </p>
            
            <ol className="list-decimal list-inside text-slate-600 space-y-2">
              <li>Clone the extension repository if it's separate from the main codebase</li>
              <li>Update API endpoints in the extension code to point to your self-hosted instance</li>
              <li>Build the extension for your browser</li>
              <li>Load the extension in developer mode or package it for distribution</li>
            </ol>
          </div>
          
          <div className="mt-8 text-center">
            <Link href="/deployment">
              <a className="text-primary hover:underline font-medium">Continue to Deployment Guide →</a>
            </Link>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
