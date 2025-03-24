import SwiftUI

struct ArticleDetailView: View {
    let articleId: String
    @EnvironmentObject private var articleStore: ArticleStore
    @State private var showingOptions = false
    @State private var fontSize: CGFloat = 17
    @State private var lineSpacing: CGFloat = 1.4
    @State private var showingHighlightOptions = false
    @State private var selectedText: String = ""
    @State private var readingProgress: Double = 0
    
    // Reader UI State
    @State private var isReaderModeEnabled = true
    @State private var isDarkMode = false
    @State private var isFontMenuVisible = false
    
    private var article: Article? {
        articleStore.getArticle(by: articleId)
    }
    
    var body: some View {
        Group {
            if let article = article {
                ScrollView {
                    VStack(alignment: .leading, spacing: 16) {
                        // Article header
                        VStack(alignment: .leading, spacing: 10) {
                            Text(article.title)
                                .font(.largeTitle)
                                .fontWeight(.bold)
                            
                            HStack {
                                if let author = article.author {
                                    Text("By \(author)")
                                        .font(.subheadline)
                                }
                                
                                Spacer()
                                
                                if let date = article.publishedAt {
                                    Text(article.formattedDate)
                                        .font(.subheadline)
                                        .foregroundColor(.secondary)
                                }
                            }
                            
                            if let siteName = article.siteName {
                                Text(siteName)
                                    .font(.caption)
                                    .foregroundColor(.secondary)
                            }
                            
                            Divider()
                        }
                        .padding(.horizontal)
                        
                        // Article content
                        Text(article.content)
                            .font(.system(size: fontSize))
                            .lineSpacing(lineSpacing)
                            .padding(.horizontal)
                            .contextMenu {
                                Button(action: {
                                    // Highlight text
                                    showingHighlightOptions = true
                                }) {
                                    Label("Highlight", systemImage: "highlighter")
                                }
                                
                                Button(action: {
                                    // Copy text
                                    UIPasteboard.general.string = selectedText
                                }) {
                                    Label("Copy", systemImage: "doc.on.doc")
                                }
                                
                                Button(action: {
                                    // Share text
                                    // In a real app, this would use UIActivityViewController
                                }) {
                                    Label("Share", systemImage: "square.and.arrow.up")
                                }
                            }
                            .onAppear {
                                // Set initial reading progress
                                readingProgress = article.readingProgress
                            }
                            .onDisappear {
                                // Save reading progress on disappear
                                articleStore.updateReadingProgress(articleId: articleId, progress: readingProgress)
                            }
                        
                        // Progress tracking
                        GeometryReader { geometry in
                            Color.clear
                                .preference(key: ScrollOffsetPreferenceKey.self, value: geometry.frame(in: .named("scrollView")).minY)
                        }
                        .frame(height: 0)
                    }
                    .padding(.vertical)
                }
                .coordinateSpace(name: "scrollView")
                .onPreferenceChange(ScrollOffsetPreferenceKey.self) { offset in
                    // Calculate reading progress based on scroll position
                    // This is a simplistic approach; a real app would be more sophisticated
                    if offset < 0 {
                        let progress = min(abs(offset) / 1000.0, 1.0) // Arbitrary scale
                        readingProgress = progress
                    }
                }
                .navigationBarItems(
                    trailing: HStack {
                        Button(action: {
                            articleStore.toggleFavorite(articleId: articleId)
                        }) {
                            Image(systemName: article.isFavorite ? "star.fill" : "star")
                        }
                        
                        Button(action: {
                            showingOptions = true
                        }) {
                            Image(systemName: "ellipsis.circle")
                        }
                    }
                )
                .sheet(isPresented: $showingOptions) {
                    ArticleOptionsSheet(articleId: articleId, fontSize: $fontSize, lineSpacing: $lineSpacing)
                }
                .overlay(
                    // Reading controls overlay
                    VStack {
                        Spacer()
                        
                        HStack {
                            Button(action: {
                                isDarkMode.toggle()
                            }) {
                                Image(systemName: isDarkMode ? "sun.max.fill" : "moon.fill")
                                    .foregroundColor(.white)
                                    .padding(12)
                                    .background(Color.accentColor)
                                    .clipShape(Circle())
                            }
                            
                            Spacer()
                            
                            Button(action: {
                                isFontMenuVisible.toggle()
                            }) {
                                Image(systemName: "textformat.size")
                                    .foregroundColor(.white)
                                    .padding(12)
                                    .background(Color.accentColor)
                                    .clipShape(Circle())
                            }
                            
                            Spacer()
                            
                            Button(action: {
                                isReaderModeEnabled.toggle()
                            }) {
                                Image(systemName: isReaderModeEnabled ? "doc.plaintext" : "doc.richtext")
                                    .foregroundColor(.white)
                                    .padding(12)
                                    .background(Color.accentColor)
                                    .clipShape(Circle())
                            }
                        }
                        .padding(.horizontal, 30)
                        .padding(.bottom, 20)
                    }
                )
                .alert(isPresented: $showingHighlightOptions) {
                    Alert(
                        title: Text("Highlight Options"),
                        message: Text("Would you like to highlight this text?"),
                        primaryButton: .default(Text("Highlight"), action: {
                            // Add highlight
                            if !selectedText.isEmpty {
                                articleStore.addHighlight(articleId: articleId, text: selectedText)
                            }
                        }),
                        secondaryButton: .cancel()
                    )
                }
                .preferredColorScheme(isDarkMode ? .dark : .light)
            } else {
                VStack {
                    Text("Article not found")
                    
                    Button("Go Back") {
                        // In a real app, use NavigationLink or programmatic navigation
                    }
                }
                .padding()
            }
        }
        .navigationBarTitle("", displayMode: .inline)
    }
}

