import SwiftUI

struct SaveArticleView: View {
    @EnvironmentObject private var articleStore: ArticleStore
    @Environment(\.presentationMode) var presentationMode
    
    @State private var url = ""
    @State private var title = ""
    @State private var isLoading = false
    @State private var errorMessage = ""
    @State private var addedTags: [String] = []
    @State private var newTag = ""
    @State private var showingPastePrompt = false
    
    @State private var pasteboardText: String? = nil
    
    var isValidUrl: Bool {
        guard !url.isEmpty else { return false }
        return URL(string: url) != nil
    }
    
    var body: some View {
        VStack(spacing: 20) {
            // Header
            HStack {
                Text("Add to Reading List")
                    .font(.headline)
                Spacer()
                Button("Cancel") {
                    presentationMode.wrappedValue.dismiss()
                }
            }
            .padding(.bottom, 10)
            
            // URL input
            VStack(alignment: .leading, spacing: 8) {
                Text("URL")
                    .font(.subheadline)
                    .foregroundColor(.secondary)
                
                HStack {
                    TextField("https://example.com/article", text: $url)
                        .keyboardType(.URL)
                        .autocapitalization(.none)
                        .disableAutocorrection(true)
                    
                    if !url.isEmpty {
                        Button(action: {
                            url = ""
                        }) {
                            Image(systemName: "xmark.circle.fill")
                                .foregroundColor(.secondary)
                        }
                    }
                    
                    Button(action: {
                        pasteFromClipboard()
                    }) {
                        Image(systemName: "doc.on.clipboard")
                            .foregroundColor(.accentColor)
                    }
                }
                .padding()
                .background(Color(.systemGray6))
                .cornerRadius(8)
            }
            
            // Optional title input
            VStack(alignment: .leading, spacing: 8) {
                Text("Title (Optional)")
                    .font(.subheadline)
                    .foregroundColor(.secondary)
                
                TextField("Custom title for this article", text: $title)
                    .padding()
                    .background(Color(.systemGray6))
                    .cornerRadius(8)
            }
            
            // Tags
            VStack(alignment: .leading, spacing: 8) {
                Text("Tags (Optional)")
                    .font(.subheadline)
                    .foregroundColor(.secondary)
                
                HStack {
                    TextField("Add a tag", text: $newTag)
                        .padding()
                        .background(Color(.systemGray6))
                        .cornerRadius(8)
                    
                    Button(action: {
                        addTag()
                    }) {
                        Image(systemName: "plus.circle.fill")
                            .foregroundColor(.accentColor)
                            .imageScale(.large)
                    }
                    .disabled(newTag.isEmpty)
                }
                
                if !addedTags.isEmpty {
                    ScrollView(.horizontal, showsIndicators: false) {
                        HStack {
                            ForEach(addedTags, id: \.self) { tag in
                                TagChip(tag: tag) {
                                    removeTag(tag)
                                }
                            }
                        }
                    }
                }
            }
            
            if !errorMessage.isEmpty {
                Text(errorMessage)
                    .foregroundColor(.red)
                    .font(.footnote)
            }
            
            // Save button
            Button(action: {
                saveArticle()
            }) {
                if isLoading {
                    ProgressView()
                        .progressViewStyle(CircularProgressViewStyle(tint: .white))
                } else {
                    Text("Save Article")
                        .fontWeight(.semibold)
                }
            }
            .frame(maxWidth: .infinity)
            .padding()
            .background(isValidUrl ? Color.accentColor : Color.gray)
            .foregroundColor(.white)
            .cornerRadius(10)
            .disabled(!isValidUrl || isLoading)
            
            Spacer()
        }
        .padding()
        .onAppear {
            checkClipboard()
        }
        .alert(isPresented: $showingPastePrompt) {
            Alert(
                title: Text("Add from Clipboard"),
                message: Text("Would you like to use this URL?\n\(pasteboardText ?? "")"),
                primaryButton: .default(Text("Use URL")) {
                    if let text = pasteboardText {
                        url = text
                    }
                },
                secondaryButton: .cancel()
            )
        }
    }
    
    private func checkClipboard() {
        if let clipboardString = UIPasteboard.general.string,
           clipboardString.hasPrefix("http"),
           URL(string: clipboardString) != nil {
            pasteboardText = clipboardString
            showingPastePrompt = true
        }
    }
    
    private func pasteFromClipboard() {
        if let clipboardString = UIPasteboard.general.string {
            url = clipboardString
        }
    }
    
    private func addTag() {
        let tag = newTag.lowercased().trimmingCharacters(in: .whitespacesAndNewlines)
        if !tag.isEmpty && !addedTags.contains(tag) {
            addedTags.append(tag)
            newTag = ""
        }
    }
    
    private func removeTag(_ tag: String) {
        addedTags.removeAll { $0 == tag }
    }
    
    private func saveArticle() {
        isLoading = true
        errorMessage = ""
        
        articleStore.saveArticle(url: url, title: title.isEmpty ? nil : title) { result in
            isLoading = false
            
            switch result {
            case .success(let article):
                // Add tags if any
                for tag in addedTags {
                    articleStore.addTag(articleId: article.id, tag: tag)
                }
                presentationMode.wrappedValue.dismiss()
                
            case .failure(let error):
                errorMessage = error.localizedDescription
            }
        }
    }
}

struct TagChip: View {
    let tag: String
    let onRemove: () -> Void
    
    var body: some View {
        HStack(spacing: 4) {
            Text(tag)
                .font(.caption)
                .padding(.leading, 8)
            
            Button(action: onRemove) {
                Image(systemName: "xmark.circle.fill")
                    .foregroundColor(.secondary)
                    .padding(.trailing, 4)
            }
        }
        .padding(.vertical, 5)
        .background(Color.accentColor.opacity(0.1))
        .cornerRadius(12)
    }
}

struct SaveArticleView_Previews: PreviewProvider {
    static var previews: some View {
        SaveArticleView()
            .environmentObject(ArticleStore())
    }
} 