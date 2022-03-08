package main

import (
	"encoding/json"
	"io/ioutil"

	"github.com/TBD54566975/did-sdk/cryptosuite"
	"github.com/TBD54566975/did-sdk/vc"
	"github.com/pkg/errors"
)

func GetCredentialFromFile(filePath string) (*vc.VerifiableCredential, error) {
	bytes, err := ioutil.ReadFile(filePath)
	if err != nil {
		return nil, errors.Wrapf(err, "could not read credential from file: %s", filePath)
	}
	var cred vc.VerifiableCredential
	if err := json.Unmarshal(bytes, &cred); err != nil {
		return nil, errors.Wrap(err, "could not unmarshal credential")
	}
	return &cred, nil
}

func GetKeyFromFile(filePath string) (*cryptosuite.JSONWebKey2020, error) {
	bytes, err := ioutil.ReadFile(filePath)
	if err != nil {
		return nil, errors.Wrapf(err, "could not read key from file: %s", filePath)
	}
	var key cryptosuite.JSONWebKey2020
	if err := json.Unmarshal(bytes, &key); err != nil {
		return nil, errors.Wrap(err, "could not unmarshal key")
	}
	return &key, nil
}

func WriteVerificationResult(result bool, filePath string) error {
	data, err := json.MarshalIndent(verificationResult{result}, "", "    ")
	if err != nil {
		return err
	}
	return WriteOutputToFile(data, filePath)
}

type verificationResult struct {
	Verified bool `json:"verified"`
}

func WriteOutputToFile(data []byte, filePath string) error {
	if err := ioutil.WriteFile(filePath, data, 0755); err != nil {
		return errors.Wrapf(err, "could not write %d bytes to file: %s", len(data), filePath)
	}
	return nil
}
