import SwiftUI

struct AuthView: View {
    @State private var showingRegistration = false
    
    var body: some View {
        NavigationView {
            VStack(spacing: 30) {
                // Logo and branding
                VStack(spacing: 12) {
                    Image(systemName: "book.closed")
                        .resizable()
                        .scaledToFit()
                        .frame(width: 80, height: 80)
                        .foregroundColor(.accentColor)
                    
                    Text("ReadLtr")
                        .font(.largeTitle)
                        .fontWeight(.bold)
                    
                    Text("Your personal reading companion")
                        .font(.subheadline)
                        .foregroundColor(.secondary)
                }
                .padding(.top, 60)
                
                Spacer()
                
                // Login or Register
                VStack(spacing: 16) {
                    if !showingRegistration {
                        LoginView()
                    } else {
                        RegisterView()
                    }
                    
                    Button(action: {
                        withAnimation {
                            showingRegistration.toggle()
                        }
                    }) {
                        Text(showingRegistration ? "Already have an account? Sign in" : "Don't have an account? Sign up")
                            .font(.footnote)
                            .foregroundColor(.accentColor)
                    }
                    .padding(.bottom)
                }
                
                Spacer()
            }
            .padding()
            .background(Color(.systemBackground))
        }
    }
}

struct AuthView_Previews: PreviewProvider {
    static var previews: some View {
        AuthView()
            .environmentObject(AuthManager())
    }
} 