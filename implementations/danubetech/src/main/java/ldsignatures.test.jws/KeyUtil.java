package ldsignatures.test.jws;

import com.danubetech.keyformats.jose.JWK;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.io.IOException;
import java.net.URI;
import java.util.Map;

public class KeyUtil {

    static ObjectMapper objectMapper = new ObjectMapper();

    static Map<String, Object> readKeyMap(String key) throws IOException {
        Map<String, Object> keyMap = objectMapper.readValue(key, Map.class);
        if (keyMap == null) throw new IllegalArgumentException("No key map found: " + key);
        return keyMap;
    }

    static URI readVerificationMethod(Map<String, Object> keyMap) throws IOException {
        URI verificationMethod = keyMap == null ? null : URI.create((String) keyMap.get("id"));
        if (verificationMethod == null) throw new IllegalArgumentException("No id found: " + keyMap);
        return verificationMethod;
    }

    static JWK readJwk(Map<String, Object> keyMap, boolean privateKeyJwk) throws IOException {
        Map<String, Object> jwkMap = keyMap == null ? null : (Map<String, Object>) keyMap.get(privateKeyJwk ? "privateKeyJwk" : "publicKeyJwk");
        JWK keyJwk = jwkMap == null ? null : JWK.fromMap(jwkMap);
        if (keyJwk == null) throw new IllegalArgumentException("No key found (" + privateKeyJwk + "): " + keyMap);
        return keyJwk;
    }
}
