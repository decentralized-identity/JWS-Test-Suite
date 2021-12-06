package ldsignatures.test.jws;

import com.danubetech.keyformats.JWK_to_PrivateKey;
import com.danubetech.keyformats.crypto.ByteSigner;
import com.danubetech.keyformats.crypto.PrivateKeySignerFactory;
import com.danubetech.keyformats.jose.JWK;
import com.danubetech.keyformats.jose.JWSAlgorithm;
import com.danubetech.keyformats.jose.KeyTypeName;
import com.danubetech.keyformats.keytypes.KeyTypeName_for_JWK;
import com.danubetech.verifiablecredentials.VerifiableCredential;
import com.danubetech.verifiablecredentials.VerifiablePresentation;
import com.danubetech.verifiablecredentials.jsonld.VerifiableCredentialContexts;
import com.danubetech.verifiablecredentials.jwt.JwtObject;
import com.danubetech.verifiablecredentials.jwt.JwtVerifiableCredential;
import com.danubetech.verifiablecredentials.jwt.JwtVerifiablePresentation;
import com.danubetech.verifiablecredentials.jwt.ToJwtConverter;
import com.nimbusds.jose.JOSEException;
import foundation.identity.jsonld.JsonLDException;
import foundation.identity.jsonld.JsonLDObject;
import info.weboftrust.ldsignatures.jsonld.LDSecurityKeywords;
import info.weboftrust.ldsignatures.signer.JsonWebSignature2020LdSigner;
import info.weboftrust.ldsignatures.suites.SignatureSuites;

import java.io.IOException;
import java.io.PrintWriter;
import java.io.StringWriter;
import java.net.URI;
import java.security.GeneralSecurityException;
import java.util.Arrays;
import java.util.Date;
import java.util.Map;

public class JWSTestSuite {

    static void create(String input, URI verificationMethod, ByteSigner byteSigner, String outputFilename, String proofPurpose) throws JsonLDException, GeneralSecurityException, IOException {
        JsonLDObject jsonLDObject = JsonLDObject.fromJson(input);
        jsonLDObject.setDocumentLoader(VerifiableCredentialContexts.DOCUMENT_LOADER);
        JsonWebSignature2020LdSigner jsonWebSignature2020LdSigner = new JsonWebSignature2020LdSigner();
        jsonWebSignature2020LdSigner.setVerificationMethod(verificationMethod);
        jsonWebSignature2020LdSigner.setCreated(new Date());
        jsonWebSignature2020LdSigner.setProofPurpose(proofPurpose);
        jsonWebSignature2020LdSigner.setSigner(byteSigner);
        jsonWebSignature2020LdSigner.setChallenge("123");
        jsonWebSignature2020LdSigner.sign(jsonLDObject, true, false);
        String output = jsonLDObject.toJson(true);
        FileUtil.writeFile(outputFilename, output);
    }

    static void credentialCreate(String input, URI verificationMethod, ByteSigner byteSigner, String outputFilename) throws JsonLDException, GeneralSecurityException, IOException {
        create(input, verificationMethod, byteSigner, outputFilename, LDSecurityKeywords.JSONLD_TERM_ASSERTIONMETHOD);
    }

    static void presentationCreate(String input, URI verificationMethod, ByteSigner byteSigner, String outputFilename) throws JsonLDException, GeneralSecurityException, IOException {
        create(input, verificationMethod, byteSigner, outputFilename, LDSecurityKeywords.JSONLD_TERM_AUTHENTICATION);
    }

