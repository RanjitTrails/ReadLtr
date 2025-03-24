import SwiftUI

struct FavoritesView: View {
    @EnvironmentObject private var articleStore: ArticleStore
    @State private var searchText = ""
    
    var filteredArticles: [Article] {
        if searchText.isEmpty {
            return articleStore.favorites
        } else {
            return articleStore.favorites.filter {
                $0.title.localizedCaseInsensitiveContains(searchText) ||
                ($0.excerpt ?? "").localizedCaseInsensitiveContains(searchText) ||
                ($0.siteName ?? "").localizedCaseInsensitiveContains(searchText) ||
                ($0.author ?? "").localizedCaseInsensitiveContains(searchText)
            }
        }
    }
    
    var body: some View {
        VStack {
            // Search bar
            HStack {
                Image(systemName: "magnifyingglass")
                    .foregroundColor(.secondary)
                
                TextField("Search favorites", text: $searchText)
                    .foregroundColor(.primary)
                
                if !searchText.isEmpty {
                    Button(action: {
                        searchText = ""
                    }) {
                        Image(systemName: "xmark.circle.fill")
                            .foregroundColor(.secondary)
                    }
                }
            }
            .padding(8)
            .background(Color(.secondarySystemBackground))
            .cornerRadius(10)
            .padding(.horizontal)
            
            if articleStore.isLoading {
                Spacer()
                ProgressView()
                Spacer()
            } else if filteredArticles.isEmpty {
                Spacer()
                VStack(spacing: 15) {
                    Image(systemName: "star")
                        .font(.system(size: 50))
                        .foregroundColor(.yellow)
                    
                    Text("No Favorites Yet")
                        .font(.title3)
                        .fontWeight(.semibold)
                    
                    Text(searchText.isEmpty 
                        ? "Articles you mark as favorites will appear here"
                        : "No favorites match your search")
                    .foregroundColor(.secondary)
                    .multilineTextAlignment(.center)
                }
                .padding()
                Spacer()
            } else {
                List {
                    ForEach(filteredArticles) { article in
                        NavigationLink(destination: ArticleDetailView(articleId: article.id)) {
                            ArticleRow(article: article)
                        }
                        .swipeActions(edge: .leading) {
                            Button(action: {
                                articleStore.toggleFavorite(articleId: article.id)
                            }) {
                                Label("Unfavorite", systemImage: "star.slash")
                            }
                            .tint(.yellow)
                        }
                        .swipeActions(edge: .trailing) {
                            Button(action: {
                                articleStore.toggleArchive(articleId: article.id)
                            }) {
                                Label("Archive", systemImage: "archivebox")
                            }
                            .tint(.gray)
                        }
                    }
                }
                .listStyle(PlainListStyle())
            }
        }
    }
}

struct FavoritesView_Previews: PreviewProvider {
    static var previews: some View {
        NavigationView {
            FavoritesView()
                .navigationTitle("Favorites")
        }
        .environmentObject(ArticleStore())
    }
} 