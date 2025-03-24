import SwiftUI

struct ArchiveView: View {
    @EnvironmentObject private var articleStore: ArticleStore
    @State private var searchText = ""
    
    var filteredArticles: [Article] {
        if searchText.isEmpty {
            return articleStore.archived
        } else {
            return articleStore.archived.filter {
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
                
                TextField("Search archive", text: $searchText)
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
                    Image(systemName: "archivebox")
                        .font(.system(size: 50))
                        .foregroundColor(.gray)
                    
                    Text("Archive Empty")
                        .font(.title3)
                        .fontWeight(.semibold)
                    
                    Text(searchText.isEmpty 
                        ? "Articles you archive will appear here"
                        : "No archived articles match your search")
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
                                articleStore.toggleArchive(articleId: article.id)
                            }) {
                                Label("Unarchive", systemImage: "tray.and.arrow.up")
                            }
                            .tint(.blue)
                        }
                    }
                }
                .listStyle(PlainListStyle())
            }
        }
    }
}

struct ArchiveView_Previews: PreviewProvider {
    static var previews: some View {
        NavigationView {
            ArchiveView()
                .navigationTitle("Archive")
        }
        .environmentObject(ArticleStore())
    }
}