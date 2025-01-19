package expo.modules.webauthn

import expo.modules.kotlin.exception.CodedException

class InvalidChallengeException : CodedException("Invalid challenge provided or not properly encoded")

class InvalidUserException : CodedException("Invalid user information provided")

class InvalidCredentialException : CodedException("Invalid credential or credential not found")

class NotSupportedException : CodedException("WebAuthn is not supported on this device")

class UserCancelledException : CodedException("Operation was cancelled by the user")

class AuthenticationFailedException(message: String) : CodedException(message)

class OperationException(message: String) : CodedException(message) 