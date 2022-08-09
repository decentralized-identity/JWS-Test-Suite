package main

import (
	"encoding/json"
	"io/ioutil"

	"github.com/hyperledger/aries-framework-go/pkg/doc/jose/jwk"
	"github.com/hyperledger/aries-framework-go/pkg/doc/signature/verifier"
)

type Key struct {
	Id            string `json:"id"`
	Type          string `json:"type"`
	Controller    string `json:"controller"`
	PublicKeyJwk  `json:"publicKeyJwk"`
	PrivateKeyJwk `json:"privateKeyJwk"`
}

type PublicKeyJwk struct {
	Kty string `json:"kty"`
	Crv string `json:"crv"`
	X   string `json:"x"`
	Y   string `json:"y"`
	N   string `json:"n"`
	E   string `json:"e"`
}

type PrivateKeyJwk struct {
	Kty string `json:"kty"`
	Crv string `json:"crv"`
	X   string `json:"x"`
	Y   string `json:"y"`
	D   string `json:"d"`
	N   string `json:"n"`
	E   string `json:"e"`
	DP  string `json:"dp"`
	DQ  string `json:"dq"`
	P   string `json:"p"`
	Q   string `json:"q"`
	QI  string `json:"qi"`
}

func GetKeyFromFile(filePath string) (*Key, error) {
	bytes, err := ioutil.ReadFile(filePath)
	if err != nil {
		return nil, err
	}
	k := &Key{}
	return k, json.Unmarshal(bytes, k)
}

func (k *Key) GetPublicKeyJWK() (*jwk.JWK, error) {
	bytes, err := json.Marshal(k.PublicKeyJwk)
	if err != nil {
		return nil, err
	}
	publicKey := &jwk.JWK{}
	return publicKey, publicKey.UnmarshalJSON(bytes)
}

func (k *Key) GetPrivateKeyJWK() (*jwk.JWK, error) {
	bytes, err := json.Marshal(k.PrivateKeyJwk)
	if err != nil {
		return nil, err
	}
	privateKey := &jwk.JWK{}
	return privateKey, privateKey.UnmarshalJSON(bytes)
}

func (k *Key) GetPublicKey(issuerID, keyID string) (*verifier.PublicKey, error) {
	publicKeyJwk, err := k.GetPublicKeyJWK()
	if err != nil {
		return nil, err
	}
	b, err := publicKeyJwk.PublicKeyBytes()
	if err != nil {
		return nil, err
	}
	return &verifier.PublicKey{
		Type:  "JsonWebKey2020",
		Value: b,
		JWK:   publicKeyJwk,
	}, nil
}
