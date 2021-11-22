# JWS test suite meetings for C&C WG

[![hackmd-github-sync-badge](https://hackmd.io/WtOeBNQfRmye7FrjYjNI3g/badge)](https://hackmd.io/WtOeBNQfRmye7FrjYjNI3g)

*Note: If you are viewing this on github and it seems out of date, try clicking the above link, hackmd may hold more recent content not yet approved/cleaned by WI editors/WG chairs for syncing to github archival records.*

{ [Meeting Recordings](https://docs.google.com/spreadsheets/d/1wgccmMvIImx30qVE9GhRKWWv3vmL2ZyUauuKx3IfRmA/edit#gid=1791597999) }

## 11/22

1. CI
2. VC-JWT update
    - RSA added by Spruce (Transmute might some day later?)
    - expected behavior - Charles and Orie discussed over github, and I think we could run the suite over a MSFT credential
        - discuss issues about w3c data model spec conformance in this group?
        - cross-representation loss of information ("instead of")
<details><summary>Detailed minutes</summary>

- [VC data model #828](https://github.com/w3c/vc-data-model/pull/828) 
    - example [JWT for discussion](https://jwt.io/#debugger-io?token=eyJhbGciOiJFZERTQSIsImtpZCI6ImRpZDpleGFtcGxlOjEyMyNrZXktMCJ9.eyJleHAiOjE5MjUwNjE4MDQsImlzcyI6ImRpZDpleGFtcGxlOjEyMyIsIm5iZiI6MTYwOTUyOTAwNCwic3ViIjoiZGlkOmV4YW1wbGU6NDU2IiwidmMiOnsiQGNvbnRleHQiOlsiaHR0cHM6Ly93d3cudzMub3JnLzIwMTgvY3JlZGVudGlhbHMvdjEiLCJodHRwczovL3czaWQub3JnL3NlY3VyaXR5L3N1aXRlcy9qd3MtMjAyMC92MSIseyJAdm9jYWIiOiJodHRwczovL2V4YW1wbGUuY29tLyMifV0sInR5cGUiOlsiVmVyaWZpYWJsZUNyZWRlbnRpYWwiXSwiY3JlZGVudGlhbFN1YmplY3QiOnsiaWQiOiJkaWQ6ZXhhbXBsZTo0NTYiLCJ0eXBlIjoiUGVyc29uIn0sImlzc3VhbmNlRGF0ZSI6IjIwMjEtMDEtMDFUMTk6MjM6MjRaIiwiZXhwaXJhdGlvbkRhdGUiOiIyMDMxLTAxLTAxVDE5OjIzOjI0WiJ9fQ.m0dGh0wy0inwCbWE3W7rFnWth-5o5fUJCFK2on8nyTPTKRLX3p4Wgh_uGBhEhgfxnbFSlrhCp57sg4pYYK6kCQ )
    - See [this PR discussion](https://github.com/w3c/vc-data-model/pull/828/files#r740230917) for context
    - Date issues fixed by VC spec 1.1 - one remains, tho: unix timestamp versus ISO8610 datetime (can incl. leap seconds) - limits roundtrip translation (Orie: only possible with "`in addition to` path"/mapping in JWT - see [here](https://w3c.github.io/vc-data-model/#jwt-encoding))
        - ``` For backward compatibility with JWT processors, the following registered JWT claim names MUST be used instead of, or in addition to, their respective standard verifiable credential counterparts: ``` 
        - TransMute goes "in addition to"; DChadwick went "instead of"; MSFT and uPort went "instead of"
        - Mike: UNIX time format ignoring leapseconds is a historic simplification that has bedeviled IAM for decades... seems a problem in theory but not in practice to me
        - Orie: but it can break signatures! 
        - Mike: Timekeeping has been simplified by industry standards, tho... are we creating problems by overriding that?
        - Mike: Write a note about industry time representations, and how to destroy leapseconds 
    - Orie: there's another example of where round-trip translation isn't possible: complex objects in LD VCs, e.g. [trace-vocab#example-59](https://w3c-ccg.github.io/traceability-vocab/#example-59)
        - CEL: mapping `issuer.id` to `iss`, no?
        - Mike: there's a practical solution... Orie: But the "instead of" is hard to make reproducible or unambiguous across implementations
        - Orie: if `not-before` loses leap seconds, that's not a big deal. 
        - `iss` field: `iss MUST represent the issuer property of a verifiable credential or the holder property of a verifiable presentation.` in the JWT section of the VC spec, this is assumed to be a string, but a complex object is valid in an LD-VC...
    - For practical purposes, maybe we tackle timestamp issuers and more semantically consequential things like `iss` separately? and thirdly also deal separately with [external proofs](https://w3c.github.io/vc-data-model/#proofs-signatures)
        - In the type theoretical sense, what is a `credential` and a `presentation`? Is `iss` part of the credential, or only part of the verifiable credential (when you transform it and attach the proof)? regardless of assertion format, we all start from a credential and pick an assertion format to transform it into...
        - Mike: What didn't make it into vc1.1?
            - Orie: We preserved VC and VP terms in IANA, but couldn't map to anything registered in IANA; ambiguities about the mandatory fields of a JWT versus mandatory fields of a VC
            - David, [on that thread](https://github.com/w3c/vc-data-model/pull/828#issuecomment-974620058): `jwt.payload.vc` is an "intermediate representation" that, when combined with an external proof, becomes a VC
- Summary:
    - this test suite will go the "in addition to" route and document how implementations CAN preserve information across representations; this can serve as evidence *but not as argument* for later VC WG v2 conversations about "in addition to/instead of" cross-representation decisions
    
</details>

## 10/8

1. Discussion of vc-jwt strawman and test vectors
2. Detailed discussion of s-curve versus S-curve issue
    - [other projects](https://github.com/PointyCastle/pointycastle/issues/215) have already run into the problem
    - This test suite/repo is not the place to propose a solution or a norm, much less dictate where/who normalizes to it
    - Action item: Orie will outline/freewrite the core of a blog post about the upstream ambiguity and what would fix it, Juan will edit it to DIF blog post status to help get eyes/pressure on the problem and direct both to the appropriate venue(s)

## 9/27

1. codewalk of suite repo, how to use, current state of design issues to date
2. recruiting implementor-testers
 - orie will reach out to securekey
 - spruce will dogfood - ours has a P-384 bug to fix, but otherwise works
 - markus: we have a java implementation that supports some key types
   + Markus: I think I understood the codewalk, I'm sure we can make it work (works like VC-HTTP-API v1, right? Orie: Yeah!)
3. sidebar: discussion of testing logistics - how to make local implementation setup simple enough not to distract or create barrier to users using this suite
4. evaluation criteria discussion:
     - one option: local `verify` CLI option
           + self-issued: OIDF test suite took this option and it works well I think; SAML self-testing was quite hard, for lack of this kind of mechanism
     - desire expressed to use did-key and sidestep "did method politics"
     - stability of test vectors:
       + cryptographers prefer very stable and deterministic outputs (nonces, dates, etc)- where possible, people
       + p256 and P384 cannot freeze those, entropy required; therefore, we can stabilize Ed25519 for people that want to do that
       + self-issued: for comparison, here are the [JOSE test vectors](https://datatracker.ietf.org/doc/html/rfc7520)
           * Orie: RFC 7520 was a huge accelerator of adoption and alignment; good test vectors go a long time
       + Orie: Stable test vectors better than usable test vectors, I think; 
    - Q and A
       + Markus: maps to verificationMethods?
       + Private key representations: how closely to bind to public key representations? (Pertinent to LDP work)
           + Self-issued: I think it's quite impractical to stray from representations
           + Test vectors could force this issue by making JWKs, rather than vM-style key representations/paths, the form taken in the test vectors to highlight the issues of linking them
           + Universal Wallet follows the convention used in this draft so far
           + CEL: WebCrypto? Orie: Not exactly-- it lets you export priv and/or pub JWKs; 
           + Orie: WebAuthN seems to rely on/assume a priv key representation similar to the one used in CCG work items...
           + CLI tool could resolve Pubkeys from VCs "somehow" (assuming vM resolution); implementations need to handle that, and have freedom of doing various ways
       + Including verification conformance would force this issue, but taht seems out of scope for now for the grant so I'd rather defer on that...
   - Relation of this signature suite to JWTs 
       - codewalk of Transmute's approach
           - note: `kid` is set to `key.id` because issuer is CONTROLLER, not necessarily vM, in VC-JWT
           - self-issued: MSFT would be happy if this created a way to test "normative VC-JWTs"
           - Orie: Yes, transmute agrees-- this test suite could test a "normative VC-JWT" as an opt-in profile 
           - self-issued: we would support increasing the scope to make this a profile of VC-JWT explicitly
           - Markus: DanubeTech also supports a VC-JWT -- but i'm worried there could be a little messaging/marketing confusion - JWS assumes RDF canonicalization and VC-JWT doesn't - pretty different signing mechanisms - 
               - Markus: This needs to be documented clearly somewhere to avoid that confusion
               - Orie: input to credential-create op can and should be identical, even if signing mechanisms are different
               - Group consensus to include that section to the deliverable, BUT ALSO agrees it will be very hard to explain and write
5. Next steps
 - Orie: I will put a`format` parameter in the `for` loops in the next iteration, to include that VC-JWT profile
     - @Context sidebar: input vectors should be valid as LD
 - Markus: VC-API support? 
     - Orie: I'd love for that work item to adopt some form of this? if this work is done in time, I would like to propose it to the next batch of test vectors there to support a 3rd proof type (**JWS**, BBS+, and LDP) 
         - Orie: I think that JWS2020 and did-key are almost 100% identical, thus redundant... confusing CCG naming convention
         - CEL: RSA? Orie: Yeah, this suite could also support that key type, if 
6. (If time allows) Healing JWT
