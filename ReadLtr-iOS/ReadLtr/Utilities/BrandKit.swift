import SwiftUI

/// Brand kit for ReadLtr containing colors, fonts, and styling
struct BrandKit {
    /// Brand colors
    struct Colors {
        /// Primary gold color
        static let goldPrimary = Color("GoldPrimary")
        
        /// Secondary gold color for gradients
        static let goldSecondary = Color("GoldSecondary")
        
        /// Text dark gray color
        static let textGray = Color("TextGray")
        
        /// Background color
        static let background = Color("Background")
        
        /// Gold gradient used throughout the app
        static let goldGradient = LinearGradient(
            colors: [goldPrimary, goldSecondary],
            startPoint: .topLeading,
            endPoint: .bottomTrailing
        )
    }
    
    /// Brand typography
    struct Typography {
        /// Font used for headings
        static let headingFont = Font.system(.largeTitle, design: .rounded, weight: .bold)
        
        /// Font used for subheadings
        static let subheadingFont = Font.system(.title2, design: .rounded, weight: .semibold)
        
        /// Font used for body text
        static let bodyFont = Font.system(.body, design: .serif)
    }
    
    /// Brand styling for UI elements
    struct Style {
        /// Standard corner radius for cards and buttons
        static let cornerRadius: CGFloat = 12
        
        /// Standard padding for content
        static let contentPadding: CGFloat = 16
        
        /// Button style with brand gradient
        static func primaryButtonStyle() -> some ButtonStyle {
            return GoldGradientButtonStyle()
        }
    }
}

/// Custom button style with gold gradient
struct GoldGradientButtonStyle: ButtonStyle {
    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .padding()
            .foregroundColor(.white)
            .background(
                BrandKit.Colors.goldGradient
                    .opacity(configuration.isPressed ? 0.8 : 1.0)
            )
            .cornerRadius(BrandKit.Style.cornerRadius)
            .scaleEffect(configuration.isPressed ? 0.98 : 1.0)
            .animation(.easeInOut(duration: 0.2), value: configuration.isPressed)
    }
}

/// Extension for SwiftUI View with brand styling methods
extension View {
    /// Applies the primary card style
    func brandCard() -> some View {
        self
            .padding(BrandKit.Style.contentPadding)
            .background(Color.white)
            .cornerRadius(BrandKit.Style.cornerRadius)
            .shadow(color: Color.black.opacity(0.1), radius: 4, x: 0, y: 2)
    }
    
    /// Applies heading text style
    func brandHeading() -> some View {
        self
            .font(BrandKit.Typography.headingFont)
            .foregroundColor(BrandKit.Colors.textGray)
    }
    
    /// Applies subheading text style
    func brandSubheading() -> some View {
        self
            .font(BrandKit.Typography.subheadingFont)
            .foregroundColor(BrandKit.Colors.textGray)
    }
} 