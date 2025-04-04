import { useState } from "react";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { WifiOff, User, Bell, Palette, Shield } from "lucide-react";
import OfflineSettings from "./settings/offline";

export default function Settings() {
  const [activeTab, setActiveTab] = useState("account");

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Settings</h1>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-zinc-900 border border-zinc-800">
            <TabsTrigger value="account" className="data-[state=active]:bg-zinc-800">
              <User className="h-4 w-4 mr-2" />
              Account
            </TabsTrigger>
            <TabsTrigger value="appearance" className="data-[state=active]:bg-zinc-800">
              <Palette className="h-4 w-4 mr-2" />
              Appearance
            </TabsTrigger>
            <TabsTrigger value="notifications" className="data-[state=active]:bg-zinc-800">
              <Bell className="h-4 w-4 mr-2" />
              Notifications
            </TabsTrigger>
            <TabsTrigger value="offline" className="data-[state=active]:bg-zinc-800">
              <WifiOff className="h-4 w-4 mr-2" />
              Offline
            </TabsTrigger>
            <TabsTrigger value="privacy" className="data-[state=active]:bg-zinc-800">
              <Shield className="h-4 w-4 mr-2" />
              Privacy
            </TabsTrigger>
          </TabsList>

          <TabsContent value="account" className="space-y-6">
            <div className="bg-zinc-900 p-6 rounded-lg border border-zinc-800">
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
            </div>

            <div className="bg-zinc-900 p-6 rounded-lg border border-zinc-800">
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
            </div>

            <div className="bg-zinc-900 p-6 rounded-lg border border-zinc-800">
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
            </div>

            <div className="bg-zinc-900 p-6 rounded-lg border border-zinc-800">
              <h2 className="text-xl font-semibold mb-4">Export Data</h2>
              <p className="text-zinc-400 mb-4">Export all your saved articles and tags as a backup or for use in another service.</p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">Export as JSON</Button>
                <Button variant="outline" size="sm">Export as CSV</Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="appearance" className="space-y-6">
            <div className="bg-zinc-900 p-6 rounded-lg border border-zinc-800">
              <h2 className="text-xl font-semibold mb-4">Appearance</h2>
              <p className="text-zinc-400">Appearance settings coming soon.</p>
            </div>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-6">
            <div className="bg-zinc-900 p-6 rounded-lg border border-zinc-800">
              <h2 className="text-xl font-semibold mb-4">Notifications</h2>
              <p className="text-zinc-400">Notification settings coming soon.</p>
            </div>
          </TabsContent>

          <TabsContent value="offline" className="space-y-6">
            <OfflineSettings />
          </TabsContent>

          <TabsContent value="privacy" className="space-y-6">
            <div className="bg-zinc-900 p-6 rounded-lg border border-zinc-800">
              <h2 className="text-xl font-semibold mb-4">Privacy</h2>
              <p className="text-zinc-400">Privacy settings coming soon.</p>
            </div>

            <div className="bg-zinc-900 p-6 rounded-lg border border-zinc-800">
              <h2 className="text-xl font-semibold mb-4 text-red-500">Danger Zone</h2>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-zinc-400 mb-2">Delete your account and all your data</p>
                  <Button variant="destructive">Delete Account</Button>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}