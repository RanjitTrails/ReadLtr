export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200 mt-10">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <p className="text-center text-slate-500 text-sm">
          This is an unofficial self-hosting guide for Omnivore. Omnivore is an open-source project available under the
          <a href="https://github.com/omnivore-app/omnivore/blob/main/LICENSE" className="text-primary hover:underline ml-1">
            AGPL-3.0 License
          </a>.
        </p>
      </div>
    </footer>
  );
}
