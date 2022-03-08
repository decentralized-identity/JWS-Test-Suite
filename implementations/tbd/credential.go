package main

import (
	"encoding/json"

	"github.com/TBD54566975/did-sdk/cryptosuite"
)

func CreateCredential(credFilePath, keyFilePath, outFilePath string) error {
	cred, err := GetCredentialFromFile(credFilePath)
	if err != nil {
		return err
	}
	key, err := GetKeyFromFile(keyFilePath)
	if err != nil {
		return err
	}
	signer, err := cryptosuite.NewJSONWebKeySigner(key.ID, key.PrivateKeyJWK)
	if err != nil {
		return err
	}
	suite := cryptosuite.GetJSONWebSignature2020Suite()
	if err := suite.Sign(signer, cred); err != nil {
		return err
	}
	signedBytes, err := json.Marshal(cred)
	if err != nil {
		return err
	}
	return WriteOutputToFile(signedBytes, outFilePath)
}

func VerifyCredential(credFilePath, keyFilePath, outFilePath string) error {
	cred, err := GetCredentialFromFile(credFilePath)
	if err != nil {
		return err
	}
	key, err := GetKeyFromFile(keyFilePath)
	if err != nil {
		return err
	}
	verifier, err := cryptosuite.NewJSONWebKeyVerifier(key.ID, key.PublicKeyJWK)
	if err != nil {
		return err
	}
	suite := cryptosuite.GetJSONWebSignature2020Suite()
	verificationResult := true
	if err := suite.Verify(verifier, cred); err != nil {
		verificationResult = false
	}
	return WriteVerificationResult(verificationResult, outFilePath)
}
