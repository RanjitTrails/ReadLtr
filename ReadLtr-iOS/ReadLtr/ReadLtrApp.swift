import SwiftUI

@main
struct ReadLtrApp: App {
    @StateObject private var authManager = AuthManager()
    @StateObject private var articleStore = ArticleStore()
    
    var body: some Scene {
        WindowGroup {
            ContentView()
                .environmentObject(authManager)
                .environmentObject(articleStore)
                .tint(BrandKit.Colors.goldPrimary)
                .preferredColorScheme(.light)
                .onAppear {
                    setupAppearance()
                }
        }
    }
    
    private func setupAppearance() {
        let appearance = UINavigationBarAppearance()
        appearance.configureWithOpaqueBackground()
        appearance.backgroundColor = UIColor(BrandKit.Colors.background)
        appearance.titleTextAttributes = [.foregroundColor: UIColor(BrandKit.Colors.textGray)]
        appearance.largeTitleTextAttributes = [.foregroundColor: UIColor(BrandKit.Colors.textGray)]
        
        UINavigationBar.appearance().standardAppearance = appearance
        UINavigationBar.appearance().compactAppearance = appearance
        UINavigationBar.appearance().scrollEdgeAppearance = appearance
        
        let tabBarAppearance = UITabBarAppearance()
        tabBarAppearance.configureWithOpaqueBackground()
        tabBarAppearance.backgroundColor = UIColor(BrandKit.Colors.background)
        
        UITabBar.appearance().standardAppearance = tabBarAppearance
        UITabBar.appearance().scrollEdgeAppearance = tabBarAppearance
        
        UITableView.appearance().backgroundColor = UIColor(BrandKit.Colors.background)
        
        UISwitch.appearance().onTintColor = UIColor(BrandKit.Colors.goldPrimary)
    }
} 