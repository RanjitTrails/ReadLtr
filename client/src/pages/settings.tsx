import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";

export default function Settings() {
  return (
    <Layout>
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Settings</h1>
        
        <div className="space-y-8">
          <section className="bg-zinc-900 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Account</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-zinc-400 mb-1">Email</label>
                <input 
                  type="email" 
                  className="w-full p-2 bg-zinc-800 border border-zinc-700 rounded-md"
                  value="user@example.com"
                  readOnly
                />
              </div>
              <div>
                <label className="block text-sm text-zinc-400 mb-1">Password</label>
                <Button variant="outline" size="sm">Change Password</Button>
              </div>
            </div>
          </section>
          
          <section className="bg-zinc-900 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Reading Preferences</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-zinc-400 mb-1">Default Font Size</label>
                <select className="w-full p-2 bg-zinc-800 border border-zinc-700 rounded-md">
                  <option>Small</option>
                  <option selected>Medium</option>
                  <option>Large</option>
                  <option>Extra Large</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-zinc-400 mb-1">Theme</label>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="bg-zinc-800">Dark</Button>
                  <Button variant="outline" size="sm">Light</Button>
                  <Button variant="outline" size="sm">System</Button>
                </div>
              </div>
            </div>
          </section>
          
          <section className="bg-zinc-900 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Connected Services</h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-medium">Browser Extension</h3>
                  <p className="text-sm text-zinc-400">Save articles directly from your browser</p>
                </div>
                <Button variant="outline" size="sm">Install</Button>
              </div>
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-medium">Mobile App</h3>
                  <p className="text-sm text-zinc-400">Access your reading list on the go</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">iOS</Button>
                  <Button variant="outline" size="sm">Android</Button>
                </div>
              </div>
            </div>
          </section>
          
          <section className="bg-zinc-900 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Export Data</h2>
            <p className="text-zinc-400 mb-4">Export all your saved articles and tags as a backup or for use in another service.</p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">Export as JSON</Button>
              <Button variant="outline" size="sm">Export as CSV</Button>
            </div>
          </section>
        </div>
      </div>
    </Layout>
  );
} 