# JWS test suite meetings for C&C WG

[![hackmd-github-sync-badge](https://hackmd.io/WtOeBNQfRmye7FrjYjNI3g/badge)](https://hackmd.io/WtOeBNQfRmye7FrjYjNI3g)

*Note: If you are viewing this on github and it seems out of date, try clicking the above link, hackmd may hold more recent content not yet approved/cleaned by WI editors/WG chairs for syncing to github archival records.*

{ [Meeting Recordings](https://docs.google.com/spreadsheets/d/1wgccmMvIImx30qVE9GhRKWWv3vmL2ZyUauuKx3IfRmA/edit#gid=1791597999) }

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
