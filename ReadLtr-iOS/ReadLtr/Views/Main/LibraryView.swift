import SwiftUI

struct LibraryView: View {
    @EnvironmentObject var articleStore: ArticleStore
    @State private var searchText = ""
    @State private var selectedFilter: ArticleFilter = .all
    @State private var showingSortOptions = false
    @State private var sortOption: SortOption = .dateAdded
    
    private var filteredArticles: [Article] {
        let articles = articleStore.articles
            .filter { article in
                selectedFilter.matches(article: article)
            }
            .filter { article in
                searchText.isEmpty || 
                article.title.localizedCaseInsensitiveContains(searchText) ||
                article.author.localizedCaseInsensitiveContains(searchText)
            }
        
        return sortedArticles(articles)
    }
    
    private func sortedArticles(_ articles: [Article]) -> [Article] {
        switch sortOption {
        case .dateAdded:
            return articles.sorted { $0.dateAdded > $1.dateAdded }
        case .title:
            return articles.sorted { $0.title < $1.title }
        case .author:
            return articles.sorted { $0.author < $1.author }
        case .readTime:
            return articles.sorted { $0.readingTimeMinutes < $1.readingTimeMinutes }
        }
    }
    
    var body: some View {
        NavigationView {
            ZStack {
                BrandKit.Colors.background.ignoresSafeArea()
                
                VStack(spacing: 0) {
                    // Filter segment control
                    ScrollView(.horizontal, showsIndicators: false) {
                        HStack(spacing: 20) {
                            FilterButton(filter: .all, selectedFilter: $selectedFilter)
                            FilterButton(filter: .unread, selectedFilter: $selectedFilter)
                            FilterButton(filter: .favorites, selectedFilter: $selectedFilter)
                            FilterButton(filter: .archived, selectedFilter: $selectedFilter)
                        }
                        .padding(.horizontal)
                    }
                    .padding(.vertical, 10)
                    .background(Color.white.shadow(radius: 1))
                    
                    if filteredArticles.isEmpty {
                        emptyStateView
                    } else {
                        List {
                            ForEach(filteredArticles) { article in
                                NavigationLink(destination: ArticleDetailView(article: article)) {
                                    ArticleRow(article: article)
                                }
                                .listRowBackground(Color.white)
                                .listRowSeparator(.hidden)
                                .padding(.vertical, 4)
                            }
                            .onDelete(perform: deleteArticles)
                        }
                        .listStyle(.plain)
                        .background(BrandKit.Colors.background)
                    }
                }
            }
            .navigationTitle("Library")
            .navigationBarTitleDisplayMode(.large)
            .searchable(text: $searchText, prompt: "Search articles")
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button(action: { showingSortOptions = true }) {
                        Label("Sort", systemImage: "arrow.up.arrow.down")
                            .foregroundColor(BrandKit.Colors.goldPrimary)
                    }
                }
                
                ToolbarItem(placement: .navigationBarTrailing) {
                    Menu {
                        Button(action: { articleStore.refreshArticles() }) {
                            Label("Refresh", systemImage: "arrow.clockwise")
                        }
                        
                        Button(action: { /* TODO: Settings action */ }) {
                            Label("Settings", systemImage: "gear")
                        }
                    } label: {
                        Image(systemName: "ellipsis.circle")
                            .foregroundColor(BrandKit.Colors.goldPrimary)
                    }
                }
            }
            .confirmationDialog("Sort by", isPresented: $showingSortOptions, titleVisibility: .visible) {
                ForEach(SortOption.allCases, id: \.self) { option in
                    Button(option.name) {
                        sortOption = option
                    }
                }
            }
        }
    }
    
    private var emptyStateView: some View {
        VStack(spacing: 20) {
            Image(systemName: "book.closed")
                .font(.system(size: 60))
                .foregroundStyle(BrandKit.Colors.goldGradient)
            
            Text("No articles found")
                .font(.title2)
                .fontWeight(.semibold)
                .foregroundColor(BrandKit.Colors.textGray)
            
            Text(getEmptyStateMessage())
                .multilineTextAlignment(.center)
                .foregroundColor(.secondary)
                .padding(.horizontal, 40)
            
            Button(action: {
                articleStore.refreshArticles()
            }) {
                Text("Refresh")
                    .foregroundColor(.white)
                    .padding(.horizontal, 30)
                    .padding(.vertical, 10)
            }
            .buttonStyle(BrandKit.Style.primaryButtonStyle())
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .background(BrandKit.Colors.background)
    }
    
    private func getEmptyStateMessage() -> String {
        switch selectedFilter {
        case .all:
            return "Start saving articles to build your library"
        case .unread:
            return "You've read all your articles. Great job!"
        case .favorites:
            return "Add articles to your favorites to see them here"
        case .archived:
            return "Your archived articles will appear here"
        }
    }
    
    private func deleteArticles(at offsets: IndexSet) {
        for index in offsets {
            let article = filteredArticles[index]
            articleStore.removeArticle(article)
        }
    }
}

