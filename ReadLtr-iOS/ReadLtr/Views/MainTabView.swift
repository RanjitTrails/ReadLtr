import SwiftUI

struct MainTabView: View {
    @EnvironmentObject private var articleStore: ArticleStore
    @State private var selectedTab = 0
    
    var body: some View {
        TabView(selection: $selectedTab) {
            NavigationView {
                LibraryView()
                    .navigationTitle("Library")
                    .navigationBarItems(trailing: AddButton())
            }
            .tabItem {
                Label("Library", systemImage: "book")
            }
            .tag(0)
            
            NavigationView {
                FavoritesView()
                    .navigationTitle("Favorites")
            }
            .tabItem {
                Label("Favorites", systemImage: "star")
            }
            .tag(1)
            
            NavigationView {
                ArchiveView()
                    .navigationTitle("Archive")
            }
            .tabItem {
                Label("Archive", systemImage: "archivebox")
            }
            .tag(2)
            
            NavigationView {
                SettingsView()
                    .navigationTitle("Settings")
            }
            .tabItem {
                Label("Settings", systemImage: "gear")
            }
            .tag(3)
        }
    }
}

struct AddButton: View {
    @State private var showingAddSheet = false
    
    var body: some View {
        Button(action: {
            showingAddSheet = true
        }) {
            Image(systemName: "plus")
        }
        .sheet(isPresented: $showingAddSheet) {
            NavigationView {
                SaveArticleView()
                    .navigationTitle("Save Article")
                    .navigationBarItems(trailing: Button("Cancel") {
                        showingAddSheet = false
                    })
            }
        }
    }
}

struct MainTabView_Previews: PreviewProvider {
    static var previews: some View {
        MainTabView()
            .environmentObject(ArticleStore())
    }
} 