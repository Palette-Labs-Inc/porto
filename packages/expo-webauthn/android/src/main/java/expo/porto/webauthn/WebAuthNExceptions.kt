package expo.porto.webauthn

import expo.modules.kotlin.exception.CodedException

// Base WebAuthN Exception
open class WebAuthNException(
    message: String
) : CodedException("ERR_WEBAUTHN", message, null)

// Input Validation Exceptions
internal class InvalidChallengeException : CodedException(
    "ERR_WEBAUTHN_INVALID_CHALLENGE",
    "Invalid challenge provided or not properly encoded",
    null
)

internal class InvalidUserException : CodedException(
    "ERR_WEBAUTHN_INVALID_USER",
    "Invalid user information provided",
    null
)

internal class InvalidCredentialException : CodedException(
    "ERR_WEBAUTHN_INVALID_CREDENTIAL",
    "Invalid credential or credential not found",
    null
)

// Authorization Exceptions
internal class AuthorizationCanceledException : CodedException(
    "ERR_WEBAUTHN_CANCELED",
    "Operation was canceled by the user",
    null
)

internal class AuthorizationNotHandledException : CodedException(
    "ERR_WEBAUTHN_NOT_HANDLED",
    "The authorization request was not handled",
    null
)

internal class AuthorizationFailedException : CodedException(
    "ERR_WEBAUTHN_FAILED",
    "The authorization request failed",
    null
)

internal class InvalidResponseException : CodedException(
    "ERR_WEBAUTHN_INVALID_RESPONSE",
    "The authorization request received an invalid response",
    null
)

internal class NotInteractiveException : CodedException(
    "ERR_WEBAUTHN_NOT_INTERACTIVE",
    "The authorization request was not interacted with",
    null
)

internal class UnknownAuthorizationException(detail: String) : CodedException(
    "ERR_WEBAUTHN_UNKNOWN",
    "An unknown authorization error occurred: $detail",
    null
)

// Platform/Support Exceptions
internal class NotSupportedException : CodedException(
    "ERR_WEBAUTHN_NOT_SUPPORTED",
    "WebAuthN is not supported on this device",
    null
)

// Operation Exceptions
internal class InvalidCreationOptionsException(detail: String) : CodedException(
    "ERR_WEBAUTHN_INVALID_OPTIONS",
    detail,
    null
)

internal class AuthenticationFailedException(detail: String) : CodedException(
    "ERR_WEBAUTHN_AUTH_FAILED",
    "Authentication failed: $detail",
    null
) 