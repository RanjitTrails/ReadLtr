import { useState, useEffect } from "react";
import { useAuth } from "@/lib/api";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, getQueryFn } from "@/lib/queryClient";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CodeBlock } from "@/components/ui/code-block";
import { Chrome as ChromeIcon, Smartphone as SmartphoneIcon, ClipboardCopy as ClipboardCopyIcon, Check as CheckIcon } from "lucide-react";
import { SiApple, SiAndroid, SiFirefox, SiGoogle } from "react-icons/si";
import { toast } from "@/hooks/use-toast";

export default function Integrations() {
  const { user, isAuthenticated } = useAuth();
  const [copied, setCopied] = useState(false);
  
  // Fetch API key
  const { data: apiKeyData, isLoading, refetch } = useQuery({
    queryKey: ['/api/auth/api-key'],
    queryFn: getQueryFn<{ apiKey: string }>({ on401: "throw" }),
    enabled: isAuthenticated
  });
  
  // Generate new API key
  const { mutate: generateApiKey, isPending } = useMutation({
    mutationFn: async () => {
      return apiRequest('/api/auth/api-key', { 
        method: 'POST' 
      });
    },
    onSuccess: () => {
      refetch();
      toast({
        title: "New API Key Generated",
        description: "Your new API key is ready to use."
      });
    }
  });
  
  // Copy to clipboard
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    
    setTimeout(() => {
      setCopied(false);
    }, 2000);
    
    toast({
      title: "Copied!",
      description: "API key copied to clipboard"
    });
  };
  
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50">
        <Header />
        <main className="flex-grow flex items-center justify-center">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Authentication Required</CardTitle>
              <CardDescription>Please log in to view integrations.</CardDescription>
            </CardHeader>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Header />
      
      <main className="flex-grow py-8">
        <div className="max-w-4xl mx-auto px-4">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Integrations</h1>
          <p className="text-slate-600 mb-6">Connect ReadLtr with your browser and mobile devices.</p>
          
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center">
                <span className="mr-2">Your API Key</span>
              </CardTitle>
              <CardDescription>
                Use this key to authenticate your browser extensions and mobile apps.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-slate-100 p-3 rounded-md flex items-center justify-between">
                <code className="text-sm font-mono text-slate-700 overflow-x-auto">
                  {isLoading ? "Loading..." : (apiKeyData?.apiKey || "No API key available")}
                </code>
                <Button 
                  variant="ghost" 
                  size="sm"
                  disabled={!apiKeyData?.apiKey || copied}
                  onClick={() => copyToClipboard(apiKeyData?.apiKey)}
                >
                  {copied ? <CheckIcon className="h-4 w-4" /> : <ClipboardCopyIcon className="h-4 w-4" />}
                </Button>
              </div>
            </CardContent>
            <CardFooter>
              <Button
                onClick={() => generateApiKey()}
                disabled={isPending}
              >
                {isPending ? "Generating..." : "Generate New API Key"}
              </Button>
              <p className="text-xs text-slate-500 mt-2">
                Note: Generating a new key will invalidate any previously issued keys.
              </p>
            </CardFooter>
          </Card>
          
          <Tabs defaultValue="browser">
            <TabsList className="mb-6">
              <TabsTrigger value="browser">Browser Extensions</TabsTrigger>
              <TabsTrigger value="mobile">Mobile Apps</TabsTrigger>
            </TabsList>
            
            <TabsContent value="browser">
              <div className="grid md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <SiGoogle className="h-5 w-5 mr-2 text-primary" />
                      Chrome Extension
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="mb-4">Install our Chrome extension to save articles directly from your browser.</p>
                    <ol className="list-decimal list-inside space-y-2 mb-6">
                      <li>Download the extension from the Chrome Web Store</li>
                      <li>Click on the ReadLtr icon in your browser</li>
                      <li>Paste your API Key to connect your account</li>
                      <li>Right-click on any page or use the extension button to save articles</li>
                    </ol>
                    <Button disabled className="w-full">Coming Soon</Button>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <SiFirefox className="h-5 w-5 mr-2 text-primary" />
                      Firefox Extension
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="mb-4">Install our Firefox extension to save articles directly from your browser.</p>
                    <ol className="list-decimal list-inside space-y-2 mb-6">
                      <li>Download the extension from Firefox Add-ons</li>
                      <li>Click on the ReadLtr icon in your browser</li>
                      <li>Paste your API Key to connect your account</li>
                      <li>Right-click on any page or use the extension button to save articles</li>
                    </ol>
                    <Button disabled className="w-full">Coming Soon</Button>
                  </CardContent>
                </Card>
                
                <Card className="md:col-span-2">
                  <CardHeader>
                    <CardTitle>API Integration</CardTitle>
                    <CardDescription>
                      For developers who want to build their own integration
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="mb-4">Use our API to save articles programmatically:</p>
                    <CodeBlock language="javascript">
{`// Example: Save an article via API
fetch('${window.location.origin}/api/extension/save', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_API_KEY'
  },
  body: JSON.stringify({
    url: 'https://example.com/article',
    title: 'Article Title',
    description: 'Article description',
    content: 'Full article content',
    siteName: 'Example.com',
    siteIcon: 'https://example.com/favicon.ico'
  })
})`}
                    </CodeBlock>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            <TabsContent value="mobile">
              <div className="grid md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <SiApple className="h-5 w-5 mr-2 text-primary" />
                      iOS App
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="mb-4">Read and save articles on your iPhone or iPad.</p>
                    <ol className="list-decimal list-inside space-y-2 mb-6">
                      <li>Download ReadLtr from the App Store</li>
                      <li>Open the app and go to Settings</li>
                      <li>Enter your API Key to connect your account</li>
                      <li>Share links from Safari or other apps to ReadLtr</li>
                    </ol>
                    <Button disabled className="w-full">Coming Soon</Button>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <SiAndroid className="h-5 w-5 mr-2 text-primary" />
                      Android App
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="mb-4">Read and save articles on your Android device.</p>
                    <ol className="list-decimal list-inside space-y-2 mb-6">
                      <li>Download ReadLtr from Google Play</li>
                      <li>Open the app and go to Settings</li>
                      <li>Enter your API Key to connect your account</li>
                      <li>Share links from Chrome or other apps to ReadLtr</li>
                    </ol>
                    <Button disabled className="w-full">Coming Soon</Button>
                  </CardContent>
                </Card>
                
                <Card className="md:col-span-2">
                  <CardHeader>
                    <CardTitle>Save Articles from Anywhere</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="mb-4">
                      All your saved articles are synchronized across all your devices. Save on your phone and read later on your computer, or vice versa.
                    </p>
                    <div className="flex justify-center">
                      <div className="relative">
                        <div className="bg-blue-50 rounded-xl p-6 border border-blue-100">
                          <div className="flex items-center space-x-8">
                            <div className="text-center">
                              <SmartphoneIcon className="h-16 w-16 text-primary mx-auto mb-2" />
                              <p className="text-sm font-medium">Mobile</p>
                            </div>
                            <div className="text-center">
                              <svg className="w-16 h-8 text-blue-400 mx-auto" viewBox="0 0 24 24" fill="none">
                                <path d="M4 12H20M20 12L14 6M20 12L14 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              </svg>
                            </div>
                            <div className="text-center">
                              <ChromeIcon className="h-16 w-16 text-primary mx-auto mb-2" />
                              <p className="text-sm font-medium">Browser</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}