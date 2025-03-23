import Layout from "@/components/Layout";

export default function Help() {
  return (
    <Layout>
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Help & Support</h1>
        
        <div className="space-y-8">
          <section className="bg-zinc-900 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Frequently Asked Questions</h2>
            <div className="space-y-6">
              <div>
                <h3 className="font-medium mb-2">How do I save an article?</h3>
                <p className="text-zinc-400">
                  You can save articles in several ways:
                </p>
                <ul className="list-disc list-inside mt-2 text-zinc-400 space-y-1">
                  <li>Using our browser extension</li>
                  <li>Using our mobile app</li>
                  <li>Emailing articles to your ReadLtr email address</li>
                  <li>Sharing links directly to the ReadLtr app</li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-medium mb-2">Can I read articles offline?</h3>
                <p className="text-zinc-400">
                  Yes! The ReadLtr mobile app automatically downloads your articles so you can read them without an internet connection.
                </p>
              </div>
              
              <div>
                <h3 className="font-medium mb-2">How do I organize my saved articles?</h3>
                <p className="text-zinc-400">
                  You can organize your articles using tags, favorites, and archive functions. Click on the tag icon when viewing an article to add custom tags.
                </p>
              </div>
              
              <div>
                <h3 className="font-medium mb-2">Is my reading data synced across devices?</h3>
                <p className="text-zinc-400">
                  Yes, all your saved articles, reading progress, favorites, and tags are automatically synced across all your devices.
                </p>
              </div>
            </div>
          </section>
          
          <section className="bg-zinc-900 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Contact Support</h2>
            <p className="text-zinc-400 mb-4">
              Need help with something not covered above? Our support team is ready to assist you.
            </p>
            <div className="flex gap-2">
              <button className="px-4 py-2 bg-zinc-800 rounded-md hover:bg-zinc-700 transition-colors">
                Email Support
              </button>
              <button className="px-4 py-2 bg-zinc-800 rounded-md hover:bg-zinc-700 transition-colors">
                Visit Help Center
              </button>
            </div>
          </section>
        </div>
      </div>
    </Layout>
  );
} 