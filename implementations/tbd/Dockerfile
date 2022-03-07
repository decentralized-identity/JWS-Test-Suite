FROM golang:1.16-alpine

# Set destination for COPY
WORKDIR /app

# Download Go modules
COPY go.mod .
#COPY go.sum .
RUN go mod download

# Copy the source code
COPY *.go ./

# Build executable
RUN go build -o /tbd .

ENTRYPOINT ["/tbd"]