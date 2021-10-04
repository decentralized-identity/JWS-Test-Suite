package ldsignatures.test.jws;

import com.danubetech.keyformats.JWK_to_PrivateKey;
import com.danubetech.keyformats.crypto.ByteSigner;
import com.danubetech.keyformats.crypto.PrivateKeySignerFactory;
import com.danubetech.keyformats.jose.JWK;
import com.danubetech.keyformats.jose.KeyTypeName;
import com.danubetech.keyformats.keytypes.KeyTypeName_for_JWK;
import com.fasterxml.jackson.databind.ObjectMapper;
import foundation.identity.jsonld.JsonLDException;
import foundation.identity.jsonld.JsonLDObject;
import info.weboftrust.ldsignatures.jsonld.LDSecurityKeywords;
import info.weboftrust.ldsignatures.signer.JsonWebSignature2020LdSigner;
import info.weboftrust.ldsignatures.suites.SignatureSuites;

import java.io.IOException;
import java.net.URI;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.OpenOption;
import java.nio.file.Paths;
import java.security.GeneralSecurityException;
import java.util.Arrays;
import java.util.Date;
import java.util.Map;

public class JWSTestSuite {

    static boolean isCredentialCreate(String[] args) {
        return args != null && "credential".equals(args[0]) && "create".equals(args[1]);
    }

    static boolean isPresentationCreate(String[] args) {
        return args != null && "presentation".equals(args[0]) && "create".equals(args[1]);
    }

    static String getParamValue(String[] args, String paramName) {
        for (int i=0; i<args.length-1; i++) {
            if (args[i].equals(paramName)) return args[i+1];
        }
        return null;
    }

    static String readFile(String path) throws IOException {
        return path == null ? null : Files.readString(Paths.get(path));
    }

    static void writeFile(String path, String content) throws IOException {
        Files.createDirectories(Paths.get(path).getParent());
        Files.writeString(Paths.get(path), content, StandardCharsets.UTF_8);
    }

    static Map<String, Object> readKeyMap(String key) throws IOException {
        ObjectMapper objectMapper = new ObjectMapper();
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

    static void create(String input, String key, String outputFilename, String proofPurpose) throws JsonLDException, GeneralSecurityException, IOException {
        JsonLDObject jsonLDObject = JsonLDObject.fromJson(input);
        Map<String, Object> keyMap = readKeyMap(key);
        URI verificationMethod = readVerificationMethod(keyMap);
        JWK jwk = readJwk(keyMap, true);
        KeyTypeName keyTypeName = KeyTypeName_for_JWK.keyTypeName_for_JWK(jwk);
        String algorithm = SignatureSuites.SIGNATURE_SUITE_JSONWEBSIGNATURE2020.findDefaultJwsAlgorithmForKeyTypeName(keyTypeName);
        Object privateKey = JWK_to_PrivateKey.JWK_to_anyPrivateKey(jwk);
        ByteSigner byteSigner = PrivateKeySignerFactory.privateKeySignerForKey(keyTypeName, algorithm, privateKey);
        JsonWebSignature2020LdSigner jsonWebSignature2020LdSigner = new JsonWebSignature2020LdSigner();
        jsonWebSignature2020LdSigner.setVerificationMethod(verificationMethod);
        jsonWebSignature2020LdSigner.setCreated(new Date());
        jsonWebSignature2020LdSigner.setProofPurpose(proofPurpose);
        jsonWebSignature2020LdSigner.setSigner(byteSigner);
        jsonWebSignature2020LdSigner.setChallenge("123");
        jsonWebSignature2020LdSigner.sign(jsonLDObject, true, false);
        String output = jsonLDObject.toJson(true);
        writeFile(outputFilename, output);
    }

    static void credentialCreate(String input, String key, String outputFilename) throws JsonLDException, GeneralSecurityException, IOException {
        create(input, key, outputFilename, LDSecurityKeywords.JSONLD_TERM_ASSERTIONMETHOD);
    }

    static void presentationCreate(String input, String key, String outputFilename) throws JsonLDException, GeneralSecurityException, IOException {
        create(input, key, outputFilename, LDSecurityKeywords.JSONLD_TERM_AUTHENTICATION);
    }

    public static void main(String[] args) throws Throwable {

        String inputFilename = getParamValue(args, "--input");
        String outputFilename = getParamValue(args, "--output");
        String keyFilename = getParamValue(args, "--key");
        if (inputFilename == null) throw new IllegalArgumentException("No input filename.");
        if (outputFilename == null) throw new IllegalArgumentException("No output filename.");
        if (keyFilename == null) throw new IllegalArgumentException("No key filename.");

        String input = readFile(inputFilename);
        String key = readFile(keyFilename);

        if (isCredentialCreate(args))
            credentialCreate(input, key, outputFilename);
        else if (isPresentationCreate(args))
            presentationCreate(input, key, outputFilename);
        else
            throw new IllegalArgumentException("Invalid request: " + Arrays.asList(args));
    }
}
