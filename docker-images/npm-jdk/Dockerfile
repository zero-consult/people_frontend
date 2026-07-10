FROM alpine:latest
RUN apk --no-cache add --update nodejs npm
RUN apk --no-cache add openjdk25 --repository=http://dl-cdn.alpinelinux.org/alpine/edge/community
RUN apk --no-cache add git
RUN adduser -h /home/builduser -S builduser
USER builduser
WORKDIR /home/builduser