import SwiftUI

struct LibraryView: View {
    @EnvironmentObject private var articleStore: ArticleStore
    @State private var searchText = ""
    @State private var isShowingFilterMenu = false
    @State private var filterOption: FilterOption = .all
    
    enum FilterOption {
        case all
        case unread
        case readLater
        case today
        case thisWeek
    }
    
    var filteredArticles: [Article] {
        var articles = articleStore.articles.filter { !$0.isArchived }
        
        // Apply search filter
        if !searchText.isEmpty {
            articles = articles.filter {
                $0.title.localizedCaseInsensitiveContains(searchText) ||
                ($0.excerpt ?? "").localizedCaseInsensitiveContains(searchText) ||
                ($0.siteName ?? "").localizedCaseInsensitiveContains(searchText) ||
                ($0.author ?? "").localizedCaseInsensitiveContains(searchText)
            }
        }
        
        // Apply time filter
        switch filterOption {
        case .all:
            break // No additional filtering
        case .unread:
            articles = articles.filter { !$0.isRead }
        case .readLater:
            articles = articles.filter { $0.tags.contains("read-later") }
        case .today:
            let calendar = Calendar.current
            let today = calendar.startOfDay(for: Date())
            articles = articles.filter {
                guard let date = $0.savedAt as Date? else { return false }
                return calendar.isDate(date, inSameDayAs: today)
            }
        case .thisWeek:
            let calendar = Calendar.current
            let today = Date()
            let weekAgo = calendar.date(byAdding: .day, value: -7, to: today)!
            articles = articles.filter {
                guard let date = $0.savedAt as Date? else { return false }
                return date >= weekAgo
            }
        }
        
        return articles
    }
    
    var body: some View {
        VStack {
            // Search bar
            HStack {
                Image(systemName: "magnifyingglass")
                    .foregroundColor(.secondary)
                
                TextField("Search articles", text: $searchText)
                    .foregroundColor(.primary)
                
                if !searchText.isEmpty {
                    Button(action: {
                        searchText = ""
                    }) {
                        Image(systemName: "xmark.circle.fill")
                            .foregroundColor(.secondary)
                    }
                }
                
                Divider()
                
                Menu {
                    Button(action: { filterOption = .all }) {
                        Label("All Articles", systemImage: "doc.text")
                    }
                    Button(action: { filterOption = .unread }) {
                        Label("Unread", systemImage: "book.closed")
                    }
                    Button(action: { filterOption = .readLater }) {
                        Label("Read Later", systemImage: "clock")
                    }
                    Button(action: { filterOption = .today }) {
                        Label("Added Today", systemImage: "calendar")
                    }
                    Button(action: { filterOption = .thisWeek }) {
                        Label("Added This Week", systemImage: "calendar.badge.clock")
                    }
                } label: {
                    Image(systemName: "line.3.horizontal.decrease.circle")
                        .foregroundColor(.primary)
                }
            }
            .padding(8)
            .background(Color(.secondarySystemBackground))
            .cornerRadius(10)
            .padding(.horizontal)
            
            // Filter indicator
            if filterOption != .all {
                HStack {
                    Text("Filtered by: \(filterName)")
                        .font(.footnote)
                        .foregroundColor(.secondary)
                    
                    Spacer()
                    
                    Button(action: {
                        filterOption = .all
                    }) {
                        Text("Clear")
                            .font(.footnote)
                            .foregroundColor(.accentColor)
                    }
                }
                .padding(.horizontal)
                .padding(.top, 5)
            }
            
            if articleStore.isLoading {
                Spacer()
                ProgressView()
                Spacer()
            } else if filteredArticles.isEmpty {
                Spacer()
                VStack(spacing: 15) {
                    Image(systemName: "doc.text.magnifyingglass")
                        .font(.system(size: 50))
                        .foregroundColor(.secondary)
                    
                    Text("No Articles Found")
                        .font(.title3)
                        .fontWeight(.semibold)
                    
                    Text(searchText.isEmpty
                        ? "Your reading list is empty"
                        : "Try adjusting your search or filters")
                    .foregroundColor(.secondary)
                    .multilineTextAlignment(.center)
                }
                .padding()
                Spacer()
            } else {
                // Article list
                List {
                    ForEach(filteredArticles) { article in
                        NavigationLink(destination: ArticleDetailView(articleId: article.id)) {
                            ArticleRow(article: article)
                        }
                        .swipeActions(edge: .leading) {
                            Button(action: {
                                articleStore.toggleFavorite(articleId: article.id)
                            }) {
                                Label("Favorite", systemImage: article.isFavorite ? "star.slash" : "star")
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
                .refreshable {
                    articleStore.fetchArticles()
                }
            }
        }
        .onAppear {
            if articleStore.articles.isEmpty {
                articleStore.fetchArticles()
            }
        }
    }
    
    var filterName: String {
        switch filterOption {
        case .all: return "All Articles"
        case .unread: return "Unread"
        case .readLater: return "Read Later"
        case .today: return "Added Today"
        case .thisWeek: return "Added This Week"
        }
    }
}

struct ArticleRow: View {
    let article: Article
    
    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            HStack {
                if let siteName = article.siteName {
                    Text(siteName)
                        .font(.caption)
                        .foregroundColor(.secondary)
                }
                
                Spacer()
                
                Text(article.formattedDate)
                    .font(.caption)
                    .foregroundColor(.secondary)
            }
            
            Text(article.title)
                .font(.headline)
                .lineLimit(2)
            
            if let excerpt = article.excerpt {
                Text(excerpt)
                    .font(.subheadline)
                    .foregroundColor(.secondary)
                    .lineLimit(2)
            }
            
            HStack {
                if !article.tags.isEmpty {
                    ForEach(article.tags.prefix(2), id: \.self) { tag in
                        Text(tag)
                            .font(.caption)
                            .padding(.horizontal, 8)
                            .padding(.vertical, 3)
                            .background(Color.accentColor.opacity(0.1))
                            .cornerRadius(4)
                    }
                    
                    if article.tags.count > 2 {
                        Text("+\(article.tags.count - 2)")
                            .font(.caption)
                            .foregroundColor(.secondary)
                    }
                }
                
                Spacer()
                
                HStack(spacing: 5) {
                    Text(article.formattedReadingTime)
                        .font(.caption)
                        .foregroundColor(.secondary)
                    
                    if article.readingProgress > 0 {
                        ProgressView(value: article.readingProgress)
                            .progressViewStyle(.linear)
                            .frame(width: 50)
                    }
                }
            }
        }
        .padding(.vertical, 6)
    }
}

struct LibraryView_Previews: PreviewProvider {
    static var previews: some View {
        NavigationView {
            LibraryView()
                .navigationTitle("Library")
        }
        .environmentObject(ArticleStore())
    }
} 