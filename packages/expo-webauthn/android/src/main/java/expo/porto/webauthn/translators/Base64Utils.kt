package expo.porto.webauthn.translators

import android.util.Base64

object Base64Utils {
    fun String.toBase64URLString(): String {
        return this
            .replace('+', '-')
            .replace('/', '_')
            .replace("=", "")
    }

    fun String.fromBase64URLString(): String {
        var base64 = this
            .replace('-', '+')
            .replace('_', '/')
        
        // Add padding if necessary
        while (base64.length % 4 != 0) {
            base64 += "="
        }
        return base64
    }
}