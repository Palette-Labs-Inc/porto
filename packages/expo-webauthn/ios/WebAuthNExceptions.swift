import ExpoModulesCore
import AuthenticationServices

// MARK: - Base WebAuthN Exceptions
internal class WebAuthNException: Exception {
    override var reason: String {
        "A WebAuthN operation failed"
    }
}

// MARK: - Input Validation Exceptions
internal class InvalidChallengeException: WebAuthNException {
    override var reason: String {
        "Invalid challenge provided or not properly encoded"
    }
}

internal class InvalidUserException: WebAuthNException {
    override var reason: String {
        "Invalid user information provided"
    }
}

internal class InvalidCredentialException: WebAuthNException {
    override var reason: String {
        "Invalid credential or credential not found"
    }
}

// MARK: - Authorization Exceptions
internal class AuthorizationCanceledException: WebAuthNException {
    override var reason: String {
        "Operation was canceled by the user"
    }
}

internal class AuthorizationNotHandledException: WebAuthNException {
    override var reason: String {
        "The authorization request was not handled"
    }
}

internal class AuthorizationFailedException: WebAuthNException {
    override var reason: String {
        "The authorization request failed"
    }
}

internal class InvalidResponseException: WebAuthNException {
    override var reason: String {
        "The authorization request received an invalid response"
    }
}

internal class NotInteractiveException: WebAuthNException {
    override var reason: String {
        "The authorization request was not interacted with"
    }
}

internal class UnknownAuthorizationException: GenericException<String> {
    override var reason: String {
        "An unknown authorization error occurred: \(param)"
    }
}

// MARK: - Platform/Support Exceptions
internal class NotSupportedException: WebAuthNException {
    override var reason: String {
        "WebAuthn is not supported on this device"
    }
}

// MARK: - Operation Exceptions
internal class InvalidCreationOptionsException: GenericException<String> {
    override var reason: String {
        "\(param)"
    }
}

internal class AuthenticationFailedException: GenericException<String> {
    override var reason: String {
        "Authentication failed: \(param)"
    }
} 