struct FilterButton: View {
    let filter: ArticleFilter
    @Binding var selectedFilter: ArticleFilter
    
    var body: some View {
        Button(action: {
            selectedFilter = filter
        }) {
            Text(filter.name)
                .fontWeight(.medium)
                .padding(.horizontal, 16)
                .padding(.vertical, 8)
                .background(
                    Capsule()
                        .fill(selectedFilter == filter ? BrandKit.Colors.goldGradient : Color.clear)
                )
                .foregroundColor(selectedFilter == filter ? .white : BrandKit.Colors.textGray)
                .overlay(
                    Capsule()
                        .stroke(selectedFilter == filter ? Color.clear : BrandKit.Colors.goldPrimary.opacity(0.3), lineWidth: 1)
                )
        }
        .buttonStyle(.plain)
    }
}

struct ArticleRow: View {
    let article: Article
    
    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            HStack {
                Text(article.source)
                    .font(.caption)
                    .foregroundColor(.secondary)
                    .padding(.horizontal, 10)
                    .padding(.vertical, 4)
                    .background(Color.gray.opacity(0.1))
                    .cornerRadius(12)
                
                Spacer()
                
                Text(timeAgoSince(article.dateAdded))
                    .font(.caption)
                    .foregroundColor(.secondary)
            }
            
            Text(article.title)
                .font(.headline)
                .foregroundColor(BrandKit.Colors.textGray)
                .lineLimit(2)
            
            HStack(spacing: 12) {
                Label("\(article.readingTimeMinutes) min", systemImage: "clock")
                    .font(.caption)
                    .foregroundColor(.secondary)
                
                if !article.author.isEmpty {
                    Label(article.author, systemImage: "person")
                        .font(.caption)
                        .foregroundColor(.secondary)
                }
                
                Spacer()
                
                if article.isFavorite {
                    Image(systemName: "heart.fill")
                        .foregroundColor(BrandKit.Colors.goldPrimary)
                }
            }
        }
        .padding()
        .background(Color.white)
        .cornerRadius(12)
        .shadow(color: Color.black.opacity(0.05), radius: 2, x: 0, y: 1)
    }
    
    private func timeAgoSince(_ date: Date) -> String {
        let formatter = RelativeDateTimeFormatter()
        formatter.unitsStyle = .abbreviated
        return formatter.localizedString(for: date, relativeTo: Date())
    }
}

enum ArticleFilter: String, CaseIterable {
    case all
    case unread
    case favorites
    case archived
    
    var name: String {
        switch self {
        case .all: return "All"
        case .unread: return "Unread"
        case .favorites: return "Favorites"
        case .archived: return "Archived"
        }
    }
    
    func matches(article: Article) -> Bool {
        switch self {
        case .all:
            return true
        case .unread:
            return !article.isRead
        case .favorites:
            return article.isFavorite
        case .archived:
            return article.isArchived
        }
    }
}

enum SortOption: String, CaseIterable {
    case dateAdded
    case title
    case author
    case readTime
    
    var name: String {
        switch self {
        case .dateAdded: return "Date Added"
        case .title: return "Title"
        case .author: return "Author"
        case .readTime: return "Reading Time"
        }
    }
}

#Preview {
    LibraryView()
        .environmentObject(ArticleStore())
} 