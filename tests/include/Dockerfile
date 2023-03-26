FROM denvazh/gatling:latest


ARG USER_ID
ARG GROUP_ID

COPY runTests.sh /opt/gatling/bin

# see https://jtreminio.com/blog/running-docker-containers-as-current-host-user/ for details on user_id mapping
RUN if [ ${USER_ID:-0} -ne 0 ] && [ ${GROUP_ID:-0} -ne 0 ]; then \
    addgroup -g ${GROUP_ID} gatling-user &&\
    adduser -D -u ${USER_ID} -G gatling-user gatling-user &&\
    chown --changes --silent --no-dereference --recursive ${USER_ID}:${GROUP_ID} /opt/gatling \
;fi
        
USER gatling-user

ENTRYPOINT runTests.sh
