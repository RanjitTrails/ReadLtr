import Foundation
import Combine

class ArticleStore: ObservableObject {
    @Published var articles: [Article] = []
    @Published var isLoading = false
    @Published var error: Error?
    
    private var cancellables = Set<AnyCancellable>()
    
    init() {
        // Load placeholder data for now
        // In a real app, this would load from Core Data and/or API
        loadDemoData()
    }
    
    private func loadDemoData() {
        self.articles = Article.placeholders(count: 15)
    }
    
    // MARK: - Article Management
    
    func fetchArticles() {
        isLoading = true
        error = nil
        
        // Simulate network request
        DispatchQueue.main.asyncAfter(deadline: .now() + 1.0) {
            self.articles = Article.placeholders(count: 15)
            self.isLoading = false
        }
    }
    
    func getArticle(by id: String) -> Article? {
        return articles.first(where: { $0.id == id })
    }
    
    func saveArticle(url: String, title: String? = nil, completion: @escaping (Result<Article, Error>) -> Void) {
        isLoading = true
        
        // Simulate article saving
        DispatchQueue.main.asyncAfter(deadline: .now() + 1.5) {
            self.isLoading = false
            
            if URL(string: url) != nil {
                let article = Article(
                    id: UUID().uuidString,
                    title: title ?? "New Article from \(URL(string: url)?.host ?? "Unknown")",
                    url: url,
                    content: "Content will be fetched...",
                    excerpt: "This article was just saved and will be processed.",
                    siteName: URL(string: url)?.host,
                    author: nil,
                    publishedAt: nil,
                    savedAt: Date(),
                    imageURL: nil,
                    estimatedReadingTime: nil,
                    readingProgress: 0.0,
                    isFavorite: false,
                    isArchived: false,
                    tags: [],
                    highlights: []
                )
                
                self.articles.insert(article, at: 0)
                completion(.success(article))
            } else {
                let error = NSError(domain: "article", code: 400, userInfo: [NSLocalizedDescriptionKey: "Invalid URL"])
                self.error = error
                completion(.failure(error))
            }
        }
    }
    
    func toggleFavorite(articleId: String) {
        if let index = articles.firstIndex(where: { $0.id == articleId }) {
            articles[index].isFavorite.toggle()
        }
    }
    
    func toggleArchive(articleId: String) {
        if let index = articles.firstIndex(where: { $0.id == articleId }) {
            articles[index].isArchived.toggle()
        }
    }
    
    func updateReadingProgress(articleId: String, progress: Double) {
        if let index = articles.firstIndex(where: { $0.id == articleId }) {
            articles[index].readingProgress = progress
        }
    }
    
    func addTag(articleId: String, tag: String) {
        if let index = articles.firstIndex(where: { $0.id == articleId }),
           !articles[index].tags.contains(tag) {
            articles[index].tags.append(tag)
        }
    }
    
    func removeTag(articleId: String, tag: String) {
        if let index = articles.firstIndex(where: { $0.id == articleId }) {
            articles[index].tags.removeAll(where: { $0 == tag })
        }
    }
    
    func addHighlight(articleId: String, text: String, note: String? = nil, color: Article.HighlightColor = .yellow) {
        if let index = articles.firstIndex(where: { $0.id == articleId }) {
            let highlight = Article.Highlight(
                id: UUID().uuidString,
                text: text,
                note: note,
                createdAt: Date(),
                color: color
            )
            articles[index].highlights.append(highlight)
        }
    }
    
    // MARK: - Filtered Collections
    
    var favorites: [Article] {
        articles.filter { $0.isFavorite && !$0.isArchived }
    }
    
    var archived: [Article] {
        articles.filter { $0.isArchived }
    }
    
    var unread: [Article] {
        articles.filter { !$0.isRead && !$0.isArchived }
    }
    
    func articlesByTag(_ tag: String) -> [Article] {
        articles.filter { $0.tags.contains(tag) && !$0.isArchived }
    }
    
    var allTags: [String] {
        Array(Set(articles.flatMap { $0.tags })).sorted()
    }
} 