import Foundation
import Combine

class AuthManager: ObservableObject {
    @Published var isAuthenticated = false
    @Published var currentUser: User?
    
    private var cancellables = Set<AnyCancellable>()
    
    init() {
        // Check if there's a stored token/session
        checkAuthStatus()
    }
    
    func checkAuthStatus() {
        // This would connect to Supabase and check if the user is logged in
        // For now, using mock implementation
        if let userData = UserDefaults.standard.data(forKey: "currentUser"),
           let user = try? JSONDecoder().decode(User.self, from: userData) {
            self.currentUser = user
            self.isAuthenticated = true
        }
    }
    
    func signIn(email: String, password: String, completion: @escaping (Result<User, Error>) -> Void) {
        // Connect to Supabase for authentication
        // Mock implementation for now
        DispatchQueue.main.asyncAfter(deadline: .now() + 1.0) {
            if email.contains("@") && password.count >= 6 {
                let user = User(id: UUID().uuidString, name: "Test User", email: email)
                self.currentUser = user
                self.isAuthenticated = true
                
                // Store user for auto login
                if let userData = try? JSONEncoder().encode(user) {
                    UserDefaults.standard.set(userData, forKey: "currentUser")
                }
                
                completion(.success(user))
            } else {
                let error = NSError(domain: "auth", code: 401, userInfo: [NSLocalizedDescriptionKey: "Invalid email or password"])
                completion(.failure(error))
            }
        }
    }
    
    func signUp(name: String, email: String, password: String, completion: @escaping (Result<User, Error>) -> Void) {
        // Connect to Supabase for registration
        // Mock implementation for now
        DispatchQueue.main.asyncAfter(deadline: .now() + 1.5) {
            if email.contains("@") && password.count >= 8 {
                let user = User(id: UUID().uuidString, name: name, email: email)
                self.currentUser = user
                self.isAuthenticated = true
                
                // Store user for auto login
                if let userData = try? JSONEncoder().encode(user) {
                    UserDefaults.standard.set(userData, forKey: "currentUser")
                }
                
                completion(.success(user))
            } else {
                let error = NSError(domain: "auth", code: 400, userInfo: [NSLocalizedDescriptionKey: "Invalid registration data"])
                completion(.failure(error))
            }
        }
    }
    
    func resetPassword(email: String, completion: @escaping (Result<Void, Error>) -> Void) {
        // Connect to Supabase for password reset
        // Mock implementation for now
        DispatchQueue.main.asyncAfter(deadline: .now() + 1.0) {
            if email.contains("@") {
                completion(.success(()))
            } else {
                let error = NSError(domain: "auth", code: 400, userInfo: [NSLocalizedDescriptionKey: "Invalid email address"])
                completion(.failure(error))
            }
        }
    }
    
    func signOut() {
        // Connect to Supabase for sign out
        // Mock implementation for now
        self.currentUser = nil
        self.isAuthenticated = false
        UserDefaults.standard.removeObject(forKey: "currentUser")
    }
}

// A simple User model to match our authentication
struct User: Codable {
    let id: String
    let name: String
    let email: String
} 