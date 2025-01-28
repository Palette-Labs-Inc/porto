package expo.porto.webauthn

import android.util.Base64

object Base64Utils {
    private const val BASE64_FLAG = Base64.NO_PADDING or Base64.NO_WRAP or Base64.URL_SAFE

    fun String.toBase64URLString(): String {
        // Remove any padding and convert to URL-safe format
        return this.replace("=", "")
                  .replace("+", "-")
                  .replace("/", "_")
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

    fun ByteArray.toBase64URLString(): String {
        return Base64.encodeToString(this, BASE64_FLAG)
    }

    fun String.decodeBase64URLToBytes(): ByteArray {
        return Base64.decode(this.fromBase64URLString(), Base64.DEFAULT)
    }
} 