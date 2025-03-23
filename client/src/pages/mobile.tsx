import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { AppleIcon, Smartphone, Download, ArrowRight } from 'lucide-react';

const MobileAppPage = () => {
  const content = (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold mb-4">ReadLtr Mobile Apps</h1>
        <p className="text-zinc-400 max-w-2xl mx-auto">
          Take your reading list anywhere with our mobile apps for iOS and Android. 
          Sync seamlessly across all your devices, read offline, and manage your 
          reading list on the go.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 mb-12">
        {/* iOS App */}
        <div className="bg-zinc-900 rounded-lg overflow-hidden">
          <div className="bg-gradient-to-br from-zinc-800 to-zinc-900 p-6">
            <div className="p-3 bg-black rounded-xl inline-flex mb-4">
              <AppleIcon size={28} />
            </div>
            <h2 className="text-xl font-semibold mb-2">ReadLtr for iOS</h2>
            <p className="text-zinc-400 mb-4">
              Optimized for iPhone and iPad. Download from the App Store.
            </p>
            <Button className="w-full flex items-center justify-center gap-2">
              <Download size={16} />
              Download on App Store
            </Button>
          </div>
          <div className="p-5 border-t border-zinc-800">
            <h3 className="font-medium mb-3">Features</h3>
            <ul className="space-y-2 text-sm text-zinc-400">
              <li className="flex items-start gap-2">
                <ArrowRight size={16} className="mt-0.5 text-zinc-500" />
                <span>Offline reading for articles</span>
              </li>
              <li className="flex items-start gap-2">
                <ArrowRight size={16} className="mt-0.5 text-zinc-500" />
                <span>Text-to-speech support</span>
              </li>
              <li className="flex items-start gap-2">
                <ArrowRight size={16} className="mt-0.5 text-zinc-500" />
                <span>Dark mode and custom fonts</span>
              </li>
              <li className="flex items-start gap-2">
                <ArrowRight size={16} className="mt-0.5 text-zinc-500" />
                <span>Share extension for Safari</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Android App */}
        <div className="bg-zinc-900 rounded-lg overflow-hidden">
          <div className="bg-gradient-to-br from-zinc-800 to-zinc-900 p-6">
            <div className="p-3 bg-black rounded-xl inline-flex mb-4">
              <Smartphone size={28} className="text-green-500" />
            </div>
            <h2 className="text-xl font-semibold mb-2">ReadLtr for Android</h2>
            <p className="text-zinc-400 mb-4">
              Available for all Android devices. Get it on Google Play.
            </p>
            <Button className="w-full flex items-center justify-center gap-2">
              <Download size={16} />
              Get it on Google Play
            </Button>
          </div>
          <div className="p-5 border-t border-zinc-800">
            <h3 className="font-medium mb-3">Features</h3>
            <ul className="space-y-2 text-sm text-zinc-400">
              <li className="flex items-start gap-2">
                <ArrowRight size={16} className="mt-0.5 text-zinc-500" />
                <span>Background syncing</span>
              </li>
              <li className="flex items-start gap-2">
                <ArrowRight size={16} className="mt-0.5 text-zinc-500" />
                <span>Reading progress sync</span>
              </li>
              <li className="flex items-start gap-2">
                <ArrowRight size={16} className="mt-0.5 text-zinc-500" />
                <span>Save from any app via share intent</span>
              </li>
              <li className="flex items-start gap-2">
                <ArrowRight size={16} className="mt-0.5 text-zinc-500" />
                <span>Customizable reading experience</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="bg-zinc-900 rounded-lg p-6 mb-10">
        <div className="flex items-start md:items-center flex-col md:flex-row gap-4">
          <div className="bg-zinc-800 p-3 rounded-full">
            <Smartphone size={24} className="text-blue-400" />
          </div>
          <div className="flex-grow">
            <h3 className="text-lg font-medium mb-1">Sync Across All Devices</h3>
            <p className="text-zinc-400">
              Your reading list, favorites, tags, and reading progress stay in sync between web, desktop, and mobile apps.
            </p>
          </div>
          <Button variant="outline" className="shrink-0">
            Learn More
          </Button>
        </div>
      </div>

      <div className="bg-zinc-900/50 rounded-lg p-6">
        <h3 className="text-lg font-medium mb-4">Frequently Asked Questions</h3>
        <div className="space-y-4">
          <div>
            <h4 className="font-medium mb-2">Is the mobile app free to use?</h4>
            <p className="text-zinc-400 text-sm">
              Yes, the basic features of the mobile app are free to use. Premium features require a subscription.
            </p>
          </div>
          <div>
            <h4 className="font-medium mb-2">Can I read articles offline?</h4>
            <p className="text-zinc-400 text-sm">
              Yes, all saved articles are available for offline reading once they've been downloaded to your device.
            </p>
          </div>
          <div>
            <h4 className="font-medium mb-2">How do I save articles from other apps?</h4>
            <p className="text-zinc-400 text-sm">
              On iOS, use the share sheet and select "Save to ReadLtr". On Android, use the share intent and choose ReadLtr from the list.
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  return <Layout>{content}</Layout>;
};

export default MobileAppPage; 