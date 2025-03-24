import Foundation

struct Article: Identifiable, Codable {
    let id: String
    let title: String
    let url: String
    let content: String
    let excerpt: String?
    let siteName: String?
    let author: String?
    let publishedAt: Date?
    let savedAt: Date
    let imageURL: String?
    let estimatedReadingTime: Int?
    let readingProgress: Double
    var isFavorite: Bool
    var isArchived: Bool
    var tags: [String]
    var highlights: [Highlight]
    
    struct Highlight: Identifiable, Codable {
        let id: String
        let text: String
        let note: String?
        let createdAt: Date
        let color: HighlightColor
    }
    
    enum HighlightColor: String, Codable, CaseIterable {
        case yellow
        case green
        case blue
        case purple
        case red
    }
}

struct ReadingPosition: Codable {
    let articleId: String
    let position: Double
    let lastReadAt: Date
}

// Extended article for compatibility with the core model
extension Article {
    var isRead: Bool {
        readingProgress >= 0.9
    }
    
    var formattedDate: String {
        guard let date = publishedAt else { return "Unknown" }
        let formatter = DateFormatter()
        formatter.dateStyle = .medium
        return formatter.string(from: date)
    }
    
    var formattedReadingTime: String {
        guard let time = estimatedReadingTime else { return "Unknown" }
        if time < 1 {
            return "Less than a minute"
        } else if time == 1 {
            return "1 minute"
        } else {
            return "\(time) minutes"
        }
    }
    
    // Create a placeholder article for UI development
    static func placeholder() -> Article {
        return Article(
            id: UUID().uuidString,
            title: "The Future of Mobile Reading Apps",
            url: "https://example.com/article",
            content: "Lorem ipsum dolor sit amet, consectetur adipiscing elit...",
            excerpt: "A look at how reading apps are evolving to provide better experiences",
            siteName: "TechInsights",
            author: "Jane Smith",
            publishedAt: Date().addingTimeInterval(-86400 * 2),
            savedAt: Date().addingTimeInterval(-3600),
            imageURL: nil,
            estimatedReadingTime: 5,
            readingProgress: 0.0,
            isFavorite: false,
            isArchived: false,
            tags: ["technology", "reading"],
            highlights: []
        )
    }
    
    // Create multiple placeholder articles for UI development
    static func placeholders(count: Int) -> [Article] {
        return (0..<count).map { i in
            let days = Double(i) * -1.5
            let progress = Double.random(in: 0...1)
            let isFavorite = Bool.random()
            let isArchived = progress > 0.9 ? Bool.random() : false
            
            return Article(
                id: UUID().uuidString,
                title: "Article \(i + 1): The Evolution of Reading Experience",
                url: "https://example.com/article\(i+1)",
                content: "Lorem ipsum dolor sit amet, consectetur adipiscing elit...",
                excerpt: "This is a sample article for testing the UI",
                siteName: ["TechNews", "ReadingDaily", "BookInsights", "LiteraryTimes"].randomElement()!,
                author: ["Jane Smith", "John Doe", "Alex Johnson", "Sam Taylor"].randomElement()!,
                publishedAt: Date().addingTimeInterval(86400 * days),
                savedAt: Date().addingTimeInterval(3600 * days),
                imageURL: nil,
                estimatedReadingTime: Int.random(in: 3...15),
                readingProgress: progress,
                isFavorite: isFavorite,
                isArchived: isArchived,
                tags: [
                    ["technology", "mobile", "apps"].randomElement()!,
                    ["reading", "productivity"].randomElement()!
                ],
                highlights: []
            )
        }
    }
} 