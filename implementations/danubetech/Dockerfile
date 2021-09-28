FROM maven:3-jdk-11 AS build
MAINTAINER Markus Sabadello <markus@danubetech.com>

ADD pom.xml /opt/ldsignatures-test-jws/
RUN cd /opt/ldsignatures-test-jws && mvn dependency:resolve && mvn dependency:resolve-plugins
ADD . /opt/ldsignatures-test-jws
RUN cd /opt/ldsignatures-test-jws && mvn package

FROM openjdk:11-jre-slim
MAINTAINER Markus Sabadello <markus@danubetech.com>

RUN export DEBIAN_FRONTEND=noninteractive && \
    apt-get -y update && \
    apt-get install -y --no-install-recommends apt-utils && \
    apt-get install -y --no-install-recommends libsodium23 && \
    apt-get clean && rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

COPY --from=build /opt/ldsignatures-test-jws/target/*.jar /opt/ldsignatures-test-jws/

ENTRYPOINT [ "java", "-jar", "/opt/ldsignatures-test-jws/ldsignatures.test.jws-0.1-SNAPSHOT-jar-with-dependencies.jar" ]
