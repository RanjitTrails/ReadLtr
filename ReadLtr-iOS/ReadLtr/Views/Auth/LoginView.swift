import SwiftUI

struct LoginView: View {
    @EnvironmentObject var authManager: AuthManager
    @State private var email: String = ""
    @State private var password: String = ""
    @State private var isShowingAlert: Bool = false
    @State private var alertMessage: String = ""
    @State private var isLoading: Bool = false
    
    var body: some View {
        ZStack {
            BrandKit.Colors.background
                .ignoresSafeArea()
            
            VStack(spacing: 30) {
                // Logo
                VStack(spacing: 16) {
                    Image("Logo")
                        .resizable()
                        .aspectRatio(contentMode: .fit)
                        .frame(width: 150, height: 150)
                    
                    Text("READLTR")
                        .font(.system(size: 36, weight: .bold, design: .default))
                        .foregroundStyle(BrandKit.Colors.goldGradient)
                    
                    Text("Unlock stories")
                        .font(.system(size: 18, weight: .medium, design: .default))
                        .foregroundColor(BrandKit.Colors.textGray)
                }
                .padding(.top, 40)
                
                // Form
                VStack(spacing: 20) {
                    VStack(alignment: .leading, spacing: 8) {
                        Text("Email")
                            .foregroundColor(BrandKit.Colors.textGray)
                        
                        TextField("Enter your email", text: $email)
                            .padding()
                            .background(Color.white)
                            .cornerRadius(8)
                            .overlay(
                                RoundedRectangle(cornerRadius: 8)
                                    .stroke(BrandKit.Colors.goldPrimary.opacity(0.5), lineWidth: 1)
                            )
                            .autocapitalization(.none)
                            .keyboardType(.emailAddress)
                    }
                    
                    VStack(alignment: .leading, spacing: 8) {
                        Text("Password")
                            .foregroundColor(BrandKit.Colors.textGray)
                        
                        SecureField("Enter your password", text: $password)
                            .padding()
                            .background(Color.white)
                            .cornerRadius(8)
                            .overlay(
                                RoundedRectangle(cornerRadius: 8)
                                    .stroke(BrandKit.Colors.goldPrimary.opacity(0.5), lineWidth: 1)
                            )
                    }
                    
                    Button(action: login) {
                        if isLoading {
                            ProgressView()
                                .progressViewStyle(CircularProgressViewStyle(tint: .white))
                        } else {
                            Text("Sign In")
                                .fontWeight(.bold)
                                .foregroundColor(.white)
                                .frame(maxWidth: .infinity)
                        }
                    }
                    .buttonStyle(BrandKit.Style.primaryButtonStyle())
                    .disabled(email.isEmpty || password.isEmpty || isLoading)
                    .padding(.top, 10)
                    
                    HStack {
                        Text("Don't have an account?")
                            .foregroundColor(BrandKit.Colors.textGray)
                        
                        Button(action: {
                            authManager.currentAuthView = .register
                        }) {
                            Text("Sign Up")
                                .foregroundStyle(BrandKit.Colors.goldGradient)
                                .fontWeight(.bold)
                        }
                    }
                    .padding(.top, 10)
                    
                    Button(action: {
                        authManager.currentAuthView = .resetPassword
                    }) {
                        Text("Forgot Password?")
                            .foregroundStyle(BrandKit.Colors.goldGradient)
                            .fontWeight(.bold)
                    }
                }
                .padding(.horizontal, 30)
                
                Spacer()
            }
            .alert(isPresented: $isShowingAlert) {
                Alert(
                    title: Text("Error"),
                    message: Text(alertMessage),
                    dismissButton: .default(Text("OK"))
                )
            }
        }
    }
    
    private func login() {
        isLoading = true
        
        // Simulate network delay
        DispatchQueue.main.asyncAfter(deadline: .now() + 1.5) {
            if email.contains("@") && password.count >= 6 {
                authManager.isAuthenticated = true
            } else {
                isShowingAlert = true
                alertMessage = "Invalid email or password. Please try again."
            }
            isLoading = false
        }
    }
}

#Preview {
    LoginView()
        .environmentObject(AuthManager())
} 