struct ArticleOptionsSheet: View {
    let articleId: String
    @EnvironmentObject private var articleStore: ArticleStore
    @Binding var fontSize: CGFloat
    @Binding var lineSpacing: CGFloat
    @Environment(\.presentationMode) var presentationMode
    @State private var tags: [String] = []
    @State private var newTag: String = ""
    
    var body: some View {
        NavigationView {
            List {
                Section(header: Text("Reading Settings")) {
                    VStack(alignment: .leading) {
                        Text("Font Size")
                        Slider(value: $fontSize, in: 12...24, step: 1) {
                            Text("Font Size")
                        }
                        Text("\(Int(fontSize)) pt")
                            .font(.caption)
                            .foregroundColor(.secondary)
                    }
                    
                    VStack(alignment: .leading) {
                        Text("Line Spacing")
                        Slider(value: $lineSpacing, in: 1.0...2.0, step: 0.1) {
                            Text("Line Spacing")
                        }
                        Text("×\(String(format: "%.1f", lineSpacing))")
                            .font(.caption)
                            .foregroundColor(.secondary)
                    }
                }
                
                Section(header: Text("Article Actions")) {
                    if let article = articleStore.getArticle(by: articleId) {
                        Button(action: {
                            articleStore.toggleFavorite(articleId: articleId)
                            if article.isFavorite {
                                // Show feedback or UI update
                            }
                        }) {
                            Label(article.isFavorite ? "Remove from Favorites" : "Add to Favorites", systemImage: article.isFavorite ? "star.slash" : "star")
                        }
                        
                        Button(action: {
                            articleStore.toggleArchive(articleId: articleId)
                            presentationMode.wrappedValue.dismiss()
                        }) {
                            Label(article.isArchived ? "Unarchive" : "Archive", systemImage: article.isArchived ? "tray.and.arrow.up" : "archivebox")
                        }
                        
                        Button(action: {
                            // Share the article
                            // In a real app, use UIActivityViewController
                        }) {
                            Label("Share", systemImage: "square.and.arrow.up")
                        }
                        
                        Button(action: {
                            // Open in browser
                            if let url = URL(string: article.url), UIApplication.shared.canOpenURL(url) {
                                UIApplication.shared.open(url)
                            }
                        }) {
                            Label("Open in Browser", systemImage: "safari")
                        }
                    }
                }
                
                Section(header: Text("Tags")) {
                    if let article = articleStore.getArticle(by: articleId) {
                        ForEach(article.tags, id: \.self) { tag in
                            HStack {
                                Text(tag)
                                Spacer()
                                Button(action: {
                                    articleStore.removeTag(articleId: articleId, tag: tag)
                                }) {
                                    Image(systemName: "xmark.circle.fill")
                                        .foregroundColor(.secondary)
                                }
                            }
                        }
                        
                        HStack {
                            TextField("Add a tag", text: $newTag)
                            Button(action: {
                                if !newTag.isEmpty {
                                    articleStore.addTag(articleId: articleId, tag: newTag.lowercased())
                                    newTag = ""
                                }
                            }) {
                                Image(systemName: "plus.circle.fill")
                                    .foregroundColor(.accentColor)
                            }
                        }
                    }
                }
                
                Section(header: Text("Text-to-Speech")) {
                    Button(action: {
                        // Start text-to-speech
                    }) {
                        Label("Start Reading Aloud", systemImage: "speaker.wave.2")
                    }
                }
            }
            .listStyle(InsetGroupedListStyle())
            .navigationTitle("Article Options")
            .navigationBarItems(trailing: Button("Done") {
                presentationMode.wrappedValue.dismiss()
            })
        }
    }
}

struct ScrollOffsetPreferenceKey: PreferenceKey {
    static var defaultValue: CGFloat = 0
    static func reduce(value: inout CGFloat, nextValue: () -> CGFloat) {
        value = nextValue()
    }
}

struct ArticleDetailView_Previews: PreviewProvider {
    static var previews: some View {
        NavigationView {
            ArticleDetailView(articleId: Article.placeholder().id)
        }
        .environmentObject({
            let store = ArticleStore()
            store.articles = [Article.placeholder()]
            return store
        }())
    }
} 