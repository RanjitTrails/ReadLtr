import SwiftUI

struct SettingsView: View {
    @EnvironmentObject private var authManager: AuthManager
    @EnvironmentObject private var articleStore: ArticleStore
    
    // Settings state
    @AppStorage("defaultFontSize") private var defaultFontSize: Double = 17
    @AppStorage("defaultLineSpacing") private var defaultLineSpacing: Double = 1.4
    @AppStorage("useSystemAppearance") private var useSystemAppearance = true
    @AppStorage("darkModeEnabled") private var darkModeEnabled = false
    @AppStorage("syncOnCellular") private var syncOnCellular = true
    @AppStorage("autoSaveClipboard") private var autoSaveClipboard = true
    
    @State private var showingLogoutAlert = false
    @State private var showingClearDataAlert = false
    @State private var showingSyncAlert = false
    
    var colorScheme: ColorScheme? {
        if useSystemAppearance {
            return nil // Use system setting
        } else {
            return darkModeEnabled ? .dark : .light
        }
    }
    
    var body: some View {
        List {
            Section(header: Text("Account")) {
                if let user = authManager.currentUser {
                    HStack {
                        VStack(alignment: .leading) {
                            Text(user.name)
                                .font(.headline)
                            Text(user.email)
                                .font(.subheadline)
                                .foregroundColor(.secondary)
                        }
                        
                        Spacer()
                        
                        Button(action: {
                            // Edit profile
                        }) {
                            Text("Edit")
                                .foregroundColor(.accentColor)
                        }
                    }
                    .padding(.vertical, 4)
                    
                    Button(action: {
                        showingLogoutAlert = true
                    }) {
                        HStack {
                            Text("Sign Out")
                                .foregroundColor(.red)
                            Spacer()
                        }
                    }
                    .alert(isPresented: $showingLogoutAlert) {
                        Alert(
                            title: Text("Sign Out"),
                            message: Text("Are you sure you want to sign out?"),
                            primaryButton: .destructive(Text("Sign Out")) {
                                authManager.signOut()
                            },
                            secondaryButton: .cancel()
                        )
                    }
                }
            }
            
            Section(header: Text("Reading Preferences")) {
                VStack(alignment: .leading) {
                    Text("Font Size")
                    Slider(value: $defaultFontSize, in: 12...24, step: 1)
                    Text("\(Int(defaultFontSize)) pt")
                        .font(.caption)
                        .foregroundColor(.secondary)
                }
                .padding(.vertical, 4)
                
                VStack(alignment: .leading) {
                    Text("Line Spacing")
                    Slider(value: $defaultLineSpacing, in: 1.0...2.0, step: 0.1)
                    Text("×\(String(format: "%.1f", defaultLineSpacing))")
                        .font(.caption)
                        .foregroundColor(.secondary)
                }
                .padding(.vertical, 4)
            }
            
            Section(header: Text("Appearance")) {
                Toggle("Use System Appearance", isOn: $useSystemAppearance)
                
                if !useSystemAppearance {
                    Toggle("Dark Mode", isOn: $darkModeEnabled)
                        .disabled(useSystemAppearance)
                }
            }
            
            Section(header: Text("Sync & Storage")) {
                Toggle("Sync on Cellular Data", isOn: $syncOnCellular)
                
                Toggle("Auto-save URLs from Clipboard", isOn: $autoSaveClipboard)
                
                Button(action: {
                    showingSyncAlert = true
                }) {
                    HStack {
                        Text("Sync Library Now")
                        Spacer()
                    }
                }
                .alert(isPresented: $showingSyncAlert) {
                    Alert(
                        title: Text("Sync Complete"),
                        message: Text("Your library is up to date."),
                        dismissButton: .default(Text("OK"))
                    )
                }
                
                Button(action: {
                    showingClearDataAlert = true
                }) {
                    HStack {
                        Text("Clear Offline Data")
                            .foregroundColor(.red)
                        Spacer()
                    }
                }
                .alert(isPresented: $showingClearDataAlert) {
                    Alert(
                        title: Text("Clear Offline Data"),
                        message: Text("This will delete all cached articles from your device. Your library will still be available when you reconnect."),
                        primaryButton: .destructive(Text("Clear Data")) {
                            // Clear local data
                        },
                        secondaryButton: .cancel()
                    )
                }
            }
            
            Section(header: Text("About")) {
                HStack {
                    Text("Version")
                    Spacer()
                    Text("1.0.0")
                        .foregroundColor(.secondary)
                }
                
                NavigationLink(destination: Text("Privacy Policy would go here")) {
                    Text("Privacy Policy")
                }
                
                NavigationLink(destination: Text("Terms of Service would go here")) {
                    Text("Terms of Service")
                }
                
                Button(action: {
                    // Open support email
                    if let url = URL(string: "mailto:support@readltr.app") {
                        UIApplication.shared.open(url)
                    }
                }) {
                    HStack {
                        Text("Contact Support")
                        Spacer()
                    }
                }
            }
        }
        .listStyle(InsetGroupedListStyle())
        .preferredColorScheme(colorScheme)
    }
}

struct SettingsView_Previews: PreviewProvider {
    static var previews: some View {
        NavigationView {
            SettingsView()
                .navigationTitle("Settings")
        }
        .environmentObject(AuthManager())
        .environmentObject(ArticleStore())
    }
} 