    static void createJwt(JwtObject jwtObject, URI verificationMethod, ByteSigner byteSigner, String outputFilename) throws JOSEException, IOException {
        String jwtString;
        if (JWSAlgorithm.EdDSA.equals(byteSigner.getAlgorithm()))
            jwtString = jwtObject.sign_Ed25519_EdDSA(byteSigner, verificationMethod.toString(), false);
        else if (JWSAlgorithm.ES256K.equals(byteSigner.getAlgorithm()))
            jwtString = jwtObject.sign_secp256k1_ES256K(byteSigner, verificationMethod.toString(), false);
        else if (JWSAlgorithm.PS256.equals(byteSigner.getAlgorithm()))
            jwtString = jwtObject.sign_RSA_PS256(byteSigner, verificationMethod.toString(), false);
        else
            throw new IllegalArgumentException("Unsupported algorithm: " + byteSigner.getAlgorithm());
        String output = "{\"jwt\":\"" + jwtString + "\"}";
        FileUtil.writeFile(outputFilename, output);
    }

    static void credentialCreateJwt(String input, URI verificationMethod, ByteSigner byteSigner, String outputFilename) throws JOSEException, IOException {
        VerifiableCredential verifiableCredential = VerifiableCredential.fromJson(input);
        JwtVerifiableCredential jwtVerifiableCredential = ToJwtConverter.toJwtVerifiableCredential(verifiableCredential);
        createJwt(jwtVerifiableCredential, verificationMethod, byteSigner, outputFilename);
    }

    static void presentationCreateJwt(String input, URI verificationMethod, ByteSigner byteSigner, String outputFilename) throws JOSEException, IOException {
        VerifiablePresentation verifiablePresentation = VerifiablePresentation.fromJson(input);
        JwtVerifiablePresentation jwtVerifiablePresentation = ToJwtConverter.toJwtVerifiablePresentation(verifiablePresentation);
        createJwt(jwtVerifiablePresentation, verificationMethod, byteSigner, outputFilename);
    }

    public static void main(String[] args) throws Throwable {

        System.out.println(Arrays.asList(args));

        String inputFilename = ParamUtil.getParamValue(args, "--input");
        String outputFilename = ParamUtil.getParamValue(args, "--output");
        String keyFilename = ParamUtil.getParamValue(args, "--key");
        String format = ParamUtil.getParamValue(args, "--format");
        if (inputFilename == null) throw new IllegalArgumentException("No input filename.");
        if (outputFilename == null) throw new IllegalArgumentException("No output filename.");
        if (keyFilename == null) throw new IllegalArgumentException("No key filename.");
        if (format == null) throw new IllegalArgumentException("No format.");

        String input = FileUtil.readFile(inputFilename);
        String key = FileUtil.readFile(keyFilename);

        Map<String, Object> keyMap = KeyUtil.readKeyMap(key);
        URI verificationMethod = KeyUtil.readVerificationMethod(keyMap);
        JWK jwk = KeyUtil.readJwk(keyMap, true);
        KeyTypeName keyTypeName = KeyTypeName_for_JWK.keyTypeName_for_JWK(jwk);
        String algorithm = SignatureSuites.SIGNATURE_SUITE_JSONWEBSIGNATURE2020.findDefaultJwsAlgorithmForKeyTypeName(keyTypeName);
        Object privateKey = JWK_to_PrivateKey.JWK_to_anyPrivateKey(jwk);
        ByteSigner byteSigner = PrivateKeySignerFactory.privateKeySignerForKey(keyTypeName, algorithm, privateKey);

        try {
            if (ParamUtil.isCredentialCreate(args, format))
                credentialCreate(input, verificationMethod, byteSigner, outputFilename);
            else if (ParamUtil.isPresentationCreate(args, format))
                presentationCreate(input, verificationMethod, byteSigner, outputFilename);
            else if (ParamUtil.isCredentialCreateJwt(args, format))
                credentialCreateJwt(input, verificationMethod, byteSigner, outputFilename);
            else if (ParamUtil.isPresentationCreateJwt(args, format))
                presentationCreateJwt(input, verificationMethod, byteSigner, outputFilename);
            else
                throw new IllegalArgumentException("Invalid request: " + Arrays.asList(args));
        } catch (Exception ex) {
            StringWriter output = new StringWriter();
            ex.printStackTrace(new PrintWriter(output));
            FileUtil.writeFile(outputFilename, output.toString());
            throw ex;
        }
    }
}
