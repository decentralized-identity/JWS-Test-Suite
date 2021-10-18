FROM clux/muslrust as builder

ADD . /ssi-jws
WORKDIR /ssi-jws

RUN cargo build --release

FROM alpine
COPY --from=builder /ssi-jws/target/x86_64-unknown-linux-musl/release/ssi-jws ssi-jws
ENTRYPOINT ["./ssi-jws"]
