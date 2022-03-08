//go:build jwx_es256k

package main

import (
	"encoding/json"

	"github.com/TBD54566975/did-sdk/cryptosuite"
)

func CreatePresentation(presFilePath, keyFilePath, outFilePath string) error {
	pres, err := getPresentationFromFile(presFilePath)
	if err != nil {
		return err
	}
	key, err := getKeyFromFile(keyFilePath)
	if err != nil {
		return err
	}
	signer, err := cryptosuite.NewJSONWebKeySigner(key.ID, key.PrivateKeyJWK, cryptosuite.Authentication)
	if err != nil {
		return err
	}
	suite := cryptosuite.GetJSONWebSignature2020Suite()
	if err := suite.Sign(signer, pres); err != nil {
		return err
	}
	signedBytes, err := json.MarshalIndent(pres, "", "    ")
	if err != nil {
		return err
	}
	return writeOutputToFile(signedBytes, outFilePath)
}

func VerifyPresentation(presFilePath, keyFilePath, outFilePath string) error {
	pres, err := getPresentationFromFile(presFilePath)
	if err != nil {
		return err
	}
	key, err := getKeyFromFile(keyFilePath)
	if err != nil {
		return err
	}
	verifier, err := cryptosuite.NewJSONWebKeyVerifier(key.ID, key.PublicKeyJWK)
	if err != nil {
		return err
	}
	suite := cryptosuite.GetJSONWebSignature2020Suite()
	verificationResult := true
	if err := suite.Verify(verifier, pres); err != nil {
		verificationResult = false
	}
	return writeVerificationResult(verificationResult, outFilePath)
